// admin/AdminArea.tsx
import { useState, useEffect, useMemo } from "react";
import useAuth from "../../context/useAuth";
import { Navigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import type { Member, Claim } from "../../utils/types";
import type { DashboardStats, GrowthDataPoint, PackageMixItem, TopRecruiter, PendingCommission, CommissionRecord } from "../../utils/types";

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
            status: "Submitted",
            amount: 11500,
            submitted: "2025-05-20",
            decided: null,
            documents: ["Medical certificate", "Valid ID"],
        },
        {
            id: "cl2",
            userId: "u3",
            benefit: "Calamity assistance",
            status: "Under Review",
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
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [claims, setClaims] = useState<Claim[]>([]);
    const [pendingCommissions, setPendingCommissions] = useState<PendingCommission[]>([]);
    const [commissionHistory, setCommissionHistory] = useState<CommissionRecord[]>([]);

    // Compute admin user using useMemo instead of useEffect
    const adminUser = useMemo(() => {
        if (!currentUser) return null;

        return {
            uid: currentUser.uid,
            firstName: currentUser.displayName?.split(" ")[0] || "Admin",
            lastName: currentUser.displayName?.split(" ")[1] || "",
            email: currentUser.email || "",
            mobile: currentUser.phoneNumber || "",
            birthDate: new Date().toISOString(),
            civilStatus: "Single" as const,
            city: "",
            province: "",
            package: "Basic" as const,
            status: "Active" as const,
            referralCode: "",
            referredBy: "",
            beneficiaries: [],
            isAdmin: true,
            dateCreated: new Date(),
            initials: (currentUser.displayName?.[0] || "A").toUpperCase(),
        };
    }, [currentUser]);

    // Fetch all data
    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                const [statsData] = await Promise.all([
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

    const handleRefreshClaims = async () => {
        const data = await fetchClaims();
        setClaims(data);
    };

    const handleRefreshCommissions = async () => {
        const [pending, history] = await Promise.all([fetchPendingCommissions(), fetchCommissionHistory()]);
        setPendingCommissions(pending);
        setCommissionHistory(history);
    };

    const handleUpdateMemberStatus = async (memberId: string, status: "Active" | "Inactive") => {
        console.log(`Update member ${memberId} to ${status}`);
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

    // Loading state for data
    if (isLoading || !stats || !adminUser) {
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
