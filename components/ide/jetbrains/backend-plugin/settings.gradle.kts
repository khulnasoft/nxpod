// Copyright (c) 2021 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

rootProject.name = "nxpod-remote"

include(":supervisor-api")
val supervisorApiProjectPath: String by settings
project(":supervisor-api").projectDir = File(supervisorApiProjectPath)

include(":nxpod-protocol")
val nxpodProtocolProjectPath: String by settings
project(":nxpod-protocol").projectDir = File(nxpodProtocolProjectPath)
