// Copyright (c) 2022 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package io.nxpod.jetbrains.gateway

import com.jetbrains.gateway.api.GatewayConnector
import com.jetbrains.gateway.api.GatewayConnectorDocumentationPage
import com.jetbrains.rd.util.lifetime.Lifetime
import io.nxpod.jetbrains.icons.NxpodIcons
import java.awt.Component

class NxpodConnector : GatewayConnector {
    override val icon = NxpodIcons.Logo

    override fun createView(lifetime: Lifetime) = NxpodConnectorView(lifetime)

    override fun getActionText() = "Connect to Nxpod"

    override fun getDescription() = "Connect to Nxpod workspaces"

    override fun getDocumentationAction() = GatewayConnectorDocumentationPage("https://www.nxpod.khulnasoft.com/docs/ides-and-editors/jetbrains-gateway")

    override fun getConnectorId() = "nxpod.connector"

    override fun getRecentConnections(setContentCallback: (Component) -> Unit) = NxpodRecentConnections()

    override fun getTitle() = "Nxpod"

    @Deprecated("Not used", ReplaceWith("null"))
    override fun getTitleAdornment() = null

    override fun initProcedure() {}
}
