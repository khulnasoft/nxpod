// Copyright (c) 2022 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package ide_metrics

import "github.com/khulnasoft/nxpod/installer/pkg/common"

const (
	Component     = common.IDEMetricsComponent
	ContainerPort = common.IDEMetricsPort
	PortName      = "http"
	ServicePort   = common.IDEMetricsPort
	ReadinessPort = common.IDEMetricsPort
	VolumeConfig  = "config"
)