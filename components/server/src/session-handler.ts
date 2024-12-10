/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import * as express from 'express';
import * as session from 'express-session'
import { SessionOptions } from 'express-session'
import * as uuidv4 from "uuid/v4"
import { injectable, inject , postConstruct } from 'inversify';

import * as MySQLStore from 'express-mysql-session';
import { Config } from '@nxpod/nxpod-db/lib/config';
import { Env } from './env';
import { log } from '@nxpod/nxpod-protocol/lib/util/logging';


@injectable()
export class SessionHandlerProvider {
    @inject(Config) protected readonly dbConfig: Config;
    @inject(Env) protected readonly env: Env;

    public sessionHandler: express.RequestHandler

    @postConstruct()
    public init() {
        const options: SessionOptions = {} as SessionOptions
        options.cookie = this.getCookieOptions(this.env);
        options.genid = function (req: any) {
            return uuidv4() // use UUIDs for session IDs
        },
        options.name = SessionHandlerProvider.getCookieName(this.env);
        // options.proxy = true    // TODO SSL Proxy
        options.resave = true   // TODO Check with store! See docu
        options.rolling = true // default, new cookie and maxAge
        options.secret = this.env.sessionSecret;
        options.saveUninitialized = false   // Do not save new cookie without content (uninitialized)

        options.store = this.createStore();

        this.sessionHandler = session(options);
    }

    protected getCookieOptions(env: Env): express.CookieOptions {
        const hostParts = env.hostUrl.url.host.split('.');
        const baseDomain = hostParts.slice(hostParts.length - 2).join('.');
        let domain = `.${baseDomain}`;
        if (this.env.insecureNoDomain) {
            domain = baseDomain.split(":")[0];
        }

        return {
            path: "/",                    // default
            httpOnly: true,               // default
            secure: false,                // default, TODO SSL! Config proxy
            maxAge: env.sessionMaxAgeMs,  // configured in Helm chart, defaults to 3 days.
            sameSite: "lax",              // default: true. "Lax" needed for OAuth.
            domain: `${domain}`           // Use cookie for base domain (works for *.staging.nxpod.khulnasoft.com because of the name, see below)
            // Otherwise, clients (in this case Chrome) may ignore (as in: save it, but don't send it on consequent requests) the 'Set-Cookie:...' send with a redirect (302, to github oauth)
            // For details, see:
            // - RFC draft sameSite: http://httpwg.org/http-extensions/draft-ietf-httpbis-cookie-same-site.html
            // - https://bugs.chromium.org/p/chromium/issues/detail?id=150066
            // - google: chromium not sending cookies set with redirect
        };
    }

    static getCookieName(env: Env) {
        return env.hostUrl.toString()
            .replace(/https?/, '')
            .replace(/[\W_]+/g, "_");
    }

    public clearSessionCookie(res: express.Response, env: Env): void {
        // http://expressjs.com/en/api.html#res.clearCookie
        const name = SessionHandlerProvider.getCookieName(env);
        const options = { ...this.getCookieOptions(env) };
        delete options.expires;
        delete options.maxAge;
        res.clearCookie(name, options);
    }

    protected createStore(): any | undefined {
        const options = {
            ...(this.dbConfig.dbConfig as any),
            user: this.dbConfig.dbConfig.username,
            database: 'nxpod-sessions',
            createDatabaseTable: true
        };
        return new MySQLStore(options, undefined, (err) => {
            if (err) {
                log.debug('MySQL session store error: ', err);
            }
        });
    }
}