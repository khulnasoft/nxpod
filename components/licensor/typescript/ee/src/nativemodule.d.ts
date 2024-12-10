/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the Nxpod Enterprise Source Code License,
 * See License.enterprise.txt in the project root folder.
 */


export type Instance = number;
    
export function init(key: string, domain: string): Instance;
export function validate(id: Instance): { msg: string, valid: boolean };
export function isEnabled(id: Instance, feature: Feature): boolean;
export function hasEnoughSeats(id: Instance, seats: int): boolean;
export function canUsePrebuild(id: Instance, totalPrebuildTimeSpent: number): boolean;
export function inspect(id: Instance): string;
export function dispose(id: Instance);
