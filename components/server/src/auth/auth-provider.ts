/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */


import * as express from 'express';
import { Identity, AuthProviderInfo, User, OAuth2Config, AuthProviderEntry } from "@nxpod/nxpod-protocol";
import { saveSession } from '../express-util';

import { UserEnvVarValue } from "@nxpod/nxpod-protocol";

export const AuthProviderParams = Symbol("AuthProviderParams");
export interface AuthProviderParams extends AuthProviderEntry {
    readonly builtin: boolean; // true, if `ownerId` == ""
    readonly verified: boolean; // true, if `status` == "verified"

    readonly oauth: OAuth2Config & {
        // extending:
        readonly configFn?: string;
    }

    // for special auth providers only
    readonly params?: {
        [key: string]: string;
        readonly authUrl: string;
        readonly callBackUrl: string;
        readonly githubToken: string;
    }

    // properties to control behavior
    readonly hiddenOnDashboard?: boolean;
    readonly loginContextMatcher?: string;
    readonly disallowLogin?: boolean;
    readonly requireTOS?: boolean;

    readonly description: string;
    readonly icon: string;
}
export function parseAuthProviderParamsFromEnv(json: object): AuthProviderParams[] {
    const result: AuthProviderParams[] = [];
    if (Array.isArray(json)) {
        for (const o of json) {
            result.push({
                ...o,
                ownerId: "",
                builtin: true,
                status: "verified",
                verified: true,
            })
        }
    }
    return result;
}

export interface AuthUserSetup {
    authUser: AuthUser;
    blockUser?: boolean;
    currentScopes: string[];
    envVars?: UserEnvVarValue[];
}

export interface AuthUser {
    readonly authId: string;
    readonly authName: string;
    readonly primaryEmail: string;
    readonly name?: string;
    readonly avatarUrl?: string;
}

export const AuthProvider = Symbol('AuthProvider');
export interface AuthProvider {
    readonly authProviderId: string;
    readonly config: AuthProviderParams;
    readonly info: AuthProviderInfo;
    readonly authCallbackPath: string;
    readonly callback: express.RequestHandler;
    authorize(req: express.Request, res: express.Response, next: express.NextFunction, scopes?: string[]): void;
    refreshToken?(user: User): Promise<void>;
}

export type AuthBag = AuthBag.AuthorizeBag | AuthBag.AuthenticateBag;
export namespace AuthBag {
    export interface AuthorizeBag {
        readonly requestType: "authorize";
        readonly host: string;
        readonly returnTo: string;
        readonly override: boolean;
    }
    export interface AuthenticateBag {
        readonly requestType: "authenticate";
        readonly host: string;
        readonly returnTo: string;
        readonly identity?: Identity;
        readonly returnToAfterTos: string;
        readonly elevateScopes?: string[];
    }
    export function get(session: Express.Session | undefined): AuthBag | undefined {
        if (session) {
            return session['authBag'] as AuthBag | undefined;
        }
    }
    export async function attach(session: Express.Session, authBag: AuthBag): Promise<void> {
        session['authBag'] = authBag;
        return saveSession(session);
    }
    export async function clear(session: Express.Session | undefined) {
        if (session) {
            session['authBag'] = undefined;
            return saveSession(session);
        }
    }
}
