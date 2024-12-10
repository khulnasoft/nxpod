/**
 * Copyright (c) 2024 Nxpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License.AGPL.txt in the project root for license information.
 */

// @generated by protoc-gen-es v1.3.3 with parameter "target=ts"
// @generated from file nxpod/experimental/v1/dummy.proto (package nxpod.experimental.v1, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";

/**
 * @generated from message nxpod.experimental.v1.SayHelloRequest
 */
export class SayHelloRequest extends Message<SayHelloRequest> {
  constructor(data?: PartialMessage<SayHelloRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "nxpod.experimental.v1.SayHelloRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): SayHelloRequest {
    return new SayHelloRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): SayHelloRequest {
    return new SayHelloRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): SayHelloRequest {
    return new SayHelloRequest().fromJsonString(jsonString, options);
  }

  static equals(a: SayHelloRequest | PlainMessage<SayHelloRequest> | undefined, b: SayHelloRequest | PlainMessage<SayHelloRequest> | undefined): boolean {
    return proto3.util.equals(SayHelloRequest, a, b);
  }
}

/**
 * @generated from message nxpod.experimental.v1.SayHelloResponse
 */
export class SayHelloResponse extends Message<SayHelloResponse> {
  /**
   * @generated from field: string reply = 1;
   */
  reply = "";

  constructor(data?: PartialMessage<SayHelloResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "nxpod.experimental.v1.SayHelloResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "reply", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): SayHelloResponse {
    return new SayHelloResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): SayHelloResponse {
    return new SayHelloResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): SayHelloResponse {
    return new SayHelloResponse().fromJsonString(jsonString, options);
  }

  static equals(a: SayHelloResponse | PlainMessage<SayHelloResponse> | undefined, b: SayHelloResponse | PlainMessage<SayHelloResponse> | undefined): boolean {
    return proto3.util.equals(SayHelloResponse, a, b);
  }
}

/**
 * @generated from message nxpod.experimental.v1.LotsOfRepliesRequest
 */
export class LotsOfRepliesRequest extends Message<LotsOfRepliesRequest> {
  /**
   * @generated from field: int32 previous_count = 1;
   */
  previousCount = 0;

  constructor(data?: PartialMessage<LotsOfRepliesRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "nxpod.experimental.v1.LotsOfRepliesRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "previous_count", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): LotsOfRepliesRequest {
    return new LotsOfRepliesRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): LotsOfRepliesRequest {
    return new LotsOfRepliesRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): LotsOfRepliesRequest {
    return new LotsOfRepliesRequest().fromJsonString(jsonString, options);
  }

  static equals(a: LotsOfRepliesRequest | PlainMessage<LotsOfRepliesRequest> | undefined, b: LotsOfRepliesRequest | PlainMessage<LotsOfRepliesRequest> | undefined): boolean {
    return proto3.util.equals(LotsOfRepliesRequest, a, b);
  }
}

/**
 * @generated from message nxpod.experimental.v1.LotsOfRepliesResponse
 */
export class LotsOfRepliesResponse extends Message<LotsOfRepliesResponse> {
  /**
   * @generated from field: string reply = 1;
   */
  reply = "";

  /**
   * @generated from field: int32 count = 2;
   */
  count = 0;

  constructor(data?: PartialMessage<LotsOfRepliesResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "nxpod.experimental.v1.LotsOfRepliesResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "reply", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "count", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): LotsOfRepliesResponse {
    return new LotsOfRepliesResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): LotsOfRepliesResponse {
    return new LotsOfRepliesResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): LotsOfRepliesResponse {
    return new LotsOfRepliesResponse().fromJsonString(jsonString, options);
  }

  static equals(a: LotsOfRepliesResponse | PlainMessage<LotsOfRepliesResponse> | undefined, b: LotsOfRepliesResponse | PlainMessage<LotsOfRepliesResponse> | undefined): boolean {
    return proto3.util.equals(LotsOfRepliesResponse, a, b);
  }
}
