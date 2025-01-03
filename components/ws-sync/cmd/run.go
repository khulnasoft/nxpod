// Copyright (c) 2020 TypeFox GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License-AGPL.txt in the project root for license information.

package cmd

import (
	"context"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/khulnasoft/nxpod/ws-sync/api"
	"github.com/khulnasoft/nxpod/ws-sync/pkg/syncd"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_opentracing "github.com/grpc-ecosystem/go-grpc-middleware/tracing/opentracing"
	"github.com/khulnasoft/nxpod/common-go/log"
	"github.com/khulnasoft/nxpod/common-go/pprof"
	"github.com/opentracing/opentracing-go"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/spf13/cobra"
	"google.golang.org/grpc"
	"google.golang.org/grpc/keepalive"
)

// serveCmd represents the serve command
var runCmd = &cobra.Command{
	Use:   "run",
	Short: "Connects to the messagebus and starts the workspace monitor",

	Run: func(cmd *cobra.Command, args []string) {
		cfg := getConfig()

		service, err := syncd.NewWorkspaceService(context.Background(), cfg.Syncd)
		if err != nil {
			log.WithError(err).Fatal("cannot create service")
		}

		grpcOpts := []grpc.ServerOption{
			// We don't know how good our cients are at closing connections. If they don't close them properly
			// we'll be leaking goroutines left and right. Closing Idle connections should prevent that.
			grpc.KeepaliveParams(keepalive.ServerParameters{MaxConnectionIdle: 30 * time.Minute}),
			grpc.StreamInterceptor(grpc_middleware.ChainStreamServer(
				grpc_opentracing.StreamServerInterceptor(grpc_opentracing.WithTracer(opentracing.GlobalTracer())),
			)),
			grpc.UnaryInterceptor(grpc_middleware.ChainUnaryServer(
				grpc_opentracing.UnaryServerInterceptor(grpc_opentracing.WithTracer(opentracing.GlobalTracer())),
			)),
		}
		tlsOpt, err := cfg.Service.TLS.ServerOption()
		if err != nil {
			log.WithError(err).Fatal("cannot use TLS config")
		}
		if tlsOpt != nil {
			log.WithField("crt", cfg.Service.TLS.Certificate).WithField("key", cfg.Service.TLS.PrivateKey).Debug("securing gRPC server with TLS")
			grpcOpts = append(grpcOpts, tlsOpt)
		} else {
			log.Warn("no TLS configured - gRPC server will be unsecured")
		}

		server := grpc.NewServer(grpcOpts...)
		api.RegisterWorkspaceContentServiceServer(server, service)
		lis, err := net.Listen("tcp", cfg.Service.Addr)
		if err != nil {
			log.WithError(err).Fatalf("cannot listen on %s", cfg.Service.Addr)
		}
		go func() {
			err := server.Serve(lis)
			if err != nil {
				log.WithError(err).Fatal("cannot start server")
			}
		}()
		log.WithField("addr", cfg.Service.Addr).Info("started workspace content server")

		if cfg.Prometheus.Addr != "" {
			handler := http.NewServeMux()
			handler.Handle("/metrics", promhttp.Handler())

			go func() {
				err := http.ListenAndServe(cfg.Prometheus.Addr, handler)
				if err != nil {
					log.WithError(err).Error("Prometheus metrics server failed")
				}
			}()
			log.WithField("addr", cfg.Prometheus.Addr).Info("started Prometheus metrics server")
		}

		if cfg.PProf.Addr != "" {
			go pprof.Serve(cfg.PProf.Addr)
		}

		// run until we're told to stop
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
		log.Info("🧫 ws-sync is up and running. Stop with SIGINT or CTRL+C")
		<-sigChan
		server.Stop()
		service.Stop()
		log.Info("Received SIGINT - shutting down")
	},
}

func init() {
	rootCmd.AddCommand(runCmd)
}
