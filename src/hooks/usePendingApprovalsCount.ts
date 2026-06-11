import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase/config";

export interface PendingApprovalsCount {
    signups: number;
    upgrades: number;
    renewals: number;
    total: number;
}

// Live counts for the admin "Approvals" badge. Uses real-time onSnapshot
// listeners on single-field equality queries (status == "pending") so the badge
// updates on the fly as members sign up / request upgrades / request renewals —
// no manual refresh needed. Single-field filters mean no composite index.
export function usePendingApprovalsCount() {
    const [counts, setCounts] = useState<PendingApprovalsCount>({ signups: 0, upgrades: 0, renewals: 0, total: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let signups = 0;
        let upgrades = 0;
        let renewals = 0;
        const apply = () => {
            setCounts({ signups, upgrades, renewals, total: signups + upgrades + renewals });
            setLoading(false);
        };

        const unsubs = [
            onSnapshot(query(collection(db, "members"), where("status", "==", "pending")), (snap) => {
                signups = snap.size;
                apply();
            }),
            onSnapshot(query(collection(db, "upgradeRequests"), where("status", "==", "pending")), (snap) => {
                upgrades = snap.size;
                apply();
            }),
            onSnapshot(query(collection(db, "renewalRequests"), where("status", "==", "pending")), (snap) => {
                renewals = snap.size;
                apply();
            }),
        ];

        return () => unsubs.forEach((unsub) => unsub());
    }, []);

    // Kept for call-site compatibility; data is live so this is a no-op.
    const refetch = () => {};

    return { counts, loading, refetch };
}
