/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */


import { injectable, inject } from "inversify";
import { ConsensusLeaderQorum } from "../consensus/consensus-leader-quorum";
import { Disposable } from "@nxpod/nxpod-protocol";
import { log } from "@nxpod/nxpod-protocol/lib/util/logging";
import { WorkspaceDeletionService } from "./workspace-deletion-service";
import * as opentracing from 'opentracing';
import { TracedWorkspaceDB, DBWithTracing } from "@nxpod/nxpod-db/lib/traced-db";
import { WorkspaceDB } from "@nxpod/nxpod-db/lib/workspace-db";
import { TraceContext } from "@nxpod/nxpod-protocol/lib/util/tracing";
import { Env } from "../env";

/**
 * The WorkspaceGarbageCollector has two tasks:
 *  - mark old, unused workspaces as 'softDeleted = "gc"' after a certain period (initially: 21)
 *  - actually delete softDeleted workspaces if they are older than a configured time (initially: 7)
 */
@injectable()
export class WorkspaceGarbageCollector {
    @inject(ConsensusLeaderQorum) protected readonly leaderQuorum: ConsensusLeaderQorum;
    @inject(WorkspaceDeletionService) protected readonly deletionService: WorkspaceDeletionService;
    @inject(TracedWorkspaceDB) protected readonly workspaceDB: DBWithTracing<WorkspaceDB>;
    @inject(Env) protected readonly env: Env;

    public async start(): Promise<Disposable> {
        if (this.env.garbageCollectionDisabled) {
            console.log('wsgc: Garabage collection is disabled');
            return {
                dispose: () => {}
            }
        }
        const timer = setInterval(async () => this.garbageCollectWorkspacesIfLeader(), 30 * 60 * 1000);
        return {
            dispose: () => clearInterval(timer)
        }
    }

    public async garbageCollectWorkspacesIfLeader() {
        if (await this.leaderQuorum.areWeLeader()) {
            log.info("wsgc: we're leading the quorum. Collecting old workspaces")
            this.softDeleteOldWorkspaces().catch((err) => log.error("wsgc: error during soft-deletion", err));
            this.deleteWorkspaceContentAfterRetentionPeriod().catch((err) => log.error("wsgc: error during content deletion", err));
            this.deleteOldPrebuilds().catch((err) => log.error("wsgc: error during prebuild deletion", err));
        }
    }

    /**
     * Marks old, unused workspaces as softDeleted
     */
    protected async softDeleteOldWorkspaces() {
        if (Date.now() < this.env.garbageCollectionStartDate) {
            log.info('wsgc: garbage collection not yet active.');
            return;
        }

        const span = opentracing.globalTracer().startSpan("softDeleteOldWorkspaces");
        try {
            const workspaces = await this.workspaceDB.trace({span}).findWorkspacesForGarbageCollection(this.env.daysBeforeGarbageCollection, this.env.garbageCollectionLimit);
            const deletes = await Promise.all(workspaces.map(ws => this.deletionService.softDeleteWorkspace({span}, ws, "gc")))

            log.info(`wsgc: successfully soft-deleted ${deletes.length} workspaces`);
            span.addTags({ 'nrOfCollectedWorkspaces': deletes.length });
        } catch (err) {
            TraceContext.logError({span}, err);
            throw err;
        } finally {
            span.finish();
        }
    }

    protected async deleteWorkspaceContentAfterRetentionPeriod() {
        const span = opentracing.globalTracer().startSpan("deleteWorkspaceContentAfterRetentionPeriod");
        try {
            const workspaces = await this.workspaceDB.trace({span}).findWorkspacesForContentDeletion(this.env.workspaceDeletionRetentionPeriodDays, this.env.workspaceDeletionLimit);
            const deletes = await Promise.all(workspaces.map(ws => this.deletionService.garbageCollectWorkspace({span}, ws)))

            log.info(`wsgc: successfully deleted the content of ${deletes.length} workspaces`);
            span.addTags({ 'nrOfCollectedWorkspaces': deletes.length });
        } catch (err) {
            TraceContext.logError({span}, err);
            throw err;
        } finally {
            span.finish();
        }
    }

    protected async deleteOldPrebuilds() {
        const span = opentracing.globalTracer().startSpan("deleteOldPrebuilds");
        try {
            const workspaces = await this.workspaceDB.trace({span}).findPrebuiltWorkspacesForGC(this.env.daysBeforeGarbageCollectingPrebuilds, this.env.workspaceDeletionLimit);
            const deletes = await Promise.all(workspaces.map(ws => this.deletionService.garbageCollectPrebuild({span}, ws)))

            log.info(`wsgc: successfully deleted ${deletes.length} prebuilds`);
            span.addTags({ 'nrOfCollectedPrebuilds': deletes.length });
        } catch (err) {
            TraceContext.logError({span}, err);
            throw err;
        } finally {
            span.finish();
        }
    }
}