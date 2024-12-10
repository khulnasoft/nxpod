// Copyright (c) 2021 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package config

import (
	"bytes"
	"encoding/json"
	"os"

	"golang.org/x/xerrors"

	"github.com/khulnasoft/nxpod/common-go/baseserver"
	"github.com/khulnasoft/nxpod/ws-daemon/pkg/daemon"
)

func Read(fn string) (*Config, error) {
	ctnt, err := os.ReadFile(fn)
	if err != nil {
		return nil, xerrors.Errorf("cannot read config file: %w", err)
	}

	var cfg Config
	dec := json.NewDecoder(bytes.NewReader(ctnt))
	dec.DisallowUnknownFields()
	err = dec.Decode(&cfg)
	if err != nil {
		return nil, xerrors.Errorf("cannot parse config file: %w", err)
	}

	return &cfg, nil
}

type Config struct {
	Daemon  daemon.Config                  `json:"daemon"`
	Service baseserver.ServerConfiguration `json:"service"`
}
