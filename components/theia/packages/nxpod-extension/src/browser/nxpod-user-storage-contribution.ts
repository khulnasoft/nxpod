/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { injectable, inject } from 'inversify';
import { UserStorageContribution } from '@theia/userstorage/lib/browser/user-storage-contribution';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { FileSystemProvider } from '@theia/filesystem/lib/common/files';
import { NxpodUserStorageProvider } from './nxpod-user-storage-provider';

@injectable()
export class NxpodUserStorageContribution extends UserStorageContribution {

    @inject(NxpodUserStorageProvider)
    protected readonly provider: NxpodUserStorageProvider;

    protected async createProvider(service: FileService): Promise<FileSystemProvider> {
        return this.provider;
    }

}