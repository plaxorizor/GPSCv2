import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

export const useAdmin = () => {
    const { currentUser } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        const check = async () => {
            const snap = await getDoc(doc(db, "members", currentUser.uid));
            if (snap.exists()) setIsAdmin(snap.data().isAdmin === true);
            setLoading(false);
        };
        check();
    }, [currentUser]);

    return { isAdmin, loading };
};
