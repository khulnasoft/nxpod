// Copyright (c) 2024 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package smoketest

import (
	"context"
	"fmt"
	"os"
	"strings"
	"testing"
	"time"

	connect "github.com/bufbuild/connect-go"
	v1 "github.com/khulnasoft/nxpod/components/public-api/go/v1"
	v1connect "github.com/khulnasoft/nxpod/components/public-api/go/v1/v1connect"
)

/*
*
export TEST_CREATE_TMP_TOKEN=true
export NXPOD_HOST=hw-token-exp-1084.preview.nxpod-dev.com

	export INSTALLATION_ADMIN_PAT=<admin_pat>
	# PAT of a member or an owner or a collaborator
	export MEMBER_USER_PAT=<other_pat>

export MEMBER_USER_ID=fffbc8e0-7f70-4afc-a370-63c889f7e644
export TARGET_USER_ID=fffbc8e0-7f70-4afc-a370-63c889f7e644

go test -run "^TestCreateTemporaryAccessToken" github.com/khulnasoft/nxpod/test/tests/smoke-test -v -count=1
*/
const BUILTIN_INSTLLATION_ADMIN_USER_ID = "f071bb8e-b5d1-46cf-a436-da03ae63bcd2"

func TestCreateTemporaryAccessToken(t *testing.T) {
	if !shouldTestPAPICreateTmpToken() {
		t.Skip("skip papi create temporary access token test")
		return
	}
	nxpodHost, _ := os.LookupEnv("NXPOD_HOST")
	adminPAT, _ := os.LookupEnv("INSTALLATION_ADMIN_PAT")
	targetUserID, _ := os.LookupEnv("TARGET_USER_ID")
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	assertGetUser(ctx, t, nxpodHost, adminPAT, BUILTIN_INSTLLATION_ADMIN_USER_ID, "")
	newTargetToken := assertTemporaryAccessToken(ctx, t, nxpodHost, adminPAT, targetUserID, 60, "")
	if newTargetToken == "" {
		return
	}

	assertGetUser(ctx, t, nxpodHost, adminPAT, BUILTIN_INSTLLATION_ADMIN_USER_ID, "")
	assertGetUser(ctx, t, nxpodHost, newTargetToken, targetUserID, "")
}

func TestCreateTemporaryAccessTokenDeniedToCreateInstallationAdmin(t *testing.T) {
	// because installation admin is not an organization owned user
	if !shouldTestPAPICreateTmpToken() {
		t.Skip("skip papi create temporary access token test")
		return
	}
	nxpodHost, _ := os.LookupEnv("NXPOD_HOST")
	adminPAT, _ := os.LookupEnv("INSTALLATION_ADMIN_PAT")
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	assertGetUser(ctx, t, nxpodHost, adminPAT, BUILTIN_INSTLLATION_ADMIN_USER_ID, "")
	assertTemporaryAccessToken(ctx, t, nxpodHost, adminPAT, BUILTIN_INSTLLATION_ADMIN_USER_ID, 60, "permission_denied")
}

func TestCreateTemporaryAccessTokenWithNotFoundUser(t *testing.T) {
	if !shouldTestPAPICreateTmpToken() {
		t.Skip("skip papi create temporary access token test")
		return
	}
	nxpodHost, _ := os.LookupEnv("NXPOD_HOST")
	adminPAT, _ := os.LookupEnv("INSTALLATION_ADMIN_PAT")
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	assertGetUser(ctx, t, nxpodHost, adminPAT, BUILTIN_INSTLLATION_ADMIN_USER_ID, "")
	assertTemporaryAccessToken(ctx, t, nxpodHost, adminPAT, "00000000-0000-0000-0000-000000000000", 60, "not_found")
}

