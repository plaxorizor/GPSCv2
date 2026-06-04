// admin/AdminArea.tsx
import { useState, useEffect, useMemo } from "react";
import useAuth from "../../context/useAuth";
import { Navigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import type { Member, Claim } from "../../utils/types";
import type { DashboardStats, GrowthDataPoint, PackageMixItem, TopRecruiter, PendingCommission, CommissionRecord } from "../../utils/types";

import { activateMember, deactivateMember } from "../../firebase/admin";

import { Timestamp } from "firebase/firestore";


// Mock data fetching functions - replace with your actual API calls
const fetchDashboardStats = async (): Promise<DashboardStats> => {
    return {
        // Replace with actual API call
        activeMembers: 1247,
        totalRevenue: 1250000,
        totalCommissions: 250000,
        pendingClaims: 12,
        pendingPayouts: 8,
        avgClaimTimeDays: 4.2,
        memberSatisfaction: "94%",
    };
};

const fetchGrowthData = async (): Promise<GrowthDataPoint[]> => {
    return [
        { month: "Jan", members: 45 },
        { month: "Feb", members: 52 },
        { month: "Mar", members: 61 },
        { month: "Apr", members: 74 },
        { month: "May", members: 83 },
        { month: "Jun", members: 91 },
    ];
};

const fetchPackageMix = async (): Promise<PackageMixItem[]> => {
    return [
        { name: "Basic Care", value: 450, color: "#14365C" },
        { name: "Family Care", value: 620, color: "#4A8A2C" },
        { name: "Premium Care", value: 177, color: "#2D5A85" },
    ];
};

const fetchTopRecruiters = async (): Promise<TopRecruiter[]> => {
    return [
        { id: "1", firstName: "Maria", lastName: "Dela Cruz", initials: "MD", city: "Davao City", referrals: 24 },
        { id: "2", firstName: "Juan", lastName: "Reyes", initials: "JR", city: "Tagum City", referrals: 18 },
        { id: "3", firstName: "Carmela", lastName: "Bautista", initials: "CB", city: "General Santos", referrals: 12 },
    ];
};

const fetchRecentClaims = async (): Promise<Claim[]> => {
    return [
        {
            id: "cl1",
            userId: "u1",
            benefit: "Hospital cash assistance",
            status: "submitted",
            amount: 11500,
            submitted: "2025-05-20",
            decided: null,
            documents: ["Medical certificate", "Valid ID"],
        },
        {
            id: "cl2",
            userId: "u3",
            benefit: "Calamity assistance",
            status: "under_review",
            amount: 5000,
            submitted: "2025-05-18",
            decided: null,
            documents: ["Police report", "Valid ID"],
        },
    ];
};

const fetchMembers = async (): Promise<Member[]> => {
    // Replace with actual API call
    return [];
};

const fetchClaims = async (): Promise<Claim[]> => {
    // Replace with actual API call
    return [];
};

const fetchPendingCommissions = async (): Promise<PendingCommission[]> => {
    // Replace with actual API call
    return [];
};

const fetchCommissionHistory = async (): Promise<CommissionRecord[]> => {
    // Replace with actual API call
    return [];
};

export default function AdminArea() {
    const { currentUser, loading: authLoading } = useAuth();

    const [claims, setClaims] = useState<Claim[]>([]);
    const [pendingCommissions, setPendingCommissions] = useState<PendingCommission[]>([]);
    const [commissionHistory, setCommissionHistory] = useState<CommissionRecord[]>([]);

    // Handlers
    const handleRefreshStats = async () => {
        //const data = await fetchDashboardStats();
        //setStats(data);
    };

    const handleRefreshClaims = async () => {
        const data = await fetchClaims();
        setClaims(data);
    };

    const handleRefreshCommissions = async () => {
        const [pending, history] = await Promise.all([fetchPendingCommissions(), fetchCommissionHistory()]);
        setPendingCommissions(pending);
        setCommissionHistory(history);
    };

    const handleUpdateMemberStatus = async (memberId: string, status: string) => {
        if (status === "active") await activateMember(memberId);
        if (status === "inactive") await deactivateMember(memberId);

        // refresh current changed member on the list
    };

    const handleUpdateClaimStatus = async (claimId: string, status: "Approved" | "Rejected" | "Released") => {
        console.log(`Update claim ${claimId} to ${status}`);
        await handleRefreshClaims();
    };

    const handleReviewClaim = async (claimId: string) => {
        console.log(`Start review for claim ${claimId}`);
        await handleRefreshClaims();
    };

    const handleReleaseCommission = async (commissionId: string, earnedBy: string, amount: number, reference: string) => {
        console.log(`Release commission ${commissionId} to ${earnedBy} for ${amount} with ref ${reference}`);
        await handleRefreshCommissions();
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
            <div className="bg-gpsc-cream flex min-h-screen items-center justify-center">
                <div className="border-gpsc-green h-12 w-12 animate-spin rounded-full border-b-2"></div>
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
            loading={{
                // TODO : add loading state
                stats: false,
                members: false,
                claims: false,
                commissions: false,
            }}
            onRefreshStats={handleRefreshStats}
            onRefreshClaims={handleRefreshClaims}
            onRefreshCommissions={handleRefreshCommissions}
            onUpdateMemberStatus={handleUpdateMemberStatus}
            onUpdateClaimStatus={handleUpdateClaimStatus}
            onReviewClaim={handleReviewClaim}
            onReleaseCommission={handleReleaseCommission}
            onExportMembers={handleExportMembers}
            onExportClaims={handleExportClaims}
            onLogout={handleLogout}
        />
    );
}
