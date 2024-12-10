// Copyright (c) 2021 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package init

import (
	"github.com/khulnasoft/nxpod/installer/pkg/common"
)

var Objects = common.CompositeRenderFunc(
	configmap,
	job,
	rolebinding,
	common.DefaultServiceAccount(Component),
)
