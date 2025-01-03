// Copyright (c) 2020 TypeFox GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License-AGPL.txt in the project root for license information.

package initializer

import (
	"context"

	"github.com/khulnasoft/nxpod/common-go/tracing"
	csapi "github.com/khulnasoft/nxpod/content-service/api"
	"github.com/khulnasoft/nxpod/content-service/pkg/storage"
	"github.com/opentracing/opentracing-go"
	"golang.org/x/xerrors"
)

// SnapshotInitializer downloads a snapshot from a remote storage
type SnapshotInitializer struct {
	Location string
	Snapshot string
	Storage  storage.DirectDownloader
}

// Run downloads a snapshot from a remote storage
func (s *SnapshotInitializer) Run(ctx context.Context) (src csapi.WorkspaceInitSource, err error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "SnapshotInitializer")
	span.SetTag("snapshot", s.Snapshot)
	defer tracing.FinishSpan(span, &err)

	src = csapi.WorkspaceInitFromOther

	ok, err := s.Storage.DownloadSnapshot(ctx, s.Location, s.Snapshot)
	if err != nil {
		return src, xerrors.Errorf("snapshot initializer: %w", err)
	}
	if !ok {
		return src, xerrors.Errorf("did not find snapshot %s", s.Snapshot)
	}

	err = recursiveChown(ctx, s.Location)
	if err != nil {
		return src, err
	}

	return
}