func TestCreateTemporaryAccessTokenViaMember(t *testing.T) {
	if !shouldTestPAPICreateTmpToken() {
		t.Skip("skip papi create temporary access token test")
		return
	}
	nxpodHost, _ := os.LookupEnv("NXPOD_HOST")
	memberUserPAT, _ := os.LookupEnv("MEMBER_USER_PAT")
	memberUserID, _ := os.LookupEnv("MEMBER_USER_ID")
	targetUserID, _ := os.LookupEnv("TARGET_USER_ID")
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	assertGetUser(ctx, t, nxpodHost, memberUserPAT, memberUserID, "")
	assertTemporaryAccessToken(ctx, t, nxpodHost, memberUserPAT, targetUserID, 60, "permission_denied")
}

func TestCreateTemporaryAccessTokenExpiry(t *testing.T) {
	if !shouldTestPAPICreateTmpToken() {
		t.Skip("skip papi create temporary access token test")
		return
	}
	nxpodHost, _ := os.LookupEnv("NXPOD_HOST")
	adminPAT, _ := os.LookupEnv("INSTALLATION_ADMIN_PAT")
	targetUserID, _ := os.LookupEnv("TARGET_USER_ID")
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	assertGetUser(ctx, t, nxpodHost, adminPAT, BUILTIN_INSTLLATION_ADMIN_USER_ID, "")
	newTargetToken := assertTemporaryAccessToken(ctx, t, nxpodHost, adminPAT, targetUserID, 3, "")
	if newTargetToken == "" {
		return
	}
	assertGetUser(ctx, t, nxpodHost, adminPAT, BUILTIN_INSTLLATION_ADMIN_USER_ID, "")
	assertGetUser(ctx, t, nxpodHost, newTargetToken, targetUserID, "")

	time.Sleep(time.Second * 3)

	assertGetUser(ctx, t, nxpodHost, newTargetToken, targetUserID, "unauthenticated")
}

func TestCreateTemporaryAccessTokenCreateEnv(t *testing.T) {
	if !shouldTestPAPICreateTmpToken() {
		t.Skip("skip papi create temporary access token test")
		return
	}
	nxpodHost, _ := os.LookupEnv("NXPOD_HOST")
	adminPAT, _ := os.LookupEnv("INSTALLATION_ADMIN_PAT")
	targetUserID, _ := os.LookupEnv("TARGET_USER_ID")
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	assertGetUser(ctx, t, nxpodHost, adminPAT, BUILTIN_INSTLLATION_ADMIN_USER_ID, "")
	newTargetToken := assertTemporaryAccessToken(ctx, t, nxpodHost, adminPAT, targetUserID, 60, "")
	if newTargetToken == "" {
		return
	}

	assertGetUser(ctx, t, nxpodHost, adminPAT, BUILTIN_INSTLLATION_ADMIN_USER_ID, "")
	assertGetUser(ctx, t, nxpodHost, newTargetToken, targetUserID, "")

	assertCreateEnvVar(ctx, t, nxpodHost, newTargetToken, "foo", "boo")
}

func assertTemporaryAccessToken(ctx context.Context, t *testing.T, nxpodHost, userToken, targetUserID string, expirySeconds int32, wantedErrMsg string) string {
	useCookie := !strings.HasPrefix(userToken, "nxpod_pat_")
	v1Http, v1Opts, v1Host := getPAPIConnSettings(nxpodHost, userToken, useCookie, false)
	v1Client := v1connect.NewTokenServiceClient(v1Http, v1Host, v1Opts...)
	targetInfo, err := v1Client.CreateTemporaryAccessToken(ctx, connect.NewRequest(&v1.CreateTemporaryAccessTokenRequest{
		UserId:        targetUserID,
		ExpirySeconds: expirySeconds,
	}))
	if wantedErrMsg != "" {
		if err == nil {
			t.Errorf("CreateTemporaryAccessToken() error = %v", err)
		}
		if !strings.Contains(err.Error(), wantedErrMsg) {
			t.Errorf("CreateTemporaryAccessToken() error = %v, wantErr %v", err, wantedErrMsg)
		}
		return ""
	}
	if err != nil && wantedErrMsg == "" {
		t.Errorf("CreateTemporaryAccessToken() error = %v", err)
		return ""
	}
	return fmt.Sprintf("%s=%s", targetInfo.Msg.CookieName, targetInfo.Msg.Token)
}

