/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import '../../src/browser/extensions/style/extensions.css'

import { ContainerModule } from "inversify";
import { GitHubTokenProvider, InitialGitHubDataProvider, GetGitHubTokenParams } from "./github";
import { NxpodKeepAlivePolling } from './activity/nxpod-keep-alive-polling';
import { FrontendApplicationContribution, WebSocketConnectionProvider, WidgetFactory, bindViewContribution, ShellLayoutRestorer, CommonFrontendContribution } from '@theia/core/lib/browser';
import { StorageService } from '@theia/core/lib/browser/storage-service';
import { NxpodLocalStorageService } from './nxpod-local-storage-service';
import { NxpodOpenContext, NxpodWorkspaceService } from './nxpod-open-context';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { TerminalWidget } from "@theia/terminal/lib/browser/base/terminal-widget";
import { NxpodTerminalWidget } from "./nxpod-terminal-widget";
import { NxpodInfoService, nxpodInfoPath } from "../common/nxpod-info";
import { NxpodServiceProvider } from "./nxpod-service-provider";
import { NxpodService, NxpodServiceImpl } from "@nxpod/nxpod-protocol/lib/nxpod-service";
import { NxpodUiContribution } from "./nxpod-ui-contribution";
import { CommandContribution, MenuContribution, MenuModelRegistry } from "@theia/core";
import { ServedPortsService, ServedPortsServiceServer } from "../common/served-ports-service";
import { NxpodAccountInfoDialog, NxpodAccountInfoDialogProps } from "./nxpod-account-info";
import { UserMessageContribution } from "./user-message/user-message-contribution";
import { NxpodShareWidget, NxpodShareDialog, NxpodShareDialogProps } from "./nxpod-share-widget";
import { NxpodAboutDialog, NxpodAboutDialogProps } from "./nxpod-about-dialog";
import { AboutDialog } from "@theia/core/lib/browser/about-dialog";
import { NxpodPortViewContribution } from "./ports/nxpod-port-view-contribution";
import { NxpodPortViewWidget, PORT_WIDGET_FACTORY_ID } from "./ports/nxpod-port-view-widget";
import { NxpodPortsService } from "./ports/nxpod-ports-service";
import { GitRepositoryProvider } from "@theia/git/lib/browser/git-repository-provider";
import { NxpodRepositoryProvider } from "./nxpod-repository-provider";
import { UserStorageContribution } from "@theia/userstorage/lib/browser/user-storage-contribution";
import { CliServiceClientImpl, CliServiceClient } from "./cli-service-client";
import { SERVICE_PATH } from "../common/cli-service";
import { CliServiceContribution } from "./cli-service-contribution";
import { SnapshotSupport } from "./nxpod-snapshot-support";
import { NxpodLayoutRestorer } from "./nxpod-shell-layout-restorer";
import { NxpodFileParser } from "@nxpod/nxpod-protocol/lib/nxpod-file-parser";
import { MarkdownPreviewHandler } from '@theia/preview/lib/browser/markdown'
import { NxpodMarkdownPreviewHandler } from "./user-message/NxpodMarkdownPreviewHandler";
import { NxpodPreviewLinkNormalizer } from "./user-message/NxpodPreviewLinkNormalizer";
import { PreviewLinkNormalizer } from "@theia/preview/lib/browser/preview-link-normalizer";
import { NxpodMenuModelRegistry } from "./nxpod-menu";
import { WaitForContentContribution } from './waitfor-content-contribution';
import { ContentReadyServiceServer, ContentReadyService } from '../common/content-ready-service';
import { NxpodWebSocketConnectionProvider } from './nxpod-ws-connection-provider';
import { GitHostWatcher } from './git-host-watcher';
import { NxpodExternalUriService } from './nxpod-external-uri-service';
import { ExternalUriService } from '@theia/core/lib/browser/external-uri-service';
import { NxpodGitTokenProvider } from './nxpod-git-token-provider';
import { NxpodPortsAuthManger } from './ports/nxpod-ports-auth-manager';
import { setupModule } from './setup/setup-module';
import { NxpodBranding } from './nxpod-branding';
import { NxpodMainMenuFactory } from './nxpod-main-menu';
import { BrowserMainMenuFactory } from '@theia/core/lib/browser/menu/browser-menu-plugin';
import { NxpodCommonFrontendContribution } from './nxpod-common-frontend-contribution';
import { NxpodGitTokenValidator } from './nxpod-git-token-validator';
import { ConnectionStatusOptions } from '@theia/core/lib/browser/connection-status-service';
import { extensionsModule } from './extensions/extensions-module';
import { NxpodUserStorageContribution } from './nxpod-user-storage-contribution';
import { NxpodUserStorageProvider } from './nxpod-user-storage-provider';

