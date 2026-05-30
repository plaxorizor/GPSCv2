// firebase/admin.ts
import { 
    collection, 
    getDocs, 
    doc, 
    updateDoc, 
    addDoc, 
    serverTimestamp, 
    query, 
    where,
    orderBy,
    limit as limitQuery
} from "firebase/firestore";
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
    await updateDoc(doc(db, "commissions", commissionId), {
        status: "released",
    });
    await addDoc(collection(db, "payouts"), {
        memberId,
        amount,
        reference,
        releasedAt: serverTimestamp(),
    });
};

// --- NEW FUNCTIONS FOR ADMIN DASHBOARD ---

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
    
    const paidCommissionsSnap = await getDocs(query(collection(db, "commissions"), where("status", "==", "paid")));
    const totalCommissionsPaid = paidCommissionsSnap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
    
    return {
        totalMembers: membersSnap.size,
        activeMembers: membersSnap.docs.filter(d => d.data().status === "active").length,
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
    
    membersSnap.docs.forEach(doc => {
        const joinedAt = doc.data().joinedAt;
        if (joinedAt) {
            const date = new Date(joinedAt);
            if (date >= monthsAgo) {
                const monthKey = date.toLocaleString('default', { month: 'short' });
                monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
            }
        }
    });
    
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = now.getMonth();
    const result = [];
    
    for (let i = months - 1; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        const monthName = monthOrder[monthIndex];
        result.push({
            month: monthName,
            members: monthlyData[monthName] || 0
        });
    }
    
    return result;
};

export const getPackageDistribution = async () => {
    const membersSnap = await getDocs(collection(db, "members"));
    const distribution: Record<string, number> = {};
    
    membersSnap.docs.forEach(doc => {
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
    
    membersSnap.docs.forEach(doc => {
        const data = doc.data();
        const sponsorId = data.sponsorId;
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
    
    const topRecruiters = Object.entries(referralCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limitCount)
        .map(([id, count]) => ({
            id,
            ...memberDetails[id],
            referrals: count,
        }));
    
    return topRecruiters;
};

export const getRecentClaims = async (limitCount: number = 5) => {
    const q = query(
        collection(db, "claims"), 
        orderBy("submittedAt", "desc"), 
        limitQuery(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getCommissionHistory = async () => {
    const q = query(
        collection(db, "commissions"), 
        where("status", "in", ["paid", "released"])
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAllPayouts = async () => {
    const snapshot = await getDocs(collection(db, "payouts"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAllCommissions = async () => {
    const snapshot = await getDocs(collection(db, "commissions"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};