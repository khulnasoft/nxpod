/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the Nxpod Enterprise Source Code License,
 * See License.enterprise.txt in the project root folder.
 */

import { User, WorkspaceContext, StartPrebuildContext, IssueContext } from "@nxpod/nxpod-protocol";
import { injectable } from "inversify";
import { IPrefixContextParser } from "../../../src/workspace/context-parser";

@injectable()
export class StartPrebuildContextParser implements IPrefixContextParser {
    static PREFIX = 'prebuild/';

    findPrefix(user: User, context: string): string | undefined {
        if (context.startsWith(StartPrebuildContextParser.PREFIX)) {
            return StartPrebuildContextParser.PREFIX;
        }
    }

    public async handle(user: User, prefix: string, context: WorkspaceContext): Promise<WorkspaceContext> {
        if (IssueContext.is(context)) {
            throw new Error("cannot start prebuilds on an issue context")
        }

        const result: StartPrebuildContext = {
            title: `Prebuild of "${context.title}"`,
            actual: context
        };
        return result;
    }

}