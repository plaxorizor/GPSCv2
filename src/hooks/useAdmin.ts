import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import useAuth from "../context/useAuth";

export const useAdmin = () => {
    const { currentUser } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        if (!currentUser) return;

        const check = async () => {
            const snap = await getDoc(doc(db, "members", currentUser.uid));
            if (!cancelled) {
                const data = snap.exists() ? snap.data() : null;
                setIsAdmin(data?.isAdmin === true);
                // Super admins are a tier above admins (can archive/delete members).
                setIsSuperAdmin(data?.isSuperAdmin === true);
                setLoading(false);
            }
        };

        check();
        return () => {
            cancelled = true;
        };
    }, [currentUser]);

    return { isAdmin, isSuperAdmin, loading };
};
