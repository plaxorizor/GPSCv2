// member/index.tsx
import { LayoutGrid, Wallet, FileText, Settings, Network } from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { MemberOverview } from "./Overview";
import { MemberReferrals } from "./Referrals";
import { MemberEarnings } from "./Earnings";
import { MemberClaims } from "./Claims";
import { MemberBeneficiaries } from "./Beneficiaries";
import { MemberProfile } from "./Profile";
import type { Member, Commission, ReferralNode, EarningsTrendPoint, Claim, Payout, MemberStats } from "../../utils/types";

import { getEligibilityTimeline } from "../../utils/eligibility";

interface MemberDashboardProps {
    member: Member;
    memberStats: MemberStats | null;
    rankName: string;
    packageName: string;
    commissions: Commission[];
    directReferrals: ReferralNode[];
    earningsTrend: EarningsTrendPoint[];
    claims: Claim[];
    payouts: Payout[];
    currentSection: string;
    onSectionChange: (section: string) => void;
    onRequestPayout: () => void;
    onFileClaim: () => void;
    onLogout: () => void;
    onChangePassword: () => void;
}

export default function MemberDashboard({
    member,
    memberStats,
    rankName,
    packageName,
    commissions,
    directReferrals,
    earningsTrend,
    claims,
    payouts,
    currentSection,
    onSectionChange,
    onRequestPayout,
    onFileClaim,
    onLogout,
    onChangePassword,
}: MemberDashboardProps) {

    // Stats from memberStats (always loaded with the overview — no extra fetch needed)
    const availableToWithdraw = memberStats?.availableToWithdraw ?? 0;
    const totalEarned = memberStats?.totalEarned ?? 0;
    const activeReferralsCount = memberStats?.activeReferrals ?? 0;
    const totalReferralsCount = memberStats?.totalReferrals ?? 0;
    const approvedClaimsCount = memberStats?.approvedClaimsCount ?? 0;
    const approvedClaimsTotal = memberStats?.approvedClaimsTotal ?? 0;

    // These need the full commission list — only available once Earnings section is visited
    const pendingHold = commissions.filter((c) => c.status === "pending").reduce((sum, c) => sum + c.amount, 0);
    const lifetimePaid = commissions.filter((c) => c.status === "paid").reduce((sum, c) => sum + c.amount, 0);

    // Eligibility timeline (example - you can make this dynamic based on member's join date)
    const eligibilityTimeline = getEligibilityTimeline(member.dateCreated);

    // Recent commissions with initials:
    const recentCommissions = (memberStats?.recentCommissions ?? []).map((c) => {
        const name = (c.fromMemberName as string | undefined) ?? "Unknown";
        const parts = name.trim().split(" ");
        return {
            ...c,
            fromMemberName: name,
            fromMemberInitials: `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase() || "?",
            // Convert Firestore Timestamp → ISO string so Overview can call formatDate()
            date: (c as any).dateCreated?.toDate?.()?.toISOString?.() ?? "",
        };
    });

    // Pending claims count if there's any - TODO: make this dynamic based on claims
    const pendingClaimsCount = claims.filter((c) => c.status !== "approved").length;

    // Sidebar items
    const sidebarItems = [];
    sidebarItems.push({ id: "overview", label: "Overview", icon: LayoutGrid });
    sidebarItems.push({ id: "referrals", label: "My Referrals", icon: Network, badge: totalReferralsCount });
    sidebarItems.push({ id: "earnings", label: "Earnings", icon: Wallet });
    sidebarItems.push({ id: "claims", label: "Claims", icon: FileText, badge: claims.filter((c) => c.status !== "approved").length });
    // Basic members don't have beneficiaries
    if (member.package.toLowerCase() !== "basic") {
        sidebarItems.push({ id: "beneficiaries", label: "Beneficiaries", icon: Wallet });
    }
    sidebarItems.push({ id: "profile", label: "Profile", icon: Settings });

    return (
        <div className="fsc-cream flex min-h-screen">
            <DashboardSidebar
                member={member}
                rankName={rankName}
                currentSection={currentSection}
                onSectionChange={onSectionChange}
                items={sidebarItems}
                onLogout={onLogout}
            />

            <MobileBottomNav
                current={currentSection}
                onChange={onSectionChange}
                claimsBadge={pendingClaimsCount}
                referralsBadge={totalReferralsCount}
            />

            <main className="flex-1 p-6 pb-24 lg:p-10 lg:pb-10 lg:pl-24">
                {currentSection === "overview" && (
                    <MemberOverview
                        member={member}
                        rankName={rankName}
                        packageName={packageName}
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
                {currentSection === "beneficiaries" && <MemberBeneficiaries member={member} />}
                {currentSection === "profile" && <MemberProfile onLogout={onLogout} user={member} onChangePassword={onChangePassword} />}
            </main>
        </div>
    );
}
