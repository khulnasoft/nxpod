/**
 * Copyright (c) 2024 Nxpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License.AGPL.txt in the project root for license information.
 */

// @generated by protoc-gen-es v1.3.3 with parameter "target=ts"
// @generated from file nxpod/v1/error.proto (package nxpod.v1, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";

/**
 * details for PERMISSION_DENIED status code
 *
 * @generated from message nxpod.v1.PermissionDeniedDetails
 */
export class PermissionDeniedDetails extends Message<PermissionDeniedDetails> {
  /**
   * @generated from oneof nxpod.v1.PermissionDeniedDetails.reason
   */
  reason: {
    /**
     * @generated from field: nxpod.v1.UserBlockedError user_blocked = 1;
     */
    value: UserBlockedError;
    case: "userBlocked";
  } | {
    /**
     * @generated from field: nxpod.v1.NeedsVerificationError needs_verification = 2;
     */
    value: NeedsVerificationError;
    case: "needsVerification";
  } | { case: undefined; value?: undefined } = { case: undefined };

  constructor(data?: PartialMessage<PermissionDeniedDetails>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "nxpod.v1.PermissionDeniedDetails";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "user_blocked", kind: "message", T: UserBlockedError, oneof: "reason" },
    { no: 2, name: "needs_verification", kind: "message", T: NeedsVerificationError, oneof: "reason" },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): PermissionDeniedDetails {
    return new PermissionDeniedDetails().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): PermissionDeniedDetails {
    return new PermissionDeniedDetails().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): PermissionDeniedDetails {
    return new PermissionDeniedDetails().fromJsonString(jsonString, options);
  }

  static equals(a: PermissionDeniedDetails | PlainMessage<PermissionDeniedDetails> | undefined, b: PermissionDeniedDetails | PlainMessage<PermissionDeniedDetails> | undefined): boolean {
    return proto3.util.equals(PermissionDeniedDetails, a, b);
  }
}

/**
 * @generated from message nxpod.v1.UserBlockedError
 */
export class UserBlockedError extends Message<UserBlockedError> {
  constructor(data?: PartialMessage<UserBlockedError>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "nxpod.v1.UserBlockedError";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): UserBlockedError {
    return new UserBlockedError().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): UserBlockedError {
    return new UserBlockedError().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): UserBlockedError {
    return new UserBlockedError().fromJsonString(jsonString, options);
  }

  static equals(a: UserBlockedError | PlainMessage<UserBlockedError> | undefined, b: UserBlockedError | PlainMessage<UserBlockedError> | undefined): boolean {
    return proto3.util.equals(UserBlockedError, a, b);
  }
}

/**
 * @generated from message nxpod.v1.NeedsVerificationError
 */
export class NeedsVerificationError extends Message<NeedsVerificationError> {
  constructor(data?: PartialMessage<NeedsVerificationError>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "nxpod.v1.NeedsVerificationError";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): NeedsVerificationError {
    return new NeedsVerificationError().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): NeedsVerificationError {
    return new NeedsVerificationError().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): NeedsVerificationError {
    return new NeedsVerificationError().fromJsonString(jsonString, options);
  }

  static equals(a: NeedsVerificationError | PlainMessage<NeedsVerificationError> | undefined, b: NeedsVerificationError | PlainMessage<NeedsVerificationError> | undefined): boolean {
    return proto3.util.equals(NeedsVerificationError, a, b);
  }
}

/**
 * details for FAILED_PRECONDITION status code
 *
 * @generated from message nxpod.v1.FailedPreconditionDetails
 */
