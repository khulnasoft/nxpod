/**
 * Copyright (c) 2021 Nxpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License.AGPL.txt in the project root for license information.
 */

import { HeadlessWorkspaceEvent, PrebuildWithStatus, WorkspaceInstance } from "@nxpod/nxpod-protocol";
import { TraceContext } from "@nxpod/nxpod-protocol/lib/util/tracing";

export interface PrebuildUpdateListener {
    (ctx: TraceContext, evt: PrebuildWithStatus): void;
}
export interface HeadlessWorkspaceEventListener {
    (ctx: TraceContext, evt: HeadlessWorkspaceEvent): void;
}
export interface WorkspaceInstanceUpdateListener {
    (ctx: TraceContext, instance: WorkspaceInstance): void;
}
