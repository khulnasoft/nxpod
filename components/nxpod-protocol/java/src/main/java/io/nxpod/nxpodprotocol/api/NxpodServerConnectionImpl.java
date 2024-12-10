// Copyright (c) 2022 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package io.nxpod.nxpodprotocol.api;

import javax.websocket.CloseReason;
import javax.websocket.Session;
import java.io.IOException;
import java.util.concurrent.CompletableFuture;
import java.util.logging.Level;
import java.util.logging.Logger;

public class NxpodServerConnectionImpl extends CompletableFuture<CloseReason> implements NxpodServerConnection {

    public static final Logger LOG = Logger.getLogger(NxpodServerConnectionImpl.class.getName());

    private final String nxpodHost;

    private Session session;

    public NxpodServerConnectionImpl(String nxpodHost) {
        this.nxpodHost = nxpodHost;
    }

    public void setSession(Session session) {
        this.session = session;
    }

    @Override
    public boolean cancel(boolean mayInterruptIfRunning) {
        Session session = this.session;
        this.session = null;
        if (session != null) {
            try {
                session.close();
            } catch (IOException e) {
                LOG.log(Level.WARNING, nxpodHost + ": failed to close connection:", e);
            }
        }
        return super.cancel(mayInterruptIfRunning);
    }
}
