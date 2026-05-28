import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./config";

export interface TreeNode {
    uid: string;
    fullName: string;
    package: string | null;
    status: string;
    level: number;
    children: TreeNode[];
}

export const buildReferralTree = async (memberId: string, level: number = 1, maxLevel: number = 6): Promise<TreeNode[]> => {
    if (level > maxLevel) return [];

    const q = query(collection(db, "members"), where("referredBy", "==", memberId));
    const snap = await getDocs(q);

    const nodes: TreeNode[] = [];
    for (const doc of snap.docs) {
        const data = doc.data();
        const children = await buildReferralTree(doc.id, level + 1, maxLevel);
        nodes.push({
            uid: doc.id,
            fullName: data.fullName,
            package: data.package,
            status: data.status,
            level,
            children,
        });
    }
    return nodes;
};
