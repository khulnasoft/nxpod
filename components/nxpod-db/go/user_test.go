// Copyright (c) 2023 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package db_test

import (
	"context"
	"testing"

	db "github.com/khulnasoft/nxpod/components/nxpod-db/go"
	"github.com/khulnasoft/nxpod/components/nxpod-db/go/dbtest"
	"github.com/stretchr/testify/require"
)

func TestGetUser(t *testing.T) {
	conn := dbtest.ConnectForTests(t).Debug()
	user := dbtest.CreatUsers(t, conn, db.User{})[0]

	retrived, err := db.GetUser(context.Background(), conn, user.ID)
	require.NoError(t, err)
	require.Equal(t, user, retrived)
}
