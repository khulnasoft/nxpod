/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import "reflect-metadata";
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ResponseError } from "vscode-jsonrpc";
import { NxpodService, CreateWorkspaceMode } from "@nxpod/nxpod-protocol";
import { Deferred } from "@nxpod/nxpod-protocol/lib/util/deferred";
import { ErrorCodes } from "@nxpod/nxpod-protocol/lib/messaging/error";
import { WelcomeOauth } from "../create/welcome-oauth";
import { CreateWorkspaceProps, getWayoutURL } from "./create-workspace";
import { createNxpodService } from "../../service-factory";
import { getWorkspacesUrl } from "../../routing";
import withRoot from "../../withRoot";
import { WithBranding } from "../with-branding";
import { renderEntrypoint } from "../../entrypoint";
import { NxpodHostUrl } from "@nxpod/nxpod-protocol/lib/util/nxpod-host-url";

export async function start(Component: React.ComponentType<CreateWorkspaceProps>) {
    function getContextUrl() {
        const ctxUrl = window.location.hash || window.location.pathname;
        return ctxUrl ? ctxUrl.replace(/^[#/]+/g, '') : undefined;
    }
    async function redirectNotAuthenticated(service: NxpodService) {
        let tgt = await getWayoutURL(service);
        const branding = await WithBranding.getBranding(service);
        if (branding) {
            tgt = branding.redirectUrlIfNotAuthenticated || getWorkspacesUrl();
        }
        window.location.href = tgt;
        return;
    }
    async function showWelcome(_contextUrl?: string) {
        const moveOn = new Deferred<void>();
        service.server.getLoggedInUser().then(user => {
            // when logged in proceed, just in case the cookie was deleted manually
            if (user) {
                moveOn.resolve();
            }
        });
        document.title = 'Welcome! - Nxpod';
        const WelcomeOauthRoot = withRoot(WelcomeOauth);
        ReactDOM.render(<WelcomeOauthRoot moveOn={moveOn} contextUrl={_contextUrl} />, document.querySelector('#root'));
        return moveOn.promise;
    }
    const contextUrl = getContextUrl();
    const service = createNxpodService();
    if (contextUrl === undefined || contextUrl === '') {
        // opening nxpod.io without context and no login
        // should eagerly forward to website
        if (!document.cookie.match("nxpod-user=loggedIn")) {
            return redirectNotAuthenticated(service);
        }
        try {
            await service.server.getLoggedInUser();
            // if logged in without context -> go to workspaces
            window.location.href = getWorkspacesUrl();
            return;
        } catch (err) {
            if (err instanceof ResponseError) {
                switch (err.code) {
                    case ErrorCodes.SETUP_REQUIRED:
                        window.location.href = new NxpodHostUrl(window.location.toString()).with({ pathname: "first-steps" }).toString();
                        break;
                    case ErrorCodes.NOT_AUTHENTICATED:
                        // redirect to website
                        return redirectNotAuthenticated(service);
                    default:
                }
            }
        }
    } else {
        const showWelcomeEnabled = window.location.hostname.includes('nxpod');

        // opening nxpod.io with a context and no login
        // forward to welcome page
        if (!document.cookie.match("nxpod-user=loggedIn") && showWelcomeEnabled) {
            await showWelcome(contextUrl);
            document.title = 'Nxpod - Prebuilt Dev Environments for GitLab, GitHub, and Bitbucket';
        }

        const createWorkspacePromise = service.server.createWorkspace({ contextUrl, mode: CreateWorkspaceMode.SelectIfRunning });
        renderEntrypoint(Component, { service, contextUrl, createWorkspacePromise });
    }
}