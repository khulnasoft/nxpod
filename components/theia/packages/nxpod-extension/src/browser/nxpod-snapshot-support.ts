/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { CommandContribution, CommandRegistry, Command, CommandHandler } from "@theia/core";
import { injectable, inject } from "inversify";
import { NxpodInfoService, NxpodInfo } from "../common/nxpod-info";
import { AbstractDialog } from "@theia/core/lib/browser";
import { NxpodServiceProvider } from "./nxpod-service-provider";
import { NxpodService, LicenseFeature } from "@nxpod/nxpod-protocol";
import { NxpodLayoutRestorer } from "./nxpod-shell-layout-restorer";
import { NxpodHostUrl } from "@nxpod/nxpod-protocol/lib/util/nxpod-host-url";

export const TAKE_SNAPSHOT_COMMAND: Command = {
    id: 'nxpod-take-snapshot',
    label: 'Nxpod: Share Workspace Snapshot'
}

@injectable()
export class SnapshotSupport implements CommandContribution, CommandHandler {

    @inject(NxpodInfoService) protected infoProvider: NxpodInfoService;
    @inject(NxpodServiceProvider) protected nxpodServiceProvider: NxpodServiceProvider;
    @inject(NxpodLayoutRestorer) protected nxpodLayoutRestorer: NxpodLayoutRestorer;

    protected info: NxpodInfo;
    protected service: NxpodService;

    async registerCommands(commands: CommandRegistry): Promise<void> {
        commands.registerCommand(TAKE_SNAPSHOT_COMMAND);
        commands.registerHandler(TAKE_SNAPSHOT_COMMAND.id, this);
        this.info = await this.infoProvider.getInfo();
        this.service = this.nxpodServiceProvider.getService();
    }

    async execute() {
        const dialog = new SnapshotTakenDialog(this.service);
        dialog.open();
        const layoutData = this.nxpodLayoutRestorer.captureLayout();
        const workspaceId = this.info.workspaceId;
        try {
            const snapShotId = await this.service.server.takeSnapshot({ workspaceId, layoutData });
            const url = `${this.info.host}/#snapshot/${snapShotId}`;
            dialog.setUrl(url);
        } catch (e) {
            dialog.setError(e);
        }
    }

}

interface CopyToClipBoardElement {
    setContent(content: string): void
    element: HTMLElement
}

export class SnapshotTakenDialog extends AbstractDialog<boolean> {
    readonly value: boolean = true;
    protected link: CopyToClipBoardElement;
    protected mdCode: CopyToClipBoardElement;
    protected htmlCode: CopyToClipBoardElement;

    constructor(protected service: NxpodService) {
        super({
            title: 'Share Workspace Snapshot'
        });

        this.appendAcceptButton('Done');
        this.appendContent();
    }

    public async open() {
        const canCreateSnapshot = await this.service.server.licenseIncludesFeature(LicenseFeature.CreateSnapshot);
        if (!canCreateSnapshot) {
            this.showNoLicenseContent();
        }
        return super.open();
    }

    setError(error: string) {
        this.link.setContent(`Cannot take snapshot: ${error}`);
        this.mdCode.setContent('not available');
        this.htmlCode.setContent('not available');
    }

    setUrl(url: string) {
        this.link.setContent(url);
        this.mdCode.setContent(`[![Open in Nxpod](https://nxpod.khulnasoft.com/button/open-in-nxpod.svg)](${url})`);
        this.htmlCode.setContent(`<a href="${url}"><img alt="Open in Nxpod" src="https://nxpod.khulnasoft.com/button/open-in-nxpod.svg"></a>`);
    }

    protected showNoLicenseContent() {
        // clean first
        this.contentNode.innerHTML = "";

        const licenseLink = new NxpodHostUrl(window.location.href).withoutWorkspacePrefix().with({ pathname: "license"}).toString();
        const eeFeatureMessage = document.createElement("div");
        eeFeatureMessage.setAttribute('style', 'max-width: 30vw; padding-bottom: 1em');
        eeFeatureMessage.innerHTML = `<p><strong>Sharing reproducible Workspace Snapshots is an enterprise feature and requires a license.</strong></p>
        <p>To enable Workspace Snapshots in your Nxpod installation, please <a href="${licenseLink}" target="_blank">purchase a license</a>.</p>`;
        this.contentNode.appendChild(eeFeatureMessage);
        this.contentNode.style.width = '';
    }

    protected appendContent() {
        const messageNode = document.createElement("div");
        messageNode.innerHTML = "<p>The current state is captured in a snapshot. Sharing the link below allows anybody to create their own copy of this workspace.</p>";
        this.contentNode.appendChild(messageNode);
        this.contentNode.style.width = '60vw';

        this.link = this.createCopyToClipboard('Taking snapshot, please wait ...', false, 'Link');
        this.contentNode.appendChild(this.link.element);

        this.mdCode = this.createCopyToClipboard('Computing Markdown code ...', true, 'Markdown Button');
        this.htmlCode = this.createCopyToClipboard('Computing Html code ...', true, 'HTML Button');
        this.contentNode.appendChild(this.mdCode.element);
        this.contentNode.appendChild(this.htmlCode.element);
    }

    private createCopyToClipboard(initialText: string, isButton: boolean, title: string): CopyToClipBoardElement {
        const enableSharingPanel = document.createElement("div");

        const header = document.createElement('h4');
        header.style.marginBottom = "5px";
        header.style.marginTop = "10px";
        header.textContent = title;
        enableSharingPanel.appendChild(header);

        const row = document.createElement('div');
        row.style.display = 'flex';
        enableSharingPanel.appendChild(row);
        if (isButton) {
            const button = document.createElement('img');
            button.src = 'https://nxpod.khulnasoft.com/button/open-in-nxpod.svg';
            button.style.paddingRight = '5px';
            row.appendChild(button);
        }
        const linkBox = document.createElement('div');
        linkBox.className = 'linkbox';
        linkBox.style.flexGrow = '2';
        row.appendChild(linkBox);

        const link = document.createElement('span');
        link.innerText = initialText;
        linkBox.appendChild(link);

        const copyToClipboard = document.createElement('i');
        copyToClipboard.className = 'fa fa-link';
        copyToClipboard.title = 'Copy link to clipboard';
        copyToClipboard.onclick = () => {
            this.selectElement(link);
            document.execCommand('copy');
            header.textContent = 'Copied to clipboard!';
            setTimeout(() => { header.textContent = title }, 500);
        };
        linkBox.appendChild(copyToClipboard);
        return {
            setContent(content: string) {
                link.innerText = content;
            },
            element: enableSharingPanel
        }
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