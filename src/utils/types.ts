import { Timestamp } from "firebase/firestore";

// Package is just for display/UI use, NOT stored as object in Firestore
export const PACKAGE_INFO = {
    // `level` = how many downline levels this package can earn commissions from
    // (basic 1 / family 3 / premium 6). Rank is NOT package-based — it's the
    // recognition rank computed from referrals (see utils/rank.ts).
    basic: { price: 698, level: 1, rate: 0.2 },
    family: { price: 1698, level: 3, rate: 0.05 },
    premium: { price: 4998, level: 6, rate: 0.03 },
} as const;

export type PackageName = "basic" | "family" | "premium";
export type MemberStatus = "pending" | "active" | "inactive";
export type MemberCivilStatus = "single" | "married" | "divorced" | "widowed";

export interface Member {
    uid: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    birthDate: string; // stored as string from date input
    civilStatus: MemberCivilStatus;
    city: string;
    province: string;
    package: PackageName; // ← simple string, not object
    status: MemberStatus;
    referralCode: string;
    referredBy: string;
    beneficiaries: Beneficiary[];
    isAdmin: boolean;
    isSuperAdmin?: boolean;
    archived?: boolean;
    dateArchived?: Timestamp | null;
    dateCreated: Timestamp;
    dateActivated?: Timestamp;
    dateExpiry?: Timestamp;
    dateContestabilityEnd?: Timestamp;
    dateEligibility?: Timestamp; // basis for the eligibility timeline; resets on upgrade
    packageLocked?: boolean;
}

export interface MemberStats {
    availableToWithdraw: number;
    totalEarned: number;
    totalReferrals: number;
    activeReferrals: number;
    approvedClaimsCount: number;
    approvedClaimsTotal: number;
    recentCommissions: Commission[];
    earningsTrend: EarningsTrendPoint[];
}

// pending  = earned, not yet claimed (claimable once eligible by time/level)
// requested = included in a payout request, awaiting admin payment (locked)
// paid     = payout completed
export type CommissionStatus = "pending" | "requested" | "paid";

export interface Commission {
    id: string;
    membershipId: string;
    recipientId: string;
    level: number;
    role: string;
    amount: number;
    status: CommissionStatus;
    date: string; // ISO of dateCreated — used to compute eligibility
    fromMember: string;
    fromMemberName: string;
    fromMemberCity: string;
    reason?: "signup" | "upgrade"; // how the commission was generated
}

export type ClaimStatus = "approved" | "under_review" | "submitted" | "rejected" | "released";

export interface Claim {
    id: string;
    memberId: string;
    memberName: string;
    benefit: string;
    status: ClaimStatus;
    amount: number;
    description: string;
    submitted: string; // ISO date
    decided: string | null; // ISO date
    documents: string[];
}

export interface Payout {
    id: string;
    userId: string;
    amount: number; // net amount the member receives (after the 5% fee)
    grossAmount?: number; // sum of claimed commissions before the fee
    feeAmount?: number; // 5% transaction fee deducted
    commissionIds?: string[]; // commissions this payout covers
    method: string;
    accountNumber?: string;
    accountName?: string;
    status: "sent" | "requested" | "rejected";
    dateRequested: string;
    dateSent: string | null;
    reference: string | null;
}

// Admin-side payout view — includes member name and full account details
export interface AdminPayout {
    id: string;
    memberId: string;
    memberName: string;
    amount: number; // net amount the member receives
    grossAmount?: number; // before the 5% fee
    feeAmount?: number; // 5% transaction fee
    method: string;
    accountNumber: string;
    accountName: string;
    status: "requested" | "sent" | "rejected";
    dateRequested: string;
    dateSent: string | null;
    reference: string | null;
}

export interface Beneficiary {
    id?: string;
    name: string;
    relationship: string;
    coverage?: number; // optional, not always set
}

export interface ReferralNode {
    id: string;
    firstName: string;
    lastName: string;
    initials: string;
    packageName: string;
    city: string;
    memberSince: string;
    status: string;
    level: number;
    commissionRate: number;
    rank: number; // 0..6 computed rank (see utils/rank.ts)
    rankName: string; // human-readable rank label
    downline: ReferralNode[];
}

export interface EarningsTrendPoint {
    month: string;
    amount: number;
}

export interface DashboardStats {
    activeMembers: number;
    totalRevenue: number;
    totalCommissions: number;
    pendingClaims: number;
    pendingPayouts: number;
    avgClaimTimeDays: number;
    memberSatisfaction: string;
}

