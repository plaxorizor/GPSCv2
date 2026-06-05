import { useEffect, useState, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import type { AdminPayout } from "../utils/types";

const useAdminPayouts = () => {
    const [payouts, setPayouts] = useState<AdminPayout[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // `isInitial` shows the full-page skeleton (first mount only); a manual
    // refresh updates the data quietly while flagging `refreshing` for the spinner.
    const fetchPayouts = useCallback(async (isInitial = false) => {
        if (isInitial) setLoading(true);
        else setRefreshing(true);
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
                        method:        (data.method as string | undefined) ?? "",
                        accountNumber: (data.accountNumber as string | undefined) ?? "",
                        accountName:   (data.accountName as string | undefined) ?? "",
                        status:        data.status as "requested" | "sent",
                        requestedAt:   data.requestedAt?.toDate?.()?.toISOString?.() ?? "",
                        sentAt:        data.sentAt?.toDate?.()?.toISOString?.() ?? null,
                        reference:     (data.reference as string | null) ?? null,
                    };
                });

            // Pending requests first, then newest-first within each group
            docs.sort((a, b) => {
                if (a.status === "requested" && b.status !== "requested") return -1;
                if (a.status !== "requested" && b.status === "requested") return 1;
                return b.requestedAt > a.requestedAt ? 1 : -1;
            });

            setPayouts(docs);
        } catch (err) {
            console.error("[useAdminPayouts] error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchPayouts(true);
    }, [fetchPayouts]);

    return { payouts, loading, refreshing, refetch: () => fetchPayouts(false) };
};

export default useAdminPayouts;
