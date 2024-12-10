// Copyright (c) 2020 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package cmd

import (
	"context"

	"github.com/khulnasoft/nxpod/common-go/log"
	"github.com/khulnasoft/nxpod/content-service/api"
	"github.com/khulnasoft/nxpod/content-service/pkg/storage"
	"github.com/khulnasoft/nxpod/ws-daemon/pkg/content"
	"github.com/spf13/cobra"
)

// debugRunInitializer represents the generate command
var debugRunInitializer = &cobra.Command{
	Use:   "run-initializer",
	Short: "Runs the content initializer",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		dst := args[0]
		log.WithField("dst", dst).Info("running content initializer")
		return content.RunInitializer(context.Background(), dst, &api.WorkspaceInitializer{
			Spec: &api.WorkspaceInitializer_Git{
				Git: &api.GitInitializer{
					RemoteUri:        "https://github.com/khulnasoft/nxpod.git",
					TargetMode:       api.CloneTargetMode_REMOTE_BRANCH,
					CloneTaget:       "refs/heads/main",
					CheckoutLocation: "foo",
					Config: &api.GitConfig{
						Authentication: api.GitAuthMethod_NO_AUTH,
					},
				},
			},
		}, make(map[string]storage.DownloadInfo), content.RunInitializerOpts{})
	},
}

func init() {
	debugCmd.AddCommand(debugRunInitializer)
}
