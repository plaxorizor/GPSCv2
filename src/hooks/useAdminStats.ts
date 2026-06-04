import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import type { Member } from "../utils/types";

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
    pendingAccounts: number;
    totalRevenue: number;
    packageCounts: { basic: number; family: number; premium: number };
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

            const members = membersSnap.docs.map((d) => ({ uid: d.id, ...d.data() }) as Member);

            const packageCounts = { basic: 0, family: 0, premium: 0 };
            let totalRevenue = 0;
            let activeMembers = 0;
            let pendingAccounts = 0;
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
                if (m.status === "active") {
                    activeMembers++;

                    // total revenue counts only active members
                    if (m.package === "basic") {
                        totalRevenue += 698;
                        packageCounts.basic++;
                    } else if (m.package === "family") {
                        totalRevenue += 1698;
                        packageCounts.family++;
                    } else if (m.package === "premium") {
                        totalRevenue += 4998;
                        packageCounts.premium++;
                    }
                }

                if (m.status === "pending") pendingAccounts++;

                if (m.referredBy) {
                    referralCount[m.referredBy] = (referralCount[m.referredBy] ?? 0) + 1;
                }

                // Map dateCreated (Firestore Timestamp) into monthly buckets
                if (m.dateCreated) {
                    const date: Date = m.dateCreated.toDate();
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
                    const found = members.find((m: Member) => m.uid === uid);
                    return {
                        uid,
                        name: found ? `${found.firstName} ${found.lastName}` : "Unknown",
                        referralCount: count,
                    };
                });

            setStats({
                activeMembers,
                pendingAccounts,
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
