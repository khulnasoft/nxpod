// Copyright (c) 2020 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package main

import (
	_ "github.com/go-sql-driver/mysql"

	"github.com/khulnasoft/nxpod/service-waiter/cmd"
)

func main() {
	cmd.Execute()
}
