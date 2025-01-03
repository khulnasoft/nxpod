/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the Nxpod Enterprise Source Code License,
 * See License.enterprise.txt in the project root folder.
 */

import * as express from 'express';
import { Server } from "../../src/server";
import { inject } from "inversify";
import { GraphQLController } from "./graphql/graphql-controller";
import { NxpodClient, NxpodServer } from '@nxpod/nxpod-protocol';
import { log } from '@nxpod/nxpod-protocol/lib/util/logging';
import { GitLabApp } from './prebuilds/gitlab-app';
import { BitbucketApp } from './prebuilds/bitbucket-app';
import { GithubApp } from './prebuilds/github-app';

export class ServerEE<C extends NxpodClient, S extends NxpodServer> extends Server<C, S> {
    @inject(GraphQLController) protected readonly adminGraphQLController: GraphQLController;
    @inject(GithubApp) protected readonly githubApp: GithubApp;
    @inject(GitLabApp) protected readonly gitLabApp: GitLabApp;
    @inject(BitbucketApp) protected readonly bitbucketApp: BitbucketApp;
    
    protected async registerRoutes(app: express.Application): Promise<void> {
        await super.registerRoutes(app);

        app.use("/graphql", await this.adminGraphQLController.apiRouter());
        if (this.env.githubAppEnabled) {
            log.info("Registered GitHub app at /apps/github")
            app.use('/apps/github/', this.githubApp.server);
            log.debug(`GitHub app ready under ${this.githubApp.server.path()}`);
        } else {
            log.info("GitHub app disabled");
        }

        log.info("Registered GitLab app at " + GitLabApp.path);
        app.use(GitLabApp.path, this.gitLabApp.router);

        log.info("Registered Bitbucket app at " + BitbucketApp.path);
        app.use(BitbucketApp.path, this.bitbucketApp.router);

    }

}