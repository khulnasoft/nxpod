-- Copyright (c) 2020 Nxpod GmbH. All rights reserved.
-- Licensed under the GNU Affero General Public License (AGPL). See License.AGPL.txt in the project root for license information.


-- create test DB user
SET @nxpodDbPassword = IFNULL(@nxpodDbPassword, 'test');

SET @statementStr = CONCAT(
    'CREATE USER IF NOT EXISTS "nxpod"@"%" IDENTIFIED BY "', @nxpodDbPassword, '";'
);
SELECT @statementStr ;
PREPARE stmt FROM @statementStr; EXECUTE stmt; DEALLOCATE PREPARE stmt;
