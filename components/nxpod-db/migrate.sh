#!/bin/bash
# Copyright (c) 2021 Nxpod GmbH. All rights reserved.
# Licensed under the GNU Affero General Public License (AGPL).
# See License.AGPL.txt in the project root for license information.

set -euo pipefail

/app/typeorm.sh migrations:run
