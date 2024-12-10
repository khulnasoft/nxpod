/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the Nxpod Enterprise Source Code License,
 * See License.enterprise.txt in the project root folder.
 */

import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import { WorkspacesView } from "./workspaces-view";
import { NxpodService } from '@nxpod/nxpod-protocol';

export interface WorkspacesAdminProps {
    service: NxpodService;
}

export const WorkspacesAdmin: React.SFC<WorkspacesAdminProps> = props => <React.Fragment>
    <Typography variant="h2">Workspaces</Typography>
    <WorkspacesView service={props.service} />
</React.Fragment>