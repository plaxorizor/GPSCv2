import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

interface Member {
    uid: string;
    fullName: string;
    email: string;
    package: "basic" | "family" | "premium" | null;
    status: "pending" | "active" | "inactive";
    referredBy: string | null;
    createdAt: any;
}

export const useMember = () => {
    const { currentUser } = useAuth();
    const [member, setMember] = useState<Member | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        const fetch = async () => {
            const snap = await getDoc(doc(db, "members", currentUser.uid));
            if (snap.exists()) setMember(snap.data() as Member);
            setLoading(false);
        };
        fetch();
    }, [currentUser]);

    return { member, loading };
};
