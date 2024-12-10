/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the Nxpod Enterprise Source Code License,
 * See License.enterprise.txt in the project root folder.
 */

import { UserController } from "../../../src/user/user-controller";
import { inject } from "inversify";
import { LicenseEvaluator } from '@nxpod/licensor/lib';

export class UserControllerEE extends UserController {
    @inject(LicenseEvaluator) protected evaluator: LicenseEvaluator;

}