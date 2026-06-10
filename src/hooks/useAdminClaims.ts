import { useCallback, useEffect, useState } from "react";
import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import type { Claim } from "../utils/types";

// Admin sees ALL claims. Eager fetch on mount (admins are few).
export default function useAdminClaims() {
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // First statement is the network await, so no state is set synchronously when
    // this runs from the mount effect (avoids cascading renders). `loading` starts
    // true for the initial skeleton; the manual `refetch` flips `refreshing`.
    const fetchClaims = useCallback(async () => {
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
                        uploads: (data.uploads as { name: string; url: string }[]) ?? [],
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

    // Live-watch only the small "pending" subset (submitted / under_review).
    // onSnapshot fires immediately on subscribe (the initial load) and again
    // whenever a claim lands or changes status — each emission re-pulls the full
    // list. This single subscription covers both the first load and live updates,
    // and keeps every setState inside a callback (never the synchronous effect body).
    useEffect(() => {
        const q = query(collection(db, "claims"), where("status", "in", ["submitted", "under_review"]));
        const unsub = onSnapshot(q, () => {
            fetchClaims();
        });
        return () => unsub();
    }, [fetchClaims]);

    return { claims, loading, refreshing, refetch: async () => { setRefreshing(true); await fetchClaims(); } };
}
