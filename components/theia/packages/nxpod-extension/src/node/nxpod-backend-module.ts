/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

/**
 * Generated using theia-extension-generator
 */

import { ContainerModule } from "inversify";
import { NxPodExpressService } from './nxpod-express-service';
import { BackendApplicationContribution } from "@theia/core/lib/node/backend-application";
import { NxpodTaskStarter, TheiaLocalTaskStarter, WorkspaceReadyTaskStarter } from './nxpod-task-starter';
import { NxpodFileParser } from '@nxpod/nxpod-protocol/lib/nxpod-file-parser';

import { NxpodInfoProviderNodeImpl } from "./nxpod-info-backend";
import { ConnectionHandler, JsonRpcConnectionHandler } from "@theia/core";
import { ServedPortsServiceClient, ServedPortsService, ServedPortsServiceServer } from "../common/served-ports-service";
import { NxpodEnvVariablesServer } from "./nxpod-env-variables-server";
import { ShellProcess } from "@theia/terminal/lib/node/shell-process";
import { NxpodShellProcess } from "./nxpod-shell-process";
import { ServedPortsServiceServerImpl } from "./served-ports-service-server";
import { CliServiceServer, CliServiceServerImpl } from "./cli-service-server";
import { ILoggerServer } from "@theia/core/lib/common/logger-protocol";
import { JsonConsoleLoggerServer } from "./json-console-logger-server";
import { PluginDeployerResolver } from "@theia/plugin-ext/lib/common/plugin-protocol";
import { PluginPathsService } from "@theia/plugin-ext/lib/main/common/plugin-paths-protocol";
import { NxpodPluginPathService } from "./nxpod-plugin-path-service";
import { TheiaCLIService, SERVICE_PATH } from "../common/cli-service";
import { NxpodPluginResolver } from "./extensions/nxpod-plugin-resolver";
import { NxpodPluginDeployer } from "./extensions/nxpod-plugin-deployer";
import { HostedPluginDeployerHandler } from "@theia/plugin-ext/lib/hosted/node/hosted-plugin-deployer-handler";
import { NxpodPluginDeployerHandler } from "./extensions/nxpod-plugin-deployer-handler";
import { nxpodPluginPath, NxpodPluginClient } from "../common/nxpod-plugin-service";
import { NxpodPluginLocator } from "./extensions/nxpod-plugin-locator";
import { NxpodPluginLocatorClient } from "./extensions/nxpod-plugin-locator-client";
import { HostedPluginReader } from "@theia/plugin-ext/lib/hosted/node/plugin-reader";
import { NxpodPluginReader } from "./extensions/nxpod-plugin-reader";
import { nxpodInfoPath } from "../common/nxpod-info";
import { ContentReadyServiceServer, ContentReadyServiceClient, ContentReadyService } from "../common/content-ready-service";
import { ContentReadyServiceServerImpl } from "./content-ready-service-server";
import { Deferred } from "@theia/core/lib/common/promise-util";
import { OpenVSXExtensionProviderImpl } from "./extensions/openvsx-extension-provider-impl";
import { openVSXExtensionProviderPath } from "../common/openvsx-extension-provider";
import { EnvVariablesServer } from "@theia/core/lib/common/env-variables";
import { RemoteFileSystemServer, FileSystemProviderServer } from "@theia/filesystem/lib/common/remote-file-system-provider";

