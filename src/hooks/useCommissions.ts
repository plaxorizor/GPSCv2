import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import useAuth from "../context/useAuth";

interface Commission {
    id: string;
    fromMember: string;
    level: number;
    amount: number;
    status: "pending" | "released";
    dateCreated: Date;
}

export const useCommissions = () => {
    const { currentUser } = useAuth();
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [totalEarned, setTotalEarned] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        const fetch = async () => {
            const q = query(collection(db, "commissions"), where("earnedBy", "==", currentUser.uid), orderBy("dateCreated", "desc"));
            const snap = await getDocs(q);
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Commission);
            setCommissions(data);
            setTotalEarned(data.reduce((sum, c) => sum + c.amount, 0));
            setLoading(false);
        };
        fetch();
    }, [currentUser]);

    return { commissions, totalEarned, loading };
};
