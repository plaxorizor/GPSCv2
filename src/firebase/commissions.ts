import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

type Package = "basic" | "family" | "premium";

// Commission amounts per level per package
const COMMISSION_TABLE: Record<Package, Record<number, number>> = {
    basic: { 1: 100, 2: 50, 3: 30, 4: 20, 5: 15, 6: 10 },
    family: { 1: 250, 2: 125, 3: 75, 4: 50, 5: 38, 6: 25 },
    premium: { 1: 750, 2: 375, 3: 225, 4: 150, 5: 113, 6: 75 },
};

export const triggerCommissions = async (newMemberId: string, pkg: Package) => {
    const commissions = COMMISSION_TABLE[pkg];
    let currentUid = newMemberId;

    for (let level = 1; level <= 6; level++) {
        // Get current member's doc to find who referred them
        const memberSnap = await getDoc(doc(db, "members", currentUid));
        if (!memberSnap.exists()) break;

        const referredBy = memberSnap.data().referredBy as string | null;
        if (!referredBy) break; // no more upline, stop

        // Write commission record for the upline member
        await addDoc(collection(db, "commissions"), {
            earnedBy: referredBy,
            fromMember: newMemberId,
            level,
            amount: commissions[level],
            status: "pending",
            createdAt: serverTimestamp(),
        });

        // Move one level up
        currentUid = referredBy;
    }
};
