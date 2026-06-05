import { useCallback, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
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
                        submitted: data.submittedAt?.toDate?.()?.toISOString?.() ?? "",
                        decided: data.decidedAt?.toDate?.()?.toISOString?.() ?? null,
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

    return { claims, loading, refreshing, refetch: () => fetchClaims(false) };
}
