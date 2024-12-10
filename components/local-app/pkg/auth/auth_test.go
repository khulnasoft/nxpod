// Copyright (c) 2021 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

//go:build linux && amd64
// +build linux,amd64

package auth

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"net/http"
	"testing"

	nxpod "github.com/khulnasoft/nxpod/nxpod-protocol"
	"github.com/golang/mock/gomock"
	"github.com/google/go-cmp/cmp"
)

func TestValidateToken(t *testing.T) {
	tkn := "foo"
	hash := sha256.Sum256([]byte(tkn))
	tokenHash := hex.EncodeToString(hash[:])

	unauthorizedErr := &nxpod.ErrBadHandshake{
		Resp: &http.Response{
			StatusCode: 401,
		},
	}

	forbiddenErr := errors.New("jsonrpc2: code 403 message: getNxpodTokenScopes")

	tests := []struct {
		Desc        string
		Scopes      []string
		ScopesErr   error
		Expectation error
	}{
		{
			Desc:        "invalid: unauthorized",
			ScopesErr:   unauthorizedErr,
			Expectation: &ErrInvalidNxpodToken{unauthorizedErr},
		},
		{
			Desc:        "invalid: forbidden",
			ScopesErr:   forbiddenErr,
			Expectation: &ErrInvalidNxpodToken{forbiddenErr},
		},
		{
			Desc:        "invalid: missing scopes",
			Scopes:      []string{"function:getWorkspace"},
			Expectation: &ErrInvalidNxpodToken{errors.New("function:getNxpodTokenScopes scope is missing in [function:getWorkspace]")},
		},
		{
			Desc:   "valid",
			Scopes: authScopesLocalCompanion,
		},
	}
	for _, test := range tests {
		t.Run(test.Desc, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			nxpodAPI := nxpod.NewMockAPIInterface(ctrl)
			nxpodAPI.EXPECT().GetNxpodTokenScopes(context.Background(), tokenHash).Times(1).Return(test.Scopes, test.ScopesErr)

			var expectation string
			if test.Expectation != nil {
				expectation = test.Expectation.Error()
			}

			var actual string
			err := ValidateToken(nxpodAPI, tkn)
			if err != nil {
				actual = err.Error()
			}

			if diff := cmp.Diff(expectation, actual); diff != "" {
				t.Errorf("unexpected output (-want +got):\n%s", diff)
			}
		})
	}
}
