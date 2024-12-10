/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import * as React from 'react';
import "reflect-metadata";
import { UserEnvVars } from '../user-env-vars';
import { ApplicationFrame } from '../page-frame';
import { ErrorCodes } from '@nxpod/nxpod-protocol/lib/messaging/error';
import { NxpodHostUrl } from '@nxpod/nxpod-protocol/lib/util/nxpod-host-url';
import { ResponseError } from 'vscode-jsonrpc';

import { UserSettings } from '../user-settings';
import { DeleteAccountView } from '../delete-account-view';
import Paper from '@material-ui/core/Paper';
import { ApiTokenView } from '../api-tokens';
import { AuthProviders } from '../auth-providers';
import { User, NxpodService } from '@nxpod/nxpod-protocol';

interface SettingsProps {
    service: NxpodService;
    user: Promise<User>;
}

interface SettingsState {
    user?: User;
}

export class Settings extends React.Component<SettingsProps, SettingsState> {

    constructor(props: SettingsProps) {
        super(props);

        this.state = {};
        (async () => {
            try {
                this.setState({ user: await this.props.user });
            } catch (e) {
                if (e instanceof ResponseError) {
                    switch (e.code) {
                        case ErrorCodes.SETUP_REQUIRED:
                            window.location.href = new NxpodHostUrl(window.location.toString()).with({ pathname: "first-steps" }).toString();
                            break;
                        case ErrorCodes.NOT_AUTHENTICATED:
                            window.location.href = new NxpodHostUrl(window.location.toString()).withApi({
                                pathname: '/login/',
                                search: 'returnTo=' + encodeURIComponent(window.location.toString())
                            }).toString();
                            break;
                        default:
                    }
                }
                throw e;
            }
        })();
    }

    render() {
        return (
            <ApplicationFrame service={this.props.service}>
                <Paper style={{ padding: 20 }}>
                    <h3>Email Settings</h3>
                    <UserSettings service={this.props.service} user={this.state.user} />
                    <h3 style={{ marginTop: 50 }}>Environment Variables</h3>
                    <UserEnvVars service={this.props.service} user={this.state.user} />
                    <ApiTokenView service={this.props.service} />
                    <h3 style={{ marginTop: 50 }}>Git Provider Integrations</h3>
                    <AuthProviders service={this.props.service} user={this.state.user} mode="user-settings" />
                    <DeleteAccountView service={this.props.service} />
                </Paper>
            </ApplicationFrame>
        );
    }
}