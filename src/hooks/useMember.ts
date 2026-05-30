// hooks/useMember.ts
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import useAuth from "../context/useAuth";

import type { Member } from "../pages/types";

// Extend the Member type to include uid
interface MemberWithUid extends Member {
    uid: string;
}

const useMember = () => {
    const { currentUser } = useAuth();
    const [member, setMember] = useState<MemberWithUid | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchMember = async () => {
            if (!currentUser) {
                if (isMounted) {
                    setMember(null);
                    setLoading(false);
                }
                return;
            }

            try {
                const snap = await getDoc(doc(db, "members", currentUser.uid));
                if (isMounted) {
                    if (snap.exists()) {
                        //const memberData = snap.data() as Member;
                        // Add the uid to the member object
                        setMember({ uid: snap.id, ...snap.data() } as Member);
                    } else {
                        setMember(null);
                    }
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching member:", error);
                if (isMounted) {
                    setMember(null);
                    setLoading(false);
                }
            }
        };

        fetchMember();

        return () => {
            isMounted = false;
        };
    }, [currentUser]);

    return { member, loading };
};

export default useMember;
