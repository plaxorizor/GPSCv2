// utils/upgrade.ts
//
// Package upgrades. Within a 90-day grace period (from activation) a member may
// upgrade to ANY higher tier by paying only the price DIFFERENCE. On a confirmed
// upgrade the eligibility timeline resets to 0 and the membership renews to 365
// days (handled in firebase/upgrades.ts).

import { PACKAGE_INFO } from "./types";
import { toDate } from "./commission";

export const GRACE_DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;

const PACKAGE_ORDER = ["basic", "family", "premium"] as const;
export type PackageKey = (typeof PACKAGE_ORDER)[number];

const norm = (p: string | null | undefined) => (p ?? "").toLowerCase() as PackageKey;

export const tierIndex = (pkg: string | null | undefined): number => PACKAGE_ORDER.indexOf(norm(pkg));

export const packageLabel = (pkg: string): string => {
    const k = norm(pkg);
    return k ? k.charAt(0).toUpperCase() + k.slice(1) : "—";
};

export const packagePrice = (pkg: string | null | undefined): number =>
    PACKAGE_INFO[norm(pkg) as keyof typeof PACKAGE_INFO]?.price ?? 0;

// Amount a member pays to move from `from` → `to` (the difference).
export const upgradeDifference = (from: string, to: string): number => Math.max(0, packagePrice(to) - packagePrice(from));

// Higher tiers a member could upgrade to (e.g. basic → [family, premium]).
export const upgradeTargets = (from: string): PackageKey[] => {
    const i = tierIndex(from);
    return i < 0 ? [] : (PACKAGE_ORDER.slice(i + 1) as PackageKey[]);
};

// Whole days left in the 90-day grace window (0 once it's over).
export const graceDaysLeft = (dateActivated: Date | { toDate: () => Date } | null | undefined): number => {
    const start = toDate(dateActivated);
    if (!start) return 0;
    const end = start.getTime() + GRACE_DAYS * DAY_MS;
    const diff = end - Date.now();
    return diff <= 0 ? 0 : Math.ceil(diff / DAY_MS);
};

// Is the member still inside the 90-day grace window?
export const isWithinGrace = (dateActivated: Date | { toDate: () => Date } | null | undefined): boolean =>
    graceDaysLeft(dateActivated) > 0;

// What a member pays to upgrade: only the DIFFERENCE within the grace window,
// otherwise the FULL price of the new package.
export const upgradeCharge = (from: string, to: string, inGrace: boolean): number =>
    inGrace ? upgradeDifference(from, to) : packagePrice(to);

// Can this member upgrade at all? Active + a higher tier exists. (Grace only
// affects the PRICE now — difference vs full — not whether they can upgrade.)
export const canUpgrade = (member: { status?: string; package?: string }): boolean =>
    member.status === "active" && upgradeTargets(member.package ?? "").length > 0;
