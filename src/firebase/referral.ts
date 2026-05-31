import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./config";

export interface TreeNode {
    uid: string;
    firstName: string;
    lastName: string;
    city: string;
    //dateCreated: Date;
    package: string;
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
            firstName: data.firstName,
            lastName: data.lastName,
            city: data.city,
            //dateCreated: data.dateCreated,
            package: data.package,
            status: data.status,
            level,
            children,
        });
    }
    return nodes;
};
