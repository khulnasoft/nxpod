/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

const URL = require('url').URL || window.URL;
import { log } from './logging';

export interface UrlChange {
    (old: URL): Partial<URL>
}
export type UrlUpdate = UrlChange | Partial<URL>;

export const workspaceIDRegex = /([a-z0-9]{4,8}-)+([a-z0-9]{12})/;

export class NxpodHostUrl {
    readonly url: URL;

    constructor(urlParam?: string | URL) {
        if (urlParam === undefined || typeof urlParam === 'string') {
            this.url = new URL(urlParam || 'https://nxpod.khulnasoft.com');
            this.url.search = '';
            this.url.hash = '';
            this.url.pathname = '';
        } else if (urlParam instanceof URL) {
            this.url = urlParam;
        } else {
            log.error('Unexpected urlParam', { urlParam });
        }
    }

    withWorkspacePrefix(workspaceId: string, region: string) {
        return this.withDomainPrefix(`${workspaceId}.ws-${region}.`);
    }

    withDomainPrefix(prefix: string): NxpodHostUrl {
        return this.with(url => ({ host: prefix + url.host }));;
    }

    withoutWorkspacePrefix(): NxpodHostUrl {
        if (!this.url.host.match(workspaceIDRegex)) {
            // URL has no workspace prefix
            return this;
        }

        return this.withoutDomainPrefix(2);
    }

    withoutDomainPrefix(removeSegmentsCount: number): NxpodHostUrl {
        return this.with(url => ({ host: url.host.split('.').splice(removeSegmentsCount).join('.') }));
    }

    with(urlUpdate: UrlUpdate) {
        const update = typeof urlUpdate === 'function' ? urlUpdate(this.url) : urlUpdate;
        const addSlashToPath = update.pathname && update.pathname.length > 0 && !update.pathname.startsWith('/');
        if (addSlashToPath) {
            update.pathname = '/' + update.pathname;
        }
        const result = Object.assign(new URL(this.toString()), update);
        return new NxpodHostUrl(result);
    }

    withApi(urlUpdate?: UrlUpdate) {
        const updated = urlUpdate ? this.with(urlUpdate) : this;
        return updated.with(url => ({ pathname: `/api${url.pathname}` }));
    }

    withContext(contextUrl: string) {
        return this.with(url => ({ hash: contextUrl }));
    }

    asWebsocket(): NxpodHostUrl {
        return this.with(url => ({ protocol: url.protocol === 'https:' ? 'wss:' : 'ws:' }));
    }

    asDashboard(): NxpodHostUrl {
        return this.with(url => ({ pathname: '/workspaces/' }));
    }

    asLogin(): NxpodHostUrl {
        return this.with(url => ({ pathname: '/login/' }));
    }

    asUpgradeSubscription(): NxpodHostUrl {
        return this.with(url => ({ pathname: '/upgrade-subscription/' }));
    }

    asAccessControl(): NxpodHostUrl {
        return this.with(url => ({ pathname: '/access-control/' }));
    }

    asSettings(): NxpodHostUrl {
        return this.with(url => ({ pathname: '/settings/' }));
    }

    asGraphQLApi(): NxpodHostUrl {
        return this.with(url => ({ pathname: '/graphql/' }));
    }

    asWorkspaceAuth(instanceID: string, redirect?: boolean): NxpodHostUrl {
        return this.with(url => ({ pathname: `/api/auth/workspace-cookie/${instanceID}`, search: redirect ? "redirect" : "" }));
    }

    toString() {
        return this.url.toString();
    }

    toStringWoRootSlash() {
        let result = this.toString();
        if (result.endsWith('/')) {
            result = result.slice(0, result.length - 1);
        }
        return result;
    }
}
