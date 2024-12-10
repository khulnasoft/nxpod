/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the Nxpod Enterprise Source Code License,
 * See License.enterprise.txt in the project root folder.
 */

import * as React from 'react';
import { NxpodService, User } from '@nxpod/nxpod-protocol';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Avatar from "@material-ui/core/Avatar";
import { DataTable, SearchSpec, ColSpec } from './datatable';
import { NxpodHostUrl } from '@nxpod/nxpod-protocol/lib/util/nxpod-host-url';
import moment = require('moment');
import { ResponseError } from 'vscode-jsonrpc';
import { ErrorCodes } from '@nxpod/nxpod-protocol/lib/messaging/error';

export interface UsersAdminProps {
    service: NxpodService;
}

export const UsersAdmin: React.SFC<UsersAdminProps> = props => {
    const update = async (q: SearchSpec<User>) => {
        try {
            return await props.service.server.adminGetUsers({
                limit: q.rowsPerPage,
                offset: q.rowsPerPage*q.page,
                orderBy: q.orderCol,
                orderDir: q.orderDir,
                searchTerm: q.searchTerm
            });
        } catch (err) {
            var rerr: ResponseError<any> = err;
            if (rerr.code === ErrorCodes.PERMISSION_DENIED) {
                window.location.href = new NxpodHostUrl(window.location.toString()).asDashboard().toString();
            }

            // TODO: improve error handling
            console.log(err);
            throw err;
        }
    }

    const columns: ColSpec<User>[] = [
        {
            header: "Avatar",
            property: "avatarUrl",
            sortable: false,
            render: user => <Avatar alt={user.name}
                            src={user.avatarUrl}
                            style={{
                                borderRadius: 3,
                                marginLeft: 20
                            }}
                            data-testid={"avatar-" + user.id}></Avatar>,
        },
        {
            header: "Name",
            property: "name",
            sortable: true,
            render: u => <Link href={`/admin/#/user/${u.id}`}>{u.name}</Link>,
        },
        {
            header: "Blocked",
            property: "blocked",
            sortable: true
        },
        {
            header: "Signup Date",
            property: "creationDate",
            sortable: true,
            render: u => <div>{moment(new Date(u.creationDate)).format('YY-MM-DD hh:mm')}</div>
        }
    ];

    return <React.Fragment>
        <Typography variant="h2">Users</Typography>
        <DataTable<User> columns={columns} defaultOrderCol="creationDate" defaultOrderDir="desc" update={update} searchable={true} />
    </React.Fragment>

}