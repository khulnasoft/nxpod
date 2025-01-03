// Copyright (c) 2020 TypeFox GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License-AGPL.txt in the project root for license information.

package daemon

import (
	"fmt"

	"github.com/khulnasoft/nxpod/ws-manager-node/pkg/resourcegov"
)

// Configuration configures a daemon
type Configuration struct {
	ContainerdSocket    string `json:"containerd"`
	KubernetesNamespace string `json:"namespace"`
	Kubeconfig          string `json:"kubeconfig"`

	Resources *resourcegov.WorkspaceDispatchConfig `json:"resources"`
	Hosts     *struct {
		NodeHostsFile string            `json:"nodeHostsFile"`
		FromNodeIPs   map[string]string `json:"fromPodNodeIP"`
		ServiceProxy  struct {
			Enabled     bool `json:"enabled,omitempty"`
			PortMapping []struct {
				Selector  string `json:"selector"`
				Alias     string `json:"alias"`
				ProxyPort int    `json:"proxyPort"`
			} `json:"mapping"`
		} `json:"serviceProxy,omitempty"`
	} `json:"hosts"`
	DiskSpaceGuard []struct {
		Path          string `json:"path"`
		MinBytesAvail uint64 `json:"minBytesAvail"`
	} `json:"disk"`
}

// Validate ensures the configuration is valid
func (c Configuration) Validate() error {
	if c.Resources != nil {
		if c.ContainerdSocket == "" {
			return fmt.Errorf("containerd socket is mandatory")
		}
		if c.Resources.CGroupsBasePath == "" {
			return fmt.Errorf("cgroupBasePath is mandatory")
		}
	}

	return nil
}
