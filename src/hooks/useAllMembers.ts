import { useEffect, useState } from "react";
import { getAllMembers } from "../firebase/admin";
import type { Member } from "../pages/member/types";

export const useAllMembers = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllMembers().then((data) => {
            setMembers(data as unknown as Member[]);
            setLoading(false);
        });
    }, []);

    return { members, loading };
};
