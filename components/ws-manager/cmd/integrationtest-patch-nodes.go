// Copyright (c) 2020 TypeFox GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License-AGPL.txt in the project root for license information.

// kubectl patch node $EXECUTING_NODE_NAME --patch '{"metadata":{"labels":{"nxpod.khulnasoft.com/theia.'$VERSION'": "available"}}}'

package cmd

import (
	"github.com/khulnasoft/nxpod/common-go/log"
	"github.com/khulnasoft/nxpod/ws-manager/pkg/test"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"github.com/spf13/cobra"
)

// integrationTestSetupCmd represents the integrationTestSetup command
var integrationTestPatchNodesCmd = &cobra.Command{
	Use:   "patch-nodes",
	Short: "Patches all nodes so that integration test pods can be deployed to them",
	Args:  cobra.ExactArgs(0),
	Run: func(cmd *cobra.Command, args []string) {
		kubecfgfn, _ := cmd.Parent().PersistentFlags().GetString("kubeconfig")
		client, _, err := test.GetIntegrationTestClient(kubecfgfn)
		if err != nil {
			log.WithError(err).Fatal("cannot get kubernetes client")
		}

		labelselector, _ := cmd.Flags().GetString("label-selector")
		dryRun, _ := cmd.Flags().GetBool("dry-run")
		nodes, err := client.CoreV1().Nodes().List(metav1.ListOptions{LabelSelector: labelselector})
		if err != nil {
			log.WithError(err).Fatal("cannot list nodes")
		}
		for _, n := range nodes.Items {
			n.Labels["nxpod.khulnasoft.com/theia.wsman-test"] = "available"

			if dryRun {
				log.WithField("node", n.Name).Info("would patch node")
				continue
			}

			_, err := client.CoreV1().Nodes().Update(&n)
			if err != nil {
				log.WithError(err).WithField("node", n.Name).Warn("cannot patch node")
				continue
			}
			log.WithField("node", n.Name).Info("patched node")
		}
	},
}

func init() {
	integrationTestCmd.AddCommand(integrationTestPatchNodesCmd)

	integrationTestPatchNodesCmd.Flags().StringP("label-selector", "l", "", "label selector to apply filter the nodes by")
	integrationTestPatchNodesCmd.Flags().Bool("dry-run", false, "don't actually patch the nodes, just test the label filter")
}
