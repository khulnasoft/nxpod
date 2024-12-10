/**
 * Copyright (c) 2023 Nxpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import Alert, { AlertType } from "./components/Alert";
import { useUserLoader } from "./hooks/use-user-loader";
import { isNxpodIo } from "./utils";
import { trackEvent } from "./Analytics";
import { useUpdateCurrentUserMutation } from "./data/current-user/update-mutation";
import { User as UserProtocol } from "@nxpod/nxpod-protocol";
import { User } from "@nxpod/public-api/lib/nxpod/v1/user_pb";
import { useCurrentOrg } from "./data/organizations/orgs-query";
import { AttributionId } from "@nxpod/nxpod-protocol/lib/attribution";
import { getNxpodService } from "./service/service";
import { useOrgBillingMode } from "./data/billing-mode/org-billing-mode-query";
import { Organization } from "@nxpod/public-api/lib/nxpod/v1/organization_pb";

const KEY_APP_DISMISSED_NOTIFICATIONS = "nxpod-app-notifications-dismissed";
const PRIVACY_POLICY_LAST_UPDATED = "2024-12-03";

interface Notification {
    id: string;
    type: AlertType;
    message: JSX.Element;
    preventDismiss?: boolean;
    onClose?: () => void;
}

const UPDATED_PRIVACY_POLICY = (updateUser: (user: Partial<UserProtocol>) => Promise<User>) => {
    return {
        id: "privacy-policy-update",
        type: "info",
        preventDismiss: true,
        onClose: async () => {
            let dismissSuccess = false;
            try {
                const updatedUser = await updateUser({
                    additionalData: { profile: { acceptedPrivacyPolicyDate: dayjs().toISOString() } },
                });
                dismissSuccess = !!updatedUser;
            } catch (err) {
                console.error("Failed to update user's privacy policy acceptance date", err);
                dismissSuccess = false;
            } finally {
                trackEvent("privacy_policy_update_accepted", {
                    path: window.location.pathname,
                    success: dismissSuccess,
                });
            }
        },
        message: (
            <span className="text-md">
                We've updated our Privacy Policy. You can review it{" "}
                <a className="gp-link" href="https://www.nxpod.khulnasoft.com/privacy" target="_blank" rel="noreferrer">
                    here
                </a>
                .
            </span>
        ),
    } as Notification;
};

const NXPOD_FLEX_INTRODUCTION_COACHMARK_KEY = "nxpod_flex_introduction";
const NXPOD_FLEX_INTRODUCTION = (updateUser: (user: Partial<UserProtocol>) => Promise<User>) => {
    return {
        id: NXPOD_FLEX_INTRODUCTION_COACHMARK_KEY,
        type: "info",
        preventDismiss: true,
        onClose: async () => {
            let dismissSuccess = false;
            try {
                const updatedUser = await updateUser({
                    additionalData: {
                        profile: {
                            coachmarksDismissals: {
                                [NXPOD_FLEX_INTRODUCTION_COACHMARK_KEY]: new Date().toISOString(),
                            },
                        },
                    },
                });
                dismissSuccess = !!updatedUser;
            } catch (err) {
                dismissSuccess = false;
            } finally {
                trackEvent("coachmark_dismissed", {
                    name: "nxpod-flex-introduction",
                    success: dismissSuccess,
                });
            }
        },
        message: (
            <span className="text-md">
                <b>Introducing Nxpod Flex:</b> self-host for free in 3 min or run locally using Nxpod Desktop |{" "}
                <a
                    className="text-kumquat-ripe font-bold"
                    href="https://app.nxpod.io"
                    target="_blank"
                    rel="noreferrer"
                >
                    Try now
                </a>
            </span>
        ),
    } as Notification;
};

const INVALID_BILLING_ADDRESS = (stripePortalUrl: string | undefined) => {
    return {
        id: "invalid-billing-address",
        type: "warning",
        preventDismiss: true,
        message: (
            <span className="text-md">
                Invalid billing address: tax calculations may be affected. Ensure your address includes Country, City,
                State, and Zip code. Update your details{" "}
                <a
                    href={`${stripePortalUrl}/customer/update`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gp-link"
                >
                    here
                </a>
                .
            </span>
        ),
    } as Notification;
};

export function AppNotifications() {
    const [topNotification, setTopNotification] = useState<Notification | undefined>(undefined);
    const { user, loading } = useUserLoader();
    const { mutateAsync } = useUpdateCurrentUserMutation();

    const currentOrg = useCurrentOrg().data;
    const { data: billingMode } = useOrgBillingMode();

    useEffect(() => {
        let ignore = false;

        const updateNotifications = async () => {
            const notifications = [];
            if (!loading) {
                if (
                    isNxpodIo() &&
                    (!user?.profile?.acceptedPrivacyPolicyDate ||
                        new Date(PRIVACY_POLICY_LAST_UPDATED) > new Date(user.profile.acceptedPrivacyPolicyDate))
                ) {
                    notifications.push(UPDATED_PRIVACY_POLICY((u: Partial<UserProtocol>) => mutateAsync(u)));
                }

                if (isNxpodIo() && currentOrg && billingMode?.mode === "usage-based") {
                    const notification = await checkForInvalidBillingAddress(currentOrg);
                    if (notification) {
                        notifications.push(notification);
                    }
                }

                if (isNxpodIo() && !user?.profile?.coachmarksDismissals[NXPOD_FLEX_INTRODUCTION_COACHMARK_KEY]) {
                    notifications.push(NXPOD_FLEX_INTRODUCTION((u: Partial<UserProtocol>) => mutateAsync(u)));
                }
            }

            if (!ignore) {
                const dismissedNotifications = getDismissedNotifications();
                const topNotification = notifications.find((n) => !dismissedNotifications.includes(n.id));
                setTopNotification(topNotification);
            }
        };
        updateNotifications();

        return () => {
            ignore = true;
        };
    }, [loading, mutateAsync, user, currentOrg, billingMode]);

    const dismissNotification = useCallback(() => {
        if (!topNotification) {
            return;
        }

        const dismissedNotifications = getDismissedNotifications();
        dismissedNotifications.push(topNotification.id);
        setDismissedNotifications(dismissedNotifications);
        setTopNotification(undefined);
    }, [topNotification, setTopNotification]);

    if (!topNotification) {
        return <></>;
    }

    return (
        <div className="app-container pt-2">
            <Alert
                type={topNotification.type}
                closable={true}
                onClose={() => {
                    if (!topNotification.preventDismiss) {
                        dismissNotification();
                    } else {
                        if (topNotification.onClose) {
                            topNotification.onClose();
                        }
                    }
                }}
                showIcon={true}
                className="flex rounded mb-2 w-full"
            >
                <span>{topNotification.message}</span>
            </Alert>
        </div>
    );
}

async function checkForInvalidBillingAddress(org: Organization): Promise<Notification | undefined> {
    try {
        const attributionId = AttributionId.render(AttributionId.createFromOrganizationId(org.id));

        const subscriptionId = await getNxpodService().server.findStripeSubscriptionId(attributionId);
        if (!subscriptionId) {
            return undefined;
        }

        const invalidBillingAddress = await getNxpodService().server.isCustomerBillingAddressInvalid(attributionId);
        if (!invalidBillingAddress) {
            return undefined;
        }

        const stripePortalUrl = await getNxpodService().server.getStripePortalUrl(attributionId);
        return INVALID_BILLING_ADDRESS(stripePortalUrl);
    } catch (err) {
        // On error we don't want to block but still would like to report against metrics
        console.debug("failed to determine 'invalid billing address' state", err);
        return undefined;
    }
}

function getDismissedNotifications(): string[] {
    try {
        const str = window.localStorage.getItem(KEY_APP_DISMISSED_NOTIFICATIONS);
        const parsed = JSON.parse(str || "[]");
        if (!Array.isArray(parsed)) {
            window.localStorage.removeItem(KEY_APP_DISMISSED_NOTIFICATIONS);
            return [];
        }
        return parsed;
    } catch (err) {
        console.debug("Failed to parse dismissed notifications", err);
        window.localStorage.removeItem(KEY_APP_DISMISSED_NOTIFICATIONS);
        return [];
    }
}

function setDismissedNotifications(ids: string[]) {
    try {
        window.localStorage.setItem(KEY_APP_DISMISSED_NOTIFICATIONS, JSON.stringify(ids));
    } catch (err) {
        console.debug("Failed to set dismissed notifications", err);
        window.localStorage.removeItem(KEY_APP_DISMISSED_NOTIFICATIONS);
    }
}
