/**
 * Copyright (c) 2020 Nxpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License.AGPL.txt in the project root for license information.
 */

import { NxpodHostUrl } from "@nxpod/nxpod-protocol/lib/util/nxpod-host-url";

export const workspaceUrl = new NxpodHostUrl(window.location.href);

export const serverUrl = workspaceUrl.withoutWorkspacePrefix();

export const startUrl = serverUrl.asStart(workspaceUrl.workspaceId);
