// Copyright (c) 2022 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package io.nxpod.nxpodprotocol.api.entities;

public enum WorkspaceTimeoutDuration {
    DURATION_SHORT("short"),
    DURATION_LONG("long"),
    DURATION_EXTENDED("extended"),
    DURATION_180M("180m"); // for backwards compatibility since the IDE uses this

    private String value;

    WorkspaceTimeoutDuration(String value) {
        this.value = value;
    }

    public String toString() {
        return value;
    }
}
