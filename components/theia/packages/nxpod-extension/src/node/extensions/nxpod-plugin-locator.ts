/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { Disposable } from '@theia/core/lib/common/disposable';

export const NxpodPluginLocator = Symbol('NxpodPluginLocator');
export interface NxpodPluginLocator extends Disposable {

    find(fileUri: string, extensionsPath: string): Promise<{ fullPluginName: string } | undefined>;

}
