import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

interface Member {
    uid: string;
    firstName: string;
    lastName: string;
    email: string;
    package: "basic" | "family" | "premium" | null;
    status: "pending" | "active" | "inactive";
    referredBy: string | null;
    dateCreated: Date;
}

export default function useMember() {
    const { User } = useAuth();
    const [member, setMember] = useState<Member | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!User) return;
        const fetch = async () => {
            const snap = await getDoc(doc(db, "members", User.uid));
            if (snap.exists()) setMember(snap.data() as Member);
            setLoading(false);
        };
        fetch();
    }, [User]);

    return { member, loading };
}
