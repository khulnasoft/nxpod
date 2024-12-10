/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { Configuration } from "@nxpod/nxpod-protocol";
import { createNxpodService } from "./service-factory";
import { globalCache } from "./util";

export async function getNxpodConfiguration(): Promise<Configuration> {
    return globalCache('config', () => {
        const service = createNxpodService();
        return service.server.getConfiguration();
    });
}