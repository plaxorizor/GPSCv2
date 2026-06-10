import { useCallback, useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import useAuth from "../context/useAuth";
import type { Claim } from "../utils/types";

// Lazy hook — only fetches the member's claims when `enabled` is true
// (i.e. when they actually open the Claims section).
export const useMemberClaims = (enabled = false) => {
    const { currentUser } = useAuth();
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(false);

    // First statement is the network await, so no state is set synchronously when
    // this is called from the effect (avoids cascading renders).
    const fetchClaims = useCallback(async () => {
        if (!currentUser) return;
        try {
            const snap = await getDocs(
                query(collection(db, "claims"), where("memberId", "==", currentUser.uid)),
            );
            const docs = snap.docs.map((d) => {
                const data = d.data();
                return {
                    id: d.id,
                    memberId: data.memberId as string,
                    memberName: (data.memberName as string) ?? "",
                    benefit: (data.benefit as string) ?? "",
                    status: (data.status as Claim["status"]) ?? "submitted",
                    amount: (data.amount as number) ?? 0,
                    description: (data.description as string) ?? "",
                    submitted: data.dateSubmitted?.toDate?.()?.toISOString?.() ?? "",
                    decided: data.dateDecided?.toDate?.()?.toISOString?.() ?? null,
                    documents: (data.documents as string[]) ?? [],
                } satisfies Claim;
            });
            // Newest first
            docs.sort((a, b) => (b.submitted > a.submitted ? 1 : -1));
            setClaims(docs);
        } catch (err) {
            console.error("[useMemberClaims] error:", err);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (!enabled) return;
        // Defer into a microtask so the fetch's state updates don't run synchronously
        // in the effect body (avoids cascading renders).
        queueMicrotask(() => fetchClaims());
    }, [enabled, fetchClaims]);

    return { claims, loading, refetch: fetchClaims };
};
