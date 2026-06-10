import { useCallback, useEffect, useRef, useState } from "react";
import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import type { Claim } from "../utils/types";

// Admin sees ALL claims. Eager fetch on mount (admins are few).
export default function useAdminClaims() {
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // `isInitial` shows the full-page skeleton (first mount only); a manual
    // refresh updates the data quietly while flagging `refreshing` for the spinner.
    const fetchClaims = useCallback(async (isInitial = false) => {
        if (isInitial) setLoading(true);
        else setRefreshing(true);
        try {
            const snap = await getDocs(collection(db, "claims"));
            const docs = snap.docs
                // Guard against malformed/test docs missing memberId
                .filter((d) => typeof d.data().memberId === "string" && d.data().memberId.length > 0)
                .map((d) => {
                    const data = d.data();
                    return {
                        id: d.id,
                        memberId: data.memberId as string,
                        memberName: (data.memberName as string) ?? "Unknown",
                        benefit: (data.benefit as string) ?? "",
                        status: (data.status as Claim["status"]) ?? "submitted",
                        amount: (data.amount as number) ?? 0,
                        description: (data.description as string) ?? "",
                        submitted: data.dateSubmitted?.toDate?.()?.toISOString?.() ?? "",
                        decided: data.dateDecided?.toDate?.()?.toISOString?.() ?? null,
                        documents: (data.documents as string[]) ?? [],
                    } satisfies Claim;
                });
            docs.sort((a, b) => (b.submitted > a.submitted ? 1 : -1));
            setClaims(docs);
        } catch (err) {
            console.error("[useAdminClaims] error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchClaims(true);
    }, [fetchClaims]);

    // Live-watch only the small "pending" subset (submitted / under_review). When a
    // NEW claim lands, quietly re-pull the full list so it appears without a manual
    // refresh. We skip the first emission (it fires on subscribe) to avoid a
    // double-fetch on mount. History changes still update via actions / the button.
    const firstPendingSnap = useRef(true);
    useEffect(() => {
        const q = query(collection(db, "claims"), where("status", "in", ["submitted", "under_review"]));
        const unsub = onSnapshot(q, () => {
            if (firstPendingSnap.current) {
                firstPendingSnap.current = false;
                return;
            }
            fetchClaims(false);
        });
        return () => unsub();
    }, [fetchClaims]);

    return { claims, loading, refreshing, refetch: () => fetchClaims(false) };
}
