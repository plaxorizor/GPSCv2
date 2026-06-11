// Upgrade pricing — difference within the 90-day grace, full price after.
import { describe, expect, it } from "bun:test";
import {
    GRACE_DAYS,
    canUpgrade,
    graceDaysLeft,
    isWithinGrace,
    packageLabel,
    packagePrice,
    tierIndex,
    upgradeCharge,
    upgradeDifference,
    upgradeTargets,
} from "../src/utils/upgrade";

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (d: number) => new Date(Date.now() - d * DAY_MS);

describe("package pricing", () => {
    it("locks the package prices", () => {
        expect(packagePrice("basic")).toBe(698);
        expect(packagePrice("family")).toBe(1698);
        expect(packagePrice("premium")).toBe(4998);
    });

    it("is case-insensitive and safe on unknowns", () => {
        expect(packagePrice("Premium")).toBe(4998);
        expect(packagePrice("unknown")).toBe(0);
        expect(packagePrice(null)).toBe(0);
    });

    it("orders tiers basic < family < premium", () => {
        expect(tierIndex("basic")).toBe(0);
        expect(tierIndex("family")).toBe(1);
        expect(tierIndex("premium")).toBe(2);
        expect(tierIndex("bogus")).toBe(-1);
    });

    it("labels packages for the UI", () => {
        expect(packageLabel("basic")).toBe("Basic");
        expect(packageLabel("PREMIUM")).toBe("Premium");
        expect(packageLabel("")).toBe("—");
    });
});

describe("upgradeDifference / upgradeCharge", () => {
    it("difference = price gap, never negative", () => {
        expect(upgradeDifference("basic", "family")).toBe(1000);
        expect(upgradeDifference("basic", "premium")).toBe(4300);
        expect(upgradeDifference("family", "premium")).toBe(3300);
        expect(upgradeDifference("premium", "basic")).toBe(0); // downgrade → 0
    });

    it("charges the difference within grace, the FULL new price after", () => {
        expect(upgradeCharge("basic", "family", true)).toBe(1000);
        expect(upgradeCharge("basic", "family", false)).toBe(1698);
        expect(upgradeCharge("family", "premium", true)).toBe(3300);
        expect(upgradeCharge("family", "premium", false)).toBe(4998);
    });
});

describe("90-day grace window", () => {
    it("locks GRACE_DAYS at 90", () => {
        expect(GRACE_DAYS).toBe(90);
    });

    it("counts down and closes after 90 days", () => {
        expect(graceDaysLeft(daysAgo(0))).toBe(90);
        expect(graceDaysLeft(daysAgo(89))).toBe(1);
        expect(graceDaysLeft(daysAgo(91))).toBe(0);
        expect(isWithinGrace(daysAgo(30))).toBe(true);
        expect(isWithinGrace(daysAgo(91))).toBe(false);
    });

    it("no activation date → no grace", () => {
        expect(graceDaysLeft(null)).toBe(0);
        expect(isWithinGrace(undefined)).toBe(false);
    });
});

describe("upgradeTargets / canUpgrade", () => {
    it("offers only higher tiers", () => {
        expect(upgradeTargets("basic")).toEqual(["family", "premium"]);
        expect(upgradeTargets("family")).toEqual(["premium"]);
        expect(upgradeTargets("premium")).toEqual([]);
        expect(upgradeTargets("bogus")).toEqual([]);
    });

    it("only active members with a higher tier available can upgrade", () => {
        expect(canUpgrade({ status: "active", package: "basic" })).toBe(true);
        expect(canUpgrade({ status: "active", package: "premium" })).toBe(false);
        expect(canUpgrade({ status: "pending", package: "basic" })).toBe(false);
        expect(canUpgrade({})).toBe(false);
    });
});
