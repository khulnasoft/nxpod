/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { injectable, inject, postConstruct } from 'inversify';
import { TheiaCLIService, GetGitTokenRequest, GetGitTokenResponse, OpenFileRequest, OpenFileResponse, OpenPreviewRequest, OpenPreviewResponse, GetEnvvarsRequest, GetEnvvarsResponse, EnvironmentVariable, SetEnvvarRequest, SetEnvvarResponse, DeleteEnvvarRequest, DeleteEnvvarResponse, IsFileOpenRequest, IsFileOpenResponse, GetPortURLRequest, GetPortURLResponse } from '../common/cli-service';
import { NxpodServiceProvider } from './nxpod-service-provider';
import { OpenerService, ApplicationShell, Widget, WidgetOpenerOptions } from '@theia/core/lib/browser';
import URI from '@theia/core/lib/common/uri';
import { NxpodInfoService, NxpodInfo } from '../common/nxpod-info';
import { UserEnvVar, CommitContext, NxpodServer, UserEnvVarValue } from '@nxpod/nxpod-protocol';
import { Deferred } from "@theia/core/lib/common/promise-util";
import { MiniBrowserOpenHandler } from '@theia/mini-browser/lib/browser/mini-browser-open-handler';
import { FrontendApplicationStateService } from '@theia/core/lib/browser/frontend-application-state';
import { NxpodGitTokenProvider } from './nxpod-git-token-provider';
import { EditorManager, EditorWidget } from '@theia/editor/lib/browser';

export const CliServiceClient = Symbol('CliServiceClient');
export interface CliServiceClient extends TheiaCLIService {
    getGitToken(p: GetGitTokenRequest): Promise<GetGitTokenResponse>;
}

@injectable()
export class CliServiceClientImpl implements CliServiceClient {

    @inject(NxpodInfoService) protected infoProvider: NxpodInfoService;
    @inject(NxpodServiceProvider) protected serviceProvider: NxpodServiceProvider;
    @inject(OpenerService) protected readonly openerService: OpenerService;
    @inject(ApplicationShell) protected readonly shell: ApplicationShell;
    @inject(MiniBrowserOpenHandler) protected miniBrowserOpenHandler: MiniBrowserOpenHandler;
    @inject(FrontendApplicationStateService) protected applicationStateService: FrontendApplicationStateService;
    @inject(NxpodGitTokenProvider) protected gitTokenProvider: NxpodGitTokenProvider;
    @inject(EditorManager) protected readonly editorManager: EditorManager;


    protected isWorkspaceOwner = new Deferred<boolean>();
    protected nxpodInfo: NxpodInfo;

    @postConstruct()
    protected async init() {
        this.nxpodInfo = await this.infoProvider.getInfo();
        const service = await this.serviceProvider.getService();
        this.isWorkspaceOwner.resolve(await service.server.isWorkspaceOwner(this.nxpodInfo.workspaceId));
    }

    protected async checkWorkspaceOwner() {
        if (!(await this.isWorkspaceOwner.promise)) {
            throw new Error(`Only the workspace owner can handle this request.`);
        }
    }

    async getGitToken(p: GetGitTokenRequest): Promise<GetGitTokenResponse> {
        await this.checkWorkspaceOwner();
        return this.gitTokenProvider.getGitToken(p);
    }

    async openFile(params: OpenFileRequest): Promise<OpenFileResponse> {
        // make sure the application is fully initialized (e.g. README files have been opened)
        await this.applicationStateService.reachedState("ready");

        const path = params.path;
        const uri = new URI(`file://${path}`);
        const opener = await this.openerService.getOpener(uri);
        const widget = await opener.open(uri, <WidgetOpenerOptions>{ mode: 'reveal' });
        if (widget instanceof Widget) {
            this.shell.activateWidget(widget.id);
        }

        return {};
    }

    async openPreview(params: OpenPreviewRequest): Promise<OpenPreviewResponse> {
        await this.miniBrowserOpenHandler.openPreview(params.url);
        return {};
    }

