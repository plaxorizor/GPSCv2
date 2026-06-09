// utils/membership.ts
//
// Membership lifecycle. A member with an active plan is ACTIVE for 365 days from
// activation, then gets a 30-day INACTIVE grace period to renew, after which the
// membership is EXPIRED.
//
// Phases are DERIVED from dates on read (no scheduled job / Blaze needed). The
// stored `status` only records the admin's intent ("pending" until activated).
// Once on Blaze, a nightly function can also persist the derived status.

import { toDate, type DateLike } from "./commission";

export const MEMBERSHIP_DAYS = 365;
export const RENEWAL_GRACE_DAYS = 30;
const DAY_MS = 86_400_000;

export type MembershipPhase = "pending" | "active" | "grace" | "expired";

interface MemberLike {
    status?: string;
    dateActivated?: DateLike;
    dateExpiry?: DateLike;
}

// Expiry = stored dateExpiry, or dateActivated + 365 days as a fallback.
const expiryDate = (m: MemberLike): Date | null => {
    const exp = toDate(m.dateExpiry ?? null);
    if (exp) return exp;
    const act = toDate(m.dateActivated ?? null);
    return act ? new Date(act.getTime() + MEMBERSHIP_DAYS * DAY_MS) : null;
};

// End of the renewal grace window (expiry + 30 days).
export const graceEndDate = (m: MemberLike): Date | null => {
    const exp = expiryDate(m);
    return exp ? new Date(exp.getTime() + RENEWAL_GRACE_DAYS * DAY_MS) : null;
};

export const membershipPhase = (m: MemberLike): MembershipPhase => {
    if (m.status === "pending") return "pending";
    const exp = expiryDate(m);
    if (!exp) return "active"; // activated but no dates yet — treat as active
    const now = Date.now();
    if (now < exp.getTime()) return "active";
    if (now < exp.getTime() + RENEWAL_GRACE_DAYS * DAY_MS) return "grace";
    return "expired";
};

// Whole days until expiry (positive while active, ≤0 after).
export const daysUntilExpiry = (m: MemberLike): number | null => {
    const exp = expiryDate(m);
    return exp ? Math.ceil((exp.getTime() - Date.now()) / DAY_MS) : null;
};

// Whole days left in the renewal grace window (0 once it's over).
export const graceDaysRemaining = (m: MemberLike): number => {
    const ge = graceEndDate(m);
    if (!ge) return 0;
    const d = Math.ceil((ge.getTime() - Date.now()) / DAY_MS);
    return d > 0 ? d : 0;
};
