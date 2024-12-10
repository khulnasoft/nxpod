/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { IssueContext, Workspace, User, PullRequestContext, Repository, Token } from "@nxpod/nxpod-protocol";
import { GitHubScope } from "../github/scopes";
import { GitLabScope } from "../gitlab/scopes";
import { ConfigProvider } from "../workspace/config-provider";
import { TokenService } from "../user/token-service";

export namespace DevData {
    export function createTestUser(): User {
        return {
            id: "somefox",
            name: 'somefox',
            avatarUrl: 'https://github.com/typefox.png',
            creationDate: new Date().toISOString(),
            identities: [
                {
                    authId: "33891423",
                    authName: "somefox",
                    authProviderId: "Public-GitHub",
                    primaryEmail: "somefox@nxpod.io"
                },
                {
                    authId: "3171928",
                    authName: "somefox",
                    authProviderId: "Public-GitLab",
                    primaryEmail: "somefox@nxpod.io"
                }
            ],
            allowsMarketingCommunication: true
        }
    }

    export function createGitHubTestToken(): Token {
        return {
            ...getTokenFromEnv("NXPOD_TEST_TOKEN_GITHUB"),
            scopes: [
                GitHubScope.EMAIL,
                GitHubScope.PUBLIC,
                GitHubScope.PRIVATE,
            ]
        };
    }

    export function createDummyHostContextProvider(): any {
        return {
            get: (hostname: string) => {
                const authProviderId = hostname === "github.com"
                    ? "Public-GitHub"
                    : "Public-GitLab";
                return {
                    authProvider: {
                        authProviderId
                    }
                }
            }
        }
    }

    export function createGitlabTestToken(): Token {
        return {
            ...getTokenFromEnv("NXPOD_TEST_TOKEN_GITLAB"),
            scopes: [
                GitLabScope.READ_USER,
                GitLabScope.API,
            ]
        };
    }

    export function createBitbucketTestToken(): Token {
        const result = {
            ...getTokenFromEnv("NXPOD_TEST_TOKEN_BITBUCKET"),
            scopes: []
        };
        return result;
    }

    function getTokenFromEnv(varname: string): Token {
        const secret = process.env[varname];
        if (!secret) {
            throw new Error(`${varname} env var is not set`);
        }
        return JSON.parse(secret);
    }

    export function createPortAuthTestToken(workspaceId: string): Token {
        const now = new Date();
        return {
            value: "f3d1880e1cae34116bbb863ff524d858ae13573219886ec63e8568380aa744fe",
            scopes: [
                TokenService.generateWorkspacePortAuthScope(workspaceId),
            ],
            updateDate: now.toISOString(),
            expiryDate: new Date(now.getTime() + TokenService.NXPOD_PORT_AUTH_TOKEN_EXPIRY_MILLIS).toISOString(),
        };
    }

    function createPrContext(user: User): PullRequestContext {
        const repository: Repository = {
            host: 'github.com',
            owner: user.identities[0].authName,
            name: "nxpod-test-repo",
            cloneUrl: "https://github.com/TypeFox/nxpod-test-repo.git"
        };
        return <PullRequestContext>{
            repository,
            title: 'Test PR',
            nr: 13,
            ref: "12test",
            revision: "",
            base: {
                repository,
                ref: '1test'
            }
        }
    };

    export function createTestWorkspacePR(user: User): Workspace {
        const config = ConfigProvider.defaultConfig()
        return {
            id: "a12-345",
            type: "regular",
            creationTime: new Date().toISOString(),
            contextURL: 'github.com/TypeFox/nxpod-test-repo',
            description: "Test Workspace, connecting to local Theia",
            ownerId: user.id,
            context: createPrContext(user),
            config
        }
    };

    function createIssueContext(user: User): IssueContext {
        const repository: Repository = {
            host: 'github.com',
            owner: user.identities[0].authName,
            name: "nxpod-test-repo",
            cloneUrl: "https://github.com/TypeFox/nxpod-test-repo.git"
        };
        return <IssueContext>{
            ref: 'GH-15',
            repository,
            title: 'My First Issue',
            nr: 15,
            revision: "",
        }
    };

    export function createTestWorkspaceISSUE(user: User): Workspace {
        const config = ConfigProvider.defaultConfig();
        return {
            id: "a12-321",
            type: "regular",
            creationTime: new Date().toISOString(),
            contextURL: 'github.com/TypeFox/nxpod-test-repo',
            description: "Test Workspace, connecting to local Theia",
            ownerId: user.id,
            context: createIssueContext(user),
            config
        }
    };

}