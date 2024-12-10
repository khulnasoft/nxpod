/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the Nxpod Enterprise Source Code License,
 * See License.enterprise.txt in the project root folder.
 */

import { UserService, CheckSignUpParams } from "../../../src/user/user-service";
import { User, WorkspaceTimeoutDuration } from "@nxpod/nxpod-protocol";
import { inject } from "inversify";
import { LicenseEvaluator } from "@nxpod/licensor/lib";
import { Feature } from "@nxpod/licensor/lib/api";
import { AuthException } from "../../../src/auth/errors";

export class UserServiceEE extends UserService {
    @inject(LicenseEvaluator) protected readonly licenseEvaluator: LicenseEvaluator;

    async getDefaultWorkspaceTimeout(user: User, date: Date): Promise<WorkspaceTimeoutDuration> {
        if (!this.licenseEvaluator.isEnabled(Feature.FeatureSetTimeout)) {
            return "30m";
        }

        return "60m";
    }

    async checkSignUp(params: CheckSignUpParams) {
        const userCount = await this.userDb.getUserCount(true);
        if (!this.licenseEvaluator.hasEnoughSeats(userCount)) {
            // TODO: bail out to EE license flow

            const msg = `Maximum number of users permitted by the license exceeded`;
            throw AuthException.create("Cannot sign up", msg, { userCount });
        }
    }

}