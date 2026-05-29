// pages/member/MemberArea.tsx
import { Navigate } from "react-router-dom";
import useMember from "../../hooks/useMember";
import { useCommissions } from "../../hooks/useCommissions";
import { useReferralTree } from "../../hooks/useReferralTree";
import MemberDashboard from "./index";
import type { User, Package, Commission, ReferralNode, EarningsTrendPoint, Claim, Payout, Beneficiary } from "./types";

const generateReferralLink = (uid: string) => `${window.location.origin}/signup?ref=${uid}`;

export default function MemberArea() {
    const { member, loading: memberLoading } = useMember();
    const { commissions: rawCommissions, loading: commLoading } = useCommissions();
    const { tree, loading: treeLoading } = useReferralTree();

    const isLoading = memberLoading || commLoading || treeLoading;
    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">Loading your dashboard...</div>;
    }

    if (!member) {
        return <Navigate to="/signin" />;
    }

    // 1. Build User object
    const user: User = {
        id: member.uid,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone ?? "",
        role: "member",
        rankId: "",
        sponsorId: member.referredBy ?? null,
        packageId: member.package ?? null,
        memberSince: member.dateCreated instanceof Date
            ? member.dateCreated.toISOString()
            : (member.dateCreated as string) ?? "",
        city: member.city ?? "",
        province: member.province ?? "",
        status: member.status === "pending" ? "pending_kyc" : member.status,
        initials: `${member.firstName?.[0] ?? ""}${member.lastName?.[0] ?? ""}`.toUpperCase(),
    };

    // 2. Build Package object
    let packageData: Package | null = null;
    if (member.package) {
        const packagePrices: Record<string, number> = { basic: 698, family: 1698, premium: 4998 };
        const packageNames: Record<string, string> = { basic: "Basic", family: "Family", premium: "Premium" };
        packageData = {
            id: member.package,
            name: packageNames[member.package] ?? member.package,
            price: packagePrices[member.package] ?? 0,
            tagline: "",
            coverage: "",
            color: "#5DAB3A",
            benefits: [],
            commission: 0,
        };
    }

    // 3. Map raw commissions to the expected Commission shape
    const commissions: Commission[] = rawCommissions.map((c) => ({
        id: c.id,
        membershipId: "",
        recipientId: member.uid,
        level: c.level,
        role: "member",
        amount: c.amount,
        status: c.status === "released" ? "paid" : "pending" as Commission["status"],
        date: c.dateCreated instanceof Date
            ? c.dateCreated.toISOString()
            : (c.dateCreated as string) ?? "",
        fromMemberName: c.fromMember ?? "",
        fromMemberCity: "",
    }));

    // 4. Map TreeNode[] → ReferralNode[]
    const mapTreeToReferralNodes = (nodes: typeof tree, depth: number = 0): ReferralNode[] =>
        nodes.map((node) => {
            const parts = (node.fullName ?? "").trim().split(" ");
            const firstName = parts[0] ?? "";
            const lastName = parts.slice(1).join(" ") || "";
            const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "?";
            return {
                id: node.uid,
                firstName,
                lastName,
                initials,
                packageName: node.package ?? "",
                city: "",
                memberSince: "",
                status: node.status ?? "active",
                level: depth,
                commissionRate: 0,
                downline: mapTreeToReferralNodes(node.children ?? [], depth + 1),
            };
        });

    const directReferrals: ReferralNode[] = mapTreeToReferralNodes(tree);

    // 5. Referral link
    const referralLink = generateReferralLink(member.uid);

    // 6. Empty typed arrays
    const earningsTrend: EarningsTrendPoint[] = [];
    const claims: Claim[] = [];
    const payouts: Payout[] = [];
    const beneficiaries: Beneficiary[] = [];

    // 7. Handlers
    const handleCopyReferralLink = () => {
        navigator.clipboard.writeText(referralLink);
        alert("Referral link copied!");
    };

    const handleShareReferralLink = (method: "copy" | "messenger" | "whatsapp") => {
        if (method === "copy") handleCopyReferralLink();
        else if (method === "whatsapp") {
            window.open(`https://wa.me/?text=${encodeURIComponent(`Join me on GPSC! Use my referral link: ${referralLink}`)}`, "_blank");
        } else {
            alert(`Sharing via ${method} – implement later`);
        }
    };

    const handleRequestPayout = () => alert("Request payout – coming soon");
    const handleFileClaim = () => alert("File a claim – coming soon");
    const handleEditProfile = () => alert("Edit profile – coming soon");
    const handleChangePassword = () => alert("Change password – coming soon");
    const handleEnable2FA = () => alert("Enable 2FA – coming soon");
    const handleLogout = async () => {
        const { getAuth, signOut } = await import("firebase/auth");
        await signOut(getAuth());
        window.location.href = "/signin";
    };

    return (
        <MemberDashboard
            user={user}
            packageData={packageData}
            rankData={null}
            commissions={commissions}
            directReferrals={directReferrals}
            earningsTrend={earningsTrend}
            claims={claims}
            payouts={payouts}
            beneficiaries={beneficiaries}
            referralLink={referralLink}
            onCopyReferralLink={handleCopyReferralLink}
            onShareReferralLink={handleShareReferralLink}
            onRequestPayout={handleRequestPayout}
            onFileClaim={handleFileClaim}
            onEditProfile={handleEditProfile}
            onChangePassword={handleChangePassword}
            onEnable2FA={handleEnable2FA}
            onLogout={handleLogout}
        />
    );
}