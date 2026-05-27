import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

export const useAdmin = () => {
    const { User } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!User) return;
        const check = async () => {
            const snap = await getDoc(doc(db, "members", User.uid));
            if (snap.exists()) setIsAdmin(snap.data().isAdmin === true);
            setLoading(false);
        };
        check();
    }, [User]);

    return { isAdmin, loading };
};
