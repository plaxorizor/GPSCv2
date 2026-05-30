import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import useAuth from "../context/useAuth";

interface MemberStats {
    availableToWithdraw: number;
    totalEarned: number;
    totalReferrals: number;
    activeReferrals: number;
    approvedClaimsCount: number;
    approvedClaimsTotal: number;
    recentCommissions: any[];
}


export const useMemberStats = () => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState<MemberStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        const fetch = async () => {
            const [commissionsSnap, referralsSnap, claimsSnap, payoutsSnap] = await Promise.all([
                getDocs(query(collection(db, "commissions"), where("earnedBy", "==", currentUser.uid))),
                getDocs(query(collection(db, "members"), where("referredBy", "==", currentUser.uid))),
                getDocs(query(collection(db, "claims"), where("memberId", "==", currentUser.uid), where("status", "==", "approved"))),
                getDocs(query(collection(db, "payouts"), where("memberId", "==", currentUser.uid), where("status", "==", "sent"))),
            ]);

            const commissions = commissionsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as any);
            const referrals = referralsSnap.docs.map((d) => d.data() as any);

            const totalEarned = commissions.reduce((sum: number, c: any) => sum + c.amount, 0);
            const totalSentPayouts = payoutsSnap.docs.reduce((sum, d) => sum + (d.data().amount ?? 0), 0);
            const availableToWithdraw =
                commissions.filter((c: any) => c.status === "released").reduce((sum: number, c: any) => sum + c.amount, 0) - totalSentPayouts;

            const approvedClaims = claimsSnap.docs.map((d) => d.data() as any);

            // Recent 5 commissions sorted by date
            const recentCommissions = [...commissions].sort((a, b) => b.dateCreated?.toMillis?.() - a.dateCreated?.toMillis?.()).slice(0, 5);

            setStats({
                availableToWithdraw: Math.max(0, availableToWithdraw),
                totalEarned,
                totalReferrals: referrals.length,
                activeReferrals: referrals.filter((r) => r.status === "active").length,
                approvedClaimsCount: approvedClaims.length,
                approvedClaimsTotal: approvedClaims.reduce((sum, c) => sum + (c.amount ?? 0), 0),
                recentCommissions,
            });
            setLoading(false);
        };
        fetch();
    }, [currentUser]);

    return { stats, loading };
};
