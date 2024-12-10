/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { TerminalWidgetImpl } from '@theia/terminal/lib/browser/terminal-widget-impl';
import { injectable } from 'inversify';
import { Terminal } from 'xterm';
import { Disposable } from '@theia/core';

@injectable()
export class NxpodTerminalWidget extends TerminalWidgetImpl {

    constructor() {
        super();
        this.installLinkHandler();
    }

    protected installLinkHandler(): void {
        const term = (this as any).term as Terminal;
        if (term && term.registerLinkMatcher) {
            const nxpodTerminalLinkHandler = NxpodTerminalWidget.createLinkHandler();
            const options = {
                matchIndex: 1, //index of the regex capture group
            };
            const matcherId = term.registerLinkMatcher(NxpodTerminalWidget.modifiedUrlRegex, nxpodTerminalLinkHandler, options);
            this.toDispose.push(Disposable.create(
                () => {
                    term.deregisterLinkMatcher(matcherId);
                }
            ));
            this.logger.trace("Registered Nxpod xTerm LinkMatcher.");
        }
    }

    // on restoreState, let's not immediately start the terminal but keep the state and wait for an external start call
    private oldState: any;
    restoreState(oldState: object) {
        this.oldState = oldState;
    }

    public getTerminalId(): number | undefined {
        if (this.terminalId) {
            return this.terminalId;
        }
        return this.oldState && this.oldState.terminalId;
    }

    async start(id?: number): Promise<number> {
        if (id === undefined && this.oldState !== undefined) {
            super.restoreState(this.oldState);
            return this.terminalId;
        }
        return super.start(id);
    }

}

export namespace NxpodTerminalWidget {

    export type LinkMatcherHandler = (event: MouseEvent, uri: string) => boolean | void;
    export type LinkMatcherValidationCallback = (uri: string, callback: (isValid: boolean) => void) => void;

    // Source: https://github.com/xtermjs/xterm.js/tree/master/src/Linkifier.ts
    const protocolClause = '(https?:\\/\\/)';
    const domainCharacterSet = '[\\da-z\\.-]+';
    const negatedDomainCharacterSet = '[^\\da-z\\.-]+';
    const domainBodyClause = '(' + domainCharacterSet + ')';
    const tldClause = '([a-z\\.]{2,6})';
    const ipClause = '((\\d{1,3}\\.){3}\\d{1,3})';
    const localHostClause = '(localhost)';
    const portClause = '(:\\d{1,5})';
    const hostClause = '((' + domainBodyClause + '\\.' + tldClause + ')|' + ipClause + '|' + localHostClause + ')' + portClause + '?';
    const pathClause = '(\\/[\\/\\w\\.\\-%~]*)*';
    const queryStringHashFragmentCharacterSet = '[0-9\\w\\[\\]\\(\\)\\/\\?\\!#@$%&\'*+,:;~\\=\\.\\-]*';
    const queryStringClause = '(\\?' + queryStringHashFragmentCharacterSet + ')?';
    const hashFragmentClause = '(#' + queryStringHashFragmentCharacterSet + ')?';
    // const negatedPathCharacterSet = '[^\\/\\w\\.\\-%]+';
    const bodyClause = hostClause + pathClause + queryStringClause + hashFragmentClause;
    const start = '(?:^|' + negatedDomainCharacterSet + ')(';
    const end = ')';    // old: ')($|' + negatedPathCharacterSet + ')';     // What is this for? The regex is not correct, it eats the ':<port>' part
    export const modifiedUrlRegex = new RegExp(start + protocolClause + bodyClause + end);

    export function createLinkHandler(): LinkMatcherHandler {
        return (event: MouseEvent, uri: string): void => {
            openUri(uri);
        }
    }

    function determineTargetPort(url: URL | Location): string {
        if (!url.port) {
            return url.protocol === 'https:' ? '443' : '80';
        }
        return url.port;
    }

    export function toURL(uri: string) : URL | undefined {
        let url;
        try {
            if (!uri.startsWith("http")) {
                uri = "http://" + uri;
            }
            url = new URL(uri);
        } catch (err) {
            console.error(err);
            return undefined;
        }

        if (url.hostname === 'localhost' ||
            url.hostname === '127.0.0.1' ||
            url.hostname === '0.0.0.0') {
            // We are currently at: <wsid>.ws.nxpod.io/
            // Port available under: <port>-<wsid>.ws.nxpod.io/...
            url.hostname = `${determineTargetPort(url)}-${window.location.hostname}`;
            url.protocol = window.location.protocol;
            url.port = determineTargetPort(window.location);
        }
        return url;
    }

    export function openUri(uri: string): void {
        const url = toURL(uri);
        if (url) {
            window.open(url.href, `_blank`, 'noopener');
        }
    }

}
