import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";

interface TopRecruiter {
    uid: string;
    name: string;
    referralCount: number;
}

interface AdminStats {
    activeMembers: number;
    totalRevenue: number;
    packageCounts: { Basic: number; Family: number; Premium: number };
    pendingClaims: number;
    pendingPayouts: number;
    topRecruiters: TopRecruiter[];
}

export const useAdminStats = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            const [membersSnap, claimsSnap, payoutsSnap] = await Promise.all([
                getDocs(query(collection(db, "members"), where("isAdmin", "==", false))),
                getDocs(query(collection(db, "claims"), where("status", "==", "pending"))),
                getDocs(query(collection(db, "payouts"), where("status", "==", "requested"))),
            ]);

            const members = membersSnap.docs.map((d) => ({ uid: d.id, ...d.data() }) as any);

            // Package counts
            const packageCounts = { Basic: 0, Family: 0, Premium: 0 };
            let totalRevenue = 0;
            let activeMembers = 0;

            // Referral count per member
            const referralCount: Record<string, number> = {};

            for (const m of members) {
                // Package counts
                if (m.package === "Basic") packageCounts.Basic++;
                else if (m.package === "Family") packageCounts.Family++;
                else if (m.package === "Premium") packageCounts.Premium++;

                // Revenue
                if (m.package === "Basic") totalRevenue += 698;
                else if (m.package === "Family") totalRevenue += 1698;
                else if (m.package === "Premium") totalRevenue += 4998;

                // Active members
                if (m.status === "active") activeMembers++;

                // Count referrals
                if (m.referredBy) {
                    referralCount[m.referredBy] = (referralCount[m.referredBy] ?? 0) + 1;
                }
            }

            // Top 3 recruiters
            const topRecruiters: TopRecruiter[] = Object.entries(referralCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([uid, count]) => {
                    const found = members.find((m: any) => m.uid === uid);
                    return {
                        uid,
                        name: found ? `${found.firstName} ${found.lastName}` : "Unknown",
                        referralCount: count,
                    };
                });

            setStats({
                activeMembers,
                totalRevenue,
                packageCounts,
                pendingClaims: claimsSnap.size,
                pendingPayouts: payoutsSnap.size,
                topRecruiters,
            });
            setLoading(false);
        };
        fetch();
    }, []);

    return { stats, loading };
};
