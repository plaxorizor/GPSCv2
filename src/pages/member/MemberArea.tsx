import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

import useMember from "../../hooks/useMember";
import useMemberStats from "../../hooks/useMemberStats";
import { useCommissions } from "../../hooks/useCommissions";
import { useReferralTree } from "../../hooks/useReferralTree";
import { usePayouts } from "../../hooks/usePayouts";
import { useMemberClaims } from "../../hooks/useMemberClaims";
import MemberDashboard from "./MemberDashboard";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import RequestPayoutModal from "../../components/RequestPayoutModal";
import FileClaimModal from "../../components/FileClaimModal";
import { PACKAGE_INFO } from "../../utils/types";
import { rankFromChildren, rankName } from "../../utils/rank";
import type { Member, Commission, ReferralNode } from "../../utils/types";

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
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showRequestPayout, setShowRequestPayout] = useState(false);
    const [showFileClaim, setShowFileClaim] = useState(false);
    const [pwChanged, setPwChanged] = useState(false);

    const { member, loading: memberLoading } = useMember();
    const { stats: memberStats, loading: statsLoading } = useMemberStats();

    // Only fetch when the member actually visits that section
    const { commissions: rawCommissions } = useCommissions(currentSection === "earnings");
    const { tree } = useReferralTree(currentSection === "referrals");
    const { payouts, refetch: refetchPayouts } = usePayouts(currentSection === "earnings");
    const { claims, refetch: refetchClaims } = useMemberClaims(currentSection === "claims");

    const isLoading = memberLoading || statsLoading;
    if (isLoading) {
        return (
            // Loading spinner
            <div className="flex h-screen items-center justify-center">
                <div className="border-fsc-navy h-12 w-12 animate-spin rounded-full border-b-2"></div>
            </div>
        );
    }

    if (!member) return <Navigate to="/" />;

    // Members encoded by an admin start with a temporary password. Block access
    // until they replace it (forced, non-dismissable modal).
    if ((member as { mustChangePassword?: boolean }).mustChangePassword === true && !pwChanged) {
        return (
            <ChangePasswordModal
                forced
                onChanged={async () => {
                    await updateDoc(doc(db, "members", member.uid), { mustChangePassword: false });
                }}
                onClose={() => setPwChanged(true)}
            />
        );
    }

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
    const packageName = pkgInfo ? pkgKey.charAt(0).toUpperCase() + pkgKey.slice(1) : (user.package ?? "—");

    // 3. Map tree — compute each node's rank bottom-up (children first, then the
    //    parent's rank from its active direct children). Recognition only.
    const commissionRates = [20, 5, 3, 2, 1, 1];
    const mapTreeToReferralNodes = (nodes: typeof tree, depth: number = 0): ReferralNode[] =>
        nodes.map((node) => {
            const downline = mapTreeToReferralNodes(node.children ?? [], depth + 1);
            const rank = rankFromChildren(downline);
            return {
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
                rank,
                rankName: rankName(rank),
                downline,
            };
        });

    const directReferrals: ReferralNode[] = mapTreeToReferralNodes(tree);

    // The member's own rank comes from their active direct referrals.
    const memberRank = rankFromChildren(directReferrals);
    const memberRankName = rankName(memberRank);

    // 4. Map commissions — use the enriched fields from useCommissions
    const commissions: Commission[] = rawCommissions.map((c) => ({
        id: c.id,
        membershipId: "",
        recipientId: member.uid,
        level: c.level,
        role: memberRankName,
        amount: c.amount,
        status: c.status === "released" ? "paid" : "pending",
        date: c.dateCreated?.toDate?.()?.toISOString?.() ?? "",
        fromMember: c.fromMember,
        fromMemberName: c.fromMemberName ?? "—",
        fromMemberCity: c.fromMemberCity ?? "—",
    }));

    // 5. Referral link
    // const referralLink = `${window.location.origin}/signup?ref=${member.referralCode}`;

    // 6. Earnings trend comes from memberStats (loaded on mount); claims/payouts from hooks
    const earningsTrend = memberStats?.earningsTrend ?? [];

    // 7. Handlers
    const handleRequestPayout = () => setShowRequestPayout(true);
    const handleFileClaim = () => setShowFileClaim(true);
    const handleLogout = async () => {
        const { getAuth, signOut } = await import("firebase/auth");
        await signOut(getAuth());
        navigate("/");
    };

    return (
        <>
            {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
            {showRequestPayout && (
                <RequestPayoutModal
                    availableToWithdraw={memberStats?.availableToWithdraw ?? 0}
                    memberName={`${user.firstName} ${user.lastName}`.trim()}
                    onClose={() => setShowRequestPayout(false)}
                    onSuccess={refetchPayouts}
                />
            )}
            {showFileClaim && (
                <FileClaimModal
                    memberName={`${user.firstName} ${user.lastName}`.trim()}
                    onClose={() => setShowFileClaim(false)}
                    onSuccess={refetchClaims}
                />
            )}
            <MemberDashboard
                member={user}
                memberStats={memberStats}
                rankName={memberRankName}
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
                onChangePassword={() => setShowChangePassword(true)}
            />
        </>
    );
}
