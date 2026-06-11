// Membership lifecycle — active 365 days → 30-day renewal grace → expired.
// Phases are derived from dates at read time (no scheduled jobs).
import { describe, expect, it } from "bun:test";
import {
    MEMBERSHIP_DAYS,
    RENEWAL_GRACE_DAYS,
    daysUntilExpiry,
    graceDaysRemaining,
    graceEndDate,
    membershipPhase,
} from "../src/utils/membership";

const DAY_MS = 86_400_000;
const daysFromNow = (d: number) => new Date(Date.now() + d * DAY_MS);

describe("membershipPhase", () => {
    it("locks the business constants", () => {
        expect(MEMBERSHIP_DAYS).toBe(365);
        expect(RENEWAL_GRACE_DAYS).toBe(30);
    });

    it("pending status always wins", () => {
        expect(membershipPhase({ status: "pending" })).toBe("pending");
        expect(membershipPhase({ status: "pending", dateExpiry: daysFromNow(-100) })).toBe("pending");
    });

    it("is active while expiry is in the future", () => {
        expect(membershipPhase({ status: "active", dateExpiry: daysFromNow(100) })).toBe("active");
    });

    it("falls back to dateActivated + 365 days when no expiry is stored", () => {
        expect(membershipPhase({ status: "active", dateActivated: daysFromNow(-10) })).toBe("active");
        expect(membershipPhase({ status: "active", dateActivated: daysFromNow(-(MEMBERSHIP_DAYS + 5)) })).toBe("grace");
    });

    it("enters grace at expiry and expires 30 days later", () => {
        expect(membershipPhase({ status: "active", dateExpiry: daysFromNow(-1) })).toBe("grace");
        expect(membershipPhase({ status: "active", dateExpiry: daysFromNow(-29) })).toBe("grace");
        expect(membershipPhase({ status: "active", dateExpiry: daysFromNow(-31) })).toBe("expired");
    });

    it("admin-marked inactive forces grace even before stored expiry", () => {
        expect(membershipPhase({ status: "inactive", dateExpiry: daysFromNow(100) })).toBe("grace");
    });

    it("treats a member with no dates as active (legacy data, fail open)", () => {
        expect(membershipPhase({ status: "active" })).toBe("active");
    });
});

describe("grace window math", () => {
    it("graceEndDate = expiry + 30 days", () => {
        const exp = daysFromNow(0);
        const end = graceEndDate({ dateExpiry: exp })!;
        expect(end.getTime()).toBe(exp.getTime() + RENEWAL_GRACE_DAYS * DAY_MS);
    });

    it("graceDaysRemaining is clamped to [0, 30]", () => {
        expect(graceDaysRemaining({ dateExpiry: daysFromNow(-5) })).toBe(25);
        expect(graceDaysRemaining({ dateExpiry: daysFromNow(-100) })).toBe(0);
        // expiry far in the future would yield > 30 — clamp to the window size
        expect(graceDaysRemaining({ dateExpiry: daysFromNow(100) })).toBe(RENEWAL_GRACE_DAYS);
        // no dates at all → a full window
        expect(graceDaysRemaining({})).toBe(RENEWAL_GRACE_DAYS);
    });

    it("daysUntilExpiry counts down and goes ≤ 0 after expiry", () => {
        expect(daysUntilExpiry({ dateExpiry: daysFromNow(10) })).toBe(10);
        expect(daysUntilExpiry({ dateExpiry: daysFromNow(-10) })!).toBeLessThanOrEqual(0);
        expect(daysUntilExpiry({})).toBeNull();
    });
});
