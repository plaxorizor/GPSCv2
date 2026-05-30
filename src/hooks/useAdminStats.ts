import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";

interface TopRecruiter {
    uid: string;
    name: string;
    referralCount: number;
}

export interface GrowthDataPoint {
    month: string;
    members: number;
}

interface AdminStats {
    activeMembers: number;
    totalRevenue: number;
    packageCounts: { Basic: number; Family: number; Premium: number };
    pendingClaims: number;
    pendingPayouts: number;
    topRecruiters: TopRecruiter[];
    growthData: GrowthDataPoint[];
}

export default () => {
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

            const packageCounts = { Basic: 0, Family: 0, Premium: 0 };
            let totalRevenue = 0;
            let activeMembers = 0;
            const referralCount: Record<string, number> = {};

            // Build last 6 months buckets
            const now = new Date();
            const monthBuckets: Record<string, number> = {};
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
                monthBuckets[key] = 0;
            }

            for (const m of members) {
                if (m.package === "Basic") { packageCounts.Basic++; totalRevenue += 698; }
                else if (m.package === "Family") { packageCounts.Family++; totalRevenue += 1698; }
                else if (m.package === "Premium") { packageCounts.Premium++; totalRevenue += 4998; }

                if (m.status === "active") activeMembers++;

                if (m.referredBy) {
                    referralCount[m.referredBy] = (referralCount[m.referredBy] ?? 0) + 1;
                }

                // Map dateCreated (Firestore Timestamp) into monthly buckets
                if (m.dateCreated) {
                    const date: Date = m.dateCreated.toDate ? m.dateCreated.toDate() : new Date(m.dateCreated);
                    const key = date.toLocaleString("default", { month: "short", year: "2-digit" });
                    if (key in monthBuckets) {
                        monthBuckets[key]++;
                    }
                }
            }

            const growthData: GrowthDataPoint[] = Object.entries(monthBuckets).map(([month, count]) => ({
                month,
                members: count,
            }));

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
                growthData,
            });
            setLoading(false);
        };
        fetch();
    }, []);

    return { stats, loading };
};