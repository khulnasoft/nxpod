/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { injectable, inject } from 'inversify';
import { ExternalUriService } from '@theia/core/lib/browser/external-uri-service';
import URI from '@theia/core/lib/common/uri';
import { NxpodPortsService } from './ports/nxpod-ports-service';
import { parseLocalhost } from './nxpod-parse-localhost';

@injectable()
export class NxpodExternalUriService extends ExternalUriService {
    @inject(NxpodPortsService) protected readonly portsService: NxpodPortsService;

    async resolve(uri: URI): Promise<URI> {
        const localhost = this.parseLocalhost(uri);
        if (!localhost) {
            return uri;
        }

        // Actually expose the port
        let { config } = await this.portsService.findPortConfig(localhost.port);
        if (!config) {
            await this.portsService.openPort({
                port: localhost.port,
                onOpen: 'ignore'
            }, 'private');
        }

        return this.toRemoteUrl(uri, localhost);
    }

    protected toRemoteHost(localhost: { address: string, port: number }): string {
        return `${localhost.port}-${window.location.hostname}`;
    }

    parseLocalhost(uri: URI): { address: string, port: number } | undefined {
        return parseLocalhost(uri);
    }

}