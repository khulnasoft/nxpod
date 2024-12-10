/**
 * Copyright (c) 2022 Nxpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License.AGPL.txt in the project root for license information.
 */

import { ifEnvVarNotSet } from "@nxpod/nxpod-protocol/lib/util/skip-if";
import { Container, ContainerModule } from "inversify";
import { retries, skip, suite, test, timeout } from "@testdeck/mocha";
import { expect } from "chai";
import { BitbucketServerApi } from "./bitbucket-server-api";
import { BitbucketServerTokenValidator } from "./bitbucket-server-token-validator";
import { AuthProviderParams } from "../auth/auth-provider";
import { BitbucketServerTokenHelper } from "./bitbucket-server-token-handler";
import { TokenProvider } from "../user/token-provider";
import { IGitTokenValidatorParams } from "../workspace/git-token-validator";

const shouldSkip =
    ifEnvVarNotSet("NXPOD_TEST_TOKEN_BITBUCKET_SERVER_READ") &&
    ifEnvVarNotSet("NXPOD_TEST_TOKEN_BITBUCKET_SERVER_WRITE") &&
    ifEnvVarNotSet("NXPOD_TEST_TOKEN_BITBUCKET_SERVER_ADMIN");

@suite(timeout(10000), retries(0), skip(shouldSkip))
class TestBitbucketServerTokenValidator {
    static readonly AUTH_HOST_CONFIG: Partial<AuthProviderParams> = {
        id: "MyBitbucketServer",
        type: "BitbucketServer",
        verified: true,
        description: "",
        icon: "",
        host: "bitbucket.nxpod-dev.com",
        oauth: {
            callBackUrl: "",
            clientId: "not-used",
            clientSecret: "",
            tokenUrl: "",
            scope: "",
            authorizationUrl: "",
        },
    };

    // https://bitbucket.nxpod-dev.com/projects/TES/repos/read-write-permission/permissions
    readonly checkParams: IGitTokenValidatorParams = {
        host: TestBitbucketServerTokenValidator.AUTH_HOST_CONFIG.host!,
        owner: "TES",
        repo: "read-write-permission",
        repoKind: "projects",
        token: "undefined",
    };

    private getValidator(token: string) {
        const container = new Container();
        container.load(
            new ContainerModule((bind, unbind, isBound, rebind) => {
                bind(BitbucketServerTokenValidator).toSelf().inSingletonScope();
                bind(AuthProviderParams).toConstantValue(TestBitbucketServerTokenValidator.AUTH_HOST_CONFIG);
                bind(BitbucketServerTokenHelper).toSelf().inSingletonScope();
                bind(TokenProvider).toConstantValue(<TokenProvider>{
                    getTokenForHost: async () => {
                        return {
                            value: token || "undefined",
                            scopes: [],
                        };
                    },
                });
                bind(BitbucketServerApi).toSelf().inSingletonScope();
            }),
        );
        return container.get(BitbucketServerTokenValidator);
    }

    @test(skip(ifEnvVarNotSet("NXPOD_TEST_TOKEN_BITBUCKET_SERVER_READ"))) async test_checkWriteAccess_read_only() {
        const token = process.env["NXPOD_TEST_TOKEN_BITBUCKET_SERVER_READ"]!;
        const result = await this.getValidator(token).checkWriteAccess(Object.assign({}, this.checkParams, { token }));
        expect(result).to.deep.equal({
            found: true,
            isPrivateRepo: true,
            writeAccessToRepo: false,
        });
    }

    @test(skip(ifEnvVarNotSet("NXPOD_TEST_TOKEN_BITBUCKET_SERVER_WRITE")))
    async test_checkWriteAccess_write_permissions() {
        const token = process.env["NXPOD_TEST_TOKEN_BITBUCKET_SERVER_WRITE"]!;
        const result = await this.getValidator(token).checkWriteAccess(Object.assign({}, this.checkParams, { token }));
        expect(result).to.deep.equal({
            found: true,
            isPrivateRepo: true,
            writeAccessToRepo: true,
        });
    }

    @test(skip(ifEnvVarNotSet("NXPOD_TEST_TOKEN_BITBUCKET_SERVER_ADMIN")))
    async test_checkWriteAccess_admin_permissions() {
        const token = process.env["NXPOD_TEST_TOKEN_BITBUCKET_SERVER_ADMIN"]!;
        const result = await this.getValidator(token).checkWriteAccess(Object.assign({}, this.checkParams, { token }));
        expect(result).to.deep.equal({
            found: true,
            isPrivateRepo: true,
            writeAccessToRepo: true,
        });
    }
}

module.exports = new TestBitbucketServerTokenValidator();
