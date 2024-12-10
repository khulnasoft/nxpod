/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import * as React from 'react';
import { NxpodHostUrl } from '@nxpod/nxpod-protocol/lib/util/nxpod-host-url';

export namespace ShowUnauthorizedError {
    export interface Props {
        data: any;
    }
}

export default class ShowUnauthorizedError extends React.Component<ShowUnauthorizedError.Props> {

    render() {
        const { host, scopes, messageHint } = this.props.data;
        console.log(messageHint);
        const scopesJoined = scopes.join(',');
        const link = new NxpodHostUrl(window.location.toString()).withApi({
            pathname: '/authorize',
            search: `returnTo=${encodeURIComponent(window.location.toString())}&host=${host}&scopes=${scopesJoined}`
        }).toString();
        return (
            <div className="sorry">
                <h1 className="heading">Unauthorized</h1>
                <div className="text">
                    This action requires more permissions. Please <a href={link}>authorize with {host}</a> to continue.
                </div>
            </div>
        );
    }
}
