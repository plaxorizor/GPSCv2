// admin/index.tsx
import { useState } from "react";
import { LayoutGrid, Users, FileText, DollarSign, Database } from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";
import { Overview } from "./Overview";
import { Members } from "./Members";
import { Claims } from "./Claims";
import { Commissions } from "./Commissions";
import { DatabaseViewer } from "./DatabaseViewer";
import type { User } from "../member/types";
import type { DashboardStats, GrowthDataPoint, PackageMixItem, TopRecruiter, PendingCommission, CommissionRecord } from "./types";
import type { Claim } from "../member/types";


interface AdminDashboardProps {
  adminUser: User;
  stats: DashboardStats;
  growthData: GrowthDataPoint[];
  packageMix: PackageMixItem[];
  topRecruiters: TopRecruiter[];
  recentClaims: Claim[];
  members: User[];
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
  onUpdateMemberStatus: (memberId: string, status: 'active' | 'inactive') => Promise<void>;
  onUpdateClaimStatus: (claimId: string, status: 'approved' | 'rejected' | 'released') => Promise<void>;
  onReviewClaim: (claimId: string) => Promise<void>;
  onReleaseCommission: (commissionId: string, earnedBy: string, amount: number, reference: string) => Promise<void>;
  onExportMembers: () => void;
  onExportClaims: () => void;
  onLogout: () => void;
}

export default function AdminDashboard({
  adminUser,
  stats,
  growthData,
  packageMix,
  topRecruiters,
  recentClaims,
  members,
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

  const pendingClaimsCount = claims.filter(c => c.status === "submitted" || c.status === "under_review").length;
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
    <div className="flex min-h-screen gpsc-cream font-body">
      <DashboardSidebar
        user={adminUser}
        rankName={rankName}
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        items={sidebarItems}
        onLogout={onLogout}
      />
      <main className="flex-1 p-6 lg:p-10 max-w-6xl">
        {currentSection === "overview" && (
          <Overview
            stats={stats}
            growthData={growthData}
            packageMix={packageMix}
            topRecruiters={topRecruiters}
            recentClaims={recentClaims}
            loading={loading.stats || false}
            onRefresh={onRefreshStats}
          />
        )}
        {currentSection === "members" && (
          <Members
            members={members}
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
        {currentSection === "database" && (
          <DatabaseViewer
            members={members}
            claims={claims}
            commissions={commissionHistory}
            payouts={[]}
            loading={loading}
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