// Copyright (c) 2024 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package io.nxpod.jetbrains.gateway.latest

import com.intellij.openapi.components.Service
import com.jetbrains.gateway.api.GatewayConnectionHandle
import com.jetbrains.gateway.ssh.ClientOverSshTunnelConnector
import com.jetbrains.gateway.ssh.HostTunnelConnector
import com.jetbrains.gateway.thinClientLink.ThinClientHandle
import com.jetbrains.rd.util.lifetime.Lifetime
import io.nxpod.jetbrains.gateway.NxpodConnectionProvider.ConnectParams
import io.nxpod.jetbrains.gateway.common.NxpodConnectionHandle
import io.nxpod.jetbrains.gateway.common.NxpodConnectionHandleFactory
import java.net.URI
import javax.swing.JComponent

@Suppress("UnstableApiUsage")
class LatestNxpodConnectionHandleFactory: NxpodConnectionHandleFactory {
    override fun createNxpodConnectionHandle(
        lifetime: Lifetime,
        component: JComponent,
        params: ConnectParams
    ): GatewayConnectionHandle {
        return NxpodConnectionHandle(lifetime, component, params)
    }

    override suspend fun connect(lifetime: Lifetime, connector: HostTunnelConnector, tcpJoinLink: URI): ThinClientHandle {
        return ClientOverSshTunnelConnector(
            lifetime,
            connector
        ).connect(tcpJoinLink, null)
    }
}
