/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { JsonRpcProxyFactory } from '@theia/core/lib/common/messaging/proxy-factory';
import { IPCEntryPoint } from '@theia/core/lib/node/messaging/ipc-protocol';
import { NxpodPluginLocatorImpl } from './nxpod-plugin-locator-impl';

export default <IPCEntryPoint>(connection =>
    new JsonRpcProxyFactory(new NxpodPluginLocatorImpl()).listen(connection)
);
