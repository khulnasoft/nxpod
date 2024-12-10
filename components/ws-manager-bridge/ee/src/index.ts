/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the Nxpod Enterprise Source Code License,
 * See License.enterprise.txt in the project root folder.
 */

require('reflect-metadata');

import { Container } from "inversify";
import { containerModuleEE } from "./container-module";
import { start } from "../../src/main";
import { containerModule } from "../../src/container-module";
import { dbContainerModule } from "@nxpod/nxpod-db/lib/container-module";

const container = new Container();
container.load(containerModule);
container.load(containerModuleEE);
container.load(dbContainerModule);

start(container);
