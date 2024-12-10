// Copyright (c) 2024 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

// Code generated by connect-kotlin. DO NOT EDIT.
//
// Source: nxpod/v1/installation.proto
//
package io.nxpod.publicapi.v1

import com.connectrpc.Headers
import com.connectrpc.ResponseMessage

public interface InstallationServiceClientInterface {
  /**
   *  GetInstallationWorkspaceDefaultImage returns the default image for current
   *  Nxpod Installation.
   */
  public suspend
      fun getInstallationWorkspaceDefaultImage(request: Installation.GetInstallationWorkspaceDefaultImageRequest,
      headers: Headers = emptyMap()):
      ResponseMessage<Installation.GetInstallationWorkspaceDefaultImageResponse>

  /**
   *  ListBlockedRepositories lists blocked repositories.
   */
  public suspend fun listBlockedRepositories(request: Installation.ListBlockedRepositoriesRequest,
      headers: Headers = emptyMap()): ResponseMessage<Installation.ListBlockedRepositoriesResponse>

  /**
   *  CreateBlockedRepository creates a new blocked repository.
   */
  public suspend fun createBlockedRepository(request: Installation.CreateBlockedRepositoryRequest,
      headers: Headers = emptyMap()): ResponseMessage<Installation.CreateBlockedRepositoryResponse>

  /**
   *  DeleteBlockedRepository deletes a blocked repository.
   */
  public suspend fun deleteBlockedRepository(request: Installation.DeleteBlockedRepositoryRequest,
      headers: Headers = emptyMap()): ResponseMessage<Installation.DeleteBlockedRepositoryResponse>

  /**
   *  ListBlockedEmailDomains lists blocked email domains.
   */
  public suspend fun listBlockedEmailDomains(request: Installation.ListBlockedEmailDomainsRequest,
      headers: Headers = emptyMap()): ResponseMessage<Installation.ListBlockedEmailDomainsResponse>

  /**
   *  CreateBlockedEmailDomain creates a new blocked email domain.
   */
  public suspend fun createBlockedEmailDomain(request: Installation.CreateBlockedEmailDomainRequest,
      headers: Headers = emptyMap()): ResponseMessage<Installation.CreateBlockedEmailDomainResponse>

  /**
   *  GetOnboardingState returns the onboarding state of the installation.
   */
  public suspend fun getOnboardingState(request: Installation.GetOnboardingStateRequest,
      headers: Headers = emptyMap()): ResponseMessage<Installation.GetOnboardingStateResponse>

  /**
   *  GetInstallationConfiguration returns configuration of the installation.
   */
  public suspend
      fun getInstallationConfiguration(request: Installation.GetInstallationConfigurationRequest,
      headers: Headers = emptyMap()):
      ResponseMessage<Installation.GetInstallationConfigurationResponse>
}
