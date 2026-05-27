export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'member' | 'consultant' | 'admin';
  rankId: string;
  sponsorId: string | null;
  packageId: string | null;
  memberSince: string;
  city: string;
  province: string;
  status: 'active' | 'pending_kyc' | 'inactive';
  initials: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  tagline: string;
  coverage: string;
  color: string;
  benefits: Array<{ label: string; amount: string; eligibility: string }>;
  commission: number;
}

export interface Rank {
  id: string;
  name: string;
  rate: number;
  level: number;
}

export interface Commission {
  id: string;
  membershipId: string;
  recipientId: string;
  level: number;
  role: string;
  amount: number;
  status: 'paid' | 'payable' | 'pending';
  date: string;
  fromMemberName: string;
  fromMemberCity: string;
}

export interface Claim {
  id: string;
  userId: string;
  benefit: string;
  status: 'approved' | 'under_review' | 'submitted';
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
  status: 'sent' | 'requested';
  requestedAt: string;
  sentAt: string | null;
  reference: string | null;
}

export interface Beneficiary {
  id: string;
  membershipId: string;
  name: string;
  relationship: string;
  dob: string;
  coverage: number;
  position: number;
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