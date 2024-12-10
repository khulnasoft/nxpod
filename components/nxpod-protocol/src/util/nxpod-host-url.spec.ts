/**
 * Copyright (c) 2020 Nxpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License.AGPL.txt in the project root for license information.
 */

import * as chai from "chai";
import { suite, test } from "@testdeck/mocha";
import { NxpodHostUrl } from "./nxpod-host-url";
const expect = chai.expect;

@suite
export class NxpodHostUrlTest {
    @test public parseWorkspaceId_hosts_withEnvVarsInjected() {
        const actual = new NxpodHostUrl(
            "https://gray-grasshopper-nfbitfia.ws-eu02.nxpod-staging.com/#passedin=test%20value/https://github.com/khulnasoft/nxpod-test-repo",
        ).workspaceId;
        expect(actual).to.equal("gray-grasshopper-nfbitfia");
    }

    @test public async testWithoutWorkspacePrefix() {
        expect(
            new NxpodHostUrl("https://3000-moccasin-ferret-155799b3.ws-eu02.nxpod-staging.com/")
                .withoutWorkspacePrefix()
                .toString(),
        ).to.equal("https://nxpod-staging.com/");
    }

    @test public async testWithoutWorkspacePrefix2() {
        expect(new NxpodHostUrl("https://nxpod-staging.com/").withoutWorkspacePrefix().toString()).to.equal(
            "https://nxpod-staging.com/",
        );
    }

    @test public async testWithoutWorkspacePrefix3() {
        expect(
            new NxpodHostUrl("https://gray-rook-5523v5d8.ws-dev.my-branch-1234.staging.nxpod-dev.com/")
                .withoutWorkspacePrefix()
                .toString(),
        ).to.equal("https://my-branch-1234.staging.nxpod-dev.com/");
    }

    @test public async testWithoutWorkspacePrefix4() {
        expect(
            new NxpodHostUrl("https://my-branch-1234.staging.nxpod-dev.com/").withoutWorkspacePrefix().toString(),
        ).to.equal("https://my-branch-1234.staging.nxpod-dev.com/");
    }

    @test public async testWithoutWorkspacePrefix5() {
        expect(
            new NxpodHostUrl("https://abc-nice-brunch-4224.staging.nxpod-dev.com/")
                .withoutWorkspacePrefix()
                .toString(),
        ).to.equal("https://abc-nice-brunch-4224.staging.nxpod-dev.com/");
    }

    @test public async testWithoutWorkspacePrefix6() {
        expect(
            new NxpodHostUrl("https://gray-rook-5523v5d8.ws-dev.abc-nice-brunch-4224.staging.nxpod-dev.com/")
                .withoutWorkspacePrefix()
                .toString(),
        ).to.equal("https://abc-nice-brunch-4224.staging.nxpod-dev.com/");
    }
}
module.exports = new NxpodHostUrlTest();
