// Package is just for display/UI use, NOT stored as object in Firestore
export const PACKAGE_INFO = {
    Basic: { price: 698, level: 1, rank: "Sales Consultant", rate: 0.2 },
    Family: { price: 1698, level: 3, rank: "Team Consultant", rate: 0.05 },
    Premium: { price: 4998, level: 6, rank: "Sales Manager", rate: 0.03 },
} as const;

export type PackageName = "Basic" | "Family" | "Premium";
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
    dateCreated: any; // Firestore Timestamp
}

export interface Commission {
    id: string;
    membershipId: string;
    recipientId: string;
    level: number;
    role: string;
    amount: number;
    status: "paid" | "pending"; // ← removed "payable", maps from "released" → "paid"
    date: string;
    fromMemberName: string;
    fromMemberCity: string;
}

export interface Claim {
    id: string;
    userId: string;
    benefit: string;
    status: "approved" | "under_review" | "submitted";
    amount: number;
    submitted: string;
    decided: string | null;
    documents: string[];
}

export interface Payout {
    id: string;
    userId: string;
    amount: number;
    method: string;
    status: "sent" | "requested";
    requestedAt: string;
    sentAt: string | null;
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
    downline: ReferralNode[];
}

export interface EarningsTrendPoint {
    month: string;
    amount: number;
}
