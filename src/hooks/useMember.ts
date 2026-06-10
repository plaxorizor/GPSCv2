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

    // Re-reads the member doc. Exposed as `refetch` so gates (pending / expired)
    // can re-check status in place instead of forcing a full window reload.
    const fetchMember = useCallback(async () => {
        if (!currentUser) {
            setMember(null);
            setLoading(false);
            return;
        }
        try {
            const snap = await getDoc(doc(db, "members", currentUser.uid));
            setMember(snap.exists() ? ({ uid: snap.id, ...snap.data() } as MemberWithUid) : null);
        } catch (error) {
            console.error("Error fetching member:", error);
            setMember(null);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchMember();
    }, [fetchMember]);

    return { member, loading, refetch: fetchMember };
};

export default useMember;
