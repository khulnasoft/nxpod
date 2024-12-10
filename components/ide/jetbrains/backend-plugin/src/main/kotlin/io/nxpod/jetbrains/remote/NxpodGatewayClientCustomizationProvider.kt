// Copyright (c) 2022 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package io.nxpod.jetbrains.remote

import com.jetbrains.rdserver.unattendedHost.customization.GatewayClientCustomizationProvider
import com.jetbrains.rdserver.unattendedHost.customization.controlCenter.DefaultGatewayControlCenterProvider
import com.jetbrains.rdserver.unattendedHost.customization.controlCenter.GatewayControlCenterProvider
import com.jetbrains.rdserver.unattendedHost.customization.controlCenter.GatewayHostnameDisplayKind
import io.nxpod.jetbrains.remote.icons.NxpodIcons
import javax.swing.Icon

class NxpodGatewayClientCustomizationProvider : GatewayClientCustomizationProvider {
    override val icon: Icon = NxpodIcons.Logo
    override val title: String = System.getenv("JETBRAINS_NXPOD_WORKSPACE_HOST") ?: DefaultGatewayControlCenterProvider().getHostnameShort()

    override val controlCenter: GatewayControlCenterProvider = object : GatewayControlCenterProvider {
        override fun getHostnameDisplayKind() = GatewayHostnameDisplayKind.ShowHostnameOnNavbar
        override fun getHostnameShort() = title
        override fun getHostnameLong() = title
    }
}
