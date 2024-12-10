// Copyright (c) 2022 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package componentswebapp

import (
	"github.com/khulnasoft/nxpod/installer/pkg/common"
	"github.com/khulnasoft/nxpod/installer/pkg/components/auth"
	contentservice "github.com/khulnasoft/nxpod/installer/pkg/components/content-service"
	"github.com/khulnasoft/nxpod/installer/pkg/components/dashboard"
	"github.com/khulnasoft/nxpod/installer/pkg/components/database"
	"github.com/khulnasoft/nxpod/installer/pkg/components/migrations"
	"github.com/khulnasoft/nxpod/installer/pkg/components/minio"
	"github.com/khulnasoft/nxpod/installer/pkg/components/proxy"
	public_api_server "github.com/khulnasoft/nxpod/installer/pkg/components/public-api-server"
	"github.com/khulnasoft/nxpod/installer/pkg/components/redis"
	"github.com/khulnasoft/nxpod/installer/pkg/components/server"
	"github.com/khulnasoft/nxpod/installer/pkg/components/spicedb"
	"github.com/khulnasoft/nxpod/installer/pkg/components/usage"
	wsmanagerbridge "github.com/khulnasoft/nxpod/installer/pkg/components/ws-manager-bridge"
)

var Objects = common.CompositeRenderFunc(
	contentservice.Objects,
	dashboard.Objects,
	database.Objects,
	migrations.Objects,
	minio.Objects,
	proxy.Objects,
	server.Objects,
	wsmanagerbridge.Objects,
	public_api_server.Objects,
	usage.Objects,
	spicedb.Objects,
	redis.Objects,
	auth.Objects,
)

var Helm = common.CompositeHelmFunc(
	database.Helm,
	minio.Helm,
)
