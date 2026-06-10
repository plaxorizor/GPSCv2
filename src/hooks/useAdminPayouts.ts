import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import type { AdminPayout } from "../utils/types";

const useAdminPayouts = () => {
    const [payouts, setPayouts] = useState<AdminPayout[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // First statement is the network await, so no state is set synchronously when
    // this runs from the mount effect (avoids cascading renders). `loading` starts
    // true for the initial skeleton; the manual `refetch` flips `refreshing`.
    const fetchPayouts = useCallback(async () => {
        try {
            const snap = await getDocs(collection(db, "payouts"));
            const docs: AdminPayout[] = snap.docs
                // Skip docs that are missing critical fields (e.g. admin-released
                // commission payouts from old code that had no memberId)
                .filter((d) => typeof d.data().memberId === "string" && d.data().memberId.length > 0)
                .map((d) => {
                    const data = d.data();
                    return {
                        id: d.id,
                        memberId:      data.memberId as string,
                        memberName:    (data.memberName as string | undefined) ?? "Unknown",
                        amount:        data.amount as number,
                        grossAmount:   (data.grossAmount as number | undefined) ?? (data.amount as number),
                        feeAmount:     (data.feeAmount as number | undefined) ?? 0,
                        method:        (data.method as string | undefined) ?? "",
                        accountNumber: (data.accountNumber as string | undefined) ?? "",
                        accountName:   (data.accountName as string | undefined) ?? "",
                        status:        data.status as "requested" | "sent" | "rejected",
                        dateRequested:   data.dateRequested?.toDate?.()?.toISOString?.() ?? "",
                        dateSent:        data.dateSent?.toDate?.()?.toISOString?.() ?? null,
                        reference:     (data.reference as string | null) ?? null,
                    };
                });

            // Pending requests first, then newest-first within each group
            docs.sort((a, b) => {
                if (a.status === "requested" && b.status !== "requested") return -1;
                if (a.status !== "requested" && b.status === "requested") return 1;
                return b.dateRequested > a.dateRequested ? 1 : -1;
            });

            setPayouts(docs);
        } catch (err) {
            console.error("[useAdminPayouts] error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Live-watch only the small "requested" (pending) subset. onSnapshot fires
    // immediately on subscribe (the initial load) and again whenever a payout
    // request lands or changes status — each emission re-pulls the full list. One
    // subscription covers both first load and live updates, keeping every setState
    // inside a callback (never the synchronous effect body).
    useEffect(() => {
        const q = query(collection(db, "payouts"), where("status", "==", "requested"));
        const unsub = onSnapshot(q, () => {
            fetchPayouts();
        });
        return () => unsub();
    }, [fetchPayouts]);

    return { payouts, loading, refreshing, refetch: async () => { setRefreshing(true); await fetchPayouts(); } };
};

export default useAdminPayouts;
