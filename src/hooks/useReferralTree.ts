import { useEffect, useState } from "react";
import useAuth from "../context/useAuth";
import { buildReferralTree, type TreeNode } from "../firebase/referral";

export const useReferralTree = (enabled = false) => {
    const { currentUser } = useAuth();
    const [tree, setTree] = useState<TreeNode[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!currentUser || !enabled) return;
        let active = true;
        // All state updates happen in the async callback (not synchronously in the
        // effect body) to avoid cascading renders.
        buildReferralTree(currentUser.uid)
            .then((data) => {
                if (active) {
                    setTree(data);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [currentUser, enabled]);

    return { tree, loading };
};
