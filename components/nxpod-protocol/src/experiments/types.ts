/**
 * Copyright (c) 2022 Nxpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License.AGPL.txt in the project root for license information.
 */

import { BillingTier } from "../protocol";

export const Client = Symbol("Client");

// Attributes define attributes which can be used to segment audiences.
// Set the attributes which you want to use to group audiences into.
export interface Attributes {
    // user.id is mapped to ConfigCat's "identifier" + "custom.user_id"
    user?: { id: string; email?: string };

    // The BillingTier of this particular user
    billingTier?: BillingTier;

    // Currently selected Nxpod Project ID (mapped to "custom.project_id")
    projectId?: string;

    // Currently selected Nxpod Team ID (mapped to "custom.team_id")
    teamId?: string;

    // Currently selected Nxpod Team Name (mapped to "custom.team_name")
    teamName?: string;

    // Host name of the Nxpod installation (mapped to "custom.nxpod_host")
    nxpodHost?: string;
}

export interface Client {
    getValueAsync<T>(experimentName: string, defaultValue: T, attributes: Attributes): Promise<T>;

    // dispose will dispose of the client, no longer retrieving flags
    dispose(): void;
}
