// utils/eligibility.ts
//
// Benefit-claim eligibility (a.k.a. the "Eligibility Timeline"). Each membership
// package unlocks a DIFFERENT set of benefits after a different membership /
// contestability period, per the FaithShield Care business proposal.
//
// All waiting periods below are client-confirmed. `amount` is the headline
// payout for the benefit and `documents` lists the supporting documents a claim
// requires — both drive the claim form. The admin still verifies on review.

// Reusable supporting-document sets per benefit category.
const DOC_DEATH_ACCIDENTAL = ["Valid ID", "Death Certificate", "Police Report", "Barangay Certificate"];
const DOC_DEATH_NATURAL = ["Valid ID", "Death Certificate", "Barangay Certificate"];
const DOC_HOSPITAL = ["Valid ID", "Medical Certificate", "Hospital Records", "Official Receipt / Billing Statement"];
const DOC_SENIOR = ["Valid ID", "Proof of Age (Birth Certificate / Senior ID)"];
const DOC_CALAMITY = ["Valid ID", "Barangay Certificate", "Proof of Loss / Photos"];
const DOC_BIRTHDAY = ["Valid ID"];
const DOC_MATERNITY = ["Valid ID", "Medical Certificate", "Official Receipt / Billing Statement"];

export interface EligibilityMilestone {
    label: string;
    months: number;
    days: number;
    amount: number; // headline claim payout (default / maximum for variable benefits)
    documents: string[]; // required supporting documents
    variableAmount?: boolean; // payout varies (member enters the claimed amount)
}

export type PackageKey = "basic" | "family" | "premium";

export const ELIGIBILITY_BY_PACKAGE: Record<PackageKey, EligibilityMilestone[]> = {
    // Basic Care (₱698) — individual
    basic: [
        { label: "Accidental Death Assistance", months: 1, days: 30, amount: 10_000, documents: DOC_DEATH_ACCIDENTAL },
        { label: "Hospital Cash Assistance", months: 6, days: 180, amount: 5_000, documents: DOC_HOSPITAL, variableAmount: true },
        { label: "Senior Citizen Recognition Gift", months: 6, days: 180, amount: 5_000, documents: DOC_SENIOR, variableAmount: true },
        { label: "Natural / Accidental Death (₱40k)", months: 10, days: 300, amount: 40_000, documents: DOC_DEATH_NATURAL },
    ],
    // Family Care (₱1,698) — family of 4
    family: [
        { label: "Accidental Death Assistance", months: 1, days: 30, amount: 10_000, documents: DOC_DEATH_ACCIDENTAL },
        { label: "Hospital Cash Assistance", months: 6, days: 180, amount: 5_000, documents: DOC_HOSPITAL, variableAmount: true },
        { label: "Senior Citizen Recognition Gift", months: 6, days: 180, amount: 5_000, documents: DOC_SENIOR, variableAmount: true },
        { label: "Calamities Cash Assistance", months: 8, days: 240, amount: 5_000, documents: DOC_CALAMITY },
        { label: "Natural / Accidental Death", months: 10, days: 300, amount: 40_000, documents: DOC_DEATH_NATURAL },
    ],
    // Premium Care (₱4,998) — family of 5
    premium: [
        { label: "Accidental Death Assistance", months: 1, days: 30, amount: 20_000, documents: DOC_DEATH_ACCIDENTAL },
        { label: "Natural Death (₱40k)", months: 5, days: 150, amount: 40_000, documents: DOC_DEATH_NATURAL },
        { label: "Hospital Cash Assistance", months: 6, days: 180, amount: 10_000, documents: DOC_HOSPITAL, variableAmount: true },
        { label: "Senior Citizen Recognition Gift", months: 6, days: 180, amount: 20_000, documents: DOC_SENIOR, variableAmount: true },
        { label: "Birthday Care Gift", months: 8, days: 240, amount: 5_000, documents: DOC_BIRTHDAY },
        { label: "Maternity Cash Assistance", months: 8, days: 240, amount: 20_000, documents: DOC_MATERNITY, variableAmount: true },
        { label: "Calamities Cash Assistance", months: 8, days: 240, amount: 10_000, documents: DOC_CALAMITY },
        { label: "Natural / Accidental Death (₱80k)", months: 10, days: 300, amount: 80_000, documents: DOC_DEATH_NATURAL },
    ],
};

// Back-compat export (Basic timeline) — prefer ELIGIBILITY_BY_PACKAGE.
export const ELIGIBILITY_MILESTONES = ELIGIBILITY_BY_PACKAGE.basic;

export const getEligibilityTimeline = (dateCreated: Date | { toDate: () => Date } | null | undefined, pkg: string = "basic") => {
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

// A benefit the member can actually file a claim for (unlocked).
export interface ClaimBenefit {
    label: string;
    amount: number;
    documents: string[];
    variableAmount?: boolean;
}

// The member's currently-claimable benefits (unlocked only), for the claim form.
export const getClaimableBenefits = (dateCreated: Date | { toDate: () => Date } | null | undefined, pkg: string = "basic"): ClaimBenefit[] =>
    getEligibilityTimeline(dateCreated, pkg)
        .filter((m) => m.unlocked)
        .map(({ label, amount, documents, variableAmount }) => ({ label, amount, documents, variableAmount }));