func assertGetUser(ctx context.Context, t *testing.T, nxpodHost, userToken string, wantedUser, wantedErrMsg string) {
	useCookie := !strings.HasPrefix(userToken, "nxpod_pat_")
	v1Http, v1Opts, v1Host := getPAPIConnSettings(nxpodHost, userToken, useCookie, false)
	v1Client := v1connect.NewUserServiceClient(v1Http, v1Host, v1Opts...)
	user, err := v1Client.GetAuthenticatedUser(ctx, connect.NewRequest(&v1.GetAuthenticatedUserRequest{}))
	if wantedErrMsg != "" {
		if err == nil {
			t.Errorf("GetAuthenticatedUser() error = nil, wantErr %s", wantedErrMsg)
			return
		}
		if !strings.Contains(err.Error(), wantedErrMsg) {
			t.Errorf("GetAuthenticatedUser() error = %v, wantErr %s", err, wantedErrMsg)
		}
		return
	}
	if err != nil {
		t.Errorf("GetAuthenticatedUser() error = %v", err)
		return
	}
	if user.Msg.User.Id != wantedUser {
		t.Errorf("GetAuthenticatedUser() = %v, wantUser %v", user.Msg.User.Id, wantedUser)
	}
}

func assertCreateEnvVar(ctx context.Context, t *testing.T, nxpodHost, userToken string, envVarName, envVarVal string) {
	useCookie := !strings.HasPrefix(userToken, "nxpod_pat_")
	v1Http, v1Opts, v1Host := getPAPIConnSettings(nxpodHost, userToken, useCookie, false)
	v1Client := v1connect.NewEnvironmentVariableServiceClient(v1Http, v1Host, v1Opts...)

	list, err := v1Client.ListUserEnvironmentVariables(ctx, connect.NewRequest(&v1.ListUserEnvironmentVariablesRequest{}))
	if err != nil {
		t.Errorf("ListUserEnvironmentVariables() error = %v", err)
		return
	}
	var found *v1.UserEnvironmentVariable = nil
	for _, envVar := range list.Msg.EnvironmentVariables {
		if envVar.Name == envVarName {
			found = envVar
			break
		}
	}
	if found != nil {
		fmt.Printf("found env var %+v\n", found)
	}
	if found == nil {
		_, err := v1Client.CreateUserEnvironmentVariable(ctx, connect.NewRequest(&v1.CreateUserEnvironmentVariableRequest{
			Name:              envVarName,
			Value:             envVarVal,
			RepositoryPattern: "*/*",
		}))
		if err != nil {
			t.Errorf("CreateUserEnvironmentVariable() error = %v", err)
			return
		}
	} else {
		scope := "*/*"
		_, err := v1Client.UpdateUserEnvironmentVariable(ctx, connect.NewRequest(&v1.UpdateUserEnvironmentVariableRequest{
			EnvironmentVariableId: found.Id,
			Name:                  &envVarName,
			Value:                 &envVarVal,
			RepositoryPattern:     &scope,
		}))
		if err != nil {
			t.Errorf("UpdateUserEnvironmentVariable() error = %v", err)
			return
		}
	}
	list2, err := v1Client.ListUserEnvironmentVariables(ctx, connect.NewRequest(&v1.ListUserEnvironmentVariablesRequest{}))
	if err != nil {
		t.Errorf("ListUserEnvironmentVariables() error = %v", err)
		return
	}
	for _, envVar := range list2.Msg.EnvironmentVariables {
		if envVar.Name == envVarName && envVar.Value == envVarVal {
			return
		}
	}
	t.Errorf("Cannot found env var %s=%s", envVarName, envVarVal)
}

func shouldTestPAPICreateTmpToken() bool {
	should, _ := os.LookupEnv("TEST_CREATE_TMP_TOKEN")
	return should == "true"
}
