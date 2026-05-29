// member/index.tsx
import { useState } from "react";
import { LayoutGrid, Wallet, FileText, Settings, Share2 } from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";
import { MemberOverview } from "./Overview";
import { MemberReferrals } from "./Referrals";
import { MemberEarnings } from "./Earnings";
import { MemberClaims } from "./Claims";
import { MemberProfile } from "./Profile";
import type { User, Package, Rank, Commission, ReferralNode, EarningsTrendPoint, Claim, Payout, Beneficiary } from "./types";

interface MemberDashboardProps {
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

export default function MemberDashboard({
  user,
  packageData,
  rankData,
  commissions,
  directReferrals,
  earningsTrend,
  claims,
  payouts,
  beneficiaries,
  referralLink,
  onCopyReferralLink,
  onShareReferralLink,
  onRequestPayout,
  onFileClaim,
  onEditProfile,
  onChangePassword,
  onEnable2FA,
  onLogout,
}: MemberDashboardProps) {
  const [section, setSection] = useState("overview");

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "referrals", label: "My referrals", icon: Share2, badge: directReferrals.length },
    { id: "earnings", label: "Earnings", icon: Wallet },
    { id: "claims", label: "Claims", icon: FileText },
    { id: "profile", label: "Profile", icon: Settings },
  ];

  // Calculate dashboard stats
  const availableToWithdraw = commissions
    .filter(c => c.status === "payable")
    .reduce((sum, c) => sum + c.amount, 0);
  
  const totalEarned = commissions
    .filter(c => c.status === "paid")
    .reduce((sum, c) => sum + c.amount, 0);
  
  const activeReferrals = directReferrals.filter(r => r.status === "active").length;
  const approvedClaimsTotal = claims
    .filter(c => c.status === "approved")
    .reduce((sum, c) => sum + c.amount, 0);

  const packageName = packageData?.name || "No Package";
  const rankName = rankData?.name || "Member";

  // Eligibility timeline (example - you can make this dynamic based on member's join date)
  const eligibilityTimeline = [
    { label: "Accidental death assistance", months: 1, unlocked: true },
    { label: "Natural death (₱20k tier)", months: 5, unlocked: true },
    { label: "Hospital cash assistance", months: 6, unlocked: true },
    { label: "Birthday care gift", months: 8, unlocked: true },
    { label: "Natural/Accidental ₱40k tier", months: 10, unlocked: false },
  ];

  // Recent commissions for overview
  const recentCommissions = commissions.slice(0, 5).map(c => ({
    id: c.id,
    fromMemberName: c.fromMemberName,
    fromMemberInitials: c.fromMemberName.split(' ').map(n => n[0]).join('').toUpperCase() || "??",
    level: c.level,
    amount: c.amount,
    status: c.status,
    date: c.date,
  }));

  return (
    <div className="flex min-h-screen gpsc-cream">
      <DashboardSidebar
        user={user}
        rankName={rankName}
        currentSection={section}
        onSectionChange={setSection}
        items={sidebarItems}
        onLogout={onLogout}
      />
      <main className="flex-1 p-6 lg:p-10 max-w-6xl">
        {section === "overview" && (
          <MemberOverview
            user={user}
            packageName={packageName}
            rankName={rankName}
            availableToWithdraw={availableToWithdraw}
            totalEarned={totalEarned}
            activeReferralsCount={activeReferrals}
            totalReferralsCount={directReferrals.length}
            approvedClaimsCount={claims.filter(c => c.status === "approved").length}
            approvedClaimsTotal={approvedClaimsTotal}
            earningsTrend={earningsTrend}
            referralLink={referralLink}
            onCopyReferralLink={onCopyReferralLink}
            onShareReferralLink={onShareReferralLink}
            onRequestPayout={onRequestPayout}
            eligibilityTimeline={eligibilityTimeline}
            recentCommissions={recentCommissions}
          />
        )}
        {section === "referrals" && (
          <MemberReferrals
            user={user}
            referralLink={referralLink}
            onCopyReferralLink={onCopyReferralLink}
            onShareReferralLink={onShareReferralLink}
            referralTree={directReferrals}
          />
        )}
        {section === "earnings" && (
          <MemberEarnings
            availableToWithdraw={availableToWithdraw}
            pendingHold={commissions.filter(c => c.status === "pending").reduce((sum, c) => sum + c.amount, 0)}
            lifetimePaid={totalEarned}
            commissions={commissions}
            payouts={payouts}
            onRequestPayout={onRequestPayout}
          />
        )}
        {section === "claims" && (
          <MemberClaims
            claims={claims}
            onFileClaim={onFileClaim}
          />
        )}
        {section === "profile" && (
          <MemberProfile
            user={user}
            packageName={packageName}
            rankName={rankName}
            beneficiaries={beneficiaries}
            onEditProfile={onEditProfile}
            onChangePassword={onChangePassword}
            onEnable2FA={onEnable2FA}
          />
        )}
      </main>
    </div>
  );
}