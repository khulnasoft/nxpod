// Copyright (c) 2020 TypeFox GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License-AGPL.txt in the project root for license information.

package cmd

import (
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/khulnasoft/nxpod/common-go/log"
	"github.com/khulnasoft/nxpod/common-go/pprof"
	"github.com/khulnasoft/nxpod/content-service/pkg/layer"
	"github.com/khulnasoft/nxpod/ws-manager/pkg/manager"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_opentracing "github.com/grpc-ecosystem/go-grpc-middleware/tracing/opentracing"
	"github.com/opentracing/opentracing-go"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/spf13/cobra"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/keepalive"
)

// serveCmd represents the serve command
var runCmd = &cobra.Command{
	Use:   "run",
	Short: "Starts the workspace monitor",

	Run: func(cmd *cobra.Command, args []string) {
		cfg := getConfig()

		err := cfg.Manager.Validate()
		if err != nil {
			log.WithError(err).Fatal("invalid configuration")
		}
		log.Info("wsman configuration is valid")

		clientset, err := newClientSet()
		if err != nil {
			log.WithError(err).Fatal("cannot connect to Kubernetes")
		}
		log.Info("connected to Kubernetes")

		cp, err := layer.NewProvider(&cfg.Content.Storage)
		if err != nil {
			log.WithError(err).Fatal("invalid content provider configuration")
		}

		mgmt, err := manager.New(cfg.Manager, clientset, cp)
		if err != nil {
			log.WithError(err).Fatal("cannot create manager")
		}
		defer mgmt.Close()

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
		if cfg.TLS.Certificate != "" && cfg.TLS.PrivateKey != "" {
			creds, err := credentials.NewServerTLSFromFile(cfg.TLS.Certificate, cfg.TLS.PrivateKey)
			if err != nil {
				log.WithError(err).WithField("crt", cfg.TLS.Certificate).WithField("key", cfg.TLS.PrivateKey).Fatal("could not load TLS keys")
			}
			grpcOpts = append(grpcOpts, grpc.Creds(creds))
			log.WithField("crt", cfg.TLS.Certificate).WithField("key", cfg.TLS.PrivateKey).Debug("securing gRPC server with TLS")
		} else {
			log.Warn("no TLS configured - gRPC server will be unsecured")
		}

		grpcServer := grpc.NewServer(grpcOpts...)
		defer grpcServer.Stop()

		manager.Register(grpcServer, mgmt)
		lis, err := net.Listen("tcp", cfg.RPCServerAddr)
		if err != nil {
			log.WithError(err).WithField("addr", cfg.RPCServerAddr).Fatal("cannot start RPC server")
		}
		//nolint:errcheck
		go grpcServer.Serve(lis)
		log.WithField("addr", cfg.RPCServerAddr).Info("started gRPC server")

		monitor, err := mgmt.CreateMonitor()
		if err != nil {
			log.WithError(err).Fatal("cannot start workspace monitor")
		}
		err = monitor.Start()
		if err != nil {
			log.WithError(err).Fatal("cannot start workspace monitor")
		}
		defer monitor.Stop()
		log.Info("workspace monitor is up and running")

		if cfg.PProfAddr != "" {
			go pprof.Serve(cfg.PProfAddr)
		}

		if cfg.PrometheusAddr != "" {
			reg := prometheus.NewRegistry()
			reg.MustRegister(
				prometheus.NewGoCollector(),
				prometheus.NewProcessCollector(prometheus.ProcessCollectorOpts{}),
			)

			err := mgmt.RegisterMetrics(reg)
			if err != nil {
				log.WithError(err).Error("Prometheus metrics incomplete")
			}

			handler := http.NewServeMux()
			handler.Handle("/metrics", promhttp.HandlerFor(reg, promhttp.HandlerOpts{}))

			go func() {
				err := http.ListenAndServe(cfg.PrometheusAddr, handler)
				if err != nil {
					log.WithError(err).Error("Prometheus metrics server failed")
				}
			}()
			log.WithField("addr", cfg.PrometheusAddr).Info("started Prometheus metrics server")
		}

		// run until we're told to stop
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
		log.Info("🦸  wsman is up and running. Stop with SIGINT or CTRL+C")
		<-sigChan
		log.Info("Received SIGINT - shutting down")
	},
}

func init() {
	rootCmd.AddCommand(runCmd)
}
