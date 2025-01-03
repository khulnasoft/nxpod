/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the Nxpod Enterprise Source Code License,
 * See License.enterprise.txt in the project root folder.
 */

import { RepositoryService } from "../../../src/repohost/repo-service";
import { User } from "@nxpod/nxpod-protocol";
import { inject, injectable } from "inversify";
import BitbucketApiFactory from "../../../src/bitbucket/bitbucket-api-factory";
import { AuthProviderParams } from "../../../src/auth/auth-provider";
import { BitbucketApp } from "./bitbucket-app";
import { Env } from "../../../src/env";
import { TokenService } from "../../../src/user/token-service";
import { BitbucketContextParser } from "../../../src/bitbucket/bitbucket-context-parser";

@injectable()
export class BitbucketService extends RepositoryService {

    static PREBUILD_TOKEN_SCOPE = 'prebuilds';

    @inject(BitbucketApiFactory) protected api: BitbucketApiFactory;
    @inject(Env) protected env: Env;
    @inject(AuthProviderParams) protected config: AuthProviderParams;
    @inject(TokenService) protected tokenService: TokenService;
    @inject(BitbucketContextParser) protected bitbucketContextParser: BitbucketContextParser;

    async canInstallAutomatedPrebuilds(user: User, cloneUrl: string): Promise<boolean> {
        const { host } = await this.bitbucketContextParser.parseURL(user, cloneUrl);
        return host === this.config.host;
    }

    async installAutomatedPrebuilds(user: User, cloneUrl: string): Promise<void> {
        try {
            const api = await this.api.create(user);
            const { owner, repoName } = await this.bitbucketContextParser.parseURL(user, cloneUrl);
            const existing = await api.repositories.listWebhooks({
                repo_slug: repoName,
                workspace: owner
            });
            const hookUrl = this.getHookUrl();
            if (existing.data.values &&
                existing.data.values.some(hook => hook.url && hook.url.indexOf(hookUrl) !== -1)) {
                console.log(`bitbucket webhook already installed on ${owner}/${repoName}`);
                return;
            }
            const tokenEntry = await this.tokenService.createNxpodToken(user, BitbucketService.PREBUILD_TOKEN_SCOPE, cloneUrl);
            const response = await api.repositories.createWebhook({
                repo_slug: repoName,
                workspace: owner,
                // see https://developer.atlassian.com/bitbucket/api/2/reference/resource/repositories/%7Bworkspace%7D/%7Brepo_slug%7D/hooks#post
                _body: {
                    "description": `Nxpod Prebuilds for ${this.env.hostUrl}.`,
                    "url": hookUrl + `?token=${user.id + '|' + tokenEntry.token.value}`,
                    "active": true,
                    "events": [
                        "repo:push"
                    ]
                }
            });
            if (response.status !== 201) {
                throw new Error(`Couldn't install webhook for ${cloneUrl}: ${response.status}`);
            }
            console.log('Installed Bitbucket Webhook for ' + cloneUrl);
        } catch (error) {
            console.error(error);
        }
    }

    protected getHookUrl() {
        return this.env.hostUrl.with({
            pathname: BitbucketApp.path
        }).toString();
    }
}