/**
 * Copyright (c) 2024 Nxpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License.AGPL.txt in the project root for license information.
 */

import { FC } from "react";
import { Configuration } from "@nxpod/public-api/lib/nxpod/v1/configuration_pb";
import { ConfigurationWorkspaceEditorsOptions } from "./editors/ConfigurationWorkspaceEditorsOptions";

interface Props {
    configuration: Configuration;
}
export const ConfigurationDetailEditors: FC<Props> = ({ configuration }) => {
    return <ConfigurationWorkspaceEditorsOptions configuration={configuration} />;
};
