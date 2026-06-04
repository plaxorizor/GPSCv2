import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import useMember from "../../hooks/useMember";
import useMemberStats from "../../hooks/useMemberStats";
import { useCommissions } from "../../hooks/useCommissions";
import { useReferralTree } from "../../hooks/useReferralTree";
import MemberDashboard from "./MemberDashboard";
import { PACKAGE_INFO } from "../../utils/types";
import type { Member, Commission, ReferralNode, EarningsTrendPoint, Claim, Payout } from "../../utils/types";

// Rank mapping based on rank number
// const getRankName = (rank: number): string => {
//     const ranks: Record<number, string> = {
//         0: "Sales Consultant",
//         1: "Team Consultant",
//         2: "Sales Manager",
//         3: "Provincial Director",
//         4: "Regional Director",
//         5: "National Director",
//     };
//     return ranks[rank] || "Member";
// };

export default function MemberArea() {
    const navigate = useNavigate();
    const [currentSection, setCurrentSection] = useState("overview");

    const { member, loading: memberLoading } = useMember();
    const { stats: memberStats, loading: statsLoading } = useMemberStats();

    // Only fetch when the member actually visits that section
    const { commissions: rawCommissions, loading: commLoading } = useCommissions(currentSection === "earnings");
    const { tree, loading: treeLoading } = useReferralTree(currentSection === "referrals");

    const isLoading = memberLoading || statsLoading;
    if (isLoading) {
        return (
            // Loading spinner
            <div className="flex h-screen items-center justify-center">
                <div className="border-gpsc-navy h-12 w-12 animate-spin rounded-full border-b-2"></div>
            </div>
        );
    }

    if (!member) return <Navigate to="/" />;

    // 1. User object — matches Member interface exactly
    const user: Member = {
        uid: member.uid,
        firstName: member.firstName,
        lastName: member.lastName,
        birthDate: member.birthDate,
        civilStatus: member.civilStatus,
        email: member.email,
        mobile: member.mobile,
        referredBy: member.referredBy ?? null,
        package: member.package ?? null,
        dateCreated: member.dateCreated,
        city: member.city,
        province: member.province,
        status: member.status,
        referralCode: member.referralCode,
        beneficiaries: member.beneficiaries ?? [],
        isAdmin: member.isAdmin ?? false,
    };

    // 2. Package display info — normalise to lowercase before lookup so
    //    "Basic" / "basic" / "BASIC" all resolve correctly
    const pkgKey = (user.package?.toLowerCase() ?? "") as keyof typeof PACKAGE_INFO;
    const pkgInfo = PACKAGE_INFO[pkgKey];
    const rankName = pkgInfo?.rank ?? "—";
    const packageName = pkgInfo ? pkgKey.charAt(0).toUpperCase() + pkgKey.slice(1) : (user.package ?? "—");

    // 3. Map commissions
    const commissions: Commission[] = rawCommissions.map((c) => ({
        id: c.id,
        membershipId: "",
        recipientId: member.uid,
        level: c.level,
        role: rankName,
        amount: c.amount,
        status: c.status === "released" ? "paid" : "pending",
        date: c.dateCreated?.toISOString?.() ?? "",
        fromMemberName: c.fromMember ?? "",
        fromMemberCity: "",
    }));

    // 4. Map tree — use firstName/lastName directly (no more fullName split)
    const commissionRates = [20, 5, 3, 2, 1, 1];
    const mapTreeToReferralNodes = (nodes: typeof tree, depth: number = 0): ReferralNode[] =>
        nodes.map((node) => ({
            id: node.uid,
            firstName: node.firstName,
            lastName: node.lastName,
            initials: `${node.firstName[0] ?? ""}${node.lastName[0] ?? ""}`.toUpperCase() || "?",
            packageName: node.package ?? "",
            city: node.city,
            memberSince: "",
            status: node.status ?? "active",
            level: depth,
            commissionRate: commissionRates[depth] ?? 0,
            downline: mapTreeToReferralNodes(node.children ?? [], depth + 1),
        }));

    const directReferrals: ReferralNode[] = mapTreeToReferralNodes(tree);

    // 5. Referral link
    // const referralLink = `${window.location.origin}/signup?ref=${member.referralCode}`;

    // 6. Typed arrays — claims/payouts/earningsTrend fetched later
    const earningsTrend: EarningsTrendPoint[] = [];
    const claims: Claim[] = [];
    const payouts: Payout[] = [];

    // 7. Handlers

    const handleRequestPayout = () => alert("Request payout – coming soon");
    const handleFileClaim = () => alert("File a claim – coming soon");
    const handleLogout = async () => {
        const { getAuth, signOut } = await import("firebase/auth");
        await signOut(getAuth());
        navigate("/");
    };

    return (
        <MemberDashboard
            member={user}
            memberStats={memberStats}
            rankName={rankName}
            packageName={packageName}
            commissions={commissions}
            directReferrals={directReferrals}
            earningsTrend={earningsTrend}
            claims={claims}
            payouts={payouts}
            currentSection={currentSection}
            onSectionChange={setCurrentSection}
            onRequestPayout={handleRequestPayout}
            onFileClaim={handleFileClaim}
            onLogout={handleLogout}
        />
    );
}
