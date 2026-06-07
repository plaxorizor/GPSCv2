// utils/eligibility.ts
//
// Benefit-claim eligibility (a.k.a. the "Eligibility Timeline"). Each membership
// package unlocks a DIFFERENT set of benefits after a different membership /
// contestability period, per the Faith Shield Care business proposal.
//
// `assumed: true` marks a waiting period the proposal did not state explicitly —
// we use a sensible default (flagged so it's easy to confirm with the client).

export interface EligibilityMilestone {
    label: string;
    months: number;
    days: number;
    assumed?: boolean;
}

export type PackageKey = "basic" | "family" | "premium";

export const ELIGIBILITY_BY_PACKAGE: Record<PackageKey, EligibilityMilestone[]> = {
    // Basic Care (₱698) — individual
    basic: [
        { label: "Accidental Death Assistance", months: 1, days: 30 },
        { label: "Hospital Cash Assistance", months: 6, days: 180, assumed: true },
        { label: "Senior Citizen Recognition Gift", months: 6, days: 180 },
        { label: "Natural / Accidental Death (₱40k)", months: 10, days: 300 },
    ],
    // Family Care (₱1,698) — family of 4
    family: [
        { label: "Accidental Death Assistance", months: 1, days: 30, assumed: true },
        { label: "Hospital Cash Assistance", months: 6, days: 180, assumed: true },
        { label: "Senior Citizen Recognition Gift", months: 6, days: 180 },
        { label: "Calamities Cash Assistance", months: 8, days: 240 },
        { label: "Natural / Accidental Death", months: 10, days: 300, assumed: true },
    ],
    // Premium Care (₱4,998) — family of 5
    premium: [
        { label: "Accidental Death Assistance", months: 1, days: 30, assumed: true },
        { label: "Natural Death (₱40k)", months: 5, days: 150 },
        { label: "Hospital Cash Assistance", months: 6, days: 180 },
        { label: "Senior Citizen Recognition Gift", months: 6, days: 180 },
        { label: "Birthday Care Gift", months: 8, days: 240 },
        { label: "Maternity Cash Assistance", months: 8, days: 240, assumed: true },
        { label: "Calamities Cash Assistance", months: 8, days: 240, assumed: true },
        { label: "Natural / Accidental Death (₱80k)", months: 10, days: 300 },
    ],
};

// Back-compat export (Basic timeline) — prefer ELIGIBILITY_BY_PACKAGE.
export const ELIGIBILITY_MILESTONES = ELIGIBILITY_BY_PACKAGE.basic;

export const getEligibilityTimeline = (
    dateCreated: Date | { toDate: () => Date } | null | undefined,
    pkg: string = "basic",
) => {
    const key = (pkg ?? "basic").toLowerCase() as PackageKey;
    const milestones = ELIGIBILITY_BY_PACKAGE[key] ?? ELIGIBILITY_BY_PACKAGE.basic;

    if (!dateCreated) return milestones.map((m) => ({ ...m, unlocked: false }));

    const joinDate: Date = typeof dateCreated === "object" && "toDate" in dateCreated ? dateCreated.toDate() : new Date(dateCreated);
    const now = new Date();
    const monthsElapsed = (now.getFullYear() - joinDate.getFullYear()) * 12 + (now.getMonth() - joinDate.getMonth());
    const daysElapsed = (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24);

    return milestones.map((m) => ({
        ...m,
        unlocked: monthsElapsed >= m.months && daysElapsed >= m.days,
    }));
};
