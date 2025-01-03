/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import * as express from 'express';
import { injectable, inject } from 'inversify';
import { Env } from '../env';

@injectable()
export class NxpodCookie {
    @inject(Env) protected readonly env: Env;
    /**
     * The cookie is used to distinguish between users and new website visitors.
     */
    setCookie(res: express.Response) {
        if (res.headersSent) {
            return;
        }
        res.cookie('nxpod-user', 'loggedIn', {
            path: "/",
            httpOnly: false,
            secure: false,
            maxAge: 1000 * 60 * 60 * 24 * 7,    // 7 days
            sameSite: "lax",                    // default: true. "Lax" needed for OAuth.
            domain: `.${this.env.hostUrl.url.host}`
        });
    }

    unsetCookie(res: express.Response) {
        if (res.headersSent) {
            return;
        }
        res.cookie('nxpod-user', '', {
            path: "/",
            domain: `.${this.env.hostUrl.url.host}`,
            maxAge: 0
        });
    }
}