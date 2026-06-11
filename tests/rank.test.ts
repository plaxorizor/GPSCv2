// Rank system — recognition only; 10+ ACTIVE directs per tier, computed bottom-up.
import { describe, expect, it } from "bun:test";
import { MAX_RANK, RANKS, RANK_THRESHOLD, computeRankFromTree, rankFromChildren, rankName } from "../src/utils/rank";

const active = (rank: number) => ({ status: "active", rank });
const pending = (rank: number) => ({ status: "pending", rank });

describe("rankName", () => {
    it("maps and clamps numeric ranks", () => {
        expect(rankName(0)).toBe("Member");
        expect(rankName(1)).toBe("Consultant");
        expect(rankName(6)).toBe("National Consultant");
        expect(rankName(-5)).toBe("Member");
        expect(rankName(99)).toBe("National Consultant");
    });

    it("locks the 7-tier ladder and the 10-direct threshold", () => {
        expect(RANKS.length).toBe(7);
        expect(MAX_RANK).toBe(6);
        expect(RANK_THRESHOLD).toBe(10);
    });
});

describe("rankFromChildren", () => {
    it("stays Member below 10 active directs", () => {
        expect(rankFromChildren([])).toBe(0);
        expect(rankFromChildren(Array.from({ length: 9 }, () => active(0)))).toBe(0);
    });

    it("reaches Consultant at exactly 10 active directs", () => {
        expect(rankFromChildren(Array.from({ length: 10 }, () => active(0)))).toBe(1);
    });

    it("does NOT count pending/inactive directs", () => {
        const children = [...Array.from({ length: 9 }, () => active(0)), pending(0), { status: "inactive", rank: 0 }];
        expect(rankFromChildren(children)).toBe(0);
    });

    it("climbs a tier when 10+ actives hold the previous tier or above", () => {
        // 10 active Consultants → District Consultant (rank 2)
        expect(rankFromChildren(Array.from({ length: 10 }, () => active(1)))).toBe(2);
        // 10 active District+ → Municipal/City (rank 3)
        expect(rankFromChildren(Array.from({ length: 10 }, () => active(2)))).toBe(3);
        // higher-ranked directs also satisfy lower requirements
        expect(rankFromChildren(Array.from({ length: 10 }, () => active(6)))).toBe(6);
    });

    it("stops climbing at the first unmet tier", () => {
        // 10 actives but only 9 are Consultant+ → stays Consultant
        const children = [...Array.from({ length: 9 }, () => active(1)), active(0)];
        expect(rankFromChildren(children)).toBe(1);
    });
});

describe("computeRankFromTree", () => {
    const leafActive = { status: "active", children: [] };

    it("computes bottom-up from a raw downline tree", () => {
        // Each direct has 10 active leaves → each direct is a Consultant;
        // 10 such directs → the member is a District Consultant.
        const consultantDirect = {
            status: "active",
            children: Array.from({ length: 10 }, () => leafActive),
        };
        const tree = Array.from({ length: 10 }, () => consultantDirect);
        expect(computeRankFromTree(tree)).toBe(2);
    });

    it("returns Member for an empty or shallow tree", () => {
        expect(computeRankFromTree([])).toBe(0);
        expect(computeRankFromTree([leafActive])).toBe(0);
    });
});
