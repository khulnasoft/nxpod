// Copyright (c) 2022 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package io.nxpod.jetbrains.gateway

import com.intellij.ui.dsl.builder.AlignX
import com.intellij.ui.dsl.builder.AlignY
import com.intellij.ui.dsl.builder.panel
import com.jetbrains.gateway.api.GatewayRecentConnections
import com.jetbrains.rd.util.lifetime.Lifetime
import io.nxpod.jetbrains.icons.NxpodIcons
import javax.swing.JComponent

class NxpodRecentConnections : GatewayRecentConnections {

    override val recentsIcon = NxpodIcons.Logo

    private lateinit var view: NxpodWorkspacesView
    override fun createRecentsView(lifetime: Lifetime): JComponent {
        this.view = NxpodWorkspacesView(lifetime)
        return panel {
            row {
                resizableRow()
                cell(view.component)
                    .resizableColumn()
                    .align(AlignX.FILL)
                    .align(AlignY.FILL)
                cell()
            }
        }
    }

    override fun getRecentsTitle(): String {
        return "Nxpod"
    }

    override fun updateRecentView() {
        if (this::view.isInitialized) {
            this.view.refresh()
        }
    }
}
