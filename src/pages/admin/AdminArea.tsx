// admin/AdminArea.tsx
import useAuth from "../../context/useAuth";
import { Navigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";

import {
    activateMember,
    deactivateMember,
    markPayoutSent,
    rejectPayout,
    setClaimUnderReview,
    updateClaimStatus,
} from "../../firebase/admin";
import useAdminCommissions from "../../hooks/useAdminCommissions";
import useAdminPayouts from "../../hooks/useAdminPayouts";
import useAdminClaims from "../../hooks/useAdminClaims";

export default function AdminArea() {
    const { currentUser, loading: authLoading } = useAuth();

    const {
        pendingCommissions,
        commissionHistory,
        loading: commissionsLoading,
        refreshing: commissionsRefreshing,
        refetch: refetchCommissions,
    } = useAdminCommissions();

    const {
        payouts,
        loading: payoutsLoading,
        refreshing: payoutsRefreshing,
        refetch: refetchPayouts,
    } = useAdminPayouts();

    const {
        claims,
        loading: claimsLoading,
        refreshing: claimsRefreshing,
        refetch: refetchClaims,
    } = useAdminClaims();

    // Handlers
    const handleRefreshClaims = async () => {
        await refetchClaims();
    };

    const handleUpdateMemberStatus = async (memberId: string, status: string) => {
        if (status === "active") await activateMember(memberId);
        if (status === "inactive") await deactivateMember(memberId);
    };

    const handleUpdateClaimStatus = async (claimId: string, status: "Approved" | "Rejected" | "Released") => {
        const map = { Approved: "approved", Rejected: "rejected", Released: "released" } as const;
        await updateClaimStatus(claimId, map[status]);
        await refetchClaims();
    };

    const handleReviewClaim = async (claimId: string) => {
        await setClaimUnderReview(claimId);
        await refetchClaims();
    };

    const handleMarkPayoutSent = async (payoutId: string, reference: string) => {
        await markPayoutSent(payoutId, reference);
        await refetchPayouts();
        await refetchCommissions(); // covered commissions become "paid"
    };

    const handleRejectPayout = async (payoutId: string, reason: string) => {
        await rejectPayout(payoutId, reason);
        await refetchPayouts();
        await refetchCommissions(); // covered commissions return to "pending"
    };

    const handleExportMembers = () => {
        console.log("Export members");
    };

    const handleExportClaims = () => {
        console.log("Export claims");
    };

    const handleLogout = async () => {
        const { getAuth, signOut } = await import("firebase/auth");
        await signOut(getAuth());
        return <Navigate to="/" />;
    };

    // Check auth loading
    if (authLoading) {
        return (
            <div className="bg-fsc-cream flex min-h-screen items-center justify-center">
                <div className="border-fsc-green h-12 w-12 animate-spin rounded-full border-b-2"></div>
            </div>
        );
    }

    // Check if user exists
    if (!currentUser) {
        return <Navigate to="/" />;
    }

    return (
        <AdminDashboard
            claims={claims}
            pendingCommissions={pendingCommissions}
            commissionHistory={commissionHistory}
            payouts={payouts}
            loading={{
                stats: false,
                members: false,
                claims: claimsLoading,
                commissions: commissionsLoading,
                payouts: payoutsLoading,
            }}
            refreshing={{
                claims: claimsRefreshing,
                commissions: commissionsRefreshing,
                payouts: payoutsRefreshing,
            }}
            onRefreshClaims={handleRefreshClaims}
            onRefreshCommissions={refetchCommissions}
            onRefreshPayouts={refetchPayouts}
            onUpdateMemberStatus={handleUpdateMemberStatus}
            onUpdateClaimStatus={handleUpdateClaimStatus}
            onReviewClaim={handleReviewClaim}
            onMarkPayoutSent={handleMarkPayoutSent}
            onRejectPayout={handleRejectPayout}
            onExportMembers={handleExportMembers}
            onExportClaims={handleExportClaims}
            onLogout={handleLogout}
        />
    );
}
