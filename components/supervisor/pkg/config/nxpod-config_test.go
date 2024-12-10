// Copyright (c) 2020 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package config

import (
	"context"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/google/go-cmp/cmp"
	"golang.org/x/sync/errgroup"

	nxpod "github.com/khulnasoft/nxpod/nxpod-protocol"
)

func TestNxpodConfig(t *testing.T) {
	tests := []struct {
		Desc        string
		Content     string
		Expectation *nxpod.NxpodConfig
	}{
		{
			Desc: "parsing",
			Content: `
image: ghcr.io/khulnasoft/nxpod/dev-environment:clu-yq4.1
workspaceLocation: nxpod/nxpod-ws.code-workspace
checkoutLocation: nxpod
ports:
  - port: 1337
    onOpen: open-preview
  - port: 3000
    onOpen: ignore
tasks:
  - before: scripts/branch-namespace.sh
    init: yarn --network-timeout 100000 && yarn build
  - name: Go
    init: leeway exec --filter-type go -v -- go get -v ./...
    openMode: split-right
vscode:
  extensions:
    - hangxingliu.vscode-nginx-conf-hint@0.1.0:UATTe2sTFfCYWQ3jw4IRsw==
    - zxh404.vscode-proto3@0.4.2:ZnPmyF/Pb8AIWeCqc83gPw==`,
			Expectation: &nxpod.NxpodConfig{
				Image:             "ghcr.io/khulnasoft/nxpod/dev-environment:clu-yq4.1",
				WorkspaceLocation: "nxpod/nxpod-ws.code-workspace",
				CheckoutLocation:  "nxpod",
				Ports: []*nxpod.PortsItems{
					{
						Port:   1337,
						OnOpen: "open-preview",
					}, {
						Port:   3000,
						OnOpen: "ignore",
					},
				},
				Tasks: []*nxpod.TasksItems{
					{
						Before: "scripts/branch-namespace.sh",
						Init:   "yarn --network-timeout 100000 && yarn build",
					},
					{
						Name:     "Go",
						Init:     "leeway exec --filter-type go -v -- go get -v ./...",
						OpenMode: "split-right",
					},
				},
				Vscode: &nxpod.Vscode{
					Extensions: []string{
						"hangxingliu.vscode-nginx-conf-hint@0.1.0:UATTe2sTFfCYWQ3jw4IRsw==",
						"zxh404.vscode-proto3@0.4.2:ZnPmyF/Pb8AIWeCqc83gPw==",
					},
				},
			},
		},
	}
	for _, test := range tests {
		t.Run(test.Desc, func(t *testing.T) {
			tempDir, err := os.MkdirTemp("", "test-nxpod-config-*")
			if err != nil {
				t.Fatal(err)
			}
			defer os.RemoveAll(tempDir)

			locationReady := make(chan struct{})
			configService := NewConfigService(tempDir+"/.nxpod.yml", locationReady)
			ctx, cancel := context.WithCancel(context.Background())
			defer cancel()
			close(locationReady)

			go configService.Watch(ctx)

			var listeners []<-chan *nxpod.NxpodConfig
			for i := 0; i < 10; i++ {
				listeners = append(listeners, configService.Observe(ctx))
			}

			for i := 0; i < 2; i++ {
				eg, _ := errgroup.WithContext(ctx)
				for _, listener := range listeners {
					l := listener
					eg.Go(func() error {
						config := <-l
						if diff := cmp.Diff((*nxpod.NxpodConfig)(nil), config); diff != "" {
							return fmt.Errorf("unexpected output (-want +got):\n%s", diff)
						}
						return nil
					})
				}
				err = eg.Wait()
				if err != nil {
					t.Fatal(err)
				}

				err = os.WriteFile(configService.configLocation, []byte(test.Content), 0o600)
				if err != nil {
					t.Fatal(err)
				}

				eg, _ = errgroup.WithContext(ctx)
				for _, listener := range listeners {
					l := listener
					eg.Go(func() error {
						config := <-l
						if diff := cmp.Diff(test.Expectation, config); diff != "" {
							return fmt.Errorf("unexpected output (-want +got):\n%s", diff)
						}
						return nil
					})
				}
				err = eg.Wait()
				if err != nil {
					t.Fatal(err)
				}

				err = os.Remove(configService.configLocation)
				if err != nil {
					t.Fatal(err)
				}
			}
		})
	}
}

