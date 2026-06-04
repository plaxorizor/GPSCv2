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
    addDoc,
    setDoc,
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

export const updateClaimStatus = async (claimId: string, status: "approved" | "rejected" | "released") => {
    await updateDoc(doc(db, "claims", claimId), { status });
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

export const getAllCommissions = async () => {
    const snapshot = await getDocs(collection(db, "commissions"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
