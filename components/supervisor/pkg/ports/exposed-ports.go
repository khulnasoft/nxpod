// Copyright (c) 2020 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package ports

import (
	"context"
	"fmt"
	"net/url"
	"time"

	backoff "github.com/cenkalti/backoff/v4"
	"github.com/khulnasoft/nxpod/common-go/log"
	nxpod "github.com/khulnasoft/nxpod/nxpod-protocol"
	"github.com/khulnasoft/nxpod/supervisor/pkg/serverapi"
)

// ExposedPort represents an exposed pprt
type ExposedPort struct {
	LocalPort uint32
	URL       string
	Public    bool
	Protocol  string
}

// ExposedPortsInterface provides access to port exposure
type ExposedPortsInterface interface {
	// Observe starts observing the exposed ports until the context is canceled.
	// The list of exposed ports is always the complete picture, i.e. if a single port changes,
	// the whole list is returned.
	// When the observer stops operating (because the context as canceled or an irrecoverable
	// error occured), the observer will close both channels.
	Observe(ctx context.Context) (<-chan []ExposedPort, <-chan error)

	// Run starts listening to expose port requests.
	Run(ctx context.Context)

	// Expose exposes a port to the internet. Upon successful execution any Observer will be updated.
	Expose(ctx context.Context, port uint32, public bool, protocol string) <-chan error
}

// NoopExposedPorts implements ExposedPortsInterface but does nothing
type NoopExposedPorts struct{}

// Observe starts observing the exposed ports until the context is canceled.
func (*NoopExposedPorts) Observe(ctx context.Context) (<-chan []ExposedPort, <-chan error) {
	return make(<-chan []ExposedPort), make(<-chan error)
}

// Run starts listening to expose port requests.
func (*NoopExposedPorts) Run(ctx context.Context) {}

// Expose exposes a port to the internet. Upon successful execution any Observer will be updated.
func (*NoopExposedPorts) Expose(ctx context.Context, local uint32, public bool, protocol string) <-chan error {
	done := make(chan error)
	close(done)
	return done
}

// NxpodExposedPorts uses a connection to the Nxpod server to implement
// the ExposedPortsInterface.
type NxpodExposedPorts struct {
	WorkspaceID   string
	InstanceID    string
	WorkspaceUrl  string
	nxpodService serverapi.APIInterface

	localExposedPort   []uint32
	localExposedNotice chan struct{}
	lastServerExposed  []*nxpod.WorkspaceInstancePort

	requests chan *exposePortRequest
}

type exposePortRequest struct {
	port *nxpod.WorkspaceInstancePort
	ctx  context.Context
	done chan error
}

// NewNxpodExposedPorts creates a new instance of NxpodExposedPorts
func NewNxpodExposedPorts(workspaceID string, instanceID string, workspaceUrl string, nxpodService serverapi.APIInterface) *NxpodExposedPorts {
	return &NxpodExposedPorts{
		WorkspaceID:   workspaceID,
		InstanceID:    instanceID,
		WorkspaceUrl:  workspaceUrl,
		nxpodService: nxpodService,

		// allow clients to submit 30 expose requests without blocking
		requests:           make(chan *exposePortRequest, 30),
		localExposedNotice: make(chan struct{}, 30),
	}
}

func (g *NxpodExposedPorts) getPortUrl(port uint32) string {
	u, err := url.Parse(g.WorkspaceUrl)
	if err != nil {
		return ""
	}
	u.Host = fmt.Sprintf("%d-%s", port, u.Host)
	return u.String()
}

func (g *NxpodExposedPorts) getPortProtocol(protocol string) string {
	switch protocol {
	case nxpod.PortProtocolHTTP, nxpod.PortProtocolHTTPS:
		return protocol
	default:
		return nxpod.PortProtocolHTTP
	}
}

func (g *NxpodExposedPorts) existInLocalExposed(port uint32) bool {
	for _, p := range g.localExposedPort {
		if p == port {
			return true
		}
	}
	return false
}

