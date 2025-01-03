/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */


// see below for explanation
export const Permissions = {
    "monitor": undefined,
    "enforcement": undefined,
    "privileged-ws": undefined,
    "registry-access": undefined,
    "admin-users": undefined,
    "admin-workspaces": undefined,
    "admin-api": undefined
};
export type PermissionName = keyof (typeof Permissions);
export const Roles = {"devops": undefined, "viewer": undefined, "admin": undefined };
export type RoleName = keyof (typeof Roles);
export type RoleOrPermission = RoleName | PermissionName;

export namespace RoleName {
    export const is = (o: any): o is RoleName => {
        return typeof(o) === 'string'
            && Role.all().some(r => r.name === o);
    }
}

export interface Role {
    name: RoleName,
    permissions: PermissionName[],
}

export namespace Permission {
    /** The permission to monitor the (live) state of a Nxpod installation */
    export const MONITOR: PermissionName = "monitor";

    /** The permission for actions like block user, stop workspace, etc. */
    export const ENFORCEMENT: PermissionName = "enforcement";

    /** The permission to start privileged workspaces */
    export const PRIVILEGED_WORKSPACE: PermissionName = "privileged-ws";

    /** The permission for registry access (start workspaces referencing nxpod-internal Docker images) */
    export const REGISTRY_ACCESS: PermissionName = "registry-access";

    /** The permission for accessing all user data */
    export const ADMIN_USERS: PermissionName = "admin-users";

    /** The permission for accessing all workspace data */
    export const ADMIN_WORKSPACES: PermissionName = "admin-workspaces";

    /** The permission to access the admin API */
    export const ADMIN_API: PermissionName = "admin-api";

    export const is = (o: any): o is PermissionName => {
        return typeof(o) === 'string'
            && Permission.all().some(p => p === o);
    }

    export const all = (): PermissionName[] => {
        return Object.keys(Permission)
            .map(k => (Permission as any)[k])
            .filter(k => typeof(k) === 'string');
    };
}

export namespace Role {
    /** The default role for all Typefox developers */
    export const DEVOPS: Role = {
        name: "devops",
        permissions: [
            Permission.MONITOR,
            Permission.ENFORCEMENT,
            Permission.PRIVILEGED_WORKSPACE,
            Permission.REGISTRY_ACCESS,
        ]
    };

    /** A role for people that are allowed to view Nxpod internals */
    export const VIEWER: Role = {
        name: "viewer",
        permissions: [
            Permission.MONITOR,
            Permission.REGISTRY_ACCESS,
            Permission.PRIVILEGED_WORKSPACE,
        ]
    };

    export const ADMIN: Role = {
        name: "admin",
        permissions: [
            Permission.ADMIN_USERS,
            Permission.ADMIN_WORKSPACES,
            Permission.ADMIN_API,
            Permission.ENFORCEMENT,
        ]
    }

    export const getByName = (name: RoleName): Role => {
        const result = Role.all().find(r => r.name === name)
        if (!result) {
            throw Error("Unknown RoleName: " + name);
        }
        return result;
    };

    export const all = (): Role[] => {
        return Object.keys(Role)
            .map(k => (Role as any)[k])
            .filter(k => typeof(k) === 'object');
    };
}
