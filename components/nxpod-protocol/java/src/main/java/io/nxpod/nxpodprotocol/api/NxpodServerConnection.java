// Copyright (c) 2022 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package io.nxpod.nxpodprotocol.api;

import javax.websocket.CloseReason;
import java.util.concurrent.CompletionStage;
import java.util.concurrent.Future;

public interface NxpodServerConnection extends Future<CloseReason>, CompletionStage<CloseReason> {
}
