/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import * as React from 'react';
import { Branding } from '@nxpod/nxpod-protocol';

export class NxpodAboutView extends React.Component<{ branding?: Branding, host: string }> {

    render(): JSX.Element {
        return <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            {this.createLogo(this.props.branding)}
            {this.createFooter(this.props.branding)}
        </div>;
    }

    protected createLogo(branding?: Branding) {
        const logo = branding && branding.logo;
        if (logo) {
            // Handle host-absolute paths
            let logoUri = logo;
            if (logoUri.startsWith("/")) {
                logoUri = this.props.host + logoUri;
            }
            return (<div><img src={logoUri} style={{ width: '250px', paddingBottom: '20px' }}></img></div>);
        } else {
            return (
                <div>
                    <span className="nxpod-logo" style={{
                        width: '96px',
                        height: '96px',
                        marginLeft: '6px'
                    }} />
                    <h1>Nxpod</h1>
                </div>
            );
        }
    }

    protected createFooter(branding?: Branding) {
        const year = new Date().getFullYear().toString();
        const customized = branding && !!branding.ide;
        if (customized) {
            return (<span>
                Copyright {year} TypeFox. All Rights Reserved
            </span>);
        } else {
            return (<span>
                Copyright {year} TypeFox. All Rights Reserved | <a className="theia-href" target="_blank" href="https://www.nxpod.khulnasoft.com/terms/">Terms of Service</a>
            </span>);
        }
    }

}