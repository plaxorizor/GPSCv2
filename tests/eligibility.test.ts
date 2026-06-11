// Benefit eligibility timeline — per-package waiting periods gate what can be claimed.
import { describe, expect, it } from "bun:test";
import { ELIGIBILITY_BY_PACKAGE, getClaimableBenefits, getEligibilityTimeline } from "../src/utils/eligibility";

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (d: number) => new Date(Date.now() - d * DAY_MS);

describe("ELIGIBILITY_BY_PACKAGE", () => {
    it("every milestone carries an amount and required documents", () => {
        for (const milestones of Object.values(ELIGIBILITY_BY_PACKAGE)) {
            for (const m of milestones) {
                expect(m.amount).toBeGreaterThan(0);
                expect(m.documents.length).toBeGreaterThan(0);
                expect(m.days).toBe(m.months * 30);
            }
        }
    });

    it("packages unlock different benefit counts (basic 4, family 5, premium 8)", () => {
        expect(ELIGIBILITY_BY_PACKAGE.basic.length).toBe(4);
        expect(ELIGIBILITY_BY_PACKAGE.family.length).toBe(5);
        expect(ELIGIBILITY_BY_PACKAGE.premium.length).toBe(8);
    });
});

describe("getEligibilityTimeline", () => {
    it("nothing is unlocked without a join date", () => {
        const timeline = getEligibilityTimeline(null, "premium");
        expect(timeline.every((m) => !m.unlocked)).toBe(true);
    });

    it("unlocks benefits as membership ages (basic)", () => {
        // brand new member: nothing unlocked yet
        const fresh = getEligibilityTimeline(daysAgo(0), "basic");
        expect(fresh.every((m) => !m.unlocked)).toBe(true);

        // ~7 months in: 1-month and 6-month benefits unlocked, 10-month still locked
        const sevenMonths = getEligibilityTimeline(daysAgo(215), "basic");
        const byLabel = Object.fromEntries(sevenMonths.map((m) => [m.label, m.unlocked]));
        expect(byLabel["Accidental Death Assistance"]).toBe(true);
        expect(byLabel["Hospital Cash Assistance"]).toBe(true);
        expect(byLabel["Natural / Accidental Death (₱40k)"]).toBe(false);
    });

    it("falls back to the basic timeline for unknown packages", () => {
        const timeline = getEligibilityTimeline(daysAgo(10), "got-no-such-package");
        expect(timeline.length).toBe(ELIGIBILITY_BY_PACKAGE.basic.length);
    });

    it("accepts Firestore-style Timestamp objects", () => {
        const ts = { toDate: () => daysAgo(215) };
        const timeline = getEligibilityTimeline(ts, "basic");
        expect(timeline.some((m) => m.unlocked)).toBe(true);
    });
});

describe("getClaimableBenefits", () => {
    it("returns only unlocked benefits, shaped for the claim form", () => {
        const claimable = getClaimableBenefits(daysAgo(215), "basic");
        expect(claimable.length).toBeGreaterThan(0);
        for (const b of claimable) {
            expect(typeof b.label).toBe("string");
            expect(b.amount).toBeGreaterThan(0);
            expect(Array.isArray(b.documents)).toBe(true);
        }
        // the 10-month death benefit must not be claimable at ~7 months
        expect(claimable.map((b) => b.label)).not.toContain("Natural / Accidental Death (₱40k)");
    });

    it("a brand-new member can claim nothing", () => {
        expect(getClaimableBenefits(daysAgo(0), "premium")).toEqual([]);
    });
});
