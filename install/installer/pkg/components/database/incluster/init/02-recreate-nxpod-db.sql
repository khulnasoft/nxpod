-- Copyright (c) 2020 Nxpod GmbH. All rights reserved.
-- Licensed under the GNU Affero General Public License (AGPL). See License.AGPL.txt in the project root for license information.

-- must be idempotent

-- @nxpodDB contains name of the DB the script manipulates, and is replaced by the file reader
SET
@nxpodDB = IFNULL(@nxpodDB, '`__NXPOD_DB_NAME__`');

SET
@statementStr = CONCAT('DROP DATABASE IF EXISTS ', @nxpodDB);
PREPARE statement FROM @statementStr;
EXECUTE statement;

SET
@statementStr = CONCAT('CREATE DATABASE ', @nxpodDB, ' CHARSET utf8mb4');
PREPARE statement FROM @statementStr;
EXECUTE statement;
