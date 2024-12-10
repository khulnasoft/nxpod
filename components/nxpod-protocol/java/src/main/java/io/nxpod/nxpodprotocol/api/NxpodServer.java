// Copyright (c) 2021 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package io.nxpod.nxpodprotocol.api;

import io.nxpod.nxpodprotocol.api.entities.*;
import org.eclipse.lsp4j.jsonrpc.services.JsonRequest;

import java.util.List;
import java.util.concurrent.CompletableFuture;

public interface NxpodServer {
    @JsonRequest
    CompletableFuture<User> getLoggedInUser();

    @JsonRequest
    CompletableFuture<Void> sendHeartBeat(SendHeartBeatOptions options);

    @JsonRequest
    CompletableFuture<Void> trackEvent(RemoteTrackMessage event);

    @JsonRequest
    CompletableFuture<List<String>> getNxpodTokenScopes(String tokenHash);

    @JsonRequest
    CompletableFuture<WorkspaceInfo> getWorkspace(String workspaceId);

    @JsonRequest
    CompletableFuture<String> getOwnerToken(String workspaceId);

    @JsonRequest
    CompletableFuture<List<WorkspaceInfo>> getWorkspaces(GetWorkspacesOptions options);

    @JsonRequest
    CompletableFuture<IDEOptions> getIDEOptions();

    @JsonRequest
    CompletableFuture<WorkspaceInstancePort> openPort(String workspaceId, WorkspaceInstancePort port);

    @JsonRequest
    CompletableFuture<String> takeSnapshot(TakeSnapshotOptions options);

    @JsonRequest
    CompletableFuture<Void> waitForSnapshot(String snapshotId);

    @JsonRequest
    CompletableFuture<SetWorkspaceTimeoutResult> setWorkspaceTimeout(String workspaceId, String duration);

    @JsonRequest
    CompletableFuture<Void> stopWorkspace(String workspaceId);
}