    async getEnvVars(params: GetEnvvarsRequest): Promise<GetEnvvarsResponse> {
        const service = await this.serviceProvider.getService();
        const applicableVars = await this.getApplicableEnvvars(service.server);

        return {
            variables: applicableVars.map(v => <EnvironmentVariable>{
                name: v.name,
                value: v.value,
            })
        }
    }

    async setEnvVar(params: SetEnvvarRequest): Promise<SetEnvvarResponse> {
        const service = await this.serviceProvider.getService();

        const matchedVariables = await this.matchWithApplicableVars(params.variables, service.server);
        await Promise.all(matchedVariables.map(v => service.server.setEnvVar(v)));

        return {};
    }

    async deleteEnvVar(params: DeleteEnvvarRequest): Promise<DeleteEnvvarResponse> {
        const service = await this.serviceProvider.getService();

        const vars = params.variables.map(v => { return { name: v, value: "" } });
        const matchedVariables = await this.matchWithApplicableVars(vars, service.server);
        const candidates = matchedVariables.filter(v => !!v.id);
        await Promise.all(candidates.map(v => service.server.deleteEnvVar(v)));

        return {
            deleted: candidates.map(v => v.name),
            notDeleted: matchedVariables.filter(v => !v.id).map(v => v.name)
        };
    }

    async isFileOpen(params: IsFileOpenRequest): Promise<IsFileOpenResponse> {
        const isOpen = !!this.editorManager.all.find((w: EditorWidget) => w.editor.uri.path.toString() === `${params.path}`);
        return { isOpen };
    }

    protected async matchWithApplicableVars(variables: EnvironmentVariable[], service: NxpodServer): Promise<UserEnvVarValue[]> {
        const repinfo = await this.getRepo(service);
        if (!repinfo) {
            throw new Error("cannot get repo information");
        }

        const { owner, repo } = repinfo;
        const repositoryPattern = `${owner.toLocaleLowerCase()}/${repo.toLocaleLowerCase()}`;

        const applicableVars = await this.getApplicableEnvvars(service);
        return variables.map(v => {
            return {
                name: v.name,
                value: v.value,
                repositoryPattern
            }
        }).map(v => {
            const existingVar = applicableVars.find(av => av.name == v.name && av.repositoryPattern == v.repositoryPattern);
            const id = !!existingVar ? existingVar.id : undefined;
            return {
                ...v,
                id
            }
        });
    }

    protected async getApplicableEnvvars(service: NxpodServer): Promise<UserEnvVarValue[]> {
        const ws = await service.getWorkspace(this.nxpodInfo.workspaceId);

        const context = ws.workspace.context;
        if (!("repository" in context)) {
            return [];
        }
        const repository = (context as CommitContext).repository;

        const owner = repository.owner;
        const repo = repository.name;

        const vars = await service.getEnvVars();
        return UserEnvVar.filter(vars, owner, repo);

    }

    protected async getRepo(service: NxpodServer): Promise<{ owner: string, repo: string } | undefined> {
        const ws = await service.getWorkspace(this.nxpodInfo.workspaceId);

        const context = ws.workspace.context;
        if (!CommitContext.is(context)) {
            return;
        }

        const owner = context.repository.owner;
        const repo = context.repository.name;
        return { owner, repo };
    }

    async getPortURL(params: GetPortURLRequest): Promise<GetPortURLResponse> {
        const service = await this.serviceProvider.getService();
        
        const ws = await service.server.getWorkspace(this.nxpodInfo.workspaceId);
        if (!ws.latestInstance) {
            throw new Error("workspace has no instance");
        }

        const port = (ws.latestInstance.status.exposedPorts || []).find(p => p.port === params.port);
        if (!port) {
            throw new Error("port is not exposed");
        }
        if (!port.url) {
            throw new Error("port has no public URL");
        }

        return { url: port.url };
    }

}
