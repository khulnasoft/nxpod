/**
 * Copyright (c) 2023 Nxpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License.AGPL.txt in the project root for license information.
 */

import { useQuery } from "@tanstack/react-query";
import { authProviderClient } from "../../service/public-api";
import { AuthProvider, GetAuthProviderRequest } from "@nxpod/public-api/lib/nxpod/v1/authprovider_pb";

export const useGetAuthProviderQuery = (authProviderId: string | undefined) => {
    return useQuery<AuthProvider | undefined, Error>(getAuthProviderQueryKey(authProviderId || ""), async () => {
        if (!authProviderId) {
            return;
        }
        const { authProvider } = await authProviderClient.getAuthProvider(
            new GetAuthProviderRequest({
                authProviderId: authProviderId,
            }),
        );

        return authProvider;
    });
};

export const getAuthProviderQueryKey = (authProviderId: string) => ["auth-provider", { authProviderId }];
