/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { NxpodService } from "@nxpod/nxpod-protocol";
import { injectable } from "inversify";
import { getNxpodService } from "./utils";

@injectable()
export class NxpodServiceProvider {

    /** why do we need it, we can just inject bind(NxpodService).toConstantValue and then inject it */
    getService(): NxpodService {
        return getNxpodService();
    }
}