// Copyright (c) 2024 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

// Code generated by connect-kotlin. DO NOT EDIT.
//
// Source: nxpod/v1/token.proto
//
package io.nxpod.publicapi.v1

import com.connectrpc.Headers
import com.connectrpc.ResponseMessage

public interface TokenServiceClientInterface {
  /**
   *  CreateUserToken creates a new temporary access token for the specified user.
   *  +admin – only to be used by installation admins
   */
  public suspend fun createTemporaryAccessToken(request: Token.CreateTemporaryAccessTokenRequest,
      headers: Headers = emptyMap()): ResponseMessage<Token.CreateTemporaryAccessTokenResponse>
}
