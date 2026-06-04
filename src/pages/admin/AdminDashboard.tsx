// admin/index.tsx
import { useState } from "react";
import { LayoutGrid, Users, FileText, DollarSign } from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { Overview } from "./Overview";
import { Members } from "./Members";
import { Claims } from "./Claims";
import { Commissions } from "./Commissions";
import type { PendingCommission, CommissionRecord } from "../../utils/types";
import type { Claim } from "../../utils/types";

interface AdminDashboardProps {
    claims: Claim[];
    pendingCommissions: PendingCommission[];
    commissionHistory: CommissionRecord[];
    loading: {
        stats?: boolean;
        members?: boolean;
        claims?: boolean;
        commissions?: boolean;
    };
    onRefreshStats: () => void;
    onRefreshClaims: () => void;
    onRefreshCommissions: () => void;
    onUpdateMemberStatus: (memberId: string, status: "active" | "inactive") => Promise<void>;
    onUpdateClaimStatus: (claimId: string, status: "Approved" | "Rejected" | "Released") => Promise<void>;
    onReviewClaim: (claimId: string) => Promise<void>;
    onReleaseCommission: (commissionId: string, earnedBy: string, amount: number, reference: string) => Promise<void>;
    onExportMembers: () => void;
    onExportClaims: () => void;
    onLogout: () => void;
}

export default function AdminDashboard({
    claims,
    pendingCommissions,
    commissionHistory,
    loading,
    onRefreshStats,
    onRefreshClaims,
    onRefreshCommissions,
    onUpdateMemberStatus,
    onUpdateClaimStatus,
    onReviewClaim,
    onReleaseCommission,
    onExportMembers,
    onExportClaims,
    onLogout,
}: AdminDashboardProps) {
    const [currentSection, setCurrentSection] = useState("overview");

    const pendingClaimsCount = claims.filter((c) => c.status === "submitted" || c.status === "under_review").length;
    const pendingCommissionsCount = pendingCommissions.length;

    const sidebarItems = [
        { id: "overview", label: "Overview", icon: LayoutGrid, badge: null },
        { id: "members", label: "Members", icon: Users, badge: null },
        { id: "claims", label: "Claims", icon: FileText, badge: pendingClaimsCount },
        { id: "commissions", label: "Commissions", icon: DollarSign, badge: pendingCommissionsCount },
    ];

    return (
        <div className="gpsc-cream font-body flex min-h-screen">
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
                onLogout={onLogout}
            />

            {/* Added padding-left to account for fixed sidebar width (w-64 = 16rem = 256px) */}
            <main className="max-w-6xl flex-1 p-6 pb-24 lg:p-10 lg:pb-10 lg:pl-68">
                {currentSection === "overview" && <Overview loading={loading.stats || false} onRefresh={onRefreshStats} />}
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
                        onExport={onExportClaims}
                    />
                )}
                {currentSection === "commissions" && (
                    <Commissions
                        pendingCommissions={pendingCommissions}
                        commissionHistory={commissionHistory}
                        loading={loading.commissions || false}
                        onRelease={onReleaseCommission}
                        onRefresh={onRefreshCommissions}
                    />
                )}
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