func TestInvalidNxpodConfig(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "test-nxpod-config-*")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tempDir)

	locationReady := make(chan struct{})
	configService := NewConfigService(tempDir+"/.nxpod.yml", locationReady)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	close(locationReady)

	go configService.Watch(ctx)

	listener := configService.Observe(ctx)

	config := <-listener
	if diff := cmp.Diff((*nxpod.NxpodConfig)(nil), config); diff != "" {
		t.Errorf("unexpected output (-want +got):\n%s", diff)
	}

	err = os.WriteFile(configService.configLocation, []byte(`
ports:
  - port: 8080

tasks:
  - command: echo "Hello World"

vscode:
  extensions:
    - foo.bar
`), 0o600)
	if err != nil {
		t.Fatal(err)
	}

	config = <-listener
	if diff := cmp.Diff(&nxpod.NxpodConfig{
		Ports:  []*nxpod.PortsItems{{Port: 8080}},
		Tasks:  []*nxpod.TasksItems{{Command: "echo \"Hello World\""}},
		Vscode: &nxpod.Vscode{Extensions: []string{"foo.bar"}},
	}, config); diff != "" {
		t.Errorf("unexpected output (-want +got):\n%s", diff)
	}

	err = os.WriteFile(configService.configLocation, []byte(`
ports:
  - port:
	visibility: private
  - port: 8080

tasks:
  - before:
  - command: echo "Hello World"

vscode:
  extensions:
    -
`), 0o600)
	if err != nil {
		t.Fatal(err)
	}

	time.Sleep(configService.configWatcher.debounceDuration * 10)

	err = os.WriteFile(configService.configLocation, []byte(`
ports:
  - port: 8081
`), 0o600)
	if err != nil {
		t.Fatal(err)
	}

	config = <-listener
	if diff := cmp.Diff(&nxpod.NxpodConfig{
		Ports: []*nxpod.PortsItems{{Port: 8081}},
	}, config); diff != "" {
		t.Errorf("unexpected output (-want +got):\n%s", diff)
	}
}

func TestWatchImageFile(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "test-nxpod-config-*")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tempDir)

	locationReady := make(chan struct{})
	configService := NewConfigService(tempDir+"/.nxpod.yml", locationReady)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	close(locationReady)

	go configService.Watch(ctx)

	listener := configService.ObserveImageFile(ctx)

	err = os.WriteFile(configService.configLocation, []byte(`
image:
  file: Dockerfile
`), 0o600)
	if err != nil {
		t.Fatal(err)
	}

	changes := <-listener
	if diff := cmp.Diff((*struct{})(nil), changes); diff != "" {
		t.Errorf("unexpected output (-want +got):\n%s", diff)
	}

	imageLocation := tempDir + "/Dockerfile"
	err = os.WriteFile(imageLocation, []byte(`
FROM ubuntu
`), 0o600)
	if err != nil {
		t.Fatal(err)
	}

	changes = <-listener
	if diff := cmp.Diff(&struct{}{}, changes); diff != "" {
		t.Errorf("unexpected output (-want +got):\n%s", diff)
	}

	err = os.WriteFile(configService.configLocation, []byte(`
image: ubuntu
`), 0o600)
	if err != nil {
		t.Fatal(err)
	}

	changes = <-listener
	if diff := cmp.Diff((*struct{})(nil), changes); diff != "" {
		t.Errorf("unexpected output (-want +got):\n%s", diff)
	}

	err = os.WriteFile(configService.configLocation, []byte(`
image:
  file: Dockerfile
`), 0o600)
	if err != nil {
		t.Fatal(err)
	}

	changes = <-listener
	if diff := cmp.Diff(&struct{}{}, changes); diff != "" {
		t.Errorf("unexpected output (-want +got):\n%s", diff)
	}

	err = os.WriteFile(imageLocation, []byte(`
FROM node
`), 0o600)
	if err != nil {
		t.Fatal(err)
	}

	changes = <-listener
	if diff := cmp.Diff(&struct{}{}, changes); diff != "" {
		t.Errorf("unexpected output (-want +got):\n%s", diff)
	}
}
