// Copyright (c) 2020 TypeFox GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License-AGPL.txt in the project root for license information.

package executor

import (
	"context"
	"encoding/json"
	"io"

	"github.com/golang/protobuf/jsonpb"
	csapi "github.com/khulnasoft/nxpod/content-service/api"
	"github.com/khulnasoft/nxpod/content-service/pkg/initializer"
	"github.com/khulnasoft/nxpod/content-service/pkg/storage"
)

type config struct {
	URLs       map[string]string `json:"urls,omitempty"`
	Req        json.RawMessage   `json:"req,omitempty"`
	FromBackup string            `json:"fromBackupURL,omitempty"`
}

// PrepareFromBackup produces executor config to restore a backup
func PrepareFromBackup(url string) ([]byte, error) {
	return json.Marshal(config{
		FromBackup: url,
	})
}

// Prepare writes the config required by Execute to a stream
func Prepare(req *csapi.WorkspaceInitializer, urls map[string]string) ([]byte, error) {
	m := jsonpb.Marshaler{}
	ilr, err := m.MarshalToString(req)
	if err != nil {
		return nil, err
	}

	return json.Marshal(config{
		URLs: urls,
		Req:  json.RawMessage(ilr),
	})
}

// Execute runs an initializer to place content in destination based on the configuration read
// from the cfgin stream.
func Execute(ctx context.Context, destination string, cfgin io.Reader, opts ...initializer.InitializeOpt) (src csapi.WorkspaceInitSource, err error) {
	var cfg config
	err = json.NewDecoder(cfgin).Decode(&cfg)
	if err != nil {
		return "", err
	}

	var (
		rs  storage.DirectDownloader
		ilr initializer.Initializer
	)
	if cfg.FromBackup == "" {
		var req csapi.WorkspaceInitializer
		err = jsonpb.UnmarshalString(string(cfg.Req), &req)
		if err != nil {
			return "", err
		}

		rs = &storage.NamedURLDownloader{URLs: cfg.URLs}
		ilr, err = initializer.NewFromRequest(ctx, destination, rs, &req)
		if err != nil {
			return "", err
		}
	} else {
		rs = &storage.NamedURLDownloader{
			URLs: map[string]string{
				storage.DefaultBackup: cfg.FromBackup,
			},
		}
		ilr = &initializer.EmptyInitializer{}
	}

	src, err = initializer.InitializeWorkspace(ctx, destination, rs, append(opts, initializer.WithInitializer(ilr))...)
	if err != nil {
		return "", err
	}

	err = initializer.PlaceWorkspaceReadyFile(ctx, destination, src)
	if err != nil {
		return src, err
	}

	return src, nil
}
