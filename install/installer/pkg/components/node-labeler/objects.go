// Copyright (c) 2021 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package wsmanager

import (
	"k8s.io/apimachinery/pkg/runtime"

	"github.com/khulnasoft/nxpod/common-go/baseserver"
	"github.com/khulnasoft/nxpod/installer/pkg/common"
)

var Objects = common.CompositeRenderFunc(
	deployment,
	role,
	rolebinding,
	pdb,
	common.DefaultServiceAccount(Component),
	func(cfg *common.RenderContext) ([]runtime.Object, error) {
		ports := []common.ServicePort{
			{
				Name:          baseserver.BuiltinMetricsPortName,
				ContainerPort: baseserver.BuiltinMetricsPort,
				ServicePort:   baseserver.BuiltinMetricsPort,
			},
		}
		return common.GenerateService(Component, ports)(cfg)
	},
)
