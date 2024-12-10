/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { User, WorkspaceInfo, WorkspaceCreationResult, UserMessage, WorkspaceInstanceUser,
    WhitelistedRepository, WorkspaceImageBuild, AuthProviderInfo, Branding, CreateWorkspaceMode,
    Token, UserEnvVarValue, ResolvePluginsParams, PreparePluginUploadParams,
    ResolvedPlugins, Configuration, InstallPluginsParams, UninstallPluginParams, UserInfo, NxpodTokenType, NxpodToken, AuthProviderEntry } from './protocol';
import { JsonRpcProxy, JsonRpcServer } from './messaging/proxy-factory';
import { injectable, inject } from 'inversify';
import { Disposable } from 'vscode-jsonrpc';
import { HeadlessLogEvent } from './headless-workspace-log';
import { WorkspaceInstance, WorkspaceInstancePort } from './workspace-instance';
import { AdminServer } from './admin-protocol';
import { NxpodHostUrl } from './util/nxpod-host-url';
import { WebSocketConnectionProvider } from './messaging/browser/connection';
import { PermissionName } from './permission';
import { LicenseService } from './license-protocol';

export interface NxpodClient {
    onInstanceUpdate(instance: WorkspaceInstance): void;
    onWorkspaceImageBuildLogs: WorkspaceImageBuild.LogCallback;
    onHeadlessWorkspaceLogs(evt: HeadlessLogEvent): void;
}

export const NxpodServer = Symbol('NxpodServer');
export interface NxpodServer extends JsonRpcServer<NxpodClient>, AdminServer, LicenseService {
    // User related API
    getLoggedInUser(): Promise<User>;
    updateLoggedInUser(user: Partial<User>): Promise<User>;
    getAuthProviders(): Promise<AuthProviderInfo[]>;
    getOwnAuthProviders(): Promise<AuthProviderEntry[]>;
    updateOwnAuthProvider(params: NxpodServer.UpdateOwnAuthProviderParams): Promise<void>;
    deleteOwnAuthProvider(params: NxpodServer.DeleteOwnAuthProviderParams): Promise<void>;
    getBranding(): Promise<Branding>;
    getConfiguration(): Promise<Configuration>;
    getToken(query: NxpodServer.GetTokenSearchOptions): Promise<Token | undefined>;
    getPortAuthenticationToken(workspaceId: string): Promise<Token>;
    deleteAccount(): Promise<void>;
    getClientRegion(): Promise<string | undefined>;
    hasPermission(permission: PermissionName): Promise<boolean>;

    // Query/retrieve workspaces
    getWorkspaces(options: NxpodServer.GetWorkspacesOptions): Promise<WorkspaceInfo[]>;
    getWorkspaceOwner(workspaceId: string): Promise<UserInfo | undefined>;
    getWorkspaceUsers(workspaceId: string): Promise<WorkspaceInstanceUser[]>;
    getFeaturedRepositories(): Promise<WhitelistedRepository[]>;
    getWorkspace(id: string): Promise<WorkspaceInfo>;
    isWorkspaceOwner(workspaceId: string): Promise<boolean>;

    /**
     * Creates and starts a workspace for the given context URL.
     * @param options NxpodServer.CreateWorkspaceOptions
     * @return WorkspaceCreationResult
     */
    createWorkspace(options: NxpodServer.CreateWorkspaceOptions): Promise<WorkspaceCreationResult>;
    startWorkspace(id: string): Promise<StartWorkspaceResult>;
    stopWorkspace(id: string): Promise<void>;
    deleteWorkspace(id: string): Promise<void>;
    setWorkspaceDescription(id: string, desc: string): Promise<void>;
    controlAdmission(id: string, level: "owner" | "everyone"): Promise<void>;

    updateWorkspaceUserPin(id: string, action: "pin" | "unpin" | "toggle"): Promise<void>;
    sendHeartBeat(options: NxpodServer.SendHeartBeatOptions): Promise<void>;
    watchWorkspaceImageBuildLogs(workspaceId: string): Promise<void>;
    watchHeadlessWorkspaceLogs(workspaceId: string): Promise<void>;
    isPrebuildAvailable(pwsid: string): Promise<boolean>;
    
