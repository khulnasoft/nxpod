// Copyright (c) 2024 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

// Code generated by connect-kotlin. DO NOT EDIT.
//
// Source: nxpod/v1/scm.proto
//
package io.nxpod.publicapi.v1

import com.connectrpc.Headers
import com.connectrpc.MethodSpec
import com.connectrpc.ProtocolClientInterface
import com.connectrpc.ResponseMessage
import com.connectrpc.StreamType

public class SCMServiceClient(
  private val client: ProtocolClientInterface,
) : SCMServiceClientInterface {
  /**
   *  SearchSCMTokens allows clients to retrieve SCM tokens based on the
   *  specified host.
   */
  override suspend fun searchSCMTokens(request: Scm.SearchSCMTokensRequest, headers: Headers):
      ResponseMessage<Scm.SearchSCMTokensResponse> = client.unary(
    request,
    headers,
    MethodSpec(
    "nxpod.v1.SCMService/SearchSCMTokens",
      io.nxpod.publicapi.v1.Scm.SearchSCMTokensRequest::class,
      io.nxpod.publicapi.v1.Scm.SearchSCMTokensResponse::class,
      StreamType.UNARY,
    ),
  )


  /**
   *  GuessTokenScopes allows clients to retrieve scopes their SCM token would
   *  require for the specified git command.
   */
  override suspend fun guessTokenScopes(request: Scm.GuessTokenScopesRequest, headers: Headers):
      ResponseMessage<Scm.GuessTokenScopesResponse> = client.unary(
    request,
    headers,
    MethodSpec(
    "nxpod.v1.SCMService/GuessTokenScopes",
      io.nxpod.publicapi.v1.Scm.GuessTokenScopesRequest::class,
      io.nxpod.publicapi.v1.Scm.GuessTokenScopesResponse::class,
      StreamType.UNARY,
    ),
  )


  /**
   *  SearchRepositories allows clients to search for suggested repositories of
   *  SCM providers they are connected with.
   */
  override suspend fun searchRepositories(request: Scm.SearchRepositoriesRequest, headers: Headers):
      ResponseMessage<Scm.SearchRepositoriesResponse> = client.unary(
    request,
    headers,
    MethodSpec(
    "nxpod.v1.SCMService/SearchRepositories",
      io.nxpod.publicapi.v1.Scm.SearchRepositoriesRequest::class,
      io.nxpod.publicapi.v1.Scm.SearchRepositoriesResponse::class,
      StreamType.UNARY,
    ),
  )


  /**
   *  ListSuggestedRepositories allows clients to list suggested repositories
   *  based on recent workspaces and accessible repo configurations.
   */
  override suspend fun listSuggestedRepositories(request: Scm.ListSuggestedRepositoriesRequest,
      headers: Headers): ResponseMessage<Scm.ListSuggestedRepositoriesResponse> = client.unary(
    request,
    headers,
    MethodSpec(
    "nxpod.v1.SCMService/ListSuggestedRepositories",
      io.nxpod.publicapi.v1.Scm.ListSuggestedRepositoriesRequest::class,
      io.nxpod.publicapi.v1.Scm.ListSuggestedRepositoriesResponse::class,
      StreamType.UNARY,
    ),
  )

}
