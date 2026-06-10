import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc, type Timestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import useAuth from "../context/useAuth";
import type { MemberStats, EarningsTrendPoint } from "../utils/types";
import { isEligible } from "../utils/commission";

// Minimal shapes for the Firestore docs this hook reads.
interface CommissionRow {
    id: string;
    fromMember?: string;
    fromMemberName?: string;
    status?: string;
    amount?: number;
    level?: number;
    dateCreated?: Timestamp;
}
interface ReferralRow {
    status?: string;
}
interface ClaimRow {
    amount?: number;
}

const useMemberStats = () => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState<MemberStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        const fetch = async () => {
            const [commissionsSnap, referralsSnap, claimsSnap] = await Promise.all([
                getDocs(query(collection(db, "commissions"), where("earnedBy", "==", currentUser.uid))),
                getDocs(query(collection(db, "members"), where("referredBy", "==", currentUser.uid))),
                getDocs(query(collection(db, "claims"), where("memberId", "==", currentUser.uid), where("status", "==", "approved"))),
            ]);

            const commissions = commissionsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as CommissionRow);
            const referrals = referralsSnap.docs.map((d) => d.data() as ReferralRow);

            // Enrich legacy docs missing fromMemberName — look up by fromMember UID
            const missingUids = [
                ...new Set(
                    commissions
                        .filter((c) => !c.fromMemberName && typeof c.fromMember === "string" && c.fromMember.length > 0)
                        .map((c) => c.fromMember as string),
                ),
            ];
            if (missingUids.length > 0) {
                const snaps = await Promise.all(missingUids.map((uid) => getDoc(doc(db, "members", uid))));
                const nameMap = new Map<string, string>();
                snaps.forEach((snap) => {
                    if (snap.exists()) {
                        const d = snap.data();
                        nameMap.set(snap.id, `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim());
                    }
                });
                commissions.forEach((c) => {
                    if (!c.fromMemberName && c.fromMember && nameMap.has(c.fromMember)) {
                        c.fromMemberName = nameMap.get(c.fromMember);
                    }
                });
            }

            // "Earned" = commissions already PAID out (money received).
            const totalEarned = commissions
                .filter((c) => c.status === "paid")
                .reduce((sum, c) => sum + (c.amount ?? 0), 0);

            // Claimable now = commissions not yet requested/paid AND eligible by
            // time/level (L1 immediately, L2–6 after 7 days). Legacy "released"
            // docs still count as claimable.
            const claimable = (c: CommissionRow) => c.status !== "requested" && c.status !== "paid";
            const availableToWithdraw = commissions
                .filter((c) => claimable(c) && isEligible(c.level ?? 0, c.dateCreated))
                .reduce((sum, c) => sum + (c.amount ?? 0), 0);

            const approvedClaims = claimsSnap.docs.map((d) => d.data() as ClaimRow);

            // Recent 5 commissions sorted by date
            const recentCommissions = [...commissions]
                .sort((a, b) => (b.dateCreated?.toMillis?.() ?? 0) - (a.dateCreated?.toMillis?.() ?? 0))
                .slice(0, 5);

            // Earnings trend — total commissions earned per month, last 6 months
            const now = new Date();
            const trendBuckets: { key: string; month: string; amount: number }[] = [];
            const trendIndex: Record<string, number> = {};
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${d.getFullYear()}-${d.getMonth()}`;
                trendIndex[key] = trendBuckets.length;
                trendBuckets.push({ key, month: d.toLocaleString("default", { month: "short" }), amount: 0 });
            }
            for (const c of commissions) {
                const dt: Date | undefined = c.dateCreated?.toDate?.();
                if (!dt) continue;
                const idx = trendIndex[`${dt.getFullYear()}-${dt.getMonth()}`];
                if (idx !== undefined) trendBuckets[idx].amount += c.amount ?? 0;
            }
            const earningsTrend: EarningsTrendPoint[] = trendBuckets.map((b) => ({ month: b.month, amount: b.amount }));

            setStats({
                availableToWithdraw: Math.max(0, availableToWithdraw),
                totalEarned,
                totalReferrals: referrals.length,
                activeReferrals: referrals.filter((r) => r.status === "active").length,
                approvedClaimsCount: approvedClaims.length,
                approvedClaimsTotal: approvedClaims.reduce((sum, c) => sum + (c.amount ?? 0), 0),
                // Runtime docs are the raw Firestore shape; the dashboard reads them loosely.
                recentCommissions: recentCommissions as unknown as MemberStats["recentCommissions"],
                earningsTrend,
            });
            setLoading(false);
        };
        fetch();
    }, [currentUser]);

    return { stats, loading };
};
export default useMemberStats;