    // Workspace timeout
    setWorkspaceTimeout(workspaceId: string, duration: WorkspaceTimeoutDuration): Promise<SetWorkspaceTimeoutResult>;
    getWorkspaceTimeout(workspaceId: string): Promise<GetWorkspaceTimeoutResult>;
    sendHeartBeat(options: NxpodServer.SendHeartBeatOptions): Promise<void>;

    updateWorkspaceUserPin(id: string, action: "pin" | "unpin" | "toggle"): Promise<void>;

    // Port management
    getOpenPorts(workspaceId: string): Promise<WorkspaceInstancePort[]>;
    openPort(workspaceId: string, port: WorkspaceInstancePort): Promise<WorkspaceInstancePort | undefined>;
    closePort(workspaceId: string, port: number): Promise<void>;

    // User messages
    getUserMessages(options: NxpodServer.GetUserMessagesOptions): Promise<UserMessage[]>;
    updateUserMessages(options: NxpodServer.UpdateUserMessagesOptions): Promise<void>;

    // User storage
    getUserStorageResource(options: NxpodServer.GetUserStorageResourceOptions): Promise<string>;
    updateUserStorageResource(options: NxpodServer.UpdateUserStorageResourceOptions): Promise<void>;

    // user env vars
    getEnvVars(): Promise<UserEnvVarValue[]>;
    setEnvVar(variable: UserEnvVarValue): Promise<void>;
    deleteEnvVar(variable: UserEnvVarValue): Promise<void>;

    // Nxpod token
    getNxpodTokens(): Promise<NxpodToken[]>;
    generateNewNxpodToken(options: { name?: string, type: NxpodTokenType, scopes?: [] }): Promise<string>;
    deleteNxpodToken(tokenHash: string): Promise<void>;

    // misc
    sendFeedback(feedback: string): Promise<string | undefined>;
    registerGithubApp(installationId: string): Promise<void>;

    /**
     * Stores a new snapshot for the given workspace and bucketId
     * @return the snapshot id
     */
    takeSnapshot(options: NxpodServer.TakeSnapshotOptions): Promise<string>;

    /**
     * Returns the list of snapshots that exist for a workspace.
     */
    getSnapshots(workspaceID: string): Promise<string[]>;

    /**
     * stores/updates layout information for the given workspace
     */
    storeLayout(workspaceId: string, layoutData: string): Promise<void>;

    /**
     * retrieves layout information for the given workspace
     */
    getLayout(workspaceId: string): Promise<string | undefined>;

    /**
     * @param params
     * @returns promise resolves to an URL to be used for the upload
     */
    preparePluginUpload(params: PreparePluginUploadParams): Promise<string>
    resolvePlugins(workspaceId: string, params: ResolvePluginsParams): Promise<ResolvedPlugins>;
    installUserPlugins(params: InstallPluginsParams): Promise<boolean>;
    uninstallUserPlugin(params: UninstallPluginParams): Promise<boolean>;
}

export const WorkspaceTimeoutValues = ["30m", "60m", "180m"] as const;

export const createServiceMock = function<C extends NxpodClient, S extends NxpodServer>(methods: Partial<JsonRpcProxy<S>>): NxpodServiceImpl<C, S> {
    return new NxpodServiceImpl<C, S>(createServerMock(methods));
}

export const createServerMock = function<C extends NxpodClient, S extends NxpodServer>(methods: Partial<JsonRpcProxy<S>>): JsonRpcProxy<S> {
    methods.setClient = methods.setClient || (() => {});
    methods.dispose = methods.dispose || (() => {});
    return new Proxy<JsonRpcProxy<S>>(methods as any as JsonRpcProxy<S>, {
        get: (target: S, property: keyof S) => {
            const result = target[property];
            if (!result) {
                throw new Error(`Method ${property} not implemented`);
            }
            return result;
        }
    });
}

type WorkspaceTimeoutDurationTuple = typeof WorkspaceTimeoutValues;
export type WorkspaceTimeoutDuration = WorkspaceTimeoutDurationTuple[number];

export interface SetWorkspaceTimeoutResult {
    resetTimeoutOnWorkspaces: string[]
}

