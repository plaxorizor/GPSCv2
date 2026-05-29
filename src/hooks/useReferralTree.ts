import { useEffect, useState } from "react";
import useAuth from "../context/useAuth";
import { buildReferralTree, type TreeNode } from "../firebase/referral";

export const useReferralTree = () => {
    const { currentUser } = useAuth();
    const [tree, setTree] = useState<TreeNode[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        buildReferralTree(currentUser.uid).then((data) => {
            setTree(data);
            setLoading(false);
        });
    }, [currentUser]);

    return { tree, loading };
};
