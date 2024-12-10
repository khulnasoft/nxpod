// Copyright (c) 2021 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

rootProject.name = "jetbrains-gateway-nxpod-plugin"

include(":nxpod-protocol")
val nxpodProtocolProjectPath: String by settings
project(":nxpod-protocol").projectDir = File(nxpodProtocolProjectPath)
