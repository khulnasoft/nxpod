// Copyright (c) 2020 TypeFox GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License-AGPL.txt in the project root for license information.

package main

import (
	"github.com/khulnasoft/nxpod/ws-manager/cmd"

	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
)

func main() {
	cmd.Execute()
}
