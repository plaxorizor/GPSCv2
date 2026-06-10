import { useEffect, useState, useCallback } from "react";
import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import type { PendingCommission, CommissionRecord } from "../utils/types";

const useAdminCommissions = () => {
    const [pendingCommissions, setPendingCommissions] = useState<PendingCommission[]>([]);
    const [commissionHistory, setCommissionHistory] = useState<CommissionRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // First statement is the network await, so no state is set synchronously when
    // this runs from the mount effect (avoids cascading renders). `loading` starts
    // true for the initial skeleton; the manual `refetch` flips `refreshing`.
    const fetchCommissions = useCallback(async () => {
        try {
            const [pendingSnap, paidSnap] = await Promise.all([
                getDocs(query(collection(db, "commissions"), where("status", "==", "pending"))),
                getDocs(query(collection(db, "commissions"), where("status", "==", "paid"))),
            ]);

            // Batch-fetch member names for all earnedBy UIDs
            // Filter out any docs with missing/null earnedBy to avoid Firestore path errors
            const allDocs = [...pendingSnap.docs, ...paidSnap.docs];
            const uniqueUids = [
                ...new Set(
                    allDocs
                        .map((d) => d.data().earnedBy as string | undefined)
                        .filter((uid): uid is string => typeof uid === "string" && uid.length > 0),
                ),
            ];
            const memberMap = new Map<string, string>();
            const codeMap = new Map<string, string>();

            for (let i = 0; i < uniqueUids.length; i += 10) {
                const chunk = uniqueUids.slice(i, i + 10);
                const snaps = await Promise.all(chunk.map((uid) => getDoc(doc(db, "members", uid))));
                snaps.forEach((snap) => {
                    if (snap.exists()) {
                        const d = snap.data();
                        memberMap.set(snap.id, `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim());
                        if (typeof d.referralCode === "string" && d.referralCode.length > 0) {
                            codeMap.set(snap.id, d.referralCode);
                        }
                    }
                });
            }

            const pending: PendingCommission[] = pendingSnap.docs
                .filter((d) => typeof d.data().earnedBy === "string" && d.data().earnedBy.length > 0)
                .map((d) => {
                    const data = d.data();
                    const earnedBy = data.earnedBy as string;
                    return {
                        id: d.id,
                        membershipId: "",
                        recipientId: earnedBy,
                        recipientName: memberMap.get(earnedBy) ?? earnedBy,
                        recipientReferralCode: codeMap.get(earnedBy) ?? "",
                        fromMemberName: (data.fromMemberName as string | undefined) ?? "—",
                        level: data.level as number,
                        amount: data.amount as number,
                        date: data.dateCreated?.toDate?.()?.toISOString?.() ?? "",
                        reason: data.reason === "upgrade" || data.reason === "renewal" ? data.reason : "signup",
                    };
                });
            pending.sort((a, b) => (b.date > a.date ? 1 : -1));

            const history: CommissionRecord[] = paidSnap.docs
                .filter((d) => typeof d.data().earnedBy === "string" && d.data().earnedBy.length > 0)
                .map((d) => {
                    const data = d.data();
                    const earnedBy = data.earnedBy as string;
                    return {
                        id: d.id,
                        membershipId: "",
                        recipientId: earnedBy,
                        recipientName: memberMap.get(earnedBy) ?? earnedBy,
                        recipientReferralCode: codeMap.get(earnedBy) ?? "",
                        fromMemberName: (data.fromMemberName as string | undefined) ?? "—",
                        fromMemberCity: (data.fromMemberCity as string | undefined) ?? "",
                        level: data.level as number,
                        role: "",
                        amount: data.amount as number,
                        status: "paid" as const,
                        date: data.dateCreated?.toDate?.()?.toISOString?.() ?? "",
                        reference: (data.reference as string | undefined) ?? null,
                        reason: data.reason === "upgrade" || data.reason === "renewal" ? data.reason : "signup",
                    };
                });
            history.sort((a, b) => (b.date > a.date ? 1 : -1));

            setPendingCommissions(pending);
            setCommissionHistory(history);
        } catch (err) {
            console.error("[useAdminCommissions] error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Live-watch only the "pending" commissions subset. onSnapshot fires immediately
    // on subscribe (the initial load) and again whenever a commission is generated or
    // changes status — each emission re-pulls. One subscription covers both first
    // load and live updates, keeping every setState inside a callback (never the
    // synchronous effect body).
    useEffect(() => {
        const q = query(collection(db, "commissions"), where("status", "==", "pending"));
        const unsub = onSnapshot(q, () => {
            fetchCommissions();
        });
        return () => unsub();
    }, [fetchCommissions]);

    return {
        pendingCommissions,
        commissionHistory,
        loading,
        refreshing,
        refetch: async () => {
            setRefreshing(true);
            await fetchCommissions();
        },
    };
};

export default useAdminCommissions;
