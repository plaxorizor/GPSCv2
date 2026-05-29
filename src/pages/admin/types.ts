// admin/types.ts
export type ClaimStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'released';

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
  fromMemberName: string;
  fromMemberCity: string;
  level: number;
  role: string;
  amount: number;
  status: 'paid' | 'payable' | 'pending';
  date: string;
}

export interface PendingCommission {
  id: string;
  membershipId: string;
  recipientId: string;
  recipientName: string;
  fromMemberName: string;
  level: number;
  amount: number;
  date: string;
}