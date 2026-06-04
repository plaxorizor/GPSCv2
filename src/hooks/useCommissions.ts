import { useEffect, useState } from "react";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import useAuth from "../context/useAuth";

export interface Commission {
    id: string;
    fromMember: string;
    fromMemberName: string;
    fromMemberInitials: string;
    fromMemberCity: string;
    level: number;
    amount: number;
    status: "pending" | "released";
    dateCreated: any; // Firestore Timestamp
}

export const useCommissions = (enabled = false) => {
    const { currentUser } = useAuth();
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [totalEarned, setTotalEarned] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!currentUser || !enabled) return;

        const fetch = async () => {
            setLoading(true);
            try {
                const q = query(
                    collection(db, "commissions"),
                    where("earnedBy", "==", currentUser.uid),
                );
                const snap = await getDocs(q);
                console.log(`[useCommissions] fetched ${snap.size} docs for uid=${currentUser.uid}`);
                // Sort client-side — avoids needing a composite Firestore index
                const raw = snap.docs
                    .map((d) => ({ id: d.id, ...d.data() }))
                    .sort((a: any, b: any) => (b.dateCreated?.toMillis?.() ?? 0) - (a.dateCreated?.toMillis?.() ?? 0)) as any[];

                // Fetch unique member names for fromMember UIDs
                const uniqueUids = [...new Set(raw.map((c) => c.fromMember).filter(Boolean))];
                const memberMap: Record<string, { name: string; initials: string; city: string }> = {};

                await Promise.all(
                    uniqueUids.map(async (uid: string) => {
                        const memberSnap = await getDoc(doc(db, "members", uid));
                        if (memberSnap.exists()) {
                            const d = memberSnap.data();
                            const firstName = d.firstName || "";
                            const lastName = d.lastName || "";
                            memberMap[uid] = {
                                name: `${firstName} ${lastName}`.trim(),
                                initials: `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase(),
                                city: d.city || "—",
                            };
                        }
                    }),
                );

                const enriched: Commission[] = raw.map((c) => ({
                    ...c,
                    fromMemberName: memberMap[c.fromMember]?.name ?? "—",
                    fromMemberInitials: memberMap[c.fromMember]?.initials ?? "?",
                    fromMemberCity: memberMap[c.fromMember]?.city ?? "—",
                }));

                setCommissions(enriched);
                setTotalEarned(enriched.reduce((sum, c) => sum + c.amount, 0));
            } catch (err) {
                console.error("useCommissions fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, [currentUser, enabled]); // ← enabled must be here so the effect re-runs when the section is visited

    return { commissions, totalEarned, loading };
};
