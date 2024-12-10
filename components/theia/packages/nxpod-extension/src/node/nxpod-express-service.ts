/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import * as express from 'express';

import { injectable, inject } from "inversify";
import { BackendApplicationContribution } from "@theia/core/lib/node/backend-application";
import { ILogger } from '@theia/core';
import { CliServiceServer } from './cli-service-server';

@injectable()
export class NxPodExpressService implements BackendApplicationContribution {
    @inject(ILogger) protected readonly logger: ILogger;
    @inject(CliServiceServer) protected readonly cliServiceServer: CliServiceServer;

    configure(app: express.Application): void {

        app.get(NxPodExpressService.READY_PATH, async (req, res) => {
            console.log("Confirmed IDE ready on " + NxPodExpressService.READY_PATH);
            res.status(200).send('ready');
        });

        app.post(NxPodExpressService.CLI_PATH, async (req, res) => {
            const apiKey = process.env['NXPOD_CLI_APITOKEN'];
            if (apiKey === undefined) {
                this.logger.error("NXPOD_CLI_APITOKEN is missing. Abort processing CLI request.");
                res.status(500).send('cli service error');
                return;
            }
            const reqApiKey = req.header("X-AuthToken");
            if (reqApiKey === undefined || reqApiKey !== apiKey) {
                res.status(403).send('forbidden');
                return;
            }

            const cliCall = NxPodExpressService.parseCliCall(req.body);
            if (!cliCall) {
                res.status(404).send('not found');
                return;
            }

            const replyOk = (body: object = { 'status': 'done' }) => {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).send(JSON.stringify(body));
            };

            const { method, params } = cliCall;
            try {
                const handler = (this.cliServiceServer as any)[method];
                if (!handler) {
                    this.logger.warn('unhandled cli call', { req: req.body, method, params });
                    res.status(404).send('not found');
                    return;
                }

                const result = await handler.bind(this.cliServiceServer)(params);
                replyOk(result);
            } catch (error) {
                this.logger.warn(`cli call failed; method: ${method}`, error);
                res.status(500).send('cli service error');
            }
        });
    }

}

export namespace NxPodExpressService {
    export const READY_PATH = '/nxpod/ready';
    export const CLI_PATH = '/nxpod/cli';

    export function parseCliCall(body: any): { method: string, params: object } | undefined {
        if (typeof body['method'] !== 'string') {
            return undefined;
        }
        const method = body['method'] as string;
        let params = {};
        if (typeof body['params'] === 'object') {
            params = body['params'];
        }
        return { method, params };
    }
}
