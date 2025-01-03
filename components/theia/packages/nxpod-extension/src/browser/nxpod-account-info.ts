/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { AbstractDialog, DialogProps, Message, Key } from "@theia/core/lib/browser";
import { injectable, inject, postConstruct } from "inversify";
import { NxpodServiceProvider } from "./nxpod-service-provider";
import { CommandRegistry } from "@theia/core";
import { NxpodCommands } from "./nxpod-ui-contribution";

export const ACCOUNT_INFO_CLASS = 'nxpod-accoutInfo'

@injectable()
export class NxpodAccountInfoDialogProps extends DialogProps {
}

@injectable()
export class NxpodAccountInfoDialog extends AbstractDialog<void> {

    @inject(NxpodServiceProvider) nxpodServiceProvider: NxpodServiceProvider;
    @inject(CommandRegistry) commands: CommandRegistry;

    user: HTMLElement;
    accessControlButton: HTMLButtonElement;

    constructor(@inject(NxpodAccountInfoDialogProps) protected readonly props: NxpodAccountInfoDialogProps) {
        super({title: props.title})
    }

    @postConstruct()
    protected async init(): Promise<void> {
        const messageNode = document.createElement('div');
        messageNode.classList.add(ACCOUNT_INFO_CLASS);
        const info = document.createElement('dl');
        const userLabel = document.createElement('dt');
        userLabel.textContent = 'User name:';
        this.user = document.createElement('dd');
        info.appendChild(userLabel);
        info.appendChild(this.user);
        const remainingHoursLabel = document.createElement('dt');
        remainingHoursLabel.textContent = 'Remaining usage time:';
        info.appendChild(remainingHoursLabel);
        messageNode.appendChild(info);
        this.contentNode.appendChild(messageNode);
        this.appendAccessControlButton();
        this.appendAcceptButton('OK');
    }

    protected appendAccessControlButton() {
        const button = this.accessControlButton = this.createButton('Access Control');
        this.controlPanel.appendChild(button);
        button.classList.add('main');
    }

    protected onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg);
        if (this.accessControlButton) {
            const openAccessControl = () => this.commands.executeCommand(NxpodCommands.OPEN_ACCESS_CONTROL.id);
            this.addKeyListener(this.accessControlButton, Key.ENTER, openAccessControl, 'click');
        }
    }


    get value(): undefined {
        return undefined;
    }

    async open() {
        const service = await this.nxpodServiceProvider.getService();
        this.user.textContent = '' + (await service.server.getLoggedInUser()).name;
        super.open();
    }
}
