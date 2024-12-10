/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import * as React from 'react';
import { injectable, inject } from "inversify";
import { AbstractDialog, DialogProps, ReactWidget } from "@theia/core/lib/browser";
import { NxpodServiceProvider } from "./nxpod-service-provider";
import { NxpodInfoService } from "../common/nxpod-info";
import { WorkspaceInstanceUser } from "@nxpod/nxpod-protocol";
import { NxpodLayoutRestorer } from "./nxpod-shell-layout-restorer";
import { ResponseError } from 'vscode-jsonrpc';
import { ErrorCodes } from '@nxpod/nxpod-protocol/lib/messaging/error';
import { NxpodHostUrl } from '@nxpod/nxpod-protocol/lib/util/nxpod-host-url';

@injectable()
export class NxpodShareWidget extends ReactWidget {

    @inject(NxpodInfoService)
    protected infoProvider: NxpodInfoService;

    @inject(NxpodServiceProvider)
    protected serviceProvider: NxpodServiceProvider;

    protected isWorkspaceOwner?: boolean;
    protected workspaceUserPoll?: NodeJS.Timer;
    protected workspaceUsers?: WorkspaceInstanceUser[];

    protected async onAfterAttach() {
        const info = await this.infoProvider.getInfo();
        const service = await this.serviceProvider.getService();
        this.isWorkspaceOwner = await service.server.isWorkspaceOwner(info.workspaceId);
        this.update();

        this.startWorkspaceUserPolling(info.workspaceId);
    }

    protected async startWorkspaceUserPolling(workspaceId: string) {
        if (this.workspaceUserPoll) {
            this.stopWorkspaceUserPolling();
        }
        if (this.isWorkspaceOwner) {
            this.workspaceUserPoll = setInterval(async () => {
                const nxpodService = await this.serviceProvider.getService();
                const user = await nxpodService.server.getLoggedInUser();
                this.workspaceUsers = (await nxpodService.server.getWorkspaceUsers(workspaceId)).filter(u => u.userId != user.id);
                this.update();
            }, 10000);
        }
    }

    protected async stopWorkspaceUserPolling() {
        if (this.workspaceUserPoll) {
            clearInterval(this.workspaceUserPoll);
            this.workspaceUserPoll = undefined;
        }
    }

    protected render(): React.ReactChild {
        if (!this.isWorkspaceOwner) {
            return <div />;
        }
        return <div><div className='active-users'>
            {this.workspaceUsers && this.workspaceUsers.map((u, i) => this.newAvatar(u, i))}
        </div></div>;
    }

    protected newAvatar(user: WorkspaceInstanceUser, index: number): React.ReactChild {
        return <div key={index} className='avatar' title={user.name}>
            <img src={user.avatarUrl} />
        </div>
    }

}

export class NxpodShareDialogProps extends DialogProps {
}

export class NxpodShareDialog extends AbstractDialog<boolean> {
    readonly value: boolean = true;
    protected shareWorkspace?: boolean;
    protected currentStateMessage: HTMLElement;
    protected linkBox: HTMLElement;

    @inject(NxpodInfoService)
    protected infoProvider: NxpodInfoService;

    @inject(NxpodServiceProvider)
    protected serviceProvider: NxpodServiceProvider;

    @inject(NxpodLayoutRestorer)
    protected layoutRestorer: NxpodLayoutRestorer;

    constructor(@inject(NxpodShareDialogProps) protected readonly props: NxpodShareDialogProps) {
        super(props);

        this.appendAcceptButton();
        this.appendCloseButton("Done");
        this.appendContent();
    }

    public async open() {
        // always share this  workspace when this dialog is opened
        try {
            await this.setWorkspaceShareable(true);
            this.shareWorkspace = true;
            this.updateUI();
        } catch (e) {
            if (e instanceof ResponseError && (e.code == ErrorCodes.EE_FEATURE || e.code == ErrorCodes.EE_LICENSE_REQUIRED)) {
                this.showNoLicenseContent();
            }
        }
        return super.open();
    }

