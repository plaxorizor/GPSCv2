// pages/member/MemberArea.tsx
import { Navigate } from "react-router-dom";
import useMember from "../../hooks/useMember";
import { useCommissions } from "../../hooks/useCommissions";
import { useReferralTree } from "../../hooks/useReferralTree";
import MemberDashboard from "./index";
import type { User, Package, Commission, ReferralNode, EarningsTrendPoint, Claim, Payout, Beneficiary } from "./types";

const generateReferralLink = (uid: string) => `${window.location.origin}/signup?ref=${uid}`;

// Rank mapping based on rank number
const getRankName = (rank: number): string => {
  const ranks: Record<number, string> = {
    0: "Sales Consultant",
    1: "Team Consultant", 
    2: "Sales Manager",
    3: "Provincial Director",
    4: "Regional Director",
    5: "National Director",
  };
  return ranks[rank] || "Member";
};

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

  // 1. Build User object using the actual Member type
  const user: User = {
    id: member.uid,
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    phone: member.mobile, // mobile field maps to phone
    role: "member",
    rankId: getRankName(member.rank),
    sponsorId: member.referredBy || null,
    packageId: member.package,
    memberSince: member.dateCreated.toISOString(),
    city: member.city,
    province: member.province,
    status: member.status === "pending" ? "pending_kyc" : member.status === "active" ? "active" : "inactive",
    initials: `${member.firstName[0]}${member.lastName[0]}`.toUpperCase(),
  };

  // 2. Build Package object
  let packageData: Package | null = null;
  if (member.package) {
    const packagePrices: Record<string, number> = { basic: 698, family: 1698, premium: 4998 };
    const packageNames: Record<string, string> = { basic: "Basic Care", family: "Family Care", premium: "Premium Care" };
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
    status: c.status === "released" ? "paid" : (c.status as Commission["status"]) || "pending",
    date: c.dateCreated instanceof Date
      ? c.dateCreated.toISOString()
      : typeof c.dateCreated === "string"
        ? c.dateCreated
        : new Date().toISOString(),
    fromMemberName: (c as { fromMember?: string }).fromMember || (c as { fromMemberName?: string }).fromMemberName || "",
    fromMemberCity: (c as { fromMemberCity?: string }).fromMemberCity || "",
  }));

  // 4. Map TreeNode[] → ReferralNode[]
  const mapTreeToReferralNodes = (nodes: typeof tree, depth: number = 0): ReferralNode[] =>
    nodes.map((node) => {
      const nodeData = node as {
        uid?: string;
        id?: string;
        fullName?: string;
        firstName?: string;
        lastName?: string;
        package?: string;
        packageName?: string;
        city?: string;
        memberSince?: string;
        status?: string;
        children?: typeof tree;
      };
      
      const fullName = nodeData.fullName || `${nodeData.firstName || ""} ${nodeData.lastName || ""}`;
      const parts = (fullName ?? "").trim().split(" ");
      const firstName = parts[0] ?? "";
      const lastName = parts.slice(1).join(" ") || "";
      const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "?";
      return {
        id: nodeData.uid || nodeData.id || "",
        firstName,
        lastName,
        initials,
        packageName: nodeData.package || nodeData.packageName || "",
        city: nodeData.city || "",
        memberSince: nodeData.memberSince || "",
        status: nodeData.status ?? "active",
        level: depth,
        commissionRate: 0,
        downline: mapTreeToReferralNodes(nodeData.children ?? [], depth + 1),
      };
    });

  const directReferrals: ReferralNode[] = mapTreeToReferralNodes(tree);

  // 5. Referral link
  const referralLink = generateReferralLink(member.uid);

  // 6. Empty typed arrays for now
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

  // Build rank data from member.rank
  const rankData = {
    id: `rank_${member.rank}`,
    name: getRankName(member.rank),
    rate: 20 - (member.rank * 3), // Example rate calculation
    level: member.rank + 1,
  };

  return (
    <MemberDashboard
      user={user}
      packageData={packageData}
      rankData={rankData}
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