export class FailedPreconditionDetails extends Message<FailedPreconditionDetails> {
  /**
   * @generated from oneof nxpod.v1.FailedPreconditionDetails.reason
   */
  reason: {
    /**
     * @generated from field: nxpod.v1.PaymentSpendingLimitReachedError payment_spending_limit_reached = 1;
     */
    value: PaymentSpendingLimitReachedError;
    case: "paymentSpendingLimitReached";
  } | {
    /**
     * @generated from field: nxpod.v1.InvalidCostCenterError invalid_cost_center = 2;
     */
    value: InvalidCostCenterError;
    case: "invalidCostCenter";
  } | {
    /**
     * @generated from field: nxpod.v1.TooManyRunningWorkspacesError too_many_running_workspaces = 3;
     */
    value: TooManyRunningWorkspacesError;
    case: "tooManyRunningWorkspaces";
  } | {
    /**
     * @generated from field: nxpod.v1.InvalidNxpodYMLError invalid_nxpod_yml = 4;
     */
    value: InvalidNxpodYMLError;
    case: "invalidNxpodYml";
  } | {
    /**
     * @generated from field: nxpod.v1.RepositoryNotFoundError repository_not_found = 5;
     */
    value: RepositoryNotFoundError;
    case: "repositoryNotFound";
  } | {
    /**
     * @generated from field: nxpod.v1.RepositoryUnauthorizedError repository_unauthorized = 6;
     */
    value: RepositoryUnauthorizedError;
    case: "repositoryUnauthorized";
  } | {
    /**
     * @generated from field: nxpod.v1.ImageBuildLogsNotYetAvailableError image_build_logs_not_yet_available = 7;
     */
    value: ImageBuildLogsNotYetAvailableError;
    case: "imageBuildLogsNotYetAvailable";
  } | {
    /**
     * @generated from field: nxpod.v1.CellDisabledError cell_is_disabled = 8;
     */
    value: CellDisabledError;
    case: "cellIsDisabled";
  } | { case: undefined; value?: undefined } = { case: undefined };

  constructor(data?: PartialMessage<FailedPreconditionDetails>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "nxpod.v1.FailedPreconditionDetails";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "payment_spending_limit_reached", kind: "message", T: PaymentSpendingLimitReachedError, oneof: "reason" },
    { no: 2, name: "invalid_cost_center", kind: "message", T: InvalidCostCenterError, oneof: "reason" },
    { no: 3, name: "too_many_running_workspaces", kind: "message", T: TooManyRunningWorkspacesError, oneof: "reason" },
    { no: 4, name: "invalid_nxpod_yml", kind: "message", T: InvalidNxpodYMLError, oneof: "reason" },
    { no: 5, name: "repository_not_found", kind: "message", T: RepositoryNotFoundError, oneof: "reason" },
    { no: 6, name: "repository_unauthorized", kind: "message", T: RepositoryUnauthorizedError, oneof: "reason" },
    { no: 7, name: "image_build_logs_not_yet_available", kind: "message", T: ImageBuildLogsNotYetAvailableError, oneof: "reason" },
    { no: 8, name: "cell_is_disabled", kind: "message", T: CellDisabledError, oneof: "reason" },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): FailedPreconditionDetails {
    return new FailedPreconditionDetails().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): FailedPreconditionDetails {
    return new FailedPreconditionDetails().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): FailedPreconditionDetails {
    return new FailedPreconditionDetails().fromJsonString(jsonString, options);
  }

  static equals(a: FailedPreconditionDetails | PlainMessage<FailedPreconditionDetails> | undefined, b: FailedPreconditionDetails | PlainMessage<FailedPreconditionDetails> | undefined): boolean {
    return proto3.util.equals(FailedPreconditionDetails, a, b);
  }
}

/**
 * @generated from message nxpod.v1.PaymentSpendingLimitReachedError
 */
export class PaymentSpendingLimitReachedError extends Message<PaymentSpendingLimitReachedError> {
  constructor(data?: PartialMessage<PaymentSpendingLimitReachedError>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "nxpod.v1.PaymentSpendingLimitReachedError";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): PaymentSpendingLimitReachedError {
    return new PaymentSpendingLimitReachedError().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): PaymentSpendingLimitReachedError {
    return new PaymentSpendingLimitReachedError().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): PaymentSpendingLimitReachedError {
    return new PaymentSpendingLimitReachedError().fromJsonString(jsonString, options);
  }

  static equals(a: PaymentSpendingLimitReachedError | PlainMessage<PaymentSpendingLimitReachedError> | undefined, b: PaymentSpendingLimitReachedError | PlainMessage<PaymentSpendingLimitReachedError> | undefined): boolean {
    return proto3.util.equals(PaymentSpendingLimitReachedError, a, b);
  }
}

