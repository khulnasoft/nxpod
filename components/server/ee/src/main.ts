/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the Nxpod Enterprise Source Code License,
 * See License.enterprise.txt in the project root folder.
 */

import { start } from "../../src/init";
import { log } from "@nxpod/nxpod-protocol/lib/util/logging";
import { Container } from "inversify";
import { productionContainerModule } from "../../src/container-module";
import { productionEEContainerModule } from "./container-module";
import { dbContainerModule } from "@nxpod/nxpod-db/lib/container-module";

const container = new Container();
container.load(productionContainerModule);
container.load(productionEEContainerModule);
container.load(dbContainerModule);

start(container)
    .catch(err => {
        log.error("Error during startup or operation. Exiting.", err);
        process.exit(1);
    });
