// Copyright (c) 2020 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package ide

import (
	"context"
	"io"
	"log"
	"net/url"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/helloyi/go-sshclient"
	"sigs.k8s.io/e2e-framework/pkg/envconf"
	"sigs.k8s.io/e2e-framework/pkg/features"

	nxpod "github.com/khulnasoft/nxpod/nxpod-protocol"
	"github.com/khulnasoft/nxpod/test/pkg/integration"
)

func TestSSHGatewayConnection(t *testing.T) {
	userToken, _ := os.LookupEnv("USER_TOKEN")
	integration.SkipWithoutUsername(t, username)
	integration.SkipWithoutUserToken(t, userToken)

	f := features.New("TestSSHGatewayConnection").
		WithLabel("component", "server").
		Assess("it can connect to a workspace via SSH gateway", func(testCtx context.Context, t *testing.T, cfg *envconf.Config) context.Context {
			ctx, cancel := context.WithTimeout(testCtx, 10*time.Minute)
			defer cancel()

			api := integration.NewComponentAPI(ctx, cfg.Namespace(), kubeconfig, cfg.Client())
			t.Cleanup(func() {
				api.Done(t)
			})

			_, err := api.CreateUser(username, userToken)
			if err != nil {
				t.Fatal(err)
			}

			serverOpts := []integration.NxpodServerOpt{integration.WithNxpodUser(username)}
			server, err := api.NxpodServer(serverOpts...)
			if err != nil {
				t.Fatal(err)
			}

			// This env var caused an incident https://www.nxpodstatus.com/incidents/26gwnhcpvqqx before
			// Which was introduced by PR https://github.com/khulnasoft/nxpod/pull/13822
			// And fixed by PR https://github.com/khulnasoft/nxpod/pull/13858
			_ = server.SetEnvVar(ctx, &nxpod.UserEnvVarValue{
				Name:              "TEST",
				RepositoryPattern: "*/*",
				Value:             "\\\"test space\\\"",
			})

			_ = server.SetEnvVar(ctx, &nxpod.UserEnvVarValue{
				Name:              "TEST_MULTIPLE_LINES",
				RepositoryPattern: "*/*",
				Value: `Hello
World`,
			})

			nfo, stopWs, err := integration.LaunchWorkspaceFromContextURL(t, ctx, "github.com/khulnasoft/empty", username, api)
			if err != nil {
				t.Fatal(err)
			}
			defer func() {
				sctx, scancel := context.WithTimeout(context.Background(), 5*time.Minute)
				defer scancel()

				sapi := integration.NewComponentAPI(sctx, cfg.Namespace(), kubeconfig, cfg.Client())
				defer sapi.Done(t)

				stopWs(true, sapi)
			}()

			wsUrl, err := url.Parse(nfo.LatestInstance.IdeURL)
			if err != nil {
				t.Fatal(err)
			}

			wId := nfo.Workspace.ID
			ownerToken, err := server.GetOwnerToken(ctx, wId)
			if err != nil {
				t.Fatal(err)
			}

			urlComponents := strings.Split(wsUrl.Host, ".")
			connUrl := []string{urlComponents[0], "ssh"}
			connUrl = append(connUrl, urlComponents[1:]...)
			connUrlStr := strings.Join(connUrl, ".")

			cli, err := sshclient.DialWithPasswd(connUrlStr+":22", wId, ownerToken)
			if err != nil {
				t.Fatal(err)
			}

			output, err := cli.Cmd("gp info").Output()
			if err != nil && err != io.EOF {
				log.Println("[error]", err)
				time.Sleep(1 * time.Second)
			}

			t.Log(string(output))

			return testCtx
		}).
		Feature()

	testEnv.Test(t, f)
}