    protected updateUI() {
        if (this.shareWorkspace) {
            if (this.acceptButton) {
                this.acceptButton.textContent = "Stop Sharing";
            }
            if (this.currentStateMessage) {
                this.currentStateMessage.innerHTML = 'Your workspace is currently <b>shared</b>. Anyone with the link can access this workspace.';
            }
            if (this.linkBox) {
                this.linkBox.style.opacity = "1";
            }
            this.titleNode.textContent = "Workspace Shared";
        } else {
            if (this.acceptButton) {
                this.acceptButton.textContent = "Share";
            }
            if (this.currentStateMessage) {
                this.currentStateMessage.innerHTML = 'Your workspace is currently <b>not shared</b>. Only you can access it.';
            }
            if (this.linkBox) {
                this.linkBox.style.opacity = "var(--theia-mod-disabled-opacity)";
            }
            this.titleNode.textContent = "Share Workspace";
        }
    }

    protected async accept() {
        const newState = !this.shareWorkspace;
        await this.setWorkspaceShareable(newState);
        this.shareWorkspace = newState;
        this.updateUI();
    }

    protected async setWorkspaceShareable(shareable: boolean): Promise<void> {
        const info = await this.infoProvider.getInfo();
        const nxpodService = this.serviceProvider.getService();
        await nxpodService.server.controlAdmission(info.workspaceId, shareable ? "everyone" : "owner");
        const layout = this.layoutRestorer.captureLayout();
        nxpodService.server.storeLayout(info.workspaceId, layout);
    }

    protected async isWorkspaceShared(): Promise<boolean> {
        const info = await this.infoProvider.getInfo();
        const nxpodService = this.serviceProvider.getService();
        const workspace = await nxpodService.server.getWorkspace(info.workspaceId);
        return workspace.workspace.shareable || false;
    }

    protected showNoLicenseContent() {
        // clean first
        this.contentNode.innerHTML = "";

        const licenseLink = new NxpodHostUrl(window.location.href).withoutWorkspacePrefix().with({ pathname: "license"}).toString();
        const eeFeatureMessage = document.createElement("div");
        eeFeatureMessage.setAttribute('style', 'max-width: 30vw; padding-bottom: 1em');
        eeFeatureMessage.innerHTML = `<p><strong>Workspace sharing is an enterprise feature and requires a license.</strong></p>
        <p>To enable Workspace Snapshots in your Nxpod installation, please <a href="${licenseLink}" target="_blank">purchase a license</a>.</p>`;
        this.contentNode.appendChild(eeFeatureMessage);

        if (this.acceptButton) {
            this.acceptButton.style.display = 'none';
        }
    }

    protected appendContent() {
        const messageNode = document.createElement("div");
        messageNode.setAttribute('style', 'max-width: 30vw; padding-bottom: 1em');
        messageNode.innerHTML = "<p><b>Warning:</b> Sharing your workspace with others also means sharing your access to your repository. Everyone with access to the workspace you share can commit in your name.</p>";
        this.contentNode.appendChild(messageNode);

        const enableSharingPanel = document.createElement("div");

        this.linkBox = document.createElement('div');
        this.linkBox.className = 'linkbox';
        enableSharingPanel.appendChild(this.linkBox);

        const link = document.createElement('span');
        link.innerText = window.location.href;
        link.onclick = () => this.selectElement(link);
        this.linkBox.appendChild(link);

        const copyToClipboard = document.createElement('i');
        copyToClipboard.className = 'fa fa-link';
        copyToClipboard.title = 'Copy link to clipboard';
        copyToClipboard.onclick = () => {
            this.selectElement(link);
            document.execCommand('copy');
        };
        copyToClipboard.style.marginLeft = "0.5em";
        this.linkBox.appendChild(copyToClipboard);

        this.currentStateMessage = document.createElement("p");
        enableSharingPanel.appendChild(this.currentStateMessage);

        this.contentNode.appendChild(enableSharingPanel);
    }

    protected selectElement(element: HTMLElement) {
        const range = document.createRange();
        range.selectNode(element);

        const selection = window.getSelection();
        if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

}