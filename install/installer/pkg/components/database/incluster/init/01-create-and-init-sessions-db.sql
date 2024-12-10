-- Copyright (c) 2020 Nxpod GmbH. All rights reserved.
-- Licensed under the GNU Affero General Public License (AGPL). See License.AGPL.txt in the project root for license information.

-- must be idempotent

CREATE DATABASE IF NOT EXISTS `nxpod-sessions` CHARSET utf8mb4;

USE `nxpod-sessions`;

-- This removed again in later migration -  in pkg/components/database/incluster/init/04-drop-sessions-db.sql
CREATE TABLE IF NOT EXISTS sessions (
   `session_id` varchar(128) COLLATE utf8mb4_bin NOT NULL,
   `expires` int(11) unsigned NOT NULL,
   `data` text COLLATE utf8mb4_bin,
   `_lastModified` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
   PRIMARY KEY (`session_id`)
);

-- Grant privileges
GRANT ALL ON `nxpod-sessions`.* TO "__NXPOD_USERNAME__"@"%";
