/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the Nxpod Enterprise Source Code License,
 * See License.enterprise.txt in the project root folder.
 */

import "reflect-metadata";

import { createNxpodService } from "../../src/service-factory";
import { renderEntrypoint } from '../../src/entrypoint';
import { License, LicenseProps } from "./components/license";

export { License, LicenseProps };

const service = createNxpodService();
const user = service.server.getLoggedInUser();
renderEntrypoint(License, { service, user });
