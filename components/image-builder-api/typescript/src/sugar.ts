/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { ImageBuilderClient } from "./imgbuilder_grpc_pb";
import { TraceContext } from '@nxpod/nxpod-protocol/lib/util/tracing';
import { Deferred } from "@nxpod/nxpod-protocol/lib/util/deferred";
import { log } from "@nxpod/nxpod-protocol/lib/util/logging";
import * as opentracing from 'opentracing';
import { Metadata } from "grpc";
import { BuildRequest, BuildResponse, BuildStatus, LogsRequest, LogsResponse, ResolveWorkspaceImageResponse, ResolveWorkspaceImageRequest, ResolveBaseImageRequest, ResolveBaseImageResponse } from "./imgbuilder_pb";
import { injectable, inject } from 'inversify';
import * as grpc from "grpc";
import { TextDecoder } from "util";

export const ImageBuilderClientProvider = Symbol("ImageBuilderClientProvider");

// ImageBuilderClientProvider caches image builder connections
export interface ImageBuilderClientProvider {
    getDefault(): PromisifiedImageBuilderClient
}

function withTracing(ctx: TraceContext) {
    const metadata = new Metadata();
    if (ctx.span) {
        const carrier: { [key: string]: string } = {};
        opentracing.globalTracer().inject(ctx.span, opentracing.FORMAT_HTTP_HEADERS, carrier);
        Object.keys(carrier).filter(p => carrier.hasOwnProperty(p)).forEach(p => metadata.set(p, carrier[p]));
    }
    return metadata;
}

export const ImageBuilderClientConfig = Symbol("ImageBuilderClientConfig");

// ImageBuilderClientConfig configures the access to an image builder
export interface ImageBuilderClientConfig {
    address: string;
}

@injectable()
export class CachingImageBuilderClientProvider implements ImageBuilderClientProvider {
    @inject(ImageBuilderClientConfig) protected readonly clientConfig: ImageBuilderClientConfig;

    // gRPC connections maintain their connectivity themselves, i.e. they reconnect when neccesary.
    // They can also be used concurrently, even across services.
    // Thus it makes sense to cache them rather than create a new connection for each request.
    protected connectionCache: PromisifiedImageBuilderClient | undefined;

    getDefault() {
        if (!this.connectionCache || !this.connectionCache.isConnectionAlive()) {
            this.connectionCache = new PromisifiedImageBuilderClient(new ImageBuilderClient(this.clientConfig.address, grpc.credentials.createInsecure()));
        }
        return this.connectionCache!;
    }

}

// StagedBuildResponse captures the multi-stage nature (starting, running, done) of image builds.
export interface StagedBuildResponse {
    buildPromise: Promise<BuildResponse>;

    actuallyNeedsBuild: boolean;
    ref: string;
    baseRef: string;
}

export class PromisifiedImageBuilderClient {

    constructor(public readonly client: ImageBuilderClient) {}

    public isConnectionAlive() {
        const cs = this.client.getChannel().getConnectivityState(false);
            return cs == grpc.connectivityState.CONNECTING || cs == grpc.connectivityState.IDLE || cs == grpc.connectivityState.READY;
    }

    public resolveBaseImage(ctx: TraceContext, request: ResolveBaseImageRequest): Promise<ResolveBaseImageResponse> {
        return new Promise<ResolveBaseImageResponse>((resolve, reject) => {
            const span = TraceContext.startSpan(`/image-builder/resolveBaseImage`, ctx);
            this.client.resolveBaseImage(request, withTracing({span}), (err, resp) => {
                if (err) {
                    TraceContext.logError({ span }, err);
                    reject(err);
                } else {
                    resolve(resp);
                }
                span.finish();
            });
        });
    }

    public resolveWorkspaceImage(ctx: TraceContext, request: ResolveWorkspaceImageRequest): Promise<ResolveWorkspaceImageResponse> {
        return new Promise<ResolveWorkspaceImageResponse>((resolve, reject) => {
            const span = TraceContext.startSpan(`/image-builder/resolveWorkspaceImage`, ctx);
            this.client.resolveWorkspaceImage(request, withTracing({span}), (err, resp) => {
                span.finish();
                if (err) {
                    TraceContext.logError({ span }, err);
                    reject(err);
                } else {
                    resolve(resp);
                }
            });
        });
    }

    // build returns a nested promise. The outer one resolves/rejects with the build start,
    // the inner one resolves/rejects when the build is done.
    public build(ctx: TraceContext, request: BuildRequest): Promise<StagedBuildResponse> {
        const span = TraceContext.startSpan(`/image-builder/build`, ctx);

        const buildResult = new Deferred<BuildResponse>();

        const result = new Deferred<StagedBuildResponse>();
        const resultResp: StagedBuildResponse = {
            buildPromise: buildResult.promise,
            actuallyNeedsBuild: true,
            ref: "unknown",
            baseRef: "unknown",
        }

        try {
            const stream = this.client.build(request, withTracing({span}));
            stream.on('error', err => {
                log.debug("stream err", err)

                if (!result.isResolved) {
                    result.reject(err);
                } else {
                    buildResult.reject(err);
                }

                TraceContext.logError({ span }, err);
                span.finish();
            });
            stream.on('data', (resp: BuildResponse) => {
                log.debug("stream resp", resp)

                if (resp.getStatus() == BuildStatus.RUNNING) {
                    resultResp.actuallyNeedsBuild = true;
                    resultResp.ref = resp.getRef();
                    resultResp.baseRef = resp.getBaseRef();
                    result.resolve(resultResp);
                } else if (resp.getStatus() == BuildStatus.DONE_FAILURE || resp.getStatus() == BuildStatus.DONE_SUCCESS) {
                    if (!result.isResolved) {
                        resultResp.actuallyNeedsBuild = false;
                        resultResp.ref = resp.getRef();
                        resultResp.baseRef = resp.getBaseRef();
                        result.resolve(resultResp);
                        buildResult.resolve(resp);
                    } else {
                        buildResult.resolve(resp);
                    }

                    span.finish();
                }
            });
            stream.on('end', () => {
                log.debug("stream end")

                const err = new Error("stream ended before the build did");
                let spanFinished = (result.isResolved && !resultResp.actuallyNeedsBuild) || buildResult.isResolved;
                if (!result.isResolved) {
                    result.reject(err);
                } else if (!buildResult.isResolved) {
                    buildResult.reject(err);
                }

                if (!spanFinished) {
                    TraceContext.logError({span}, err);
                    span.finish();
                }
            });
        } catch (err) {
            TraceContext.logError({span}, err);
            span.finish();

            log.error("failed to start image build", request);
            result.reject(err);
        }

        return result.promise;
    }

    // logs subscribes to build logs. This function returns when there are no more logs to provide
    public logs(ctx: TraceContext, request: LogsRequest, cb: (data: string)=>void): Promise<void> {
        const span = TraceContext.startSpan(`/image-builder/logs`, ctx);

        const stream = this.client.logs(request, withTracing({span}));
        return new Promise<void>((resolve, reject) => {
            stream.on('end', () => resolve())
            stream.on('error', err => reject(err));
            stream.on('data', (resp: LogsResponse) => {
                cb(new TextDecoder("utf-8").decode(resp.getContent_asU8()));
            });
        })
    }

}
