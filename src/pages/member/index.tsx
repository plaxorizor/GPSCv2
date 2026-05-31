// member/index.tsx
import { useState } from "react";
import { LayoutGrid, Wallet, FileText, Settings, Network } from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { MemberOverview } from "./Overview";
import { MemberReferrals } from "./Referrals";
import { MemberEarnings } from "./Earnings";
import { MemberClaims } from "./Claims";
import { MemberProfile } from "./Profile";
import type { Member, Commission, ReferralNode, EarningsTrendPoint, Claim, Payout, MemberStats } from "../../utils/types";

import { getEligibilityTimeline } from "../../utils/eligibility";

interface MemberDashboardProps {
    member: Member;
    memberStats: MemberStats | null;
    rankName: string;
    commissions: Commission[];
    directReferrals: ReferralNode[];
    earningsTrend: EarningsTrendPoint[];
    claims: Claim[];
    payouts: Payout[];
    //referralLink: string;
    onRequestPayout: () => void;
    onFileClaim: () => void;
    onLogout: () => void;
}

export default function MemberDashboard({
    member,
    memberStats,
    rankName,
    commissions,
    directReferrals,
    earningsTrend,
    claims,
    payouts,
    //referralLink,
    onRequestPayout,
    onFileClaim,
    onLogout,
}: MemberDashboardProps) {
    const [currentSection, setCurrentSection] = useState("overview");


    // Calculate dashboard stats
    const availableToWithdraw = commissions.filter((c) => c.status === "Paid").reduce((sum, c) => sum + c.amount, 0);
    const totalEarned = commissions.filter((c) => c.status === "Paid").reduce((sum, c) => sum + c.amount, 0);
    const activeReferralsCount = directReferrals.filter((r) => r.status === "active").length;
    const totalReferralsCount = directReferrals.length;
    const approvedClaimsCount = claims.filter((c) => c.status === "Approved").length;
    const approvedClaimsTotal = claims.filter((c) => c.status === "Approved").reduce((sum, c) => sum + c.amount, 0);
    const pendingHold = commissions.filter((c) => c.status === "Pending").reduce((sum, c) => sum + c.amount, 0);
    const lifetimePaid = commissions.filter((c) => c.status === "Paid").reduce((sum, c) => sum + c.amount, 0);

    // Eligibility timeline (example - you can make this dynamic based on member's join date)
    const eligibilityTimeline = getEligibilityTimeline(member.dateCreated);

    // Recent commissions with initials:
    const recentCommissions = (memberStats?.recentCommissions ?? []).map((c) => {
        const name = c.fromMember ?? "Unknown";
        const parts = name.trim().split(" ");
        return {
            ...c,
            fromMemberName: name,
            fromMemberInitials: `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase() || "?",
        };
    });

    // Pending claims count if there's any - TODO: make this dynamic based on claims
    const pendingClaimsCount = claims.filter((c) => c.status !== "Approved").length;

    const sidebarItems = [
        { id: "overview", label: "Overview", icon: LayoutGrid },
        { id: "referrals", label: "My Referrals", icon: Network, badge: totalReferralsCount },
        { id: "earnings", label: "Earnings", icon: Wallet },
        { id: "claims", label: "Claims", icon: FileText, badge: claims.filter((c) => c.status !== "Approved").length },
        { id: "profile", label: "Profile", icon: Settings },
    ];

    if (member.package === "Family" || member.package === "Premium") {
        sidebarItems.push({ id: "payouts", label: "Beneficiaries", icon: Wallet });
    }

    return (
        <div className="gpsc-cream flex min-h-screen">
            <DashboardSidebar
                user={member}
                rankName={rankName}
                currentSection={currentSection}
                onSectionChange={setCurrentSection}
                items={sidebarItems}
                onLogout={onLogout}
            />

            <MobileBottomNav
                current={currentSection}
                onChange={setCurrentSection}
                claimsBadge={pendingClaimsCount}
                referralsBadge={totalReferralsCount}
            />

            <main className="max-w-6xl flex-1 p-6 pb-24 lg:ml-64 lg:p-10 lg:pb-10">
                {currentSection === "overview" && (
                    <MemberOverview
                        member={member}
                        rankName={rankName}
                        packageName={member.package}
                        availableToWithdraw={availableToWithdraw}
                        totalEarned={totalEarned}
                        activeReferralsCount={activeReferralsCount}
                        totalReferralsCount={totalReferralsCount}
                        approvedClaimsCount={approvedClaimsCount}
                        approvedClaimsTotal={approvedClaimsTotal}
                        earningsTrend={earningsTrend}
                        //referralLink={referralLink}
                        onRequestPayout={onRequestPayout}
                        eligibilityTimeline={eligibilityTimeline}
                        recentCommissions={recentCommissions}
                    />
                )}
                {currentSection === "referrals" && (
                    <MemberReferrals
                        user={member}
                        //referralLink={referralLink}
                        referralTree={directReferrals}
                    />
                )}
                {currentSection === "earnings" && (
                    <MemberEarnings
                        availableToWithdraw={availableToWithdraw}
                        pendingHold={pendingHold}
                        lifetimePaid={lifetimePaid}
                        commissions={commissions}
                        payouts={payouts}
                        onRequestPayout={onRequestPayout}
                    />
                )}
                {currentSection === "claims" && <MemberClaims claims={claims} onFileClaim={onFileClaim} />}
                {currentSection === "payouts" && (
                    <div className="border-gpsc-navy rounded-xl border bg-white p-6 shadow-sm">
                        <h2 className="text-gpsc-navy text-2xl font-semibold">Beneficiaries</h2>
                        <p className="mt-2 text-sm text-gray-600">Manage your beneficiaries and payout instructions here.</p>
                    </div>
                )}
                {currentSection === "profile" && <MemberProfile onLogout={onLogout} user={member} />}
            </main>
        </div>
    );
}