// Observe starts observing the exposed ports until the context is canceled.
func (g *NxpodExposedPorts) Observe(ctx context.Context) (<-chan []ExposedPort, <-chan error) {
	var (
		reschan = make(chan []ExposedPort)
		errchan = make(chan error, 1)
	)

	go func() {
		defer close(reschan)
		defer close(errchan)

		updates, err := g.nxpodService.WorkspaceUpdates(ctx)
		if err != nil {
			errchan <- err
			return
		}
		mixin := func(localExposedPort []uint32, serverExposePort []*nxpod.WorkspaceInstancePort) []ExposedPort {
			res := make(map[uint32]ExposedPort)
			for _, port := range g.localExposedPort {
				res[port] = ExposedPort{
					LocalPort: port,
					Public:    false,
					URL:       g.getPortUrl(port),
					Protocol:  nxpod.PortProtocolHTTP,
				}
			}

			for _, p := range serverExposePort {
				res[uint32(p.Port)] = ExposedPort{
					LocalPort: uint32(p.Port),
					Public:    p.Visibility == "public",
					URL:       g.getPortUrl(uint32(p.Port)),
					Protocol:  g.getPortProtocol(p.Protocol),
				}
			}
			exposedPort := make([]ExposedPort, 0, len(res))
			for _, p := range res {
				exposedPort = append(exposedPort, p)
			}
			return exposedPort
		}
		for {
			select {
			case u := <-updates:
				if u == nil {
					return
				}
				g.lastServerExposed = u.Status.ExposedPorts

				res := mixin(g.localExposedPort, g.lastServerExposed)
				reschan <- res
			case <-g.localExposedNotice:
				res := mixin(g.localExposedPort, g.lastServerExposed)
				reschan <- res
			case <-ctx.Done():
				return
			}
		}
	}()

	return reschan, errchan
}

// Listen starts listening to expose port requests
func (g *NxpodExposedPorts) Run(ctx context.Context) {
	// process multiple parallel requests but process one by one to avoid server/ws-manager rate limitting
	// if it does not help then we try to expose the same port again with the exponential backoff.
	for {
		select {
		case <-ctx.Done():
			return
		case req := <-g.requests:
			g.doExpose(req)
		}
	}
}

func (g *NxpodExposedPorts) doExpose(req *exposePortRequest) {
	var err error
	defer func() {
		if err != nil {
			req.done <- err
		}
		close(req.done)
	}()
	exp := &backoff.ExponentialBackOff{
		InitialInterval:     2 * time.Second,
		RandomizationFactor: 0.5,
		Multiplier:          1.5,
		MaxInterval:         30 * time.Second,
		MaxElapsedTime:      0,
		Stop:                backoff.Stop,
		Clock:               backoff.SystemClock,
	}
	exp.Reset()
	attempt := 0
	for {
		_, err = g.nxpodService.OpenPort(req.ctx, req.port)
		if err == nil || req.ctx.Err() != nil || attempt == 5 {
			return
		}
		delay := exp.NextBackOff()
		log.WithError(err).
			WithField("port", req.port).
			WithField("attempt", attempt).
			WithField("delay", delay.String()).
			Error("failed to expose port, trying again...")
		select {
		case <-req.ctx.Done():
			err = req.ctx.Err()
			return
		case <-time.After(delay):
			attempt++
		}
	}
}

// Expose exposes a port to the internet. Upon successful execution any Observer will be updated.
func (g *NxpodExposedPorts) Expose(ctx context.Context, local uint32, public bool, protocol string) <-chan error {
	if protocol != nxpod.PortProtocolHTTPS && protocol != nxpod.PortProtocolHTTP {
		protocol = nxpod.PortProtocolHTTP
	}
	if !public && protocol != nxpod.PortProtocolHTTPS {
		if !g.existInLocalExposed(local) {
			g.localExposedPort = append(g.localExposedPort, local)
			g.localExposedNotice <- struct{}{}
		}
		c := make(chan error)
		close(c)
		return c
	}
	visibility := nxpod.PortVisibilityPrivate
	if public {
		visibility = nxpod.PortVisibilityPublic
	}
	req := &exposePortRequest{
		port: &nxpod.WorkspaceInstancePort{
			Port:       float64(local),
			Visibility: visibility,
			Protocol:   protocol,
		},
		ctx:  ctx,
		done: make(chan error),
	}
	g.requests <- req
	return req.done
}
