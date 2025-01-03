// Copyright (c) 2020 TypeFox GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License-AGPL.txt in the project root for license information.

package cmd

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"

	"github.com/khulnasoft/nxpod/common-go/log"
	"github.com/khulnasoft/nxpod/common-go/tracing"
	"github.com/khulnasoft/nxpod/registry-facade/pkg/blobserve"
	"github.com/khulnasoft/nxpod/registry-facade/pkg/registry"
	"github.com/spf13/cobra"
)

var (
	// ServiceName is the name we use for tracing/logging
	ServiceName = "registry-facade"
	// Version of this service - set during build
	Version = ""
)

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "registry-facade",
	Short: "This service acts as image registry augmenting images with workspace content and Theia",
	Args:  cobra.MinimumNArgs(1),
	PersistentPreRun: func(cmd *cobra.Command, args []string) {
		log.Init(ServiceName, Version, jsonLog, jsonLog)
	},
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	closer := tracing.Init("registry-facade")
	if closer != nil {
		defer closer.Close()
	}
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func init() {
	rootCmd.PersistentFlags().BoolVarP(&jsonLog, "json-log", "v", false, "produce JSON log output on verbose level")
}

// Config configures this servuce
type Config struct {
	Registry       *registry.Config  `json:"registry"`
	BlobServe      *blobserve.Config `json:"blobserve"`
	AuthCfg        string            `json:"dockerAuth"`
	PProfAddr      string            `json:"pprofAddr"`
	PrometheusAddr string            `json:"prometheusAddr"`
}

// getConfig loads and validates the configuration
func getConfig(fn string) (*Config, error) {
	fc, err := ioutil.ReadFile(fn)
	if err != nil {
		return nil, err
	}

	var cfg Config
	err = json.Unmarshal(fc, &cfg)
	if err != nil {
		return nil, err
	}

	return &cfg, nil
}
