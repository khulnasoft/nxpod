/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

// package: wsbs
// file: workspace.proto

/* tslint:disable */

import * as jspb from "google-protobuf";
import * as content_service_api_initializer_pb from "@nxpod/content-service/lib";

export class BackupCanaryRequest extends jspb.Message { 

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BackupCanaryRequest.AsObject;
    static toObject(includeInstance: boolean, msg: BackupCanaryRequest): BackupCanaryRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BackupCanaryRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BackupCanaryRequest;
    static deserializeBinaryFromReader(message: BackupCanaryRequest, reader: jspb.BinaryReader): BackupCanaryRequest;
}

export namespace BackupCanaryRequest {
    export type AsObject = {
    }
}

export class BackupCanaryResponse extends jspb.Message { 
    getSuccess(): boolean;
    setSuccess(value: boolean): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BackupCanaryResponse.AsObject;
    static toObject(includeInstance: boolean, msg: BackupCanaryResponse): BackupCanaryResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BackupCanaryResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BackupCanaryResponse;
    static deserializeBinaryFromReader(message: BackupCanaryResponse, reader: jspb.BinaryReader): BackupCanaryResponse;
}

export namespace BackupCanaryResponse {
    export type AsObject = {
        success: boolean,
    }
}

export class PauseTheiaRequest extends jspb.Message { 

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PauseTheiaRequest.AsObject;
    static toObject(includeInstance: boolean, msg: PauseTheiaRequest): PauseTheiaRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PauseTheiaRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PauseTheiaRequest;
    static deserializeBinaryFromReader(message: PauseTheiaRequest, reader: jspb.BinaryReader): PauseTheiaRequest;
}

export namespace PauseTheiaRequest {
    export type AsObject = {
    }
}

export class PauseTheiaResponse extends jspb.Message { 

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PauseTheiaResponse.AsObject;
    static toObject(includeInstance: boolean, msg: PauseTheiaResponse): PauseTheiaResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PauseTheiaResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PauseTheiaResponse;
    static deserializeBinaryFromReader(message: PauseTheiaResponse, reader: jspb.BinaryReader): PauseTheiaResponse;
}

export namespace PauseTheiaResponse {
    export type AsObject = {
    }
}

export class GitStatusRequest extends jspb.Message { 

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GitStatusRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GitStatusRequest): GitStatusRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GitStatusRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GitStatusRequest;
    static deserializeBinaryFromReader(message: GitStatusRequest, reader: jspb.BinaryReader): GitStatusRequest;
}

export namespace GitStatusRequest {
    export type AsObject = {
    }
}

export class GitStatusResponse extends jspb.Message { 

    hasRepo(): boolean;
    clearRepo(): void;
    getRepo(): content_service_api_initializer_pb.GitStatus | undefined;
    setRepo(value?: content_service_api_initializer_pb.GitStatus): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GitStatusResponse.AsObject;
    static toObject(includeInstance: boolean, msg: GitStatusResponse): GitStatusResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GitStatusResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GitStatusResponse;
    static deserializeBinaryFromReader(message: GitStatusResponse, reader: jspb.BinaryReader): GitStatusResponse;
}

export namespace GitStatusResponse {
    export type AsObject = {
        repo?: content_service_api_initializer_pb.GitStatus.AsObject,
    }
}
