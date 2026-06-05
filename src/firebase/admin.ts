// firebase/admin.ts
// NOTE: activateMember / deactivateMember / upgradeMember currently write
// directly to Firestore. Switch to Cloud Functions (httpsCallable) once the
// Firebase project is upgraded to Blaze — functions/src/index.ts is ready.
import {
    collection,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    setDoc,
    deleteDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
    limit as limitQuery,
} from "firebase/firestore";
import { db } from "./config";
import { triggerCommissions, type Package } from "./transactions";

// --- MEMBERS ---
export const getAllMembers = async () => {
    const q = query(collection(db, "members"), where("isAdmin", "==", false));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
};

const generateReferralCode = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const segment = (len: number) =>
        Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `${segment(4)}-${segment(4)}-${segment(4)}`;
};

export const activateMember = async (uid: string) => {
    const memberSnap = await getDoc(doc(db, "members", uid));
    if (!memberSnap.exists()) return;

    const memberData = memberSnap.data();
    const now = new Date();

    const expiresAt = new Date(now);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const contestabilityEndsAt = new Date(now);
    contestabilityEndsAt.setMonth(contestabilityEndsAt.getMonth() + 1);

    const isFirstActivation = !memberData.referralCode;

    if (isFirstActivation) {
        const referralCode = generateReferralCode();
        await updateDoc(doc(db, "members", uid), {
            status: "active",
            referralCode,
            activatedAt: serverTimestamp(),
            expiresAt,
            contestabilityEndsAt,
            packageLocked: false,
        });
        await setDoc(doc(db, "referralCodes", referralCode), { uid });

        const pkg = memberData.package as Package | null;
        if (pkg) await triggerCommissions(uid, pkg);
    } else {
        await updateDoc(doc(db, "members", uid), {
            status: "active",
            activatedAt: serverTimestamp(),
            expiresAt,
            contestabilityEndsAt,
            packageLocked: false,
        });
    }
};

export const deactivateMember = async (uid: string) => {
    await updateDoc(doc(db, "members", uid), { status: "inactive" });
};

// --- ARCHIVE / DELETE (super-admin actions) ---

// Soft delete: hide the member from lists but keep tree + commission history.
// Reversible via restoreMember.
export const archiveMember = async (uid: string) => {
    await updateDoc(doc(db, "members", uid), { archived: true, archivedAt: serverTimestamp() });
};

export const restoreMember = async (uid: string) => {
    await updateDoc(doc(db, "members", uid), { archived: false, archivedAt: null });
};

// Checks whether a member is safe to hard-delete (no downlines, no commissions).
export const getMemberDependencies = async (uid: string) => {
    const [downlineSnap, earnedSnap, fromSnap] = await Promise.all([
        getDocs(query(collection(db, "members"), where("referredBy", "==", uid), limitQuery(1))),
        getDocs(query(collection(db, "commissions"), where("earnedBy", "==", uid), limitQuery(1))),
        getDocs(query(collection(db, "commissions"), where("fromMember", "==", uid), limitQuery(1))),
    ]);
    return {
        hasDownlines: !downlineSnap.empty,
        hasCommissions: !earnedSnap.empty || !fromSnap.empty,
    };
};

// Hard delete: permanently removes the member doc (+ their referral-code mapping).
// Caller MUST verify there are no dependents first (getMemberDependencies).
// NOTE: the Firebase Auth login itself can't be removed client-side on Spark —
// that needs the Admin SDK (Blaze).
export const hardDeleteMember = async (uid: string) => {
    const snap = await getDoc(doc(db, "members", uid));
    const code = snap.exists() ? (snap.data().referralCode as string | undefined) : undefined;
    if (code) {
        await deleteDoc(doc(db, "referralCodes", code)).catch(() => {});
    }
    await deleteDoc(doc(db, "members", uid));
};

// Sends a Firebase password-reset email so the member can set a new password.
// Only works for members with a REAL email. Members encoded with a synthetic
// (mobile-based) login can't receive this — that needs the Blaze/Cloud Functions
// upgrade (an Admin-SDK reset). Throws if no email.
export const sendMemberPasswordReset = async (email: string) => {
    const { getAuth, sendPasswordResetEmail } = await import("firebase/auth");
    await sendPasswordResetEmail(getAuth(), email);
};

export const upgradeMember = async (uid: string, newPackage: "family" | "premium") => {
    const memberSnap = await getDoc(doc(db, "members", uid));
    if (!memberSnap.exists()) return;

    const data = memberSnap.data();
    if (data.packageLocked) throw new Error("Package is locked. Contestability period has expired.");

    const contestabilityEndsAt = data.contestabilityEndsAt?.toDate?.();
    if (!contestabilityEndsAt || new Date() > contestabilityEndsAt) {
        await updateDoc(doc(db, "members", uid), { packageLocked: true });
        throw new Error("Contestability period has expired.");
    }

    await updateDoc(doc(db, "members", uid), { package: newPackage });
};

