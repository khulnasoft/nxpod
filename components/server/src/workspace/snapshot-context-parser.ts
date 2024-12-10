/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { User, SnapshotContext } from "@nxpod/nxpod-protocol";
import { injectable, inject } from "inversify";
import { WorkspaceDB } from "@nxpod/nxpod-db/lib/workspace-db";
import { IContextParser } from "../workspace/context-parser";
import { TraceContext } from "@nxpod/nxpod-protocol/lib/util/tracing";

@injectable()
export class SnapshotContextParser implements IContextParser {

    @inject(WorkspaceDB) protected readonly workspaceDb: WorkspaceDB;

    static PREFIX = 'snapshot/';

    public canHandle(user: User, context: string): boolean {
        return context.startsWith(SnapshotContextParser.PREFIX);
    }

    public async handle(ctx: TraceContext, user: User, context: string): Promise<SnapshotContext> {
        const span = TraceContext.startSpan("SnapshotContextParser.handle", ctx);
        const snapshotId = context.substring(SnapshotContextParser.PREFIX.length);
        span.finish();

        return {
            title: 'Snapshot ' + snapshotId,
            snapshotId,
            snapshotBucketId: 'do-not-know-yet'
        }
    }

}