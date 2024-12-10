/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { injectable, inject } from "inversify";

import { ILogger } from '@theia/core/lib/common/logger';
import { FrontendApplicationContribution, FrontendApplication } from "@theia/core/lib/browser";

import { NxpodInfoService } from "../../common/nxpod-info";
import { NxpodService } from "@nxpod/nxpod-protocol"
import { NxpodNotRunningOverlay } from "./nxpod-not-running-dialog";
import { NxpodServiceProvider } from "../nxpod-service-provider";
import { MessageService } from "@theia/core";
import { ConnectionStatusService, PingService } from "@theia/core/lib/browser/connection-status-service";


@injectable()
export class NxpodKeepAlivePolling implements FrontendApplicationContribution {

    @inject(ILogger) protected readonly logger: ILogger;
    @inject(NxpodInfoService) protected readonly nxpodInfoService: NxpodInfoService;
    @inject(NxpodServiceProvider) protected readonly nxpodServiceProvider: NxpodServiceProvider;
    @inject(MessageService) protected readonly messageService: MessageService;
    @inject(ConnectionStatusService) protected readonly connectionStatus: ConnectionStatusService;
    @inject(PingService) protected readonly pingService: PingService;

    private lastActivity: number = 0;
    protected overlay: NxpodNotRunningOverlay;

    // method is reassigned below
    onStop() {}

    async onStart(app: FrontendApplication) {
        try {
            const info = await this.nxpodInfoService.getInfo()
            const service = await this.nxpodServiceProvider.getService();
            this.overlay = new NxpodNotRunningOverlay(service, info, this.messageService, this.connectionStatus);
            this.onStop = () => {
                service.server.sendHeartBeat({ instanceId: info.instanceId, wasClosed: true });
            };
            this.registerActivityHandlers();
            setInterval(() => this.checkActivity(service, info.interval), Math.max(info.interval, 10000));

            // send one heartbeat on startup
            const roundTripTime = await this.measureRoundTripTime();
            await service.server.sendHeartBeat({ instanceId: info.instanceId, roundTripTime });
        } catch (err) {
            this.logger.error("Unable to connect to nxpod service: " + err.message);
        }
    }


    private registerActivityHandlers() {
        const activity = () => {
            this.lastActivity = new Date().getTime();
        };
        window.document.addEventListener('mousemove', activity)
        window.document.addEventListener('keydown', activity)
    }

    private noHost = false;

    protected async checkActivity(nxpodService: NxpodService, interval: number) {
        if (this.lastActivity + interval < new Date().getTime()) {
            // no activity, no heartbeat
            return;
        }
        const info = await this.nxpodInfoService.getInfo();
        try {
            if (info.host && info.instanceId) {
                this.noHost = false;

                // before sending the hearbeat we measure the round-trip time s.t. we can report that with the hearbeat
                const roundTripTime = await this.measureRoundTripTime();

                await nxpodService.server.sendHeartBeat({ instanceId: info.instanceId, roundTripTime });
            } else {
                if (!this.noHost) {
                    this.logger.info("No nxpod server host set.");
                    this.noHost = true;
                }
            }
        } catch (err) {
            this.logger.error(err.message);
        }
    }

    protected async measureRoundTripTime() {
        const targetSampleCount = 5;
        var sampleCount = 0;
        var result: number | undefined = 0;
        for(var i = 0; i < targetSampleCount; i++) {
            const now = new Date().getTime();
            try {
                await this.pingService.ping();

                const rtt = new Date().getTime() - now;
                result += rtt;
                sampleCount++;
            } catch(err) {
                // ignore this error - we're just not counting the sample
            }
        }

        if(sampleCount > 0) {
            result /= sampleCount;
        } else {
            result = undefined;
        }
        this.logger.debug(`Measured backend roundtrip time: ${result}`);

        return result;
    }
}