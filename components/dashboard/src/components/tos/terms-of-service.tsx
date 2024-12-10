/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import "reflect-metadata";
import * as React from 'react';
import { getSvgPath } from '../../withRoot';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Checkbox from '@material-ui/core/Checkbox';
import { NxpodHostUrl } from '@nxpod/nxpod-protocol/lib/util/nxpod-host-url';
import { log } from '@nxpod/nxpod-protocol/lib/util/logging';
import { User } from "@nxpod/nxpod-protocol";
import { ButtonWithProgress } from "../button-with-progress";

interface TermsOfServiceProps {
    user: Promise<User>;
}
interface TermsOfServiceState {
    acceptsTos?: boolean;
    acceptsComs?: boolean;
}
export class TermsOfService extends React.Component<TermsOfServiceProps, TermsOfServiceState> {

    constructor(props: TermsOfServiceProps) {
        super(props);
        this.state = {
            acceptsTos: false,
            acceptsComs: false
        };
    }

    componentWillMount() {
        this.onLoad();
    }

    protected async onLoad(): Promise<void> {
        try {
            await this.props.user;
            window.location.href = new NxpodHostUrl(window.location.toString()).asDashboard().toString();
        } catch {
            // ignore
        }
    }

	render() {
        const nxpodHost = new NxpodHostUrl(window.location.href);

		// tslint:disable
		return (
            <div>
                <AppBar position='static'>
                    <Toolbar className="content toolbar">
                        <div className="nxpod-logo">
                            <a href={nxpodHost.toString()}>
                                <img src={getSvgPath('/images/nxpod-ddd.svg')} alt="Nxpod Logo" className="logo" />
                            </a>
                        </div>
                        <div style={{ flexGrow: 1 }}/>
                    </Toolbar>
                </AppBar>
                <div className='content content-area'>
                    <h1>Create account</h1>
                    <form action={ nxpodHost.withApi({ pathname: '/tos/proceed' }).toString() } method="post" id="accept-tos-form">
                        <div className="tos-checks">
                            <p><label style={{ display: 'flex', alignItems: 'center' }}>
                                <Checkbox
                                    value="true"
                                    name="agreeCOMS"
                                    checked={this.state.acceptsComs}
                                    onChange={() => this.setState({ acceptsComs: !this.state.acceptsComs })} />
                                I wish to receive news and updates via email
                            </label></p>
                            <p><label style={{ display: 'flex', alignItems: 'center' }}>
                                <Checkbox
                                    value="true"
                                    name="agreeTOS"
                                    checked={this.state.acceptsTos}
                                    onChange={() => this.setState({ acceptsTos: !this.state.acceptsTos })} />
                                <span>
                                    I agree to the <a target="_blank" href="https://www.nxpod.khulnasoft.com/terms/" rel="noopener">terms of service</a>
                                </span>
                            </label></p>
                        </div>
                        <div className="tos-buttons" data-testid="tos">
                            <ButtonWithProgress
                                className='button'
                                variant='outlined'
                                disabled={!this.state.acceptsTos}
                                color={this.state.acceptsTos ? 'secondary' : 'primary'}
                                onClick={this.submitForm.bind(this)}
                                data-testid="submit">
                                { this.state.acceptsTos ? 'Create Free Account' : 'Please Accept the Terms of Service' }
                            </ButtonWithProgress>
                        </div>
                    </form>
                </div>
            </div>
        );
        // tslint:enable
    }

    protected async submitForm() {
        const form = document.getElementById('accept-tos-form');
        if (!form) {
            log.error('Form accept-tos-form not found');
        } else {
            (form as HTMLFormElement).submit();
        }
        return new Promise(() => {});
    }
}