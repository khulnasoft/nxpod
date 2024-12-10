/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { TaskConfig } from "@nxpod/nxpod-protocol";

export const nxpodInfoPath = '/services/nxpodInfoPath';

export const NxpodInfoService = Symbol('NxpodInfoService');

export interface NxpodInfoService {
    getInfo() : Promise<NxpodInfo>
    getTerminalProcessInfos(): Promise<TerminalProcessInfo[]>;
}

export interface TerminalProcessInfo {
    processId: number
    task: TaskConfig
}

export type SnapshotBucketId = string;

export interface NxpodInfo {
    workspaceId: string;
    instanceId: string;
    host: string;
    interval: number;
    repoRoot: string;
}

export namespace NxpodInfo {
    export const SERVICE_PATH = '/nxpod/info';
    export const TERMINAL_INFOS_PATH = '/nxpod/terminalnfos';
}
