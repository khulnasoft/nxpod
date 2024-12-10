/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { createNxpodService } from "@nxpod/nxpod-protocol";
import { NxpodService } from "@nxpod/nxpod-protocol";
import { NxpodHostUrl, workspaceIDRegex } from "@nxpod/nxpod-protocol/lib/util/nxpod-host-url";

export function getNxpodService(): NxpodService {
    if (!(window as any)['_nxpodService']) {
        const serverUrl = new NxpodHostUrl(window.location.href).withoutWorkspacePrefix().toString();
        const service = createNxpodService(serverUrl);
        (window as any)['_nxpodService'] = service;
    }
    return (window as any)['_nxpodService'];
}

export function getWorkspaceID() {
    const hostSegs = window.location.host.split(".");
    if (hostSegs.length > 1 && hostSegs[0].match(workspaceIDRegex)) {
        // URL has a workspace prefix
        return hostSegs[0];
    }

    const pathSegs = window.location.pathname.split("/")
    if (pathSegs.length > 3 && pathSegs[1] === "workspace") {
        return pathSegs[2];
    }

    return "unknown-workspace-id";
}