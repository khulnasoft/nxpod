/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { Commit, Repository, User } from "@nxpod/nxpod-protocol";
import { log } from '@nxpod/nxpod-protocol/lib/util/logging';
import { inject, injectable } from 'inversify';
import { FileProvider, MaybeContent } from "../repohost/file-provider";
import BitbucketApiFactory from './bitbucket-api-factory';


@injectable()
export class BitbucketFileProvider implements FileProvider {

    @inject(BitbucketApiFactory) protected readonly apiFactory: BitbucketApiFactory;

    public async getNxpodFileContent(commit: Commit, user: User): Promise<MaybeContent> {
        const yamlVersion1 = await Promise.all([
            this.getFileContent(commit, user, '.nxpod.yml'),
            this.getFileContent(commit, user, '.nxpod')
        ]);
        return yamlVersion1.filter(f => !!f)[0];
    }

    public async getLastChangeRevision(repository: Repository, revisionOrBranch: string, user: User, path: string): Promise<string> {
        try {
            const api = await this.apiFactory.create(user);
            const fileMetaData = (await api.repositories.readSrc({ workspace: repository.owner, repo_slug: repository.name, node: revisionOrBranch, path, format: "meta" })).data;
            return (fileMetaData as any).commit.hash;
        } catch (err) {
            log.error({ userId: user.id }, err);
            throw new Error(`Could not fetch ${path} of repository ${repository.owner}/${repository.name}: ${err}`);
        }
    }

    public async getFileContent(commit: Commit, user: User, path: string) {
        if (!commit.revision) {
            return undefined;
        }

        try {
            const api = await this.apiFactory.create(user);
            const contents = (await api.repositories.readSrc({ workspace: commit.repository.owner, repo_slug: commit.repository.name, node: commit.revision, path })).data;
            return contents as string;
        } catch (err) {
            log.error({ userId: user.id }, err);
        }
    }
}
