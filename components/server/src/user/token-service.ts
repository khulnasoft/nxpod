/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { injectable, inject, postConstruct } from "inversify";
import { Token, Identity, User, TokenEntry } from "@nxpod/nxpod-protocol";
import { HostContextProvider } from "../auth/host-context-provider";
import { UserDB } from "@nxpod/nxpod-db/lib/user-db";
import * as uuid from "uuid/v4";
import { TokenProvider } from "./token-provider";
import { TokenGarbageCollector } from "./token-garbage-collector";

@injectable()
export class TokenService implements TokenProvider {

    static readonly NXPOD_AUTH_PROVIDER_ID = 'Nxpod';
    static readonly NXPOD_PORT_AUTH_TOKEN_EXPIRY_MILLIS = 30 * 60 * 1000;

    @inject(HostContextProvider) protected readonly hostContextProvider: HostContextProvider;
    @inject(TokenGarbageCollector) protected readonly tokenGC: TokenGarbageCollector;
    @inject(UserDB) protected readonly userDB: UserDB;

    @postConstruct()
    init() {
        this.tokenGC.start();
    }

    async getTokenForHost(user: User, host: string): Promise<Token> {
        const identity = this.getIdentityForHost(user, host);
        let token = await this.userDB.findTokenForIdentity(identity);
        if (!token) {
            throw new Error(`No token found for user ${identity.authProviderId}/${identity.authId}/${identity.authName}!`);
        }
        const refreshTime = new Date();
        refreshTime.setTime(refreshTime.getTime() + 30 * 60 * 1000);
        if (token.expiryDate && token.expiryDate < refreshTime.toISOString()) {
            const { authProvider } = this.hostContextProvider.get(host)!;
            if (authProvider.refreshToken) {
                await authProvider.refreshToken(user);
                token = (await this.userDB.findTokenForIdentity(identity))!;
            }
        }
        return token;
    }

    async getOrCreateNxpodIdentity(user: User): Promise<Identity> {
        let identity = User.getIdentity(user, TokenService.NXPOD_AUTH_PROVIDER_ID);
        if (!identity) {
            identity = {
                authProviderId: TokenService.NXPOD_AUTH_PROVIDER_ID,
                authId: user.id,
                authName: user.name || user.id
            }
            user.identities.push(identity);
            await this.userDB.storeUser(user);
        }
        return identity;
    }

    async createNxpodToken(user: User, ...scopes: string[]): Promise<TokenEntry> {
        const identity = await this.getOrCreateNxpodIdentity(user);
        await this.userDB.deleteTokens(identity, 
            // delete any tokens with the same scopes
            tokenEntry => tokenEntry.token.scopes.every(s => scopes.indexOf(s) !== -1)
        );
        const token: Token = {
            value: uuid(),
            scopes: scopes || [],
            updateDate: new Date().toISOString()
        }
        return await this.userDB.addToken(identity, token);
    }

    /**
     * Currently this methods creates a new Token with every call.
     * This relies on two things:
     *  - the frontends to not request too many tokens (puts load on the DB)
     *  - the TokenGarbageCollector to cleanup expired tokens
     * @param user 
     * @param workspaceId
     */
    async getFreshPortAuthenticationToken(user: User, workspaceId: string): Promise<Token> {
        const newPortAuthToken = (): Token => {
            return {
                value: uuid(),
                scopes: [TokenService.generateWorkspacePortAuthScope(workspaceId)],
                updateDate: new Date().toISOString(),
                expiryDate: new Date(Date.now() + TokenService.NXPOD_PORT_AUTH_TOKEN_EXPIRY_MILLIS).toISOString(),
            };
        };

        const identity = await this.getOrCreateNxpodIdentity(user);
        const token = newPortAuthToken();
        const tokenEntry = await this.userDB.addToken(identity, token);
        // The following necessary to allow fast retrieval.
        // TODO: Move tokens like this into a separate data store
        tokenEntry.token.value = tokenEntry.uid;
        await this.userDB.updateTokenEntry(tokenEntry);
        return token;
    }

    protected getIdentityForHost(user: User, host: string): Identity {
        const authProviderId = this.getAuthProviderId(host);
        const hostIdentity = authProviderId && User.getIdentity(user, authProviderId);
        if (!hostIdentity) {
            throw new Error(`User ${user.name} has no identity for host: ${host}!`);
        }
        return hostIdentity;
    }

    protected getAuthProviderId(host: string): string | undefined {
        const hostContext = this.hostContextProvider.get(host);
        if (!hostContext) {
            return undefined;
        }
        return hostContext.authProvider.authProviderId;
    }

    public static generateWorkspacePortAuthScope(workspaceId: string): string {
        return `access/workspace/${workspaceId}/port/*`;
    }
}
