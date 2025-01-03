/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { User, Repository, Commit } from "@nxpod/nxpod-protocol"

export type MaybeContent = string | undefined;

export const FileProvider = Symbol('FileProvider');
export interface FileProvider {
    getNxpodFileContent(commit: Commit, user: User): Promise<MaybeContent>;
    getFileContent(commit: Commit, user: User, path: string): Promise<MaybeContent>;
    getLastChangeRevision(repository: Repository, revisionOrBranch: string, user: User, path: string): Promise<string>;
}