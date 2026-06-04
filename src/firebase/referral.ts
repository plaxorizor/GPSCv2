import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./config";

export interface TreeNode {
    uid: string;
    firstName: string;
    lastName: string;
    city: string;
    package: string;
    status: string;
    level: number;
    children: TreeNode[];
}

// Firestore "in" operator limit
const IN_LIMIT = 30;

function chunk<T>(arr: T[], size: number): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

// BFS approach: one batch query per level instead of one query per node.
// A tree 3-wide × 6 levels deep went from ~364 sequential queries → 6 parallel batches.
export const buildReferralTree = async (
    rootId: string,
    maxLevel: number = 6,
): Promise<TreeNode[]> => {
    const allNodes = new Map<string, TreeNode>();
    const childrenOf = new Map<string, string[]>(); // parentId → childIds

    let frontier = [rootId]; // IDs whose children we need to fetch next

    for (let level = 1; level <= maxLevel && frontier.length > 0; level++) {
        // Fire all chunk queries for this level in parallel
        const snaps = await Promise.all(
            chunk(frontier, IN_LIMIT).map((ids) =>
                getDocs(query(collection(db, "members"), where("referredBy", "in", ids))),
            ),
        );

        const nextFrontier: string[] = [];

        for (const snap of snaps) {
            for (const doc of snap.docs) {
                const d = doc.data();
                allNodes.set(doc.id, {
                    uid: doc.id,
                    firstName: d.firstName,
                    lastName: d.lastName,
                    city: d.city,
                    package: d.package,
                    status: d.status,
                    level,
                    children: [],
                });
                const parentId = d.referredBy as string;
                childrenOf.set(parentId, [...(childrenOf.get(parentId) ?? []), doc.id]);
                nextFrontier.push(doc.id);
            }
        }

        frontier = nextFrontier;
    }

    // Wire up children references
    for (const [parentId, childIds] of childrenOf) {
        const parent = allNodes.get(parentId);
        if (parent) parent.children = childIds.map((id) => allNodes.get(id)!).filter(Boolean);
    }

    return (childrenOf.get(rootId) ?? []).map((id) => allNodes.get(id)!).filter(Boolean);
};
