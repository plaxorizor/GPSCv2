// hooks/useMember.ts
import { useCallback, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import useAuth from "../context/useAuth";

import type { Member } from "../utils/types";

// Extend the Member type to include uid
interface MemberWithUid extends Member {
    uid: string;
}

const useMember = () => {
    const { currentUser } = useAuth();
    const [member, setMember] = useState<MemberWithUid | null>(null);
    const [loading, setLoading] = useState(true);
    const [reloadKey, setReloadKey] = useState(0);

    // Bumping reloadKey re-runs the fetch effect. Exposed as `refetch` so gates
    // (pending / expired) can re-check status in place instead of a full reload.
    const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

    useEffect(() => {
        let active = true;
        // All state updates run inside the async callback (never synchronously in
        // the effect body) to avoid cascading renders.
        const load: Promise<MemberWithUid | null> = currentUser
            ? getDoc(doc(db, "members", currentUser.uid)).then((snap) =>
                  snap.exists() ? ({ uid: snap.id, ...snap.data() } as MemberWithUid) : null,
              )
            : Promise.resolve(null);
        load
            .catch((error) => {
                console.error("Error fetching member:", error);
                return null;
            })
            .then((m) => {
                if (active) {
                    setMember(m);
                    setLoading(false);
                }
            });
        return () => {
            active = false;
        };
    }, [currentUser, reloadKey]);

    return { member, loading, refetch };
};

export default useMember;
