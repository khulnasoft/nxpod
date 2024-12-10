// Copyright (c) 2021 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package cmd

import (
	"context"
	"fmt"
	"io"

	"github.com/spf13/cobra"

	"github.com/khulnasoft/nxpod/common-go/log"
	"github.com/khulnasoft/nxpod/ws-manager-bridge/api"
)

// clustersUncordonCmd represents the clustersUncordonCmd command
var clustersUncordonCmd = &cobra.Command{
	Use:   "uncordon --name [cluster name]",
	Short: "Un-cordon a cluster",
	Run: func(cmd *cobra.Command, args []string) {
		ctx, cancel := context.WithCancel(context.Background())
		defer cancel()

		conn, client, err := getClustersClient(ctx)
		if err != nil {
			log.WithError(err).Fatal("cannot connect")
		}
		defer conn.Close()

		name := getClusterName()
		request := &api.UpdateRequest{Name: name, Property: &api.UpdateRequest_Cordoned{Cordoned: false}}
		_, err = client.Update(ctx, request)
		if err != nil && err != io.EOF {
			log.Fatal(err)
		}

		fmt.Printf("cluster '%s' un-cordoned\n", name)
	},
}

func init() {
	clustersCmd.AddCommand(clustersUncordonCmd)
}
