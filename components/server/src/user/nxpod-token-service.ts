/**
 * Copyright (c) 2023 Nxpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License.AGPL.txt in the project root for license information.
 */

import * as crypto from "crypto";
import { DBNxpodToken, UserDB } from "@nxpod/nxpod-db/lib";
import { NxpodToken, NxpodTokenType } from "@nxpod/nxpod-protocol";
import { log } from "@nxpod/nxpod-protocol/lib/util/logging";
import { inject, injectable } from "inversify";
import { Authorizer } from "../authorization/authorizer";

@injectable()
export class NxpodTokenService {
    constructor(
        @inject(UserDB) private readonly userDB: UserDB,
        @inject(Authorizer) private readonly auth: Authorizer,
    ) {}

    async getNxpodTokens(requestorId: string, userId: string): Promise<NxpodToken[]> {
        await this.auth.checkPermissionOnUser(requestorId, "read_tokens", userId);
        const nxpodTokens = await this.userDB.findAllNxpodTokensOfUser(userId);
        return nxpodTokens;
    }

    async generateNewNxpodToken(
        requestorId: string,
        userId: string,
        options: { name?: string; type: NxpodTokenType; scopes?: string[] },
        oldPermissionCheck?: (dbToken: DBNxpodToken) => Promise<void>, // @deprecated
    ): Promise<string> {
        await this.auth.checkPermissionOnUser(requestorId, "write_tokens", userId);
        const token = crypto.randomBytes(30).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(token, "utf8").digest("hex");
        const dbToken: DBNxpodToken = {
            tokenHash,
            name: options.name,
            type: options.type,
            userId,
            scopes: options.scopes || [],
            created: new Date().toISOString(),
        };
        if (oldPermissionCheck) {
            await oldPermissionCheck(dbToken);
        }
        await this.userDB.storeNxpodToken(dbToken);
        return token;
    }

    async findNxpodToken(requestorId: string, userId: string, tokenHash: string): Promise<NxpodToken | undefined> {
        await this.auth.checkPermissionOnUser(requestorId, "read_tokens", userId);
        let token: NxpodToken | undefined;
        try {
            token = await this.userDB.findNxpodTokensOfUser(userId, tokenHash);
        } catch (error) {
            log.error({ userId }, "failed to resolve nxpod token: ", error);
        }
        return token;
    }

    async deleteNxpodToken(
        requestorId: string,
        userId: string,
        tokenHash: string,
        oldPermissionCheck?: (token: NxpodToken) => Promise<void>, // @deprecated
    ): Promise<void> {
        await this.auth.checkPermissionOnUser(requestorId, "write_tokens", userId);
        const existingTokens = await this.getNxpodTokens(requestorId, userId);
        const tkn = existingTokens.find((token) => token.tokenHash === tokenHash);
        if (!tkn) {
            throw new Error(`User ${requestorId} tries to delete a token ${tokenHash} that does not exist.`);
        }
        if (oldPermissionCheck) {
            await oldPermissionCheck(tkn);
        }
        await this.userDB.deleteNxpodToken(tokenHash);
    }
}
