// Copyright (c) 2021 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package io.nxpod.nxpodprotocol.testclient;

import io.nxpod.nxpodprotocol.api.NxpodClient;
import io.nxpod.nxpodprotocol.api.NxpodServer;
import io.nxpod.nxpodprotocol.api.NxpodServerLauncher;
import io.nxpod.nxpodprotocol.api.entities.SendHeartBeatOptions;
import io.nxpod.nxpodprotocol.api.entities.User;

import java.util.Collections;

public class TestClient {
    public static void main(String[] args) throws Exception {
        String uri = "wss://nxpod.io/api/v1";
        String token = "CHANGE-ME";
        String origin = "https://CHANGE-ME.nxpod.io/";

        NxpodClient client = new NxpodClient();
        NxpodServerLauncher.create(client).listen(uri, origin, token, "Test", "Test", Collections.emptyList(), null);
        NxpodServer nxpodServer = client.getServer();
        User user = nxpodServer.getLoggedInUser().join();
        System.out.println("logged in user:" + user);

        Void result = nxpodServer
                .sendHeartBeat(new SendHeartBeatOptions("CHANGE-ME", false)).join();
        System.out.println("send heart beat:" + result);
    }
}