export interface GrowthDataPoint {
    month: string;
    members: number;
}

export interface PackageMixItem {
    name: string;
    value: number;
    color: string;
}

export interface TopRecruiter {
    id: string;
    firstName: string;
    lastName: string;
    initials: string;
    city: string;
    referrals: number;
}

export interface CommissionRecord {
    id: string;
    membershipId: string;
    recipientId: string;
    recipientName: string;
    recipientReferralCode?: string;
    fromMemberName: string;
    fromMemberCity: string;
    level: number;
    role: string;
    amount: number;
    status: "paid" | "payable" | "pending";
    date: string;
    reference?: string | null;
    reason?: "signup" | "upgrade";
}

export interface PendingCommission {
    id: string;
    membershipId: string;
    recipientId: string;
    recipientName: string;
    recipientReferralCode?: string;
    fromMemberName: string;
    level: number;
    amount: number;
    date: string;
    reason?: "signup" | "upgrade";
}

export interface Benefit {
    label: string;
    amount: string;
    eligibility: string;
}

export interface Package {
    id: string;
    name: string;
    price: number;
    tagline: string;
    coverage: string;
    color: string;
    popular?: boolean;
    benefits: Benefit[];
    commission: number;
}

export const packages: Package[] = [
    {
        id: "basic",
        name: "Basic Care",
        price: 698,
        tagline: "Individual protection, simple start",
        coverage: "Individual",
        color: "navy",
        benefits: [
            { label: "Accidental death", amount: "₱10,000 cash", eligibility: "1 month" },
            { label: "Natural death", amount: "₱20,000 + ₱5,000 groceries", eligibility: "5 months" },
            { label: "Natural/Accidental death", amount: "₱40,000 + ₱10,000 groceries + tribute, tarpaulin & wake flower", eligibility: "10 months" },
            { label: "Hospital cash", amount: "₱5,000 + ₱800/day max 7 days", eligibility: "6 months" },
            { label: "Senior recognition", amount: "₱5,000 (age 60,70,80,90) / ₱25,000 (age 100)", eligibility: "6 months" },
            { label: "Agent commission", amount: "1st level rank", eligibility: "Active" },
        ],
        commission: 224,
    },
    {
        id: "family",
        name: "Family Care",
        price: 1698,
        tagline: "Coverage for the whole household",
        coverage: "Family of 4",
        color: "green",
        popular: true,
        benefits: [
            { label: "Accidental death", amount: "₱10,000 cash", eligibility: "1 month" },
            { label: "Natural death", amount: "₱20,000 + ₱5,000 groceries", eligibility: "5 months" },
            { label: "Natural/Accidental death", amount: "₱40,000 + ₱10,000 groceries + tribute, tarpaulin & wake flower", eligibility: "10 months" },
            { label: "Hospital cash", amount: "₱5,000 + ₱800/day max 7 days", eligibility: "6 months" },
            { label: "Senior recognition", amount: "₱5,000 (age 60,70,80,90) / ₱25,000 (age 100)", eligibility: "6 months" },
            { label: "Calamity assistance", amount: "₱5,000 (fire or flood)", eligibility: "8 months" },
            { label: "Leadership bonus", amount: "Up to 3rd level rank", eligibility: "Active" },
        ],
        commission: 544,
    },
    {
        id: "premium",
        name: "Premium Care",
        price: 4998,
        tagline: "Full benefits and leadership rewards",
        coverage: "Family of 5",
        color: "navy",
        benefits: [
            { label: "Accidental death", amount: "₱20,000 – ₱80,000", eligibility: "1–10 months" },
            { label: "Natural death", amount: "₱40,000 + ₱10,000 groceries", eligibility: "5 months" },
            { label: "Hospital cash", amount: "₱10,000 + ₱3,000/day", eligibility: "6 months" },
            { label: "Senior recognition", amount: "₱20,000 (age 60,70,80,90) / ₱50,000 (age 100)", eligibility: "6 months" },
            { label: "Birthday care", amount: "₱5,000 + cake + tarpaulin", eligibility: "8 months" },
            { label: "Maternity assistance", amount: "₱10,000 – ₱20,000", eligibility: "8 months" },
            { label: "Calamity assistance", amount: "₱10,000", eligibility: "8 months" },
            { label: "Leadership bonus", amount: "Up to 6th rank", eligibility: "Active" },
        ],
        commission: 1600,
    },
];

export const peso = (n: number): string => "₱" + n.toLocaleString("en-PH");