export interface GetWorkspaceTimeoutResult {
    duration: WorkspaceTimeoutDuration
    canChange: boolean
}

export interface StartWorkspaceResult {
    instanceID: string
    workspaceURL?: string
}

export namespace NxpodServer {
    export interface GetWorkspacesOptions {
        limit?: number;
        searchString?: string;
        pinnedOnly?: boolean;
    }
    export interface GetAccountStatementOptions {
        date?: string;
    }
    export interface CreateWorkspaceOptions {
        contextUrl: string;
        mode?: CreateWorkspaceMode;
    }
    export interface TakeSnapshotOptions {
        workspaceId: string;
        layoutData?: string;
    }
    export interface GetUserMessagesOptions {
        readonly releaseNotes?: boolean;
        readonly workspaceInstanceId: string;
    }
    export interface UpdateUserMessagesOptions {
        readonly messageIds: string[];
    }
    export interface GetUserStorageResourceOptions {
        readonly uri: string;
    }
    export interface UpdateUserStorageResourceOptions {
        readonly uri: string;
        readonly content: string;
    }
    export interface GetTokenSearchOptions {
        readonly host: string;
    }
    export interface SendHeartBeatOptions {
        readonly instanceId: string;
        readonly wasClosed?: boolean;
        readonly roundTripTime?: number;
    }
    export interface UpdateOwnAuthProviderParams {
        readonly entry: AuthProviderEntry.UpdateEntry | AuthProviderEntry.NewEntry
    }
    export interface DeleteOwnAuthProviderParams {
        readonly id: string
    }
}

export const NxpodServerPath = '/nxpod';

export const NxpodServerProxy = Symbol('NxpodServerProxy');
export type NxpodServerProxy<S extends NxpodServer> = JsonRpcProxy<S>;

export class NxpodCompositeClient<Client extends NxpodClient> implements NxpodClient {

    protected clients: Partial<Client>[] = [];

    public registerClient(client: Partial<Client>): Disposable {
        this.clients.push(client);
        const index = this.clients.length;
        return {
            dispose: () => {
                this.clients.slice(index, 1);
            }
        }
    }

    onInstanceUpdate(instance: WorkspaceInstance): void {
        for (const client of this.clients) {
            if (client.onInstanceUpdate) {
                try {
                    client.onInstanceUpdate(instance);
                } catch (error) {
                    console.error(error)
                }
            }
        }
    }

    onWorkspaceImageBuildLogs(info: WorkspaceImageBuild.StateInfo, content: WorkspaceImageBuild.LogContent | undefined): void {
        for (const client of this.clients) {
            if (client.onWorkspaceImageBuildLogs) {
                try {
                    client.onWorkspaceImageBuildLogs(info, content);
                } catch (error) {
                    console.error(error)
                }
            }
        }
    }

    onHeadlessWorkspaceLogs(evt: HeadlessLogEvent): void {
        for (const client of this.clients) {
            if (client.onHeadlessWorkspaceLogs) {
                try {
                    client.onHeadlessWorkspaceLogs(evt);
                } catch (error) {
                    console.error(error)
                }
            }
        }
    }
}

export const NxpodService = Symbol('NxpodService');
export type NxpodService = NxpodServiceImpl<NxpodClient, NxpodServer>

@injectable()
export class NxpodServiceImpl<Client extends NxpodClient, Server extends NxpodServer> {

    protected compositeClient = new NxpodCompositeClient<Client>();

    constructor(@inject(NxpodServer) public readonly server: JsonRpcProxy<Server>) {
        server.setClient(this.compositeClient);
    }

    public registerClient(client: Partial<Client>): Disposable {
        return this.compositeClient.registerClient(client);
    }
}

export function createNxpodService<C extends NxpodClient, S extends NxpodServer>(serverUrl: string) {
    const url = new NxpodHostUrl(serverUrl)
        .asWebsocket()
        .withApi({ pathname: NxpodServerPath });
    const connectionProvider = new WebSocketConnectionProvider();
    const nxpodServer = connectionProvider.createProxy<S>(url.toString());
    return new NxpodServiceImpl<C, S>(nxpodServer);
}