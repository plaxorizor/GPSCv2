// utils/rank.ts
//
// FaithShield Care rank system (recognition only — does NOT affect commissions).
//
// A member's rank is derived from their DIRECT referrals, and only ACTIVE
// directs count. It is computed bottom-up: each member's rank depends on how
// many of their active direct referrals already hold a given rank.
//
//   Member                       fewer than 10 active directs
//   Consultant                   10+ active directs
//   District Consultant          10+ active directs who are Consultant+
//   Municipal/City Consultant    10+ active directs who are District+
//   Provincial Consultant        10+ active directs who are Municipal/City+
//   Regional Consultant          10+ active directs who are Provincial+
//   National Consultant          10+ active directs who are Regional+
//
// Nothing is stored in Firestore — rank is always computed on the fly from the
// referral tree, so it can never drift out of sync.

// Index 0..6 — index doubles as the numeric rank.
export const RANKS = [
    "Member",
    "Consultant",
    "District Consultant",
    "Municipal/City Consultant",
    "Provincial Consultant",
    "Regional Consultant",
    "National Consultant",
] as const;

export const MAX_RANK = RANKS.length - 1; // 6 = National Consultant
export const RANK_THRESHOLD = 10; // referrals needed to climb each tier

export const rankName = (rank: number): string => RANKS[Math.max(0, Math.min(rank, MAX_RANK))];

// A node is anything that already carries its own (pre-computed) rank + status.
// Because rank is computed bottom-up, by the time we evaluate a parent the
// children's ranks are already known.
interface RankedChild {
    status: string;
    rank: number;
}

// Compute a member's rank from their direct children (whose ranks are already
// computed). Only ACTIVE directs are counted.
export const rankFromChildren = (children: RankedChild[]): number => {
    const activeRanks = children.filter((c) => c.status === "active").map((c) => c.rank);

    // Consultant needs 10+ active directs of any rank.
    if (activeRanks.length < RANK_THRESHOLD) return 0;

    let rank = 1; // Consultant
    // Each higher tier needs 10+ active directs at the previous tier or above.
    for (let tier = 2; tier <= MAX_RANK; tier++) {
        const qualifying = activeRanks.filter((r) => r >= tier - 1).length;
        if (qualifying >= RANK_THRESHOLD) rank = tier;
        else break;
    }
    return rank;
};

// Raw tree node (e.g. from buildReferralTree) — children carry no rank yet, so
// we compute bottom-up. Use this when you only have a downline tree (no
// pre-computed ranks), such as the admin member view.
interface RawTreeNode {
    status: string;
    children?: RawTreeNode[];
}

export const computeRankFromTree = (directReferrals: RawTreeNode[]): number => {
    const ranked = directReferrals.map((c) => ({
        status: c.status,
        rank: computeRankFromTree(c.children ?? []),
    }));
    return rankFromChildren(ranked);
};
