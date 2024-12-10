/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */


import { WebSocketConnectionProvider } from '@nxpod/nxpod-protocol/lib/messaging/browser/connection';
import { NxpodServer, NxpodServerPath, NxpodServiceImpl, NxpodClient } from '@nxpod/nxpod-protocol';
import { NxpodHostUrl } from '@nxpod/nxpod-protocol/lib/util/nxpod-host-url';
import { log } from '@nxpod/nxpod-protocol/lib/util/logging';
import { globalCache } from './util';

export function createNxpodService<C extends NxpodClient, S extends NxpodServer>(): NxpodServiceImpl<C, S> {
    return globalCache('service', createNxpodServiceInternal) as NxpodServiceImpl<C, S>;
}

function createNxpodServiceInternal<C extends NxpodClient, S extends NxpodServer>() {
    let host = new NxpodHostUrl(window.location.toString())
        .asWebsocket()
        .with({ pathname: NxpodServerPath })
        .withApi();
    
    const connectionProvider = new WebSocketConnectionProvider();
    let numberOfErrors = 0;
    const proxy = connectionProvider.createProxy<S>(host.toString(), undefined, {
        onerror: (event: any) => {
            log.error(event);
            if (numberOfErrors++ === 5) {
                alert('We are having trouble connecting to the server.\nEither you are offline or websocket connections are blocked.');
            }
        }
    });
    const service = new NxpodServiceImpl<C, S>(proxy);
    return service;
}