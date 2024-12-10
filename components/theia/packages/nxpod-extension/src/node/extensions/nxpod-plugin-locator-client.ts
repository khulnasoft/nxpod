/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import * as paths from 'path';
import { inject, injectable } from 'inversify';
import { JsonRpcProxyFactory, DisposableCollection } from '@theia/core';
import { IPCConnectionProvider } from '@theia/core/lib/node';
import { NxpodPluginLocator } from './nxpod-plugin-locator';

@injectable()
export class NxpodPluginLocatorClient implements NxpodPluginLocator {

    protected readonly toDispose = new DisposableCollection();

    @inject(IPCConnectionProvider)
    protected readonly ipcConnectionProvider: IPCConnectionProvider;

    dispose(): void {
        this.toDispose.dispose();
    }

    find(fileUri: string, extensionsPath: string): Promise<{ fullPluginName: string } | undefined> {
        return new Promise((resolve, reject) => {
            const toStop = this.ipcConnectionProvider.listen({
                serverName: 'nxpod-plugin-locator',
                entryPoint: paths.resolve(__dirname, 'nxpod-plugin-locator-host')
            }, async connection => {
                const proxyFactory = new JsonRpcProxyFactory<NxpodPluginLocator>();
                const remote = proxyFactory.createProxy();
                proxyFactory.listen(connection);
                try {
                    resolve(await remote.find(fileUri, extensionsPath));
                } catch (e) {
                    reject(e);
                } finally {
                    toStop.dispose();
                }
            });
            this.toDispose.push(toStop);
        });
    }

}