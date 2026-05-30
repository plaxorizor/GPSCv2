// admin/AdminArea.tsx
import { useState, useEffect, useMemo } from "react";
import useAuth from "../../context/useAuth";
import { Navigate } from "react-router-dom";
import AdminDashboard from "./index";
import type { Member, Claim } from "../types";
import type { DashboardStats, GrowthDataPoint, PackageMixItem, TopRecruiter, PendingCommission, CommissionRecord } from "./types";

// Mock data fetching functions - replace with your actual API calls
const fetchDashboardStats = async (): Promise<DashboardStats> => {
    return {
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
    const { currentUser: user, loading: authLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [growthData, setGrowthData] = useState<GrowthDataPoint[]>([]);
    const [packageMix, setPackageMix] = useState<PackageMixItem[]>([]);
    const [topRecruiters, setTopRecruiters] = useState<TopRecruiter[]>([]);
    const [recentClaims, setRecentClaims] = useState<Claim[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [claims, setClaims] = useState<Claim[]>([]);
    const [pendingCommissions, setPendingCommissions] = useState<PendingCommission[]>([]);
    const [commissionHistory, setCommissionHistory] = useState<CommissionRecord[]>([]);

    // Compute admin user using useMemo instead of useEffect
    const adminUser = useMemo(() => {
        if (!user) return null;

        return {
            id: user.uid,
            firstName: user.displayName?.split(" ")[0] || "Admin",
            lastName: user.displayName?.split(" ")[1] || "",
            email: user.email || "",
            phone: user.phoneNumber || "",
            role: "admin" as const,
            rankId: "national_director",
            sponsorId: null,
            packageId: null,
            memberSince: new Date().toISOString(),
            city: "",
            province: "",
            status: "active" as const,
            initials: (user.displayName?.[0] || "A").toUpperCase(),
        };
    }, [user]);

    // Fetch all data
    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                const [
                    statsData,
                    growthDataData,
                    packageMixData,
                    topRecruitersData,
                    recentClaimsData,
                    membersData,
                    claimsData,
                    pendingCommissionsData,
                    commissionHistoryData,
                ] = await Promise.all([
                    fetchDashboardStats(),
                    fetchGrowthData(),
                    fetchPackageMix(),
                    fetchTopRecruiters(),
                    fetchRecentClaims(),
                    fetchMembers(),
                    fetchClaims(),
                    fetchPendingCommissions(),
                    fetchCommissionHistory(),
                ]);
                setStats(statsData);
                setGrowthData(growthDataData);
                setPackageMix(packageMixData);
                setTopRecruiters(topRecruitersData);
                setRecentClaims(recentClaimsData);
                setMembers(membersData);
                setClaims(claimsData);
                setPendingCommissions(pendingCommissionsData);
                setCommissionHistory(commissionHistoryData);
            } catch (error) {
                console.error("Failed to fetch admin data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // Handlers
    const handleRefreshStats = async () => {
        const data = await fetchDashboardStats();
        setStats(data);
    };

    const handleRefreshMembers = async () => {
        const data = await fetchMembers();
        setMembers(data);
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

    const handleUpdateMemberStatus = async (memberId: string, status: "active" | "inactive") => {
        console.log(`Update member ${memberId} to ${status}`);
        await handleRefreshMembers();
    };

    const handleUpdateClaimStatus = async (claimId: string, status: "approved" | "rejected" | "released") => {
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
        window.location.href = "/signin";
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
    if (!user) {
        return <Navigate to="/signin" />;
    }

    // TODO: Check if user is admin from your database
    const isAdmin = true;

    if (!isAdmin) {
        return <Navigate to="/dashboard/member" />;
    }

    // Loading state for data
    if (isLoading || !stats) {
        return (
            <div className="bg-gpsc-cream flex min-h-screen items-center justify-center">
                <div className="border-gpsc-green h-12 w-12 animate-spin rounded-full border-b-2"></div>
            </div>
        );
    }

    if (!adminUser) {
        return (
            <div className="bg-gpsc-cream flex min-h-screen items-center justify-center">
                <div className="border-gpsc-green h-12 w-12 animate-spin rounded-full border-b-2"></div>
            </div>
        );
    }

    return (
        <AdminDashboard
            adminUser={adminUser}
            stats={stats}
            growthData={growthData}
            packageMix={packageMix}
            topRecruiters={topRecruiters}
            recentClaims={recentClaims}
            members={members}
            claims={claims}
            pendingCommissions={pendingCommissions}
            commissionHistory={commissionHistory}
            loading={{
                stats: isLoading,
                members: isLoading,
                claims: isLoading,
                commissions: isLoading,
            }}
            onRefreshStats={handleRefreshStats}
            onRefreshMembers={handleRefreshMembers}
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