export default new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(ShellProcess).to(NxpodShellProcess).inTransientScope();

    rebind(ILoggerServer).to(JsonConsoleLoggerServer).inSingletonScope();

    bind(NxpodFileParser).toSelf().inSingletonScope();
    bind(NxpodTaskStarter).toSelf().inSingletonScope();
    bind(BackendApplicationContribution).to(WorkspaceReadyTaskStarter).inSingletonScope();

    if (process.env['THEIA_LOCAL']) {
        // in theia local mode, no signal is coming from syncd, so we want to launch the tasks on start.
        bind(BackendApplicationContribution).to(TheiaLocalTaskStarter);
    }

    bind(NxPodExpressService).toSelf().inSingletonScope();
    bind(BackendApplicationContribution).toService(NxPodExpressService);

    bind(ServedPortsServiceServer).to(ServedPortsServiceServerImpl).inSingletonScope();
    bind(ConnectionHandler).toDynamicValue(context =>
        new JsonRpcConnectionHandler<ServedPortsServiceClient>(ServedPortsService.SERVICE_PATH, client => {
            const server = context.container.get<ServedPortsServiceServer>(ServedPortsServiceServer);
            server.setClient(client);
            client.onDidCloseConnection(() => server.disposeClient(client));
            return server;
        })
    ).inSingletonScope();

    bind(CliServiceServer).to(CliServiceServerImpl).inSingletonScope();
    bind(ConnectionHandler).toDynamicValue(context =>
        new JsonRpcConnectionHandler<TheiaCLIService>(SERVICE_PATH, client => {
            const server = context.container.get<CliServiceServer>(CliServiceServer);
            server.setClient(client);
            client.onDidCloseConnection(() => server.disposeClient(client));
            return server;
        })
    ).inSingletonScope();

    if (!process.env['THEIA_LOCAL']) {
        rebind(EnvVariablesServer).to(NxpodEnvVariablesServer).inSingletonScope();
        rebind(RemoteFileSystemServer).toDynamicValue(context => {
            const server = context.container.get(FileSystemProviderServer);
            const contentReadyServer: ContentReadyServiceServer = context.container.get(ContentReadyServiceServer);
            const ready = new Deferred();
            contentReadyServer.setClient({
                onContentReady() {
                    ready.resolve();
                    return Promise.resolve();
                }
            });
            const get: (target: any, prop: any) => any = (target: any, prop: any) => {
                const orig = target[prop];
                if (typeof orig === 'function') {
                    return (...args: any[]) => {
                        return ready.promise.then(() => {
                            return orig.apply(target, args);
                        });
                    }
                }
                return orig;
            };
            return new Proxy(server, { get });
        });
    }

    rebind(HostedPluginReader).to(NxpodPluginReader).inSingletonScope();

    bind(ContentReadyServiceServer).to(ContentReadyServiceServerImpl).inSingletonScope();
    bind(ConnectionHandler).toDynamicValue(context =>
        new JsonRpcConnectionHandler<ContentReadyServiceClient>(ContentReadyService.SERVICE_PATH, client => {
            const server = context.container.get<ContentReadyServiceServer>(ContentReadyServiceServer);
            server.setClient(client);
            client.onDidCloseConnection(() => server.disposeClient(client));
            return server;
        })
    ).inSingletonScope();

    bind(NxpodPluginDeployerHandler).toSelf().inSingletonScope();
    rebind(HostedPluginDeployerHandler).toService(NxpodPluginDeployerHandler);
    bind(NxpodPluginDeployer).toSelf().inSingletonScope();
    bind(BackendApplicationContribution).toService(NxpodPluginDeployer);
    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler<NxpodPluginClient>(nxpodPluginPath, client => {
            const service = ctx.container.get(NxpodPluginDeployer)
            const toRemoveClient = service.addClient(client);
            client.onDidCloseConnection(() => toRemoveClient.dispose());
            return service;
        })
    ).inSingletonScope();

    bind(NxpodPluginLocator).to(NxpodPluginLocatorClient).inSingletonScope();
    bind(NxpodPluginResolver).toSelf().inSingletonScope();
    bind(PluginDeployerResolver).toService(NxpodPluginResolver);
    rebind(PluginPathsService).to(NxpodPluginPathService).inSingletonScope();

    bind(OpenVSXExtensionProviderImpl).toSelf().inSingletonScope();
    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler<any>(openVSXExtensionProviderPath, () =>
            ctx.container.get(OpenVSXExtensionProviderImpl)
        )
    ).inSingletonScope();

    // NxpodInfoService
    bind(NxpodInfoProviderNodeImpl).toSelf().inSingletonScope();
    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler<any>(nxpodInfoPath, client => {
            const service = ctx.container.get(NxpodInfoProviderNodeImpl)
            return service;
        })
    ).inSingletonScope();
});