/**
 * @generated from message nxpod.v1.InvalidCostCenterError
 */
export class InvalidCostCenterError extends Message<InvalidCostCenterError> {
  /**
   * @generated from field: string attribution_id = 1;
   */
  attributionId = "";

  constructor(data?: PartialMessage<InvalidCostCenterError>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "nxpod.v1.InvalidCostCenterError";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "attribution_id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): InvalidCostCenterError {
    return new InvalidCostCenterError().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): InvalidCostCenterError {
    return new InvalidCostCenterError().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): InvalidCostCenterError {
    return new InvalidCostCenterError().fromJsonString(jsonString, options);
  }

  static equals(a: InvalidCostCenterError | PlainMessage<InvalidCostCenterError> | undefined, b: InvalidCostCenterError | PlainMessage<InvalidCostCenterError> | undefined): boolean {
    return proto3.util.equals(InvalidCostCenterError, a, b);
  }
}

/**
 * @generated from message nxpod.v1.TooManyRunningWorkspacesError
 */
export class TooManyRunningWorkspacesError extends Message<TooManyRunningWorkspacesError> {
  constructor(data?: PartialMessage<TooManyRunningWorkspacesError>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "nxpod.v1.TooManyRunningWorkspacesError";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): TooManyRunningWorkspacesError {
    return new TooManyRunningWorkspacesError().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): TooManyRunningWorkspacesError {
    return new TooManyRunningWorkspacesError().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): TooManyRunningWorkspacesError {
    return new TooManyRunningWorkspacesError().fromJsonString(jsonString, options);
  }

  static equals(a: TooManyRunningWorkspacesError | PlainMessage<TooManyRunningWorkspacesError> | undefined, b: TooManyRunningWorkspacesError | PlainMessage<TooManyRunningWorkspacesError> | undefined): boolean {
    return proto3.util.equals(TooManyRunningWorkspacesError, a, b);
  }
}

/**
 * @generated from message nxpod.v1.InvalidNxpodYMLError
 */
export class InvalidNxpodYMLError extends Message<InvalidNxpodYMLError> {
  /**
   * @generated from field: repeated string violations = 1;
   */
  violations: string[] = [];

  constructor(data?: PartialMessage<InvalidNxpodYMLError>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "nxpod.v1.InvalidNxpodYMLError";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "violations", kind: "scalar", T: 9 /* ScalarType.STRING */, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): InvalidNxpodYMLError {
    return new InvalidNxpodYMLError().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): InvalidNxpodYMLError {
    return new InvalidNxpodYMLError().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): InvalidNxpodYMLError {
    return new InvalidNxpodYMLError().fromJsonString(jsonString, options);
  }

  static equals(a: InvalidNxpodYMLError | PlainMessage<InvalidNxpodYMLError> | undefined, b: InvalidNxpodYMLError | PlainMessage<InvalidNxpodYMLError> | undefined): boolean {
    return proto3.util.equals(InvalidNxpodYMLError, a, b);
  }
}

/**
 * @generated from message nxpod.v1.RepositoryNotFoundError
 */
export class RepositoryNotFoundError extends Message<RepositoryNotFoundError> {
  /**
   * @generated from field: string host = 1;
   */
  host = "";

  /**
   * @generated from field: string owner = 2;
   */
  owner = "";

  /**
   * @generated from field: bool user_is_owner = 3;
   */
  userIsOwner = false;

  /**
   * @generated from field: repeated string user_scopes = 4;
   */
  userScopes: string[] = [];

  /**
   * @generated from field: string last_update = 5;
   */
  lastUpdate = "";

  /**
   * @generated from field: string repo_name = 6;
   */
  repoName = "";

  /**
   * @generated from field: string error_message = 7;
   */
  errorMessage = "";

