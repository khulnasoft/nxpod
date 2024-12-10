// Copyright (c) 2021 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package io.nxpod.nxpodprotocol.api;

import io.nxpod.nxpodprotocol.api.entities.WorkspaceInstance;
import org.eclipse.lsp4j.jsonrpc.services.JsonNotification;

public class NxpodClient {

    private NxpodServer server;

    public void connect(NxpodServer server) {
        this.server = server;
    }

    public NxpodServer getServer() {
        if (this.server == null) {
            throw new IllegalStateException("not connected");
        }
        return this.server;
    }

    public void notifyConnect() {
    }

    @JsonNotification
    public void onInstanceUpdate(WorkspaceInstance instance) {

    }
}
