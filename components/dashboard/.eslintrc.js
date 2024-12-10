/**
 * Copyright (c) 2021 Nxpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License.AGPL.txt in the project root for license information.
 */

module.exports = {
    root: true,
    extends: ["react-app", "react-app/jest"],
    rules: {
        "import/no-anonymous-default-export": "error",
        "react/jsx-no-constructed-context-values": "error",
    },
};
