/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { NxpodToken, NxpodTokenType } from "@nxpod/nxpod-protocol"
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm"
import { Transformer } from "../transformer"
import { DBUser } from "./db-user"

@Entity()
// on DB but not Typeorm: @Index("ind_lastModified", ["_lastModified"])   // DBSync
export class DBNxpodToken implements NxpodToken {

    @PrimaryColumn('varchar')
    tokenHash: string

    @Column({
        default: '',
        transformer: Transformer.MAP_EMPTY_STR_TO_UNDEFINED
    })
    name?: string

    @Column({ type: 'int' })
    type: NxpodTokenType

    @ManyToOne(type => DBUser)
    @JoinColumn()
    user: DBUser

    @Column("simple-array")
    scopes: string[]

    @Column()
    created: string

    @Column()
    deleted?: boolean;
}