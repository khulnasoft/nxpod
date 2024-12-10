/**
 * Copyright (c) 2024 Nxpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License.AGPL.txt in the project root for license information.
 */

import { UserDB } from "@nxpod/nxpod-db/lib";
import { AuditLogDB } from "@nxpod/nxpod-db/lib/audit-log-db";
import { AuditLog } from "@nxpod/nxpod-protocol/lib/audit-log";
import { ApplicationError, ErrorCodes } from "@nxpod/nxpod-protocol/lib/messaging/error";
import { log } from "@nxpod/nxpod-protocol/lib/util/logging";
import { TrustedValue, scrubber } from "@nxpod/nxpod-protocol/lib/util/scrubbing";
import { inject, injectable } from "inversify";
import { v4 } from "uuid";
import { Authorizer } from "../authorization/authorizer";
import { getExperimentsClientForBackend } from "@nxpod/nxpod-protocol/lib/experiments/configcat-server";

@injectable()
export class AuditLogService {
    constructor(
        @inject(AuditLogDB) private readonly dbAuditLog: AuditLogDB,
        @inject(Authorizer) private readonly authorizer: Authorizer,
        @inject(UserDB) private readonly dbUser: UserDB,
    ) {}

    asyncRecordAuditLog(actorId: string, method: string, args: any[]): void {
        this.recordAuditLog(actorId, method, args).catch((err) => log.error("failed to record audit log", err));
    }

    async recordAuditLog(actorId: string, method: string, args: any[]): Promise<void> {
        if (
            !(await getExperimentsClientForBackend().getValueAsync("audit_logs", false, {
                user: {
                    id: actorId,
                },
            }))
        ) {
            return;
        }
        const user = await this.dbUser.findUserById(actorId);
        // audit logs are an enterprise feature, so we ignore user actions that are not associated with an organization
        if (!user || !user.organizationId) {
            return;
        }

        const argsScrubbed = scrubber.scrub(args, true);

        const logEntry: AuditLog = {
            id: v4(),
            timestamp: new Date().toISOString(),
            actorId,
            organizationId: user.organizationId,
            action: method,
            args: argsScrubbed,
        };
        log.info("audit", new TrustedValue(logEntry));
        await this.dbAuditLog.recordAuditLog(logEntry);
    }

    async listAuditLogs(
        userId: string,
        organizationId: string,
        options?: {
            from?: string;
            to?: string;
            actorId?: string;
            action?: string;
            pagination?: {
                offset?: number;
                limit?: number;
            };
        },
    ): Promise<AuditLog[]> {
        await this.authorizer.checkPermissionOnOrganization(userId, "read_audit_logs", organizationId);

        // validate pagination options
        if (options?.pagination?.limit && options?.pagination?.limit > 250) {
            throw new ApplicationError(ErrorCodes.BAD_REQUEST, "The limit for pagination must not be larger than 250.");
        }
        return this.dbAuditLog.listAuditLogs(organizationId, options);
    }

    async purgeAuditLogs(before: string): Promise<number> {
        // check the given timestamp is parseable and is in the past
        if (isNaN(Date.parse(before))) {
            throw new ApplicationError(
                ErrorCodes.BAD_REQUEST,
                "Invalid timestamp. The timestamp must be a valid ISO 8601 date string.",
            );
        }
        if (new Date(before) >= new Date()) {
            throw new ApplicationError(ErrorCodes.BAD_REQUEST, "Invalid timestamp. The timestamp must be in the past.");
        }
        return this.dbAuditLog.purgeAuditLogs(before);
    }
}
