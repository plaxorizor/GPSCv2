import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import useAuth from "../context/useAuth";
import type { Payout } from "../utils/types";

export const usePayouts = (enabled = false) => {
    const { currentUser } = useAuth();
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchPayouts = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const snap = await getDocs(
                query(collection(db, "payouts"), where("memberId", "==", currentUser.uid))
            );
            const docs = snap.docs.map((d) => {
                const data = d.data();
                return {
                    id: d.id,
                    userId: data.memberId as string,
                    amount: data.amount as number,
                    method: data.method as string,
                    accountNumber: data.accountNumber as string | undefined,
                    accountName: data.accountName as string | undefined,
                    status: data.status as "sent" | "requested",
                    requestedAt: data.requestedAt?.toDate?.()?.toISOString?.() ?? "",
                    sentAt: data.sentAt?.toDate?.()?.toISOString?.() ?? null,
                    reference: (data.reference as string | null) ?? null,
                } satisfies Payout;
            });
            // Newest first
            docs.sort((a, b) => (b.requestedAt > a.requestedAt ? 1 : -1));
            setPayouts(docs);
        } catch (err) {
            console.error("[usePayouts] error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!currentUser || !enabled) return;
        fetchPayouts();
    }, [currentUser, enabled]);

    return { payouts, loading, refetch: fetchPayouts };
};
