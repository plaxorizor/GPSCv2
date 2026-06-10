import { useCallback, useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import useAuth from "../context/useAuth";
import type { Payout } from "../utils/types";

export const usePayouts = (enabled = false) => {
    const { currentUser } = useAuth();
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(false);

    // First statement is the network await, so no state is set synchronously when
    // this is called from the effect (avoids cascading renders).
    const fetchPayouts = useCallback(async () => {
        if (!currentUser) return;
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
                    dateRequested: data.dateRequested?.toDate?.()?.toISOString?.() ?? "",
                    dateSent: data.dateSent?.toDate?.()?.toISOString?.() ?? null,
                    reference: (data.reference as string | null) ?? null,
                } satisfies Payout;
            });
            // Newest first
            docs.sort((a, b) => (b.dateRequested > a.dateRequested ? 1 : -1));
            setPayouts(docs);
        } catch (err) {
            console.error("[usePayouts] error:", err);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (!enabled) return;
        // Defer into a microtask so the fetch's state updates don't run synchronously
        // in the effect body (avoids cascading renders).
        queueMicrotask(() => fetchPayouts());
    }, [enabled, fetchPayouts]);

    return { payouts, loading, refetch: fetchPayouts };
};
