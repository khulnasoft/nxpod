// Copyright (c) 2020 TypeFox GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License-AGPL.txt in the project root for license information.

package cmd

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "gp",
	Short: "Command line interface for Nxpod",
}

// Execute rusn the root command
func Execute() {
	entrypoint := strings.TrimPrefix(filepath.Base(os.Args[0]), "gp-")
	for _, c := range rootCmd.Commands() {
		if c.Name() == entrypoint {
			// we can't call subcommands directly (they just call their parents - thanks cobra),
			// so instead we have to manipulate the os.Args
			os.Args = append([]string{os.Args[0], entrypoint}, os.Args[1:]...)
			break
		}
	}

	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func getNxpodAPIToken() (string, error) {
	apiToken := os.Getenv("NXPOD_REMOTE_APITOKEN")
	if apiToken == "" {
		return "", fmt.Errorf("No Nxpod API token present ($NXPOD_REMOTE_APITOKEN env var isn't set)")
	}

	return apiToken, nil
}

func getWorkspaceID() (string, error) {
	result := os.Getenv("NXPOD_WORKSPACE_ID")
	if result == "" {
		return "", fmt.Errorf("No Nxpod workspace ID present ($NXPOD_WORKSPACE_ID env var isn't set)")
	}

	return result, nil
}
