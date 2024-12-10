// Copyright (c) 2022 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package cmd

import (
	"github.com/khulnasoft/nxpod/common-go/log"
	"github.com/khulnasoft/nxpod/ide-service/pkg/server"
	"github.com/spf13/cobra"
)

func init() {
	rootCmd.AddCommand(runCommand)
}

var runCommand = &cobra.Command{
	Use:     "run",
	Short:   "Starts the service",
	Version: Version,
	Run: func(cmd *cobra.Command, args []string) {
		cfg := getConfig()
		if err := server.Start(log.Log, cfg); err != nil {
			log.WithError(err).Fatal("cannot start server")
		}
	},
}
