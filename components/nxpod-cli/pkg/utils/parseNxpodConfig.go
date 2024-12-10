// Copyright (c) 2023 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package utils

import (
	"errors"
	"os"
	"path/filepath"

	nxpod "github.com/khulnasoft/nxpod/nxpod-protocol"
	yaml "gopkg.in/yaml.v2"
)

func ParseNxpodConfig(repoRoot string) (*nxpod.NxpodConfig, error) {
	if repoRoot == "" {
		return nil, errors.New("repoRoot is empty")
	}
	data, err := os.ReadFile(filepath.Join(repoRoot, ".nxpod.yml"))
	if err != nil {
		// .nxpod.yml not exist is ok
		if errors.Is(err, os.ErrNotExist) {
			return nil, nil
		}
		return nil, errors.New("read .nxpod.yml file failed: " + err.Error())
	}
	var config *nxpod.NxpodConfig
	if err = yaml.Unmarshal(data, &config); err != nil {
		return nil, errors.New("unmarshal .nxpod.yml file failed" + err.Error())
	}
	return config, nil
}
