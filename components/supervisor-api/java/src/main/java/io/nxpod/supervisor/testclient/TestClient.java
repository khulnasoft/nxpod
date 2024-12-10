// Copyright (c) 2021 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package io.nxpod.supervisor.testclient;

import java.util.Iterator;
import java.util.concurrent.TimeUnit;

import io.nxpod.supervisor.api.Status.PortsStatus;
import io.nxpod.supervisor.api.Status.PortsStatusRequest;
import io.nxpod.supervisor.api.Status.PortsStatusResponse;
import io.nxpod.supervisor.api.StatusServiceGrpc;
import io.nxpod.supervisor.api.Token.GetTokenRequest;
import io.nxpod.supervisor.api.Token.GetTokenResponse;
import io.nxpod.supervisor.api.TokenServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;

/**
 * This is a simple Test Client whose entire purpose is to just demonstrate how
 * to use the gRPC library (and to be able to run a quick test).
 *
 * Run it with: ./gradlew run
 */
public class TestClient {
    public static void main(String[] args) throws Exception {
        System.out.println("Hello from TestClient!");

        String supervisorAddr = "localhost:22999";

        ManagedChannel channel = ManagedChannelBuilder.forTarget(supervisorAddr).usePlaintext().build();
        try {
            TestClient.callGetToken(channel);
            TestClient.callPortStatus(channel);
        } finally {
            channel.shutdownNow().awaitTermination(5, TimeUnit.SECONDS);
        }
    }

    private static void callGetToken(ManagedChannel channel) throws Exception {
        TokenServiceGrpc.TokenServiceBlockingStub blockingStub = TokenServiceGrpc.newBlockingStub(channel);
        GetTokenRequest request = GetTokenRequest.newBuilder().setHost("github.com").setKind("git").build();
        GetTokenResponse response = blockingStub.getToken(request);
        System.out.println("user: " + response.getUser());
        System.out.println("token: " + response.getToken());
    }

    private static void callPortStatus(ManagedChannel channel) throws Exception {
        StatusServiceGrpc.StatusServiceBlockingStub blockingStub = StatusServiceGrpc.newBlockingStub(channel);
        PortsStatusRequest request = PortsStatusRequest.newBuilder().setObserve(false).build();
        Iterator<PortsStatusResponse> response = blockingStub.portsStatus(request);
        while (response.hasNext()) {
            PortsStatusResponse portStatusResponse = response.next();
            System.out.println("portsCount: " + portStatusResponse.getPortsCount());
            for (PortsStatus portStatus : portStatusResponse.getPortsList()) {
                System.out.println("l:" + portStatus.getLocalPort());
                System.out.println("visibitilty: " + portStatus.getExposed().getVisibility());
            }
        }
    }
}