// --- CLAIMS ---
export const getAllClaims = async () => {
    const snap = await getDocs(collection(db, "claims"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Move a submitted claim into review (no decision recorded yet).
export const setClaimUnderReview = async (claimId: string) => {
    await updateDoc(doc(db, "claims", claimId), { status: "under_review" });
};

// Record a decision (approved/rejected/released) and stamp when it was decided.
export const updateClaimStatus = async (claimId: string, status: "approved" | "rejected" | "released") => {
    await updateDoc(doc(db, "claims", claimId), {
        status,
        decidedAt: serverTimestamp(),
    });
};

// --- COMMISSIONS ---
export const getPendingCommissions = async () => {
    const q = query(collection(db, "commissions"), where("status", "==", "pending"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const releaseCommission = async (commissionId: string, reference: string) => {
    await updateDoc(doc(db, "commissions", commissionId), {
        status: "released",
        reference,
        releasedAt: serverTimestamp(),
    });
};

// --- ADMIN DASHBOARD ---

export const getPendingClaimsCount = async (): Promise<number> => {
    const q = query(collection(db, "claims"), where("status", "==", "pending"));
    const snapshot = await getDocs(q);
    return snapshot.size;
};

export const getPendingCommissionsCount = async (): Promise<number> => {
    const q = query(collection(db, "commissions"), where("status", "==", "pending"));
    const snapshot = await getDocs(q);
    return snapshot.size;
};

export const getDashboardStats = async () => {
    const [membersSnap, claimsSnap, commissionsSnap] = await Promise.all([
        getDocs(collection(db, "members")),
        getDocs(query(collection(db, "claims"), where("status", "==", "pending"))),
        getDocs(query(collection(db, "commissions"), where("status", "==", "pending"))),
    ]);

    const paidCommissionsSnap = await getDocs(query(collection(db, "commissions"), where("status", "==", "released")));
    const totalCommissionsPaid = paidCommissionsSnap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

    return {
        totalMembers: membersSnap.size,
        activeMembers: membersSnap.docs.filter((d) => d.data().status === "active").length,
        pendingClaims: claimsSnap.size,
        pendingCommissions: commissionsSnap.size,
        totalRevenue: 0,
        totalCommissionsPaid,
    };
};

export const getMembershipGrowth = async (months: number = 6) => {
    const membersSnap = await getDocs(collection(db, "members"));
    const monthlyData: Record<string, number> = {};

    const now = new Date();
    const monthsAgo = new Date();
    monthsAgo.setMonth(now.getMonth() - months);

    membersSnap.docs.forEach((doc) => {
        const joinedAt = doc.data().joinedAt;
        if (joinedAt) {
            const date = new Date(joinedAt);
            if (date >= monthsAgo) {
                const monthKey = date.toLocaleString("default", { month: "short" });
                monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
            }
        }
    });

    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = now.getMonth();
    const result = [];

    for (let i = months - 1; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        const monthName = monthOrder[monthIndex];
        result.push({ month: monthName, members: monthlyData[monthName] || 0 });
    }

    return result;
};

export const getPackageDistribution = async () => {
    const membersSnap = await getDocs(collection(db, "members"));
    const distribution: Record<string, number> = {};

    membersSnap.docs.forEach((doc) => {
        const pkg = doc.data().package || "basic";
        distribution[pkg] = (distribution[pkg] || 0) + 1;
    });

    const colors: Record<string, string> = {
        basic: "#14365C",
        family: "#4A8A2C",
        premium: "#2D5A85",
    };

    const names: Record<string, string> = {
        basic: "Basic",
        family: "Family",
        premium: "Premium",
    };

    return Object.entries(distribution).map(([name, value]) => ({
        name: names[name] || name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: colors[name] || "#6B6862",
    }));
};

interface MemberDetails {
    firstName: string;
    lastName: string;
    city: string;
    initials: string;
}

export const getTopRecruiters = async (limitCount: number = 5) => {
    const membersSnap = await getDocs(collection(db, "members"));
    const referralCounts: Record<string, number> = {};
    const memberDetails: Record<string, MemberDetails> = {};

    membersSnap.docs.forEach((doc) => {
        const data = doc.data();
        const sponsorId = data.referredBy; // was data.sponsorId — wrong field
        if (sponsorId) {
            referralCounts[sponsorId] = (referralCounts[sponsorId] || 0) + 1;
        }
        memberDetails[doc.id] = {
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            city: data.city || "",
            initials: `${(data.firstName || "")[0]}${(data.lastName || "")[0]}`.toUpperCase(),
        };
    });

    return Object.entries(referralCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limitCount)
        .map(([id, count]) => ({ id, ...memberDetails[id], referrals: count }));
};

export const getRecentClaims = async (limitCount: number = 5) => {
    const q = query(collection(db, "claims"), orderBy("submittedAt", "desc"), limitQuery(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getCommissionHistory = async () => {
    const q = query(collection(db, "commissions"), where("status", "==", "released"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getAllPayouts = async () => {
    const snapshot = await getDocs(collection(db, "payouts"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const markPayoutSent = async (payoutId: string, reference: string) => {
    await updateDoc(doc(db, "payouts", payoutId), {
        status: "sent",
        reference,
        sentAt: serverTimestamp(),
    });
};

export const getAllCommissions = async () => {
    const snapshot = await getDocs(collection(db, "commissions"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
