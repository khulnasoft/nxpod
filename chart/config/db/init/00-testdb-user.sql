-- Copyright (c) 2020 TypeFox GmbH. All rights reserved.
-- Licensed under the MIT License. See License-MIT.txt in the project root for license information.


-- create test DB user
SET @nxpodDbPassword = IFNULL(@nxpodDbPassword, 'test');
