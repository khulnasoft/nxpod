// Copyright (c) 2021 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package dockerregistry

import "github.com/khulnasoft/nxpod/installer/pkg/common"

const (
	BuiltInRegistryAuth  = common.RegistryAuthSecret
	BuiltInRegistryCerts = common.RegistryTLSCertSecret
	Component            = "docker-registry"
	RegistryName         = "registry"
)
