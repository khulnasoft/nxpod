/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import "reflect-metadata";

import { createNxpodService } from "./service-factory";
import { renderEntrypoint } from './entrypoint';
import { Settings } from "./components/settings";

const service = createNxpodService();
const user = service.server.getLoggedInUser();
renderEntrypoint(Settings, { service, user });
