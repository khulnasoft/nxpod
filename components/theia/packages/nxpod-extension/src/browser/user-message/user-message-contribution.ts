/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */


import { injectable, inject } from "inversify";

import { FrontendApplicationContribution, FrontendApplication, CommonMenus } from "@theia/core/lib/browser";
import { NxpodServiceProvider } from "../nxpod-service-provider";
import { UserMessage } from "@nxpod/nxpod-protocol";
import { UserMessageDialog } from "./user-message-dialog";
import { CommandContribution, MenuContribution, CommandRegistry, MenuModelRegistry, Command } from "@theia/core";
import { PreviewHandlerProvider } from "@theia/preview/lib/browser";
import { NxpodInfoService } from "../../common/nxpod-info";
import { NxpodBranding } from "../nxpod-branding";
import { Deferred } from "@theia/core/lib/common/promise-util";


@injectable()
export class UserMessageContribution implements FrontendApplicationContribution, CommandContribution, MenuContribution {

    @inject(NxpodServiceProvider) protected readonly serviceProvider: NxpodServiceProvider;
    @inject(NxpodInfoService) protected readonly serviceInfo: NxpodInfoService;
    @inject(PreviewHandlerProvider) protected readonly previewHandlerProvider: PreviewHandlerProvider;
    @inject(NxpodBranding) protected readonly nxpodBranding: NxpodBranding;

    protected readonly showReleaseNotesPromise = new Deferred<boolean>();
    protected get showReleaseNotes(): Promise<boolean> {
        return this.showReleaseNotesPromise.promise;
    }

    async onStart(app: FrontendApplication) {
        this.nxpodBranding.branding
            .then(branding => this.showReleaseNotesPromise.resolve(branding.ide && branding.ide.showReleaseNotes))
            .catch(err => this.showReleaseNotesPromise.reject(err));
        try {
            await this.showUserMessage();
        } catch (error) {
            console.log(error);
        }
    }

    async showUserMessage(unviewedOnly: boolean = true) {
        const showReleaseNotes = await this.showReleaseNotes;
        if (!showReleaseNotes) {
            return;
        }
        const service = await this.serviceProvider.getService();
        const info = await this.serviceInfo.getInfo();
        const messages = await service.server.getUserMessages({ releaseNotes: unviewedOnly, workspaceInstanceId: info.instanceId });
        if (messages.length < 1) {
            return;
        }

        this.doShow(messages);
    }

    protected async updateMessage(messages: UserMessage[]) {
        const service = await this.serviceProvider.getService();
        const messageIds = messages.map(m => m.id);
        await service.server.updateUserMessages({ messageIds });
    }

    protected async doShow(messages: UserMessage[]): Promise<void> {
        const dialog = new UserMessageDialog(messages, this.previewHandlerProvider);
        await dialog.open();
        this.updateMessage(messages);
    }

    openMessages: Command = {
        id: 'nxpod.message.open',
        label: 'Nxpod: Release Notes'
    }

    registerCommands(reg: CommandRegistry) {
        this.showReleaseNotes.then(show => {
            if (!show) {
                return;
            }
            reg.registerCommand(this.openMessages);
            const execute = () => this.showUserMessage(false);
            reg.registerHandler(this.openMessages.id, {
                execute
            })
        })
    }

    registerMenus(menus: MenuModelRegistry) {
        this.showReleaseNotes.then(show => {
            if (!show) {
                return;
            }
            menus.registerMenuAction(CommonMenus.HELP, {
                commandId: this.openMessages.id,
                label: 'Release Notes'
            });
        });
    }
}
