// utils/commission.ts
//
// Commission claiming rules (FaithShield Care):
//   • Level 1 (direct) commissions are claimable immediately ("daily").
//   • Levels 2–6 are held for 7 days from the downline's activation
//     (= the commission's dateCreated).
//   • A member requests a payout of one or more eligible commissions.
//   • Every payout has a 5% transaction fee (deducted — member nets 95%).
//   • Minimum payout is ₱500 on the gross (sum of selected commissions).

export const HOLD_DAYS = 7; // hold window for level 2–6
export const MIN_PAYOUT = 500; // ₱, on the gross selected amount
export const PAYOUT_FEE_RATE = 0.05; // 5% transaction fee

const DAY_MS = 24 * 60 * 60 * 1000;

// Firestore Timestamp | Date | millis → Date (best effort).
export type DateLike = Date | number | string | { toDate?: () => Date } | null | undefined;
export const toDate = (v: DateLike): Date | null => {
    if (!v) return null;
    if (v instanceof Date) return v;
    if (typeof v === "number") return new Date(v);
    if (typeof v === "string") {
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
    }
    if (typeof v === "object" && typeof v.toDate === "function") return v.toDate();
    return null;
};

// When does a commission become claimable? L1 immediately; L2–6 after HOLD_DAYS.
export const eligibleDate = (level: number, dateCreated: DateLike): Date | null => {
    const created = toDate(dateCreated);
    if (!created) return null;
    if (level <= 1) return created;
    return new Date(created.getTime() + HOLD_DAYS * DAY_MS);
};

export const isEligible = (level: number, dateCreated: DateLike, now: Date = new Date()): boolean => {
    const at = eligibleDate(level, dateCreated);
    // If we can't determine a date, fail safe: only L1 is immediately eligible.
    if (!at) return level <= 1;
    return now.getTime() >= at.getTime();
};

// Whole days until a held commission becomes claimable (0 once eligible).
export const daysUntilEligible = (level: number, dateCreated: DateLike, now: Date = new Date()): number => {
    const at = eligibleDate(level, dateCreated);
    if (!at) return 0;
    const diff = at.getTime() - now.getTime();
    return diff <= 0 ? 0 : Math.ceil(diff / DAY_MS);
};

// Money helpers — round to centavos to avoid float drift.
const round2 = (n: number) => Math.round(n * 100) / 100;
export const feeFor = (gross: number): number => round2(gross * PAYOUT_FEE_RATE);
export const netAfterFee = (gross: number): number => round2(gross - feeFor(gross));
