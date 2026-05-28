import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
//import { getAuth } from "firebase/auth";

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
    const currentUser = useAuth().User;

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
}
