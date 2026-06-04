import { doc, addDoc, updateDoc, getDoc, collection, serverTimestamp } from "firebase/firestore";
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

export const triggerCommissions = async (newMemberId: string, pkg: Package) => {
    // Normalise casing — Firestore may store "Basic", "basic", etc.
    const normPkg = pkg.toLowerCase() as Package;
    const packagePrice = PACKAGE_AMOUNTS[normPkg];
    if (!packagePrice) return; // unknown package, bail out safely

    let currentUid = newMemberId;

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
            const amount = packagePrice * COMMISSION_RATES[level];
            await addDoc(collection(db, "commissions"), {
                earnedBy: referredBy,
                fromMember: newMemberId,
                level,
                amount,
                status: "pending",
                dateCreated: serverTimestamp(),
            });
        }

        currentUid = referredBy;
    }
};

export const createTransaction = async (memberId: string, pkg: Package) => {
    const txRef = await addDoc(collection(db, "transactions"), {
        memberId,
        package: pkg,
        amount: PACKAGE_AMOUNTS[pkg],
        status: "pending",
        dateCreated: serverTimestamp(),
    });
    return txRef.id;
};

export const confirmTransaction = async (transactionId: string, memberId: string, pkg: Package) => {
    await updateDoc(doc(db, "transactions", transactionId), { status: "confirmed" });
    await updateDoc(doc(db, "members", memberId), { package: pkg, status: "active" });
    await triggerCommissions(memberId, pkg);
};
