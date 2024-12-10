/**
 * Copyright (c) 2023 Nxpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License.AGPL.txt in the project root for license information.
 */

import { MigrationInterface, QueryRunner } from "typeorm";
import { indexExists } from "./helper/helper";

const TABLE_NAME = "d_b_usage";
const INDEX_NAME = "ind_draft";

export class UsageAddIndexDraft1695798975062 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await indexExists(queryRunner, TABLE_NAME, INDEX_NAME))) {
            await queryRunner.query(
                `ALTER TABLE \`${TABLE_NAME}\` ADD INDEX \`${INDEX_NAME}\` (draft), ALGORITHM=INPLACE, LOCK=NONE`,
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await indexExists(queryRunner, TABLE_NAME, INDEX_NAME)) {
            await queryRunner.query(`DROP INDEX ${INDEX_NAME} ON ${TABLE_NAME}`);
        }
    }
}
