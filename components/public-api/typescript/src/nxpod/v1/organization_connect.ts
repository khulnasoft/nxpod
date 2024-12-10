/**
 * Copyright (c) 2024 Nxpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License.AGPL.txt in the project root for license information.
 */

// @generated by protoc-gen-connect-es v1.1.2 with parameter "target=ts"
// @generated from file nxpod/v1/organization.proto (package nxpod.v1, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import { CreateOrganizationRequest, CreateOrganizationResponse, DeleteOrganizationMemberRequest, DeleteOrganizationMemberResponse, DeleteOrganizationRequest, DeleteOrganizationResponse, GetOrganizationInvitationRequest, GetOrganizationInvitationResponse, GetOrganizationRequest, GetOrganizationResponse, GetOrganizationSettingsRequest, GetOrganizationSettingsResponse, JoinOrganizationRequest, JoinOrganizationResponse, ListOrganizationMembersRequest, ListOrganizationMembersResponse, ListOrganizationsRequest, ListOrganizationsResponse, ListOrganizationWorkspaceClassesRequest, ListOrganizationWorkspaceClassesResponse, ResetOrganizationInvitationRequest, ResetOrganizationInvitationResponse, UpdateOrganizationMemberRequest, UpdateOrganizationMemberResponse, UpdateOrganizationRequest, UpdateOrganizationResponse, UpdateOrganizationSettingsRequest, UpdateOrganizationSettingsResponse } from "./organization_pb.js";
import { MethodKind } from "@bufbuild/protobuf";

/**
 * @generated from service nxpod.v1.OrganizationService
 */
export const OrganizationService = {
  typeName: "nxpod.v1.OrganizationService",
  methods: {
    /**
     * CreateOrganization creates a new Organization.
     *
     * @generated from rpc nxpod.v1.OrganizationService.CreateOrganization
     */
    createOrganization: {
      name: "CreateOrganization",
      I: CreateOrganizationRequest,
      O: CreateOrganizationResponse,
      kind: MethodKind.Unary,
    },
    /**
     * GetOrganization retrieves a single Organization.
     *
     * @generated from rpc nxpod.v1.OrganizationService.GetOrganization
     */
    getOrganization: {
      name: "GetOrganization",
      I: GetOrganizationRequest,
      O: GetOrganizationResponse,
      kind: MethodKind.Unary,
    },
    /**
     * UpdateOrganization updates the properties of an Organization.
     *
     * @generated from rpc nxpod.v1.OrganizationService.UpdateOrganization
     */
    updateOrganization: {
      name: "UpdateOrganization",
      I: UpdateOrganizationRequest,
      O: UpdateOrganizationResponse,
      kind: MethodKind.Unary,
    },
    /**
     * ListOrganizations lists all organization the caller has access to.
     *
     * @generated from rpc nxpod.v1.OrganizationService.ListOrganizations
     */
    listOrganizations: {
      name: "ListOrganizations",
      I: ListOrganizationsRequest,
      O: ListOrganizationsResponse,
      kind: MethodKind.Unary,
    },
    /**
     * DeleteOrganization deletes the specified organization.
     *
     * @generated from rpc nxpod.v1.OrganizationService.DeleteOrganization
     */
    deleteOrganization: {
      name: "DeleteOrganization",
      I: DeleteOrganizationRequest,
      O: DeleteOrganizationResponse,
      kind: MethodKind.Unary,
    },
    /**
     * GetOrganizationInvitation retrieves the invitation for a Organization.
     *
     * @generated from rpc nxpod.v1.OrganizationService.GetOrganizationInvitation
     */
    getOrganizationInvitation: {
      name: "GetOrganizationInvitation",
      I: GetOrganizationInvitationRequest,
      O: GetOrganizationInvitationResponse,
      kind: MethodKind.Unary,
    },
    /**
     * JoinOrganization makes the caller a OrganizationMember of the Organization.
     *
     * @generated from rpc nxpod.v1.OrganizationService.JoinOrganization
     */
    joinOrganization: {
      name: "JoinOrganization",
      I: JoinOrganizationRequest,
      O: JoinOrganizationResponse,
      kind: MethodKind.Unary,
    },
    /**
     * ResetOrganizationInvitation resets the invitation_id for a Organization.
     *
     * @generated from rpc nxpod.v1.OrganizationService.ResetOrganizationInvitation
     */
    resetOrganizationInvitation: {
      name: "ResetOrganizationInvitation",
      I: ResetOrganizationInvitationRequest,
      O: ResetOrganizationInvitationResponse,
      kind: MethodKind.Unary,
    },
    /**
     * ListOrganizationMembers lists the members of a Organization.
     *
     * @generated from rpc nxpod.v1.OrganizationService.ListOrganizationMembers
     */
    listOrganizationMembers: {
      name: "ListOrganizationMembers",
      I: ListOrganizationMembersRequest,
      O: ListOrganizationMembersResponse,
      kind: MethodKind.Unary,
    },
    /**
     * UpdateOrganizationMember updates organization membership properties.
     *
     * @generated from rpc nxpod.v1.OrganizationService.UpdateOrganizationMember
     */
    updateOrganizationMember: {
      name: "UpdateOrganizationMember",
      I: UpdateOrganizationMemberRequest,
      O: UpdateOrganizationMemberResponse,
      kind: MethodKind.Unary,
    },
    /**
     * DeleteOrganizationMember removes a OrganizationMember from the
     * Organization.
     *
     * @generated from rpc nxpod.v1.OrganizationService.DeleteOrganizationMember
     */
    deleteOrganizationMember: {
      name: "DeleteOrganizationMember",
      I: DeleteOrganizationMemberRequest,
      O: DeleteOrganizationMemberResponse,
      kind: MethodKind.Unary,
    },
    /**
     * GetOrganizationSettings retrieves the settings of a Organization.
     *
     * @generated from rpc nxpod.v1.OrganizationService.GetOrganizationSettings
     */
    getOrganizationSettings: {
      name: "GetOrganizationSettings",
      I: GetOrganizationSettingsRequest,
      O: GetOrganizationSettingsResponse,
      kind: MethodKind.Unary,
    },
    /**
     * UpdateOrganizationSettings updates the settings of a Organization.
     *
     * @generated from rpc nxpod.v1.OrganizationService.UpdateOrganizationSettings
     */
    updateOrganizationSettings: {
      name: "UpdateOrganizationSettings",
      I: UpdateOrganizationSettingsRequest,
      O: UpdateOrganizationSettingsResponse,
      kind: MethodKind.Unary,
    },
    /**
     * ListOrganizationWorkspaceClasses lists workspace classes of a
     * Organization.
     *
     * @generated from rpc nxpod.v1.OrganizationService.ListOrganizationWorkspaceClasses
     */
    listOrganizationWorkspaceClasses: {
      name: "ListOrganizationWorkspaceClasses",
      I: ListOrganizationWorkspaceClassesRequest,
      O: ListOrganizationWorkspaceClassesResponse,
      kind: MethodKind.Unary,
    },
  }
} as const;
