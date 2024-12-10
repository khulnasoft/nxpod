// Copyright (c) 2023 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package cmd

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/bufbuild/connect-go"
	v1 "github.com/khulnasoft/nxpod/components/public-api/go/experimental/v1"
	"github.com/khulnasoft/local-app/pkg/helper"
	"github.com/spf13/cobra"
)

var workspaceSSHOpts struct {
	DryRun          bool
	NoImplicitStart bool
}

// workspaceSSHCmd connects to a given workspace
var workspaceSSHCmd = &cobra.Command{
	Use:   "ssh <workspace-id>",
	Short: "Connects to a workspace via SSH",
	Args:  cobra.MinimumNArgs(1),
	Example: `  # connect to workspace with current terminal session
  $ nxpod workspace ssh <workspace-id>

  # Execute a command through SSH
  $ nxpod workspace ssh <workspace-id> -- ls -la
  $ nxpod ws ssh <workspace-id> -- -t watch date

  # Get all SSH features with --dry-run
  $ $(nxpod workspace ssh <workspace-id> --dry-run) -- ls -la
  $ $(nxpod workspace ssh <workspace-id> --dry-run) -t watch date`,
	RunE: func(cmd *cobra.Command, args []string) error {
		cmd.SilenceUsage = true

		ctx, cancel := context.WithTimeout(cmd.Context(), 5*time.Minute)
		defer cancel()

		workspaceID := args[0]

		nxpod, err := getNxpodClient(cmd.Context())
		if err != nil {
			return err
		}

		ws, err := nxpod.Workspaces.GetWorkspace(ctx, connect.NewRequest(&v1.GetWorkspaceRequest{WorkspaceId: workspaceID}))
		if err != nil {
			return err
		}

		if ws.Msg.Result.Status.Instance.Status.Phase != v1.WorkspaceInstanceStatus_PHASE_RUNNING {
			if workspaceSSHOpts.NoImplicitStart {
				return fmt.Errorf("workspace is not running")
			}
			slog.Info("workspace is not running, starting it...")
			_, err := nxpod.Workspaces.StartWorkspace(ctx, connect.NewRequest(&v1.StartWorkspaceRequest{WorkspaceId: workspaceID}))
			if err != nil {
				return err
			}
			_, err = helper.ObserveWorkspaceUntilStarted(ctx, nxpod, workspaceID)
			if err != nil {
				return err
			}
		}

		dashDashIndex := cmd.ArgsLenAtDash()

		sshArgs := []string{}
		if dashDashIndex != -1 {
			sshArgs = args[dashDashIndex:]
		}

		return helper.SSHConnectToWorkspace(cmd.Context(), nxpod, workspaceID, workspaceSSHOpts.DryRun, sshArgs...)
	},
}

func init() {
	workspaceCmd.AddCommand(workspaceSSHCmd)
	workspaceSSHCmd.Flags().BoolVarP(&workspaceSSHOpts.DryRun, "dry-run", "n", false, "Dry run the command")
	workspaceSSHCmd.Flags().BoolVarP(&workspaceSSHOpts.NoImplicitStart, "no-implicit-start", "", false, "Do not start the workspace if it is not running")
}
