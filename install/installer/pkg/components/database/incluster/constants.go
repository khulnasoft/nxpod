// Copyright (c) 2021 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package incluster

import "github.com/khulnasoft/nxpod/installer/pkg/common"

const (
	Component         = "db" // mysql is used by the Helm package
	InClusterDbSecret = common.InClusterDbSecret
	Port              = 3306
	SQLInitScripts    = "db-init-scripts"
	SQLPasswordName   = "db-password"
	Username          = "nxpod"
	Database          = "nxpod"
	initScriptDir     = "init"
)