export default new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(CommonFrontendContribution).to(NxpodCommonFrontendContribution).inSingletonScope();

    bind(NxpodGitTokenValidator).toSelf().inSingletonScope();
    bind(NxpodGitTokenProvider).toSelf().inSingletonScope();
    bind(GitHubTokenProvider).toDynamicValue(ctx => {
        const tokenProvider = ctx.container.get(NxpodGitTokenProvider);
        return {
            getToken: (params: GetGitHubTokenParams) => tokenProvider.getGitToken(params).then(result => result.token)
        }
    }).inSingletonScope();

    bind(NxpodKeepAlivePolling).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toDynamicValue(ctx => {
        return ctx.container.get(NxpodKeepAlivePolling);
    });

    bind(NxpodOpenContext).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(NxpodOpenContext);
    rebind(InitialGitHubDataProvider).toService(NxpodOpenContext);

    bind(NxpodShareWidget).toSelf().inSingletonScope();
    bind(NxpodShareDialog).toSelf().inSingletonScope();
    bind(NxpodShareDialogProps).toConstantValue({ title: 'Share Workspace' });
    bind(NxpodUiContribution).toSelf().inSingletonScope();

    bind(CommandContribution).toService(NxpodUiContribution);
    bind(MenuContribution).toService(NxpodUiContribution);
    bind(FrontendApplicationContribution).toService(NxpodUiContribution);

    bind(NxpodAccountInfoDialog).toSelf().inSingletonScope();
    bind(NxpodAccountInfoDialogProps).toConstantValue({ title: 'Account' });

    bind(NxpodServiceProvider).toSelf().inSingletonScope();
    bind(NxpodService).to(NxpodServiceImpl).inSingletonScope();

    rebind(StorageService).to(NxpodLocalStorageService).inSingletonScope();
    rebind(WorkspaceService).to(NxpodWorkspaceService).inSingletonScope();

    rebind(TerminalWidget).to(NxpodTerminalWidget).inTransientScope();

    bind(ServedPortsServiceServer).toDynamicValue(context => WebSocketConnectionProvider.createProxy(context.container, ServedPortsService.SERVICE_PATH)).inSingletonScope();
    bind(ServedPortsService).toSelf().inSingletonScope();
    bind(NxpodPortsAuthManger).toSelf().inSingletonScope();

    bind(CliServiceClientImpl).toSelf().inSingletonScope();
    bind(CliServiceClient).toDynamicValue(context => {
        const client = context.container.get(CliServiceClientImpl);
        WebSocketConnectionProvider.createProxy(context.container, SERVICE_PATH, client);
        return client;
    }).inSingletonScope();

    bind(CliServiceContribution).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(CliServiceContribution);

    bind(ContentReadyServiceServer).toDynamicValue(context => WebSocketConnectionProvider.createProxy(context.container, ContentReadyService.SERVICE_PATH)).inSingletonScope();
    bind(ContentReadyService).toSelf().inSingletonScope();

    bind(NxpodPortsService).toSelf().inSingletonScope();

    bind(UserMessageContribution).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(UserMessageContribution);
    bind(CommandContribution).toService(UserMessageContribution);
    bind(MenuContribution).toService(UserMessageContribution);

    bind(NxpodAboutDialogProps).toSelf().inSingletonScope();
    rebind(AboutDialog).to(NxpodAboutDialog).inSingletonScope();

    bind(NxpodPortViewWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(context => ({
        id: PORT_WIDGET_FACTORY_ID,
        createWidget: () => context.container.get<NxpodPortViewWidget>(NxpodPortViewWidget)
    }));

    bindViewContribution(bind, NxpodPortViewContribution);
    bind(FrontendApplicationContribution).toService(NxpodPortViewContribution);

    rebind(GitRepositoryProvider).to(NxpodRepositoryProvider).inSingletonScope();

    bind(NxpodUserStorageProvider).toSelf().inSingletonScope();
    rebind(UserStorageContribution).to(NxpodUserStorageContribution).inSingletonScope();

    bind(SnapshotSupport).toSelf().inSingletonScope();
    bind(CommandContribution).toService(SnapshotSupport);

    bind(NxpodLayoutRestorer).toSelf().inSingletonScope();
    rebind(ShellLayoutRestorer).toService(NxpodLayoutRestorer);

    bind(NxpodFileParser).toSelf().inSingletonScope();

    bind(NxpodMarkdownPreviewHandler).toSelf().inSingletonScope();
    rebind(MarkdownPreviewHandler).toService(NxpodMarkdownPreviewHandler);

    bind(NxpodPreviewLinkNormalizer).toSelf().inSingletonScope();
    rebind(PreviewLinkNormalizer).toService(NxpodPreviewLinkNormalizer);

    rebind(MenuModelRegistry).to(NxpodMenuModelRegistry).inSingletonScope();

    bind(NxpodWebSocketConnectionProvider).toSelf().inSingletonScope();
    rebind(WebSocketConnectionProvider).toService(NxpodWebSocketConnectionProvider);

    extensionsModule(bind, unbind, isBound, rebind);

    bind(NxpodInfoService).toDynamicValue(ctx => {
        const provider = ctx.container.get(WebSocketConnectionProvider);
        return provider.createProxy<NxpodInfoService>(nxpodInfoPath);
    });

    bind(FrontendApplicationContribution).to(WaitForContentContribution).inSingletonScope();

    bind(FrontendApplicationContribution).to(GitHostWatcher).inSingletonScope();

    bind(NxpodExternalUriService).toSelf().inSingletonScope();
    rebind(ExternalUriService).toService(NxpodExternalUriService);

    setupModule(bind, unbind, isBound, rebind);

    bind(NxpodBranding).toSelf().inSingletonScope();
    bind(NxpodMainMenuFactory).toSelf().inSingletonScope();
    rebind(BrowserMainMenuFactory).toService(NxpodMainMenuFactory);

    bind(ConnectionStatusOptions).toConstantValue({
        offlineTimeout: 20000
    });
});