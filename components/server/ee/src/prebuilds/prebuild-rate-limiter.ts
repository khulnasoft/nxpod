/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the Nxpod Enterprise Source Code License,
 * See License.enterprise.txt in the project root folder.
 */

import { User, PrebuiltWorkspace } from "@nxpod/nxpod-protocol";
import { inject, injectable } from "inversify";
import { WorkspaceDB } from "@nxpod/nxpod-db/lib/workspace-db";
import { DBWithTracing, TracedWorkspaceDB } from "@nxpod/nxpod-db/lib/traced-db";
import { TraceContext } from "@nxpod/nxpod-protocol/lib/util/tracing";
import { Env } from "../../../src/env";

@injectable()
export class PrebuildRateLimiter {
    @inject(TracedWorkspaceDB) protected readonly workspaceDB: DBWithTracing<WorkspaceDB>;
    @inject(Env) protected readonly env: Env;

    async canBuildNow(ctx: TraceContext, user: User | string, cloneURL: string): Promise<boolean> {
        const span = TraceContext.startSpan("canBuildNow", ctx);

        try {
            const runningPrebuildCount = await this.workspaceDB.trace({span}).countRunningPrebuilds(cloneURL);
            span.log({runningPrebuildCount, cloneURL});
            if (runningPrebuildCount >= this.env.maxConcurrentPrebuildsPerRef) {
                return false;
            }
        } catch(e) {
            TraceContext.logError({span}, e);
            throw e;
        } finally {
            span.finish();
        }

        return true;
    }

    async shouldStillBuild(ctx: TraceContext, pws: PrebuiltWorkspace) {
        return true;
    }

}