  constructor(data?: PartialMessage<RepositoryNotFoundError>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "nxpod.v1.RepositoryNotFoundError";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "host", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "owner", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 3, name: "user_is_owner", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
    { no: 4, name: "user_scopes", kind: "scalar", T: 9 /* ScalarType.STRING */, repeated: true },
    { no: 5, name: "last_update", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 6, name: "repo_name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 7, name: "error_message", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): RepositoryNotFoundError {
    return new RepositoryNotFoundError().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): RepositoryNotFoundError {
    return new RepositoryNotFoundError().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): RepositoryNotFoundError {
    return new RepositoryNotFoundError().fromJsonString(jsonString, options);
  }

  static equals(a: RepositoryNotFoundError | PlainMessage<RepositoryNotFoundError> | undefined, b: RepositoryNotFoundError | PlainMessage<RepositoryNotFoundError> | undefined): boolean {
    return proto3.util.equals(RepositoryNotFoundError, a, b);
  }
}

/**
 * @generated from message nxpod.v1.RepositoryUnauthorizedError
 */
export class RepositoryUnauthorizedError extends Message<RepositoryUnauthorizedError> {
  /**
   * @generated from field: string host = 1;
   */
  host = "";

  /**
   * @generated from field: repeated string required_scopes = 2;
   */
  requiredScopes: string[] = [];

  /**
   * @generated from field: string provider_type = 3;
   */
  providerType = "";

  /**
   * @generated from field: string repo_name = 4;
   */
  repoName = "";

  /**
   * @generated from field: bool provider_is_connected = 5;
   */
  providerIsConnected = false;

  /**
   * @generated from field: bool is_missing_scopes = 6;
   */
  isMissingScopes = false;

  constructor(data?: PartialMessage<RepositoryUnauthorizedError>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "nxpod.v1.RepositoryUnauthorizedError";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "host", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "required_scopes", kind: "scalar", T: 9 /* ScalarType.STRING */, repeated: true },
    { no: 3, name: "provider_type", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 4, name: "repo_name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 5, name: "provider_is_connected", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
    { no: 6, name: "is_missing_scopes", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): RepositoryUnauthorizedError {
    return new RepositoryUnauthorizedError().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): RepositoryUnauthorizedError {
    return new RepositoryUnauthorizedError().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): RepositoryUnauthorizedError {
    return new RepositoryUnauthorizedError().fromJsonString(jsonString, options);
  }

  static equals(a: RepositoryUnauthorizedError | PlainMessage<RepositoryUnauthorizedError> | undefined, b: RepositoryUnauthorizedError | PlainMessage<RepositoryUnauthorizedError> | undefined): boolean {
    return proto3.util.equals(RepositoryUnauthorizedError, a, b);
  }
}

/**
 * @generated from message nxpod.v1.ImageBuildLogsNotYetAvailableError
 */
export class ImageBuildLogsNotYetAvailableError extends Message<ImageBuildLogsNotYetAvailableError> {
  constructor(data?: PartialMessage<ImageBuildLogsNotYetAvailableError>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "nxpod.v1.ImageBuildLogsNotYetAvailableError";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): ImageBuildLogsNotYetAvailableError {
    return new ImageBuildLogsNotYetAvailableError().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): ImageBuildLogsNotYetAvailableError {
    return new ImageBuildLogsNotYetAvailableError().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): ImageBuildLogsNotYetAvailableError {
    return new ImageBuildLogsNotYetAvailableError().fromJsonString(jsonString, options);
  }

  static equals(a: ImageBuildLogsNotYetAvailableError | PlainMessage<ImageBuildLogsNotYetAvailableError> | undefined, b: ImageBuildLogsNotYetAvailableError | PlainMessage<ImageBuildLogsNotYetAvailableError> | undefined): boolean {
    return proto3.util.equals(ImageBuildLogsNotYetAvailableError, a, b);
  }
}

/**
 * @generated from message nxpod.v1.CellDisabledError
 */
export class CellDisabledError extends Message<CellDisabledError> {
  constructor(data?: PartialMessage<CellDisabledError>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "nxpod.v1.CellDisabledError";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): CellDisabledError {
    return new CellDisabledError().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): CellDisabledError {
    return new CellDisabledError().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): CellDisabledError {
    return new CellDisabledError().fromJsonString(jsonString, options);
  }

  static equals(a: CellDisabledError | PlainMessage<CellDisabledError> | undefined, b: CellDisabledError | PlainMessage<CellDisabledError> | undefined): boolean {
    return proto3.util.equals(CellDisabledError, a, b);
  }
}
