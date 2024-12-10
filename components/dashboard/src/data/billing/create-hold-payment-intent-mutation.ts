/**
 * Copyright (c) 2023 Nxpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License.AGPL.txt in the project root for license information.
 */

import { useMutation } from "@tanstack/react-query";
import { getNxpodService } from "../../service/service";
import { useCurrency } from "../../payment-context";

export const useCreateHoldPaymentIntentMutation = () => {
    const { currency } = useCurrency();

    return useMutation(async (attributionId: string) => {
        // Create stripe customer if needed
        await getNxpodService().server.createStripeCustomerIfNeeded(attributionId, currency);

        // create payment intent for hold and for subscription
        return await getNxpodService().server.createHoldPaymentIntent(attributionId);
    });
};
