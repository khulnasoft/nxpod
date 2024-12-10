/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the Nxpod Enterprise Source Code License,
 * See License.enterprise.txt in the project root folder.
 */

import { UserDB } from '@nxpod/nxpod-db/lib/user-db';
import { NxpodTokenType, User } from '@nxpod/nxpod-protocol';
import * as crypto from 'crypto';
import * as graphqlHTTP from 'express-graphql';
import * as fs from "fs";
import { makeExecutableSchema } from 'graphql-tools';
import { inject, injectable } from "inversify";
import * as path from "path";
import { Headers } from 'request';
import { GraphQLResolvers } from './resolvers';

@injectable()
export class GraphQLController {

    @inject(GraphQLResolvers)
    protected readonly resolvers: GraphQLResolvers;

    @inject(UserDB)
    protected readonly userDb: UserDB;

    async apiRouter(): Promise<graphqlHTTP.Middleware> {
        const typeDefs = fs.readFileSync(path.join(__dirname, '/schema.graphql'), "utf-8");
        const resolvers = this.resolvers.get();
        const schema = makeExecutableSchema({
            typeDefs,
            resolvers,
        });
        return graphqlHTTP(async (request) => {
            const ctx = request as any as Context;
            ctx.authToken = this.bearerToken(request.headers);
            if (!ctx.user && !!ctx.authToken) {
                ctx.user = await this.userDb.findUserByNxpodToken(ctx.authToken, NxpodTokenType.API_AUTH_TOKEN);
            }
            return {
                schema,
                graphiql: true,
                context: request,
            }
        });
    }

    protected bearerToken(headers: Headers): string | undefined {
        const authorizationHeader = headers["authorization"];
        if (authorizationHeader && typeof authorizationHeader === "string" && authorizationHeader.startsWith("Bearer ")) {
            const token = authorizationHeader.substring("Bearer ".length);
            const hash = crypto.createHash('sha256').update(token, 'utf8').digest("hex");
            return hash;
        }
    }
}

export interface Context {
    user?: User,
    authToken?: string,
}
