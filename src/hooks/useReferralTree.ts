import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { buildReferralTree, type TreeNode } from "../firebase/referral";

export const useReferralTree = () => {
    const { User } = useAuth();
    const [tree, setTree] = useState<TreeNode[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!User) return;
        buildReferralTree(User.uid).then((data) => {
            setTree(data);
            setLoading(false);
        });
    }, [User]);

    return { tree, loading };
};
