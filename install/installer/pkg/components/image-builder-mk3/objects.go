// Copyright (c) 2021 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package image_builder_mk3

import "github.com/khulnasoft/nxpod/installer/pkg/common"

var Objects = common.CompositeRenderFunc(
	clusterrole,
	configmap,
	deployment,
	networkpolicy,
	rolebinding,
	common.GenerateService(Component, []common.ServicePort{
		{
			Name:          RPCPortName,
			ContainerPort: RPCPort,
			ServicePort:   RPCPort,
		},
	}),
	common.DefaultServiceAccount(Component),
	tlssecret,
)
