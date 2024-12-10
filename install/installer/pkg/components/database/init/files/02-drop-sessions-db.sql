-- Copyright (c) 2020 Nxpod GmbH. All rights reserved.
-- Licensed under the GNU Affero General Public License (AGPL). See License.AGPL.txt in the project root for license information.

-- must be idempotent

USE `nxpod-sessions`;

DROP TABLE IF EXISTS `sessions`;

DROP DATABASE IF EXISTS `nxpod-sessions`;
