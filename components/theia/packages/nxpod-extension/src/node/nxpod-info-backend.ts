/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { injectable, inject } from "inversify";
import { NxpodInfo, NxpodInfoService, TerminalProcessInfo } from "../common/nxpod-info";
import { NxpodTaskStarter } from "./nxpod-task-starter";

@injectable()
export class NxpodInfoProviderNodeImpl implements NxpodInfoService {
    @inject(NxpodTaskStarter) protected taskStarter: NxpodTaskStarter;

    private info: NxpodInfo = {
        host: process.env.NXPOD_HOST || 'http://localhost:3000',
        // workspaceId: process.env.NXPOD_WORKSPACE_ID || 'a12-321', // Issue workspace
        workspaceId: process.env.NXPOD_WORKSPACE_ID || 'a12-345', // PR workspace
        instanceId: process.env.NXPOD_INSTANCE_ID || 'unknown',
        interval: parseInt(process.env.NXPOD_INTERVAL || '10000', 10),
        repoRoot: process.env.NXPOD_REPO_ROOT || 'undefined'
    }

    async getInfo() {
        return this.info;
    }

    async getTerminalProcessInfos(): Promise<TerminalProcessInfo[]> {
        return this.taskStarter.terminalProcessInfos;
    }
}