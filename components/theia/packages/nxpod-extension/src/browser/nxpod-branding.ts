/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { injectable, inject, postConstruct } from "inversify";
import { NxpodServiceProvider } from "./nxpod-service-provider";
import { Branding } from "@nxpod/nxpod-protocol";
import { Deferred } from "@theia/core/lib/common/promise-util";


@injectable()
export class NxpodBranding {

    protected brandingPromise = new Deferred<Branding>();
    @inject(NxpodServiceProvider) protected serviceProvider: NxpodServiceProvider;

    @postConstruct()
    protected async init() {
        const service = await this.serviceProvider.getService();
        this.brandingPromise.resolve(await service.server.getBranding());
    }

    get branding(): Promise<Branding> {
        return this.brandingPromise.promise;
    }

}