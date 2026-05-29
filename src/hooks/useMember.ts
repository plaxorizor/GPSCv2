import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import useAuth from "../context/useAuth";

export interface Member {
    uid: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    birthDate: Date;
    civilStatus: "single" | "married" | "divorced" | "widowed";
    city: string;
    province: string;
    package: "basic" | "family" | "premium";
    status: "pending" | "active" | "inactive";
    referredBy: string;
    rank: number;
    dateCreated: Date;
}

const useMember = () => {
    const { currentUser } = useAuth();
    const [member, setMember] = useState<Member | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        const fetch = async () => {
            await Promise.resolve();
            const snap = await getDoc(doc(db, "members", currentUser.uid));
            if (snap.exists()) setMember(snap.data() as Member);
            setLoading(false);
        };
        fetch();
    }, [currentUser]);

    return { member, loading };
};
export default useMember;
