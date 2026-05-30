// admin/index.tsx
import { useState } from "react";
import { LayoutGrid, Users, FileText, DollarSign, Database } from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";
import { Overview } from "./Overview";
import { Members } from "./Members";
import { Claims } from "./Claims";
import { Commissions } from "./Commissions";
import type { Member } from "../types";
import type { DashboardStats, PendingCommission, CommissionRecord } from "./types";
import type { Claim } from "../types";

interface AdminDashboardProps {
    adminUser: Member;
    stats: DashboardStats;
    recentClaims: Claim[];
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
    onRefreshMembers: () => void;
    onRefreshClaims: () => void;
    onRefreshCommissions: () => void;
    onUpdateMemberStatus: (memberId: string, status: "active" | "inactive") => Promise<void>;
    onUpdateClaimStatus: (claimId: string, status: "approved" | "rejected" | "released") => Promise<void>;
    onReviewClaim: (claimId: string) => Promise<void>;
    onReleaseCommission: (commissionId: string, earnedBy: string, amount: number, reference: string) => Promise<void>;
    onExportMembers: () => void;
    onExportClaims: () => void;
    onLogout: () => void;
}

export default function AdminDashboard({
    adminUser,
    recentClaims,
    claims,
    pendingCommissions,
    commissionHistory,
    loading,
    onRefreshStats,
    onRefreshMembers,
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
        { id: "database", label: "Database", icon: Database, badge: null },
    ];

    const rankName = "Administrator";

    return (
        <div className="gpsc-cream font-body flex min-h-screen">
            <DashboardSidebar
                user={adminUser}
                rankName={rankName}
                currentSection={currentSection}
                onSectionChange={setCurrentSection}
                items={sidebarItems}
                onLogout={onLogout}
            />
            <main className="max-w-6xl flex-1 p-6 lg:p-10">
                {currentSection === "overview" && <Overview loading={loading.stats || false} onRefresh={onRefreshStats} />}
                {currentSection === "members" && (
                    <Members
                        loading={loading.members || false}
                        onUpdateStatus={onUpdateMemberStatus}
                        onRefresh={onRefreshMembers}
                        onExport={onExportMembers}
                    />
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

            {/* Add global animation styles */}
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
