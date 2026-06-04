import { useEffect, useState, useCallback } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import type { PendingCommission, CommissionRecord } from "../utils/types";

const useAdminCommissions = () => {
    const [pendingCommissions, setPendingCommissions] = useState<PendingCommission[]>([]);
    const [commissionHistory, setCommissionHistory] = useState<CommissionRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCommissions = useCallback(async () => {
        setLoading(true);
        try {
            const [pendingSnap, releasedSnap] = await Promise.all([
                getDocs(query(collection(db, "commissions"), where("status", "==", "pending"))),
                getDocs(query(collection(db, "commissions"), where("status", "==", "released"))),
            ]);

            // Batch-fetch member names for all earnedBy UIDs
            // Filter out any docs with missing/null earnedBy to avoid Firestore path errors
            const allDocs = [...pendingSnap.docs, ...releasedSnap.docs];
            const uniqueUids = [
                ...new Set(
                    allDocs
                        .map((d) => d.data().earnedBy as string | undefined)
                        .filter((uid): uid is string => typeof uid === "string" && uid.length > 0),
                ),
            ];
            const memberMap = new Map<string, string>();

            for (let i = 0; i < uniqueUids.length; i += 10) {
                const chunk = uniqueUids.slice(i, i + 10);
                const snaps = await Promise.all(chunk.map((uid) => getDoc(doc(db, "members", uid))));
                snaps.forEach((snap) => {
                    if (snap.exists()) {
                        const d = snap.data();
                        memberMap.set(snap.id, `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim());
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
                        fromMemberName: (data.fromMemberName as string | undefined) ?? "—",
                        level: data.level as number,
                        amount: data.amount as number,
                        date: data.dateCreated?.toDate?.()?.toISOString?.() ?? "",
                    };
                });
            pending.sort((a, b) => (b.date > a.date ? 1 : -1));

            const history: CommissionRecord[] = releasedSnap.docs
                .filter((d) => typeof d.data().earnedBy === "string" && d.data().earnedBy.length > 0)
                .map((d) => {
                    const data = d.data();
                    const earnedBy = data.earnedBy as string;
                    return {
                        id: d.id,
                        membershipId: "",
                        recipientId: earnedBy,
                        recipientName: memberMap.get(earnedBy) ?? earnedBy,
                        fromMemberName: (data.fromMemberName as string | undefined) ?? "—",
                        fromMemberCity: (data.fromMemberCity as string | undefined) ?? "",
                        level: data.level as number,
                        role: "",
                        amount: data.amount as number,
                        status: "paid" as const,
                        date: data.dateCreated?.toDate?.()?.toISOString?.() ?? "",
                    };
                });
            history.sort((a, b) => (b.date > a.date ? 1 : -1));

            setPendingCommissions(pending);
            setCommissionHistory(history);
        } catch (err) {
            console.error("[useAdminCommissions] error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCommissions();
    }, [fetchCommissions]);

    return { pendingCommissions, commissionHistory, loading, refetch: fetchCommissions };
};

export default useAdminCommissions;
