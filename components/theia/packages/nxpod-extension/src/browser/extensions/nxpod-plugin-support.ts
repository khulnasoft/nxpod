/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { injectable, inject } from "inversify";
import { HostedPluginSupport } from "@theia/plugin-ext/lib/hosted/browser/hosted-plugin";
import { PluginMetadata } from "@theia/plugin-ext";
import { NxpodPluginClient, DidDeployPluginsResult } from "../../common/nxpod-plugin-service";
import { ResolvedPlugins, ResolvePluginsParams } from "@nxpod/nxpod-protocol";
import { NxpodServiceProvider } from "../nxpod-service-provider";
import { MessageService } from "@theia/core/lib/common/message-service";
import { Progress } from "@theia/core/lib/common/message-service-protocol";
import { NxpodInfoService } from '../../common/nxpod-info';

export interface NxpodPluginData {
    plugins: PluginMetadata[]
    deployed: DidDeployPluginsResult
}

@injectable()
export class NxpodPluginSupport extends HostedPluginSupport implements NxpodPluginClient, NxpodPluginData {

    deployed: DidDeployPluginsResult = {};

    @inject(NxpodInfoService)
    protected readonly infoProvider: NxpodInfoService;

    @inject(NxpodServiceProvider)
    protected readonly serviceProvider: NxpodServiceProvider;

    @inject(MessageService)
    protected readonly messageService: MessageService;

    async resolve(params: ResolvePluginsParams): Promise<ResolvedPlugins> {
        const info = await this.infoProvider.getInfo();
        const { server } = await this.serviceProvider.getService();
        return await server.resolvePlugins(info.workspaceId, params);
    }

    protected deployProgress: Promise<Progress> | undefined;
    onWillDeploy(): void {
        this.deployProgress = this.messageService.showProgress({
            text: 'Deploying extensions...',
            options: { cancelable: false }
        });
    }

    onDidDeploy(result: DidDeployPluginsResult): void {
        this.deployed = result;
        if (this.deployProgress) {
            this.deployProgress.then(progress => progress.cancel());
        }
    }

}