/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { suite, test } from "mocha-typescript";

import * as chai from 'chai';
const chaiHttp = require('chai-http');

import * as http from "http";
import * as express from "express";
import { Server } from "../server"
import { Container } from 'inversify';
import { productionContainerModule } from '../container-module';
import { dbContainerModule } from '@nxpod/nxpod-db/lib/container-module';
import { NxpodClient, NxpodServer } from "@nxpod/nxpod-protocol";

const expect = chai.expect;

type TestApp = {
    httpServer: http.Server
    app: express.Application
    server: Server<NxpodClient, NxpodServer>
}

@suite class TestAuthenticationGitHub {
    protected testApp: TestApp;

    static before() {
        chai.use(chaiHttp);
    }

    // before each test
    @test.skip before() {
        this.testApp = TestAuthenticationGitHub.createTestServer();
    }

    @test.skip after() {
        this.testApp.httpServer.close();
    }

    static createTestServer(): TestApp {
        const app = express();

        // Create Server
        const container = new Container();
        container.load(productionContainerModule);
        container.load(dbContainerModule);
        const server = container.get(Server);
        server.init(app);
        const httpServer = app.listen(3000, "localhost");

        return { httpServer, app, server };
    }

    @test.skip async testAuthenticationOnRepositories() {
        let response = await chai.request(this.testApp.app).get("/github/TypeFox/the-product-test-repo/pull/9");
        expect(response).to.have.status(302);
    }
}

module.exports = new TestAuthenticationGitHub();   // Only to circumvent no usage warning :-/
