import { useCallback, useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import type { Member } from "../utils/types";

// One referral (a recruit and when they joined), so the dashboard can rank
// "Top Members" over any time window client-side without re-querying.
export interface ReferralEvent {
    sponsorUid: string;
    sponsorName: string;
    date: string; // ISO of the recruit's signup (dateCreated)
}

export interface GrowthDataPoint {
    month: string;
    members: number;
}

export interface PendingClaimItem {
    id: string;
    memberName: string;
    benefit: string;
    amount: number;
    status: string;
    submitted: string; // ISO date
}

interface AdminStats {
    activeMembers: number;
    pendingAccounts: number;
    totalRevenue: number;
    packageCounts: { basic: number; family: number; premium: number };
    pendingClaims: number;
    pendingPayouts: number;
    referralEvents: ReferralEvent[];
    growthData: GrowthDataPoint[];
    pendingClaimsList: PendingClaimItem[];
}

export default () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async () => {
        setLoading(true);
        try {
            const [membersSnap, claimsSnap, payoutsSnap] = await Promise.all([
                // Fetch ALL members (incl. admins) so sponsor names always resolve —
                // a recruit's sponsor can be the admin/root member. Stats below filter
                // admins back out.
                getDocs(collection(db, "members"))
                    .catch((e) => { console.error("members query failed:", e); throw e; }),
                // Pending claims = submitted or under_review (there is no "pending" status)
                getDocs(query(collection(db, "claims"), where("status", "in", ["submitted", "under_review"])))
                    .catch((e) => { console.error("claims query failed:", e); throw e; }),
                getDocs(query(collection(db, "payouts"), where("status", "==", "requested")))
                    .catch((e) => { console.error("payouts query failed:", e); throw e; }),
            ]);

            const allMembers = membersSnap.docs.map((d) => ({ uid: d.id, ...d.data() }) as Member);
            // Name lookup spans every member (admins included) so no sponsor shows "Unknown".
            const nameByUid: Record<string, string> = {};
            for (const m of allMembers) {
                nameByUid[m.uid] = `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim() || "Unknown";
            }
            // Stats (revenue, package mix, growth) count members only, not admins.
            const members = allMembers.filter((m) => !m.isAdmin);

            const packageCounts = { basic: 0, family: 0, premium: 0 };
            let totalRevenue = 0;
            let activeMembers = 0;
            let pendingAccounts = 0;

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

                    // normalise casing — Firestore may store "Basic" or "basic"
                    const pkg = m.package?.toLowerCase();
                    if (pkg === "basic") {
                        totalRevenue += 698;
                        packageCounts.basic++;
                    } else if (pkg === "family") {
                        totalRevenue += 1698;
                        packageCounts.family++;
                    } else if (pkg === "premium") {
                        totalRevenue += 4998;
                        packageCounts.premium++;
                    }
                }

                if (m.status === "pending") pendingAccounts++;

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

            // Pending claims queue — oldest first (FIFO), top 5
            const pendingClaimsList: PendingClaimItem[] = claimsSnap.docs
                .map((d) => {
                    const data = d.data();
                    return {
                        id: d.id,
                        memberName: (data.memberName as string) ?? "Unknown",
                        benefit: (data.benefit as string) ?? "",
                        amount: (data.amount as number) ?? 0,
                        status: (data.status as string) ?? "submitted",
                        submitted: data.dateSubmitted?.toDate?.()?.toISOString?.() ?? "",
                    };
                })
                .sort((a, b) => (a.submitted < b.submitted ? -1 : 1))
                .slice(0, 5);

            // One event per recruit — the dashboard ranks "Top Members" over any
            // chosen window (month / year / all-time) from these client-side.
            const referralEvents: ReferralEvent[] = allMembers
                .filter((m) => m.referredBy)
                .map((m) => ({
                    sponsorUid: m.referredBy as string,
                    sponsorName: nameByUid[m.referredBy as string] ?? "Unknown",
                    date: m.dateCreated?.toDate?.()?.toISOString?.() ?? "",
                }));

            setStats({
                activeMembers,
                pendingAccounts,
                totalRevenue,
                packageCounts,
                pendingClaims: claimsSnap.size,
                pendingPayouts: payoutsSnap.size,
                referralEvents,
                growthData,
                pendingClaimsList,
            });
        } catch (e) {
            console.error("[useAdminStats] error:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { stats, loading, refetch };
};
