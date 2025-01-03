/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the Nxpod Enterprise Source Code License,
 * See License.enterprise.txt in the project root folder.
 */

import "reflect-metadata";

import * as React from 'react';
import { ApplicationFrame } from "../../src/components/page-frame";
import { createNxpodService } from "../../src/service-factory";
import { LicenseCheck } from "../../src/components/license-check";
import { Route, Switch } from "react-router";
import { UsersAdmin } from "./components/admin/users-admin";
import { WorkspacesAdmin } from "./components/admin/workspaces-admin";
import { HashRouter } from "react-router-dom";
import { Link, Typography } from "@material-ui/core";
import { UserView, AdditionalUserPropertiesRenderer } from "./components/admin/user-view";
import { NxpodHostUrl } from "@nxpod/nxpod-protocol/lib/util/nxpod-host-url";
import { WorkspaceView } from "./components/admin/workspace-view";
import { renderEntrypoint } from "../../src/entrypoint";

export interface AdminIndexProps {
    renderAdditionalUserProperties?: AdditionalUserPropertiesRenderer;
}

export const AdminIndex: React.SFC<AdminIndexProps | undefined> = (_props: AdminIndexProps) => {
    const props = _props || {};
    const service = createNxpodService();
    service.server.getLoggedInUser().catch(e => {
        console.error(e);
        window.location.href = new NxpodHostUrl(window.location.toString()).asDashboard().toString();
    });

    const links = <React.Fragment>
        <Link href="/admin/#users">Users</Link>
        <Link href="/admin/#workspaces">Workspaces</Link>
        {/* <Link href="/admin/#snapshots">Snapshots</Link> */}
    </React.Fragment>

    const graphQLApiUrl = new NxpodHostUrl(window.location.toString()).asGraphQLApi().toString();

    return <ApplicationFrame service={service} linksOverride={links}>
        <LicenseCheck service={service.server} />

        <HashRouter>
            <Switch>
                <Route path="/users"><UsersAdmin service={service} /></Route>
                <Route path="/user/:id" render={rp => <UserView userID={rp.match.params.id} service={service} renderAdditionalUserProperties={props.renderAdditionalUserProperties}/>} />
                <Route path="/workspaces"><WorkspacesAdmin service={service} /></Route>
                <Route path="/workspace/:id" render={rp => <WorkspaceView workspaceID={rp.match.params.id} service={service} />} />
                <Route path="/"><UsersAdmin service={service} /></Route>
            </Switch>
        </HashRouter>

        <Typography align='center'>
            You'll find a GraphQL API at <Link href={graphQLApiUrl}>{graphQLApiUrl}</Link>.
            Create API tokens for your user in your <Link href={new NxpodHostUrl(window.location.toString()).asSettings().toString()}>settings page</Link>.
        </Typography>
    </ApplicationFrame>
};

renderEntrypoint(AdminIndex);
