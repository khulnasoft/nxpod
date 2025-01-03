// Copyright (c) 2020 TypeFox GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License-AGPL.txt in the project root for license information.

package proxy

import (
	"fmt"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"syscall"
	"time"

	"github.com/khulnasoft/nxpod/common-go/log"
	"golang.org/x/xerrors"

	"github.com/koding/websocketproxy"
)

// ProxyPassConfig is used as intermediate struct to assemble a configurable proxy
type proxyPassConfig struct {
	TargetResolver   targetResolver
	ErrorHandler     errorHandler
	Transport        http.RoundTripper
	WebsocketSupport bool
}

// proxyPassOpt allows to compose ProxyHandler options
type proxyPassOpt func(h *proxyPassConfig)

// errorHandler is a function that handles an error that occurred during proxying of a HTTP request
type errorHandler func(http.ResponseWriter, *http.Request, error)

// targetResolver is a function that determines to which target to forward the given HTTP request to
type targetResolver func(*Config, *http.Request) (*url.URL, error)

// proxyPass is the function that assembles a ProxyHandler from the config, a resolver and various options and returns a http.HandlerFunc
func proxyPass(config *RouteHandlerConfig, resolver targetResolver, opts ...proxyPassOpt) http.HandlerFunc {
	h := proxyPassConfig{
		Transport: config.DefaultTransport,
	}
	for _, o := range opts {
		o(&h)
	}
	h.TargetResolver = resolver

	errorHandler := func(w http.ResponseWriter, req *http.Request, connectErr error) {
		log.Debugf("could not connect to backend %s: %s", req.URL.String(), connectErrorToCause(connectErr))
		if h.ErrorHandler != nil {
			h.ErrorHandler(w, req, connectErr)
		}
	}

	// proxy constructors
	createWebsocketProxy := func(h *proxyPassConfig, targetURL *url.URL) http.Handler {
		// TODO configure custom IdleConnTimeout for websockets
		proxy := websocketproxy.NewProxy(targetURL)
		return proxy
	}
	isWebsocketRequest := func(req *http.Request) bool {
		return req.Header.Get("Connection") == "upgrade" && req.Header.Get("Upgrade") == "websocket"
	}
	createRegularProxy := func(h *proxyPassConfig, targetURL *url.URL) http.Handler {
		proxy := httputil.NewSingleHostReverseProxy(targetURL)
		proxy.Transport = h.Transport
		proxy.ErrorHandler = errorHandler
		proxy.ModifyResponse = func(resp *http.Response) error {
			url := resp.Request.URL
			if url == nil {
				return xerrors.Errorf("response's request without URL")
			}

			log.Debugf("%s: %s", url.String(), resp.Status)
			return nil
		}
		return proxy
	}

	return func(w http.ResponseWriter, req *http.Request) {
		targetURL, err := h.TargetResolver(config.Config, req)
		if err != nil {
			log.Errorf("Unable to resolve targetURL: %s", req.URL.String())
			return
		}

		// TODO Would it make sense to cache these constructs per target URL?
		var proxy http.Handler
		if h.WebsocketSupport && isWebsocketRequest(req) {
			if targetURL.Scheme == "https" {
				targetURL.Scheme = "wss"
			} else if targetURL.Scheme == "http" {
				targetURL.Scheme = "ws"
			}
			proxy = createWebsocketProxy(&h, targetURL)
		} else {
			proxy = createRegularProxy(&h, targetURL)
		}
		proxy.ServeHTTP(w, req)
	}
}

func connectErrorToCause(err error) string {
	if err == nil {
		return ""
	}

	if netError, ok := err.(net.Error); ok && netError.Timeout() {
		return "Connect timeout"
	}

	switch t := err.(type) {
	case *net.OpError:
		if t.Op == "dial" {
			return fmt.Sprintf("Unknown host: %s", err.Error())
		} else if t.Op == "read" {
			return fmt.Sprintf("Connection refused: %s", err.Error())
		}

	case syscall.Errno:
		if t == syscall.ECONNREFUSED {
			return "Connection refused"
		}
	}

	return "unknown"
}

// withOnProxyErrorRedirectToWorkspaceStartHandler is an error handler that redirects to nxpod.khulnasoft.com/start/#<wsid>
func withOnProxyErrorRedirectToWorkspaceStartHandler(config *Config) proxyPassOpt {
	return func(h *proxyPassConfig) {
		h.ErrorHandler = func(w http.ResponseWriter, req *http.Request, err error) {
			// the default impl reports all errors as 502, so we'll do the same with the rest
			ws := getWorkspaceCoords(req)
			redirectURL := fmt.Sprintf("%s://%s/start/#%s", config.NxpodInstallation.Scheme, config.NxpodInstallation.HostName, ws.ID)
			http.Redirect(w, req, redirectURL, 302)
		}
	}
}

// // withTransport allows to configure a http.RoundTripper that handles the actual sending and receiving of the HTTP request to the proxy target
// func withTransport(transport http.RoundTripper) proxyPassOpt {
// 	return func(h *proxyPassConfig) {
// 		h.Transport = transport
// 	}
// }

// withWebsocketSupport treats this route as websocket route
func withWebsocketSupport() proxyPassOpt {
	return func(h *proxyPassConfig) {
		h.WebsocketSupport = true
	}
}

func createDefaultTransport(config *TransportConfig) *http.Transport {
	// TODO equivalent of client_max_body_size 2048m; necessary ???
	// this is based on http.DefaultTransport, with some values exposed to config
	return &http.Transport{
		Proxy: http.ProxyFromEnvironment,
		DialContext: (&net.Dialer{
			Timeout:   time.Duration(config.ConnectTimeout), // default: 30s
			KeepAlive: 30 * time.Second,
			DualStack: true,
		}).DialContext,
		ForceAttemptHTTP2:     true,
		MaxIdleConns:          config.MaxIdleConns,                   // default: 100
		IdleConnTimeout:       time.Duration(config.IdleConnTimeout), // default: 90s
		TLSHandshakeTimeout:   10 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
	}
}
