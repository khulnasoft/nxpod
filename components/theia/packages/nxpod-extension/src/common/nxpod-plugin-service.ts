/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { CancellationToken } from '@theia/core/lib/common/cancellation';
import { ResolvedPlugins, ResolvedPluginKind, ResolvePluginsParams, InstallPluginsParams, UninstallPluginParams } from "@nxpod/nxpod-protocol";
import { PluginModel } from '@theia/plugin-ext/lib/common/plugin-protocol';

export const nxpodPluginPath = '/services/nxpodPlugin';

export const NxpodPluginService = Symbol('NxpodPluginService');
export interface NxpodPluginService {

    getUploadUri(): Promise<string>;

    deploy(): Promise<void>;

    find(params: FindExtensionsParams, token: CancellationToken): Promise<FindExtensionsResult>;

    install(params: InstallPluginsParams, token: CancellationToken): Promise<void>;

    uninstall(params: UninstallPluginParams, token: CancellationToken): Promise<void>;

    upload(params: UploadExtensionParams): Promise<string>;

}

export interface DeployedPlugin {
    pluginId: string
    kind: ResolvedPluginKind
}

export interface DidDeployPluginsResult {
    [id: string]: DeployedPlugin
}

export interface NxpodPluginClientEventEmitter {
    onWillDeploy(): void;
    onDidDeploy(event: DidDeployPluginsResult): void;
}

export interface NxpodPluginClient extends NxpodPluginClientEventEmitter {
    resolve(params: ResolvePluginsParams): Promise<ResolvedPlugins>;
}

export interface FindExtensionsParams {
    fileUris: string[];
}

export interface FindExtensionsResult {
    [fileUri: string]: { fullPluginName: string }[];
}

export interface UploadExtensionParams {
    fullPluginName: string;
    targetUrl: string;
}

export interface NxpodPluginModel extends PluginModel {
    author?: string | { name: string };
    icon?: string;
}
