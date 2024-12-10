/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import * as React from "react";
import * as ReactDOM from "react-dom";
import { inject, injectable, postConstruct } from 'inversify';

import { AboutDialogProps, AboutDialog } from '@theia/core/lib/browser/about-dialog';
import { Disposable } from '@theia/core';
import { Message } from "@phosphor/messaging";
import { NxpodAboutView } from "./nxpod-about-view";
import { NxpodBranding } from "./nxpod-branding";
import { Branding } from "@nxpod/nxpod-protocol";
import { NxpodInfoService } from "../common/nxpod-info";

export const ABOUT_CONTENT_CLASS = 'theia-aboutDialog';
export const ABOUT_EXTENSIONS_CLASS = 'theia-aboutExtensions';

@injectable()
export class NxpodAboutDialogProps extends AboutDialogProps {
}

@injectable()
export class NxpodAboutDialog extends AboutDialog {

    protected readonly okButton: HTMLButtonElement;

    @inject(NxpodBranding) protected readonly nxpodBranding: NxpodBranding;
    @inject(NxpodInfoService) protected readonly infoService: NxpodInfoService;

    protected branding: Branding | undefined;
    protected host: string;

    constructor(
        @inject(NxpodAboutDialogProps) protected readonly props: NxpodAboutDialogProps
    ) {
        super({
            title: props.title
        });
    }

    @postConstruct()
    protected async init(): Promise<void> {
        this.controlPanel.parentElement!.removeChild(this.controlPanel);
        this.toDispose.push(Disposable.create(() => ReactDOM.unmountComponentAtNode(this.contentNode)));
        this.branding = await this.nxpodBranding.branding;
        this.host = (await this.infoService.getInfo()).host;
    }

    protected onActivateRequest(msg: Message): void {
        this.update();
    }

    protected onUpdateRequest(msg: Message): void {
        ReactDOM.render(<NxpodAboutView branding={this.branding} host={this.host} />, this.contentNode);
    }
}
