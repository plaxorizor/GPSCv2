import { useEffect, useState } from "react";
import useAuth from "../context/useAuth";
import { buildReferralTree, type TreeNode } from "../firebase/referral";

export const useReferralTree = (enabled = false) => {
    const { currentUser } = useAuth();
    const [tree, setTree] = useState<TreeNode[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!currentUser || !enabled) return;
        setLoading(true);
        buildReferralTree(currentUser.uid).then((data) => {
            setTree(data);
            setLoading(false);
        });
    }, [currentUser, enabled]);

    return { tree, loading };
};
