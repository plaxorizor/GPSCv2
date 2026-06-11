// Commission claiming rules — L1 immediate, L2–6 held 7 days, 5% payout fee.
import { describe, expect, it } from "bun:test";
import {
    HOLD_DAYS,
    MIN_PAYOUT,
    PAYOUT_FEE_RATE,
    daysUntilEligible,
    eligibleDate,
    feeFor,
    isEligible,
    netAfterFee,
    toDate,
} from "../src/utils/commission";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("toDate", () => {
    it("passes Date through", () => {
        const d = new Date("2026-01-15");
        expect(toDate(d)).toBe(d);
    });

    it("converts millis and ISO strings", () => {
        expect(toDate(1700000000000)?.getTime()).toBe(1700000000000);
        expect(toDate("2026-01-15T00:00:00Z")?.toISOString()).toBe("2026-01-15T00:00:00.000Z");
    });

    it("unwraps Firestore-style Timestamp objects", () => {
        const inner = new Date("2026-02-01");
        expect(toDate({ toDate: () => inner })).toBe(inner);
    });

    it("returns null for nullish and garbage strings", () => {
        expect(toDate(null)).toBeNull();
        expect(toDate(undefined)).toBeNull();
        expect(toDate("not a date")).toBeNull();
    });
});

describe("eligibleDate / isEligible", () => {
    const created = new Date("2026-06-01T00:00:00Z");

    it("level 1 (direct) is claimable immediately", () => {
        expect(eligibleDate(1, created)?.getTime()).toBe(created.getTime());
        expect(isEligible(1, created, created)).toBe(true);
    });

    it("levels 2–6 are held for exactly HOLD_DAYS (7) days", () => {
        for (const level of [2, 3, 4, 5, 6]) {
            const at = eligibleDate(level, created)!;
            expect(at.getTime()).toBe(created.getTime() + HOLD_DAYS * DAY_MS);
        }
        const justBefore = new Date(created.getTime() + HOLD_DAYS * DAY_MS - 1);
        const onTheDot = new Date(created.getTime() + HOLD_DAYS * DAY_MS);
        expect(isEligible(2, created, justBefore)).toBe(false);
        expect(isEligible(2, created, onTheDot)).toBe(true);
    });

    it("fails safe when the date is unknown: only L1 eligible", () => {
        expect(isEligible(1, null)).toBe(true);
        expect(isEligible(2, null)).toBe(false);
    });
});

describe("daysUntilEligible", () => {
    const created = new Date("2026-06-01T00:00:00Z");

    it("counts whole days remaining for held levels", () => {
        expect(daysUntilEligible(2, created, created)).toBe(7);
        const threeDaysIn = new Date(created.getTime() + 3 * DAY_MS);
        expect(daysUntilEligible(2, created, threeDaysIn)).toBe(4);
    });

    it("is 0 once eligible (and for L1 immediately)", () => {
        const after = new Date(created.getTime() + 8 * DAY_MS);
        expect(daysUntilEligible(2, created, after)).toBe(0);
        expect(daysUntilEligible(1, created, created)).toBe(0);
    });
});

describe("payout fee math", () => {
    it("locks the business constants", () => {
        expect(MIN_PAYOUT).toBe(500);
        expect(PAYOUT_FEE_RATE).toBe(0.05);
    });

    it("takes 5% and nets 95%, rounded to centavos", () => {
        expect(feeFor(1000)).toBe(50);
        expect(netAfterFee(1000)).toBe(950);
        expect(feeFor(500)).toBe(25);
        expect(netAfterFee(500)).toBe(475);
    });

    it("avoids float drift on awkward amounts", () => {
        expect(feeFor(139.6)).toBe(6.98);
        expect(netAfterFee(139.6)).toBe(132.62);
        // fee + net must always reassemble the gross exactly
        expect(feeFor(139.6) + netAfterFee(139.6)).toBe(139.6);
    });
});
