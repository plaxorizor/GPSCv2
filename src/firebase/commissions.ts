import { doc, addDoc, getDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

export type Package = "basic" | "family" | "premium";

const PACKAGE_AMOUNTS: Record<Package, number> = {
    basic: 698,
    family: 1698,
    premium: 4998,
};

export const COMMISSION_RATES: Record<number, number> = {
    1: 0.2,
    2: 0.05,
    3: 0.03,
    4: 0.02,
    5: 0.01,
    6: 0.01,
};

// How many levels deep each package can earn commissions from
const PACKAGE_MAX_LEVELS: Record<Package, number> = {
    basic: 1,
    family: 3,
    premium: 6,
};

// Core: walk up the `fromMemberId` member's upline and create a `pending`
// commission for each upline, sized as `basisAmount × rate[level]`, capped by
// the upline's own package depth (basic 1 / family 3 / premium 6). `reason`
// distinguishes signup vs upgrade commissions on the docs.
const distributeCommissions = async (fromMemberId: string, basisAmount: number, reason: "signup" | "upgrade" | "renewal") => {
    if (!basisAmount || basisAmount <= 0) return;

    // Fetch the source member's profile once so we can denormalise name/city
    // onto every commission doc (avoids join queries on the dashboard).
    const fromMemberSnap = await getDoc(doc(db, "members", fromMemberId));
    const fromMemberData = fromMemberSnap.data();
    const fromMemberName =
        `${fromMemberData?.firstName ?? ""} ${fromMemberData?.lastName ?? ""}`.trim() || "Unknown";
    const fromMemberCity = (fromMemberData?.city as string | undefined) ?? "";

    let currentUid = fromMemberId;

    for (let level = 1; level <= 6; level++) {
        const memberSnap = await getDoc(doc(db, "members", currentUid));
        if (!memberSnap.exists()) break;

        const referredBy = memberSnap.data().referredBy as string | null;
        if (!referredBy) break;

        const uplineSnap = await getDoc(doc(db, "members", referredBy));
        if (!uplineSnap.exists()) break;

        const uplinePackage = (uplineSnap.data().package as string | null)?.toLowerCase() as Package | undefined;
        if (!uplinePackage || !PACKAGE_MAX_LEVELS[uplinePackage]) break;

        // Upline's package determines how deep they can earn
        if (level <= PACKAGE_MAX_LEVELS[uplinePackage]) {
            const amount = basisAmount * COMMISSION_RATES[level];
            await addDoc(collection(db, "commissions"), {
                earnedBy: referredBy,
                fromMember: fromMemberId,
                fromMemberName,
                fromMemberCity,
                level,
                amount,
                status: "pending",
                reason,
                dateCreated: serverTimestamp(),
            });
        }

        currentUid = referredBy;
    }
};

// Signup/activation: commission on the full package price.
export const triggerCommissions = async (newMemberId: string, pkg: Package) => {
    const packagePrice = PACKAGE_AMOUNTS[pkg.toLowerCase() as Package];
    if (!packagePrice) return; // unknown package, bail out safely
    await distributeCommissions(newMemberId, packagePrice, "signup");
};

// Upgrade: commission on the price difference only (the original package price
// already paid commission at signup — avoids double-paying the base amount).
export const triggerUpgradeCommissions = async (memberId: string, differenceAmount: number) => {
    await distributeCommissions(memberId, differenceAmount, "upgrade");
};

// Renewal: a re-subscription at full price — commission on the full package price.
export const triggerRenewalCommissions = async (memberId: string, pkg: Package) => {
    const packagePrice = PACKAGE_AMOUNTS[pkg.toLowerCase() as Package];
    if (!packagePrice) return;
    await distributeCommissions(memberId, packagePrice, "renewal");
};
