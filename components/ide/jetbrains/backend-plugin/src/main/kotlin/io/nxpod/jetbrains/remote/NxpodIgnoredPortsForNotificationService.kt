// Copyright (c) 2022 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package io.nxpod.jetbrains.remote

interface NxpodIgnoredPortsForNotificationService {
    fun ignorePort(portNumber: Int)
    /** Get ports that aren't actually used by the user (e.g. ports used internally by JetBrains IDEs) */
    fun getIgnoredPorts(): Set<Int>
}
