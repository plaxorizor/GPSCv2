// admin/index.tsx
import { useState } from "react";
import { LayoutGrid, Users, FileText, DollarSign, Wallet, Settings as SettingsIcon } from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { Overview } from "./Overview";
import { Members } from "./Members";
import { Claims } from "./Claims";
import { Commissions } from "./Commissions";
import { Payouts } from "./Payouts";
import { Settings } from "./Settings";
import type { PendingCommission, CommissionRecord, AdminPayout } from "../../utils/types";
import type { Claim } from "../../utils/types";

interface AdminDashboardProps {
    claims: Claim[];
    pendingCommissions: PendingCommission[];
    commissionHistory: CommissionRecord[];
    payouts: AdminPayout[];
    loading: {
        stats?: boolean;
        members?: boolean;
        claims?: boolean;
        commissions?: boolean;
        payouts?: boolean;
    };
    refreshing?: {
        claims?: boolean;
        commissions?: boolean;
        payouts?: boolean;
    };
    onRefreshClaims: () => void;
    onRefreshCommissions: () => void;
    onRefreshPayouts: () => void;
    onUpdateMemberStatus: (memberId: string, status: "active" | "inactive") => Promise<void>;
    onUpdateClaimStatus: (claimId: string, status: "Approved" | "Rejected" | "Released") => Promise<void>;
    onReviewClaim: (claimId: string) => Promise<void>;
    onMarkPayoutSent: (payoutId: string, reference: string) => Promise<void>;
    onRejectPayout: (payoutId: string, reason: string) => Promise<void>;
    onExportMembers: () => void;
    onExportClaims: () => void;
    onLogout: () => void;
}

export default function AdminDashboard({
    claims,
    pendingCommissions,
    commissionHistory,
    payouts,
    loading,
    refreshing,
    onRefreshClaims,
    onRefreshCommissions,
    onRefreshPayouts,
    onUpdateMemberStatus,
    onUpdateClaimStatus,
    onReviewClaim,
    onMarkPayoutSent,
    onRejectPayout,
    onExportMembers,
    onExportClaims,
    onLogout,
}: AdminDashboardProps) {
    const [currentSection, setCurrentSection] = useState("overview");

    const pendingClaimsCount = claims.filter((c) => c.status === "submitted" || c.status === "under_review").length;
    const pendingCommissionsCount = pendingCommissions.length;
    const pendingPayoutsCount = payouts.filter((p) => p.status === "requested").length;

    const sidebarItems = [
        { id: "overview",     label: "Overview",     icon: LayoutGrid, badge: null },
        { id: "members",      label: "Members",      icon: Users,      badge: null },
        { id: "claims",       label: "Claims",       icon: FileText,   badge: pendingClaimsCount },
        { id: "commissions",  label: "Commissions",  icon: DollarSign, badge: pendingCommissionsCount },
        { id: "payouts",      label: "Payouts",      icon: Wallet,     badge: pendingPayoutsCount },
        { id: "settings",     label: "Settings",     icon: SettingsIcon, badge: null },
    ];

    return (
        <div className="fsc-cream font-body flex min-h-screen">
            <DashboardSidebar
                currentSection={currentSection}
                onSectionChange={setCurrentSection}
                items={sidebarItems}
                onLogout={onLogout}
            />

            <MobileBottomNav
                current={currentSection}
                onChange={setCurrentSection}
                claimsBadge={pendingClaimsCount}
                commissionsBadge={pendingCommissionsCount}
                payoutsBadge={pendingPayoutsCount}
                onLogout={onLogout}
            />

            {/* pl clears the COLLAPSED sidebar (4rem). It expands as an overlay on
                hover, so we only reserve the collapsed width. No max-width: fill the
                screen instead of leaving a big empty gap on wide monitors. */}
            <main className="flex-1 p-6 pb-24 lg:p-10 lg:pb-10 lg:pl-24">
                {currentSection === "overview" && <Overview loading={loading.stats || false} />}
                {currentSection === "members" && (
                    <Members onUpdateStatus={onUpdateMemberStatus} onExport={onExportMembers} />
                )}
                {currentSection === "claims" && (
                    <Claims
                        claims={claims}
                        loading={loading.claims || false}
                        onUpdateStatus={onUpdateClaimStatus}
                        onReviewClaim={onReviewClaim}
                        onRefresh={onRefreshClaims}
                        refreshing={refreshing?.claims || false}
                        onExport={onExportClaims}
                    />
                )}
                {currentSection === "commissions" && (
                    <Commissions
                        pendingCommissions={pendingCommissions}
                        commissionHistory={commissionHistory}
                        loading={loading.commissions || false}
                        onRefresh={onRefreshCommissions}
                        refreshing={refreshing?.commissions || false}
                    />
                )}
                {currentSection === "payouts" && (
                    <Payouts
                        payouts={payouts}
                        loading={loading.payouts || false}
                        onMarkSent={onMarkPayoutSent}
                        onReject={onRejectPayout}
                        onRefresh={onRefreshPayouts}
                        refreshing={refreshing?.payouts || false}
                    />
                )}
                {currentSection === "settings" && <Settings />}
            </main>

            <style>{`
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-up {
                    animation: fade-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
