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
import PendingActivation from "./PendingActivation";
import ExpiredMembership from "./ExpiredMembership";
import { membershipPhase } from "../../utils/membership";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import RequestPayoutModal from "../../components/RequestPayoutModal";
import FileClaimModal from "../../components/FileClaimModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { PACKAGE_INFO } from "../../utils/types";
import { rankFromChildren, rankName } from "../../utils/rank";
import { isEligible } from "../../utils/commission";
import { getClaimableBenefits } from "../../utils/eligibility";
import type { Member, Commission, ReferralNode } from "../../utils/types";

import WelcomeModal from "./Welcome";

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
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [pwChanged, setPwChanged] = useState(false);

    const { member, loading: memberLoading, refetch: refetchMember } = useMember();
    const { stats: memberStats, loading: statsLoading } = useMemberStats();

    // Only fetch when the member actually visits that section
    const { commissions: rawCommissions, refetch: refetchCommissions } = useCommissions(currentSection === "earnings");
    const { tree } = useReferralTree(currentSection === "referrals");
    const { payouts, refetch: refetchPayouts } = usePayouts(currentSection === "earnings");
    const { claims, refetch: refetchClaims } = useMemberClaims(currentSection === "claims");

    const [welcomeDismissed, setWelcomeDismissed] = useState(false);

    // One-time welcome once a member is active (i.e. an admin has activated them).
    // Derived during render (no effect) and keyed in localStorage by uid so it only
    // appears the first time.
    const showWelcome =
        member?.status === "active" &&
        !welcomeDismissed &&
        !localStorage.getItem(`fsc-welcome-${member.uid}`);

    const dismissWelcome = () => {
        if (member) localStorage.setItem(`fsc-welcome-${member.uid}`, "1");
        setWelcomeDismissed(true);
    };

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

    // Membership-lifecycle gating (derived from dates):
    //  • pending  → awaiting admin activation (golden rule)
    //  • expired  → past the 365-day term + 30-day grace; must renew
    //  • active/grace → full dashboard access (grace members get a renewal banner)
    const phase = membershipPhase(member);
    if (phase === "pending") return <PendingActivation member={member} onRecheck={refetchMember} />;
    if (phase === "expired") return <ExpiredMembership member={member} onRecheck={refetchMember} />;

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
        // Lifecycle dates — needed by the dashboard for expiry / grace / eligibility.
        dateActivated: member.dateActivated,
        dateExpiry: member.dateExpiry,
        dateEligibility: member.dateEligibility,
        dateContestabilityEnd: member.dateContestabilityEnd,
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

    // 4. Map commissions — carry the lifecycle status through (legacy "released"
    //    docs collapse to "pending" so they stay claimable).
    const commissions: Commission[] = rawCommissions.map((c) => ({
        id: c.id,
        membershipId: "",
        recipientId: member.uid,
        level: c.level,
        role: memberRankName,
        amount: c.amount,
        status: c.status === "paid" ? "paid" : c.status === "requested" ? "requested" : "pending",
        date: c.dateCreated?.toDate?.()?.toISOString?.() ?? "",
        fromMember: c.fromMember,
        fromMemberName: c.fromMemberName ?? "—",
        fromMemberCity: c.fromMemberCity ?? "—",
        reason: c.reason === "upgrade" || c.reason === "renewal" ? c.reason : "signup",
    }));

    // Claimable commissions = pending + eligible by time/level. Passed to the
    // payout modal so the member can pick which ones to withdraw.
    const claimableCommissions = commissions.filter((c) => c.status === "pending" && isEligible(c.level, c.date));

    // 5. Referral link
    // const referralLink = `${window.location.origin}/signup?ref=${member.referralCode}`;

    // 6. Earnings trend comes from memberStats (loaded on mount); claims/payouts from hooks
    const earningsTrend = memberStats?.earningsTrend ?? [];

    // 7. Handlers
    // Only active memberships can withdraw — grace/expired must renew first.
    const handleRequestPayout = () => {
        if (phase !== "active") return;
        setShowRequestPayout(true);
    };
    const handleFileClaim = () => setShowFileClaim(true);
    const handleLogout = async () => {
        setLoggingOut(true);
        const { getAuth, signOut } = await import("firebase/auth");
        await signOut(getAuth());
        navigate("/");
    };

    return (
        <>
            {showWelcome && <WelcomeModal onClose={dismissWelcome} />}
            {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
            {showRequestPayout && (
                <RequestPayoutModal
                    claimableCommissions={claimableCommissions}
                    memberName={`${user.firstName} ${user.lastName}`.trim()}
                    onClose={() => setShowRequestPayout(false)}
                    onSuccess={() => {
                        refetchPayouts();
                        refetchCommissions();
                    }}
                />
            )}
            {showFileClaim && (
                <FileClaimModal
                    memberName={`${user.firstName} ${user.lastName}`.trim()}
                    benefits={getClaimableBenefits(user.dateEligibility ?? user.dateActivated ?? user.dateCreated, user.package)}
                    onClose={() => setShowFileClaim(false)}
                    onSuccess={refetchClaims}
                />
            )}
            {showLogoutConfirm && (
                <ConfirmDialog
                    title="Log out?"
                    message="You'll need to sign in again to access your account."
                    confirmLabel="Log out"
                    danger
                    busy={loggingOut}
                    onConfirm={handleLogout}
                    onCancel={() => setShowLogoutConfirm(false)}
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
                onLogout={() => setShowLogoutConfirm(true)}
                onChangePassword={() => setShowChangePassword(true)}
                onRefreshCommissions={refetchCommissions}
                onRefreshPayouts={refetchPayouts}
            />
        </>
    );
}
