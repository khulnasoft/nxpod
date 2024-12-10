-- Copyright (c) 2020 TypeFox GmbH. All rights reserved.
-- Licensed under the MIT License. See License-MIT.txt in the project root for license information.

-- must be idempotent

-- @nxpodDB contains name of the DB the script manipulates, 'nxpod' by default.
-- Prepend the script with "SET @nxpodDB = '`<db-name>`'" if needed otherwise
SET @nxpodDB = IFNULL(@nxpodDB, '`nxpod`');

SET @statementStr = CONCAT('DROP DATABASE IF EXISTS ', @nxpodDB);
PREPARE statement FROM @statementStr;
EXECUTE statement;

SET @statementStr = CONCAT('CREATE DATABASE ', @nxpodDB, ' CHARSET utf8mb4');
PREPARE statement FROM @statementStr;
EXECUTE statement;
