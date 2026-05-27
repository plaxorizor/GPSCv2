import React, { useState } from 'react';
import { LayoutGrid, Network, Wallet, FileText, Settings } from 'lucide-react';
import { DashboardSidebar } from './DashboardSidebar';
import { MemberOverview } from './Overview';
import { MemberReferrals } from './Referrals';
import { MemberEarnings } from './Earnings';
import { MemberClaims } from './Claims';
import { MemberProfile } from './Profile';
import type { User, Package, Rank, Commission, ReferralNode, EarningsTrendPoint, Claim, Payout, Beneficiary } from './types';

export interface MemberDashboardProps {
  user: User;
  packageData: Package | null;
  rankData: Rank | null;
  commissions: Commission[];
  directReferrals: ReferralNode[];
  earningsTrend: EarningsTrendPoint[];
  claims: Claim[];
  payouts: Payout[];
  beneficiaries: Beneficiary[];
  referralLink: string;
  onCopyReferralLink: () => void;
  onShareReferralLink: (method: 'copy' | 'messenger' | 'whatsapp') => void;
  onRequestPayout: () => void;
  onFileClaim: () => void;
  onEditProfile: () => void;
  onChangePassword: () => void;
  onEnable2FA: () => void;
  onLogout: () => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  user, packageData, rankData, commissions, directReferrals, earningsTrend, claims, payouts, beneficiaries,
  referralLink, onCopyReferralLink, onShareReferralLink, onRequestPayout, onFileClaim, onEditProfile,
  onChangePassword, onEnable2FA, onLogout,
}) => {
  const [currentSection, setCurrentSection] = useState('overview');

  const availableToWithdraw = commissions.filter(c => c.status === 'payable').reduce((s, c) => s + c.amount, 0);
  const totalEarned = commissions.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0);
  const activeReferralsCount = directReferrals.filter(r => r.status === 'active').length;
  const totalReferralsCount = directReferrals.length;
  const approvedClaims = claims.filter(c => c.status === 'approved');
  const approvedClaimsCount = approvedClaims.length;
  const approvedClaimsTotal = approvedClaims.reduce((s, c) => s + c.amount, 0);
  const pendingHold = commissions.filter(c => c.status === 'pending').reduce((s, c) => s + c.amount, 0);
  const lifetimePaid = totalEarned;

  const eligibilityTimeline = [
    { label: 'Accidental death assistance', months: 1, unlocked: true },
    { label: 'Natural death (₱20k tier)', months: 5, unlocked: true },
    { label: 'Hospital cash assistance', months: 6, unlocked: true },
    { label: 'Birthday care gift', months: 8, unlocked: true },
    { label: 'Natural/Accidental ₱40k tier', months: 10, unlocked: false },
  ];

  const recentCommissions = commissions.slice(0, 5).map(c => ({
    id: c.id,
    fromMemberName: c.fromMemberName,
    fromMemberInitials: c.fromMemberName.split(' ').map(n => n[0]).join(''),
    level: c.level,
    amount: c.amount,
    status: c.status,
    date: c.date,
  }));

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'referrals', label: 'My referrals', icon: Network, badge: totalReferralsCount },
    { id: 'earnings', label: 'Earnings', icon: Wallet },
    { id: 'claims', label: 'Claims', icon: FileText, badge: claims.filter(c => c.status !== 'approved').length },
    { id: 'profile', label: 'Profile', icon: Settings },
  ];

  const packageName = packageData?.name || '—';
  const rankName = rankData?.name || 'Member';

  return (
    <div className="flex min-h-screen gpsc-cream">
      <DashboardSidebar user={user} rankName={rankName} currentSection={currentSection} onSectionChange={setCurrentSection} items={sidebarItems} onLogout={onLogout} />
      <main className="flex-1 p-6 lg:p-10 max-w-6xl">
        {currentSection === 'overview' && (
          <MemberOverview user={user} packageName={packageName} rankName={rankName} availableToWithdraw={availableToWithdraw} totalEarned={totalEarned} activeReferralsCount={activeReferralsCount} totalReferralsCount={totalReferralsCount} approvedClaimsCount={approvedClaimsCount} approvedClaimsTotal={approvedClaimsTotal} earningsTrend={earningsTrend} referralLink={referralLink} onCopyReferralLink={onCopyReferralLink} onShareReferralLink={onShareReferralLink} onRequestPayout={onRequestPayout} eligibilityTimeline={eligibilityTimeline} recentCommissions={recentCommissions} />
        )}
        {currentSection === 'referrals' && <MemberReferrals user={user} referralLink={referralLink} onCopyReferralLink={onCopyReferralLink} onShareReferralLink={onShareReferralLink} referralTree={directReferrals} />}
        {currentSection === 'earnings' && <MemberEarnings availableToWithdraw={availableToWithdraw} pendingHold={pendingHold} lifetimePaid={lifetimePaid} commissions={commissions} payouts={payouts} onRequestPayout={onRequestPayout} />}
        {currentSection === 'claims' && <MemberClaims claims={claims} onFileClaim={onFileClaim} />}
        {currentSection === 'profile' && <MemberProfile user={user} packageName={packageName} rankName={rankName} beneficiaries={beneficiaries} onEditProfile={onEditProfile} onChangePassword={onChangePassword} onEnable2FA={onEnable2FA} />}
      </main>
    </div>
  );
};

// Re-export types for convenience
export type * from './types';