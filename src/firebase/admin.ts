import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp, query, where } from "firebase/firestore";
import { db } from "./config";

// --- MEMBERS ---
export const getAllMembers = async () => {
    const snap = await getDocs(collection(db, "members"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateMemberStatus = async (uid: string, status: "active" | "inactive" | "pending") => {
    await updateDoc(doc(db, "members", uid), { status });
};

// --- CLAIMS ---
export const getAllClaims = async () => {
    const snap = await getDocs(collection(db, "claims"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateClaimStatus = async (claimId: string, status: "approved" | "rejected" | "released") => {
    await updateDoc(doc(db, "claims", claimId), { status });
};

// --- COMMISSIONS ---
export const getPendingCommissions = async () => {
    const q = query(collection(db, "commissions"), where("status", "==", "pending"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const releaseCommission = async (commissionId: string, memberId: string, amount: number, reference: string) => {
    // 1. Mark commission as released
    await updateDoc(doc(db, "commissions", commissionId), {
        status: "released",
    });

    // 2. Create payout record
    await addDoc(collection(db, "payouts"), {
        memberId,
        amount,
        reference,
        releasedAt: serverTimestamp(),
    });
};
