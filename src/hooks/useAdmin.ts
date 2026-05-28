import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

export const useAdmin = () => {
    const { User } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const check = async () => {
            if (!User) {
                await Promise.resolve(); // avoids synchronous setState in effect
                if (!cancelled) {
                    setIsAdmin(false);
                    setLoading(false);
                }
                return;
            }

            const snap = await getDoc(doc(db, "members", User.uid));
            if (!cancelled) {
                setIsAdmin(snap.exists() ? snap.data().isAdmin === true : false);
                setLoading(false);
            }
        };

        check();
        return () => {
            cancelled = true;
        }; // cleanup to prevent setState on unmounted component
    }, [User]);

    return { isAdmin, loading };
};
