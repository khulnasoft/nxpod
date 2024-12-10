/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { NxpodServerImpl } from "./workspace/nxpod-server-impl";
import { NxpodServerPath, User, NxpodClient, Disposable, NxpodServer } from "@nxpod/nxpod-protocol";
import { JsonRpcConnectionHandler, JsonRpcProxy } from "@nxpod/nxpod-protocol/lib/messaging/proxy-factory";
import { ConnectionHandler } from "@nxpod/nxpod-protocol/lib/messaging/handler";
import { MessageConnection } from "vscode-jsonrpc";
import { EventEmitter } from "events";
import * as express from "express";

export type NxpodServiceFactory<C extends NxpodClient, S extends NxpodServer> = () => NxpodServerImpl<C, S>;

const EVENT_CONNECTION_CREATED = "EVENT_CONNECTION_CREATED";
const EVENT_CONNECTION_CLOSED = "EVENT_CONNECTION_CLOSED";

/**
 * Establishes and manages JsonRpc-over-websocket connections from frontends to NxpodServerImpl instances
 */
export class WebsocketConnectionManager<C extends NxpodClient, S extends NxpodServer> implements ConnectionHandler {
    public readonly path = NxpodServerPath;

    protected readonly jsonRpcConnectionHandler: JsonRpcConnectionHandler<C>;
    protected readonly events = new EventEmitter();
    protected readonly servers: NxpodServerImpl<C, S>[] = [];

    constructor(protected readonly serverFactory: NxpodServiceFactory<C, S>) {
        this.jsonRpcConnectionHandler = new JsonRpcConnectionHandler<C>(this.path, this.createProxyTarget.bind(this));
    }

    public onConnection(connection: MessageConnection, session?: object) {
        this.jsonRpcConnectionHandler.onConnection(connection, session);
    }

    protected createProxyTarget(client: JsonRpcProxy<C>, request?: object): NxpodServerImpl<C, S> {
        const expressReq = request as express.Request;
        const session = expressReq.session;

        const nxpodServer = this.serverFactory();
        const clientRegion = (expressReq as any).headers["x-glb-client-region"];
        nxpodServer.initialize(client, clientRegion, expressReq.user as User);
        client.onDidCloseConnection(() => {
            nxpodServer.dispose();

            this.removeServer(nxpodServer);
            this.events.emit(EVENT_CONNECTION_CLOSED, nxpodServer);
        });
        this.servers.push(nxpodServer);

        this.events.emit(EVENT_CONNECTION_CREATED, nxpodServer);

        return new Proxy<NxpodServerImpl<C, S>>(nxpodServer, {
            get: (target, property: keyof NxpodServerImpl<C, S>) => {
                const result = target[property];
                if (session) session.touch(console.error);
                return result;
            }
        });
    }

    public get currentConnectionCount(): number {
        return this.servers.length;
    }

    public onConnectionCreated(l: (server: NxpodServerImpl<C, S>) => void): Disposable {
        this.events.on(EVENT_CONNECTION_CREATED, l)
        return {
            dispose: () => this.events.off(EVENT_CONNECTION_CREATED, l)
        }
    }

    public onConnectionClosed(l: (server: NxpodServerImpl<C, S>) => void): Disposable {
        this.events.on(EVENT_CONNECTION_CLOSED, l)
        return {
            dispose: () => this.events.off(EVENT_CONNECTION_CLOSED, l)
        }
    }

    protected removeServer(oddServer: NxpodServerImpl<C, S>) {
        const index = this.servers.findIndex(s => s.uuid === oddServer.uuid);
        if (index !== -1) {
            this.servers.splice(index);
        }
    }
}