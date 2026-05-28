import { useReferralTree } from "../hooks/useReferralTree";
import useMember from "../hooks/useMember";
import TreeNodeCard from "../components/TreeNode";

const ReferralTree = () => {
    const { member } = useMember();
    const { tree, loading } = useReferralTree();

    const totalDownline = (nodes: typeof tree): number => nodes.reduce((sum, n) => sum + 1 + totalDownline(n.children), 0);

    if (loading) return <p>Loading referral tree...</p>;

    return (
        <div>
            <h2>My Referral Tree</h2>
            <p style={{ color: "#888" }}>
                Total downline: <strong>{totalDownline(tree)}</strong> member(s)
            </p>

            {tree.length === 0 ? (
                <div style={{ textAlign: "center", marginTop: 48, color: "#aaa" }}>
                    <p style={{ fontSize: 32 }}>🌱</p>
                    <p>No referrals yet. Share your referral code to start earning!</p>
                </div>
            ) : (
                // Scrollable container for wide trees
                <div style={{ overflowX: "auto", paddingBottom: 24 }}>
                    <div style={{ display: "flex", gap: 24, justifyContent: "center", paddingTop: 16 }}>
                        {tree.map((node) => (
                            <TreeNodeCard key={node.uid} node={node} />
                        ))}
                    </div>
                </div>
            )}

            {/* Referral code section */}
            <div
                style={{
                    marginTop: 32,
                    padding: 16,
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    textAlign: "center",
                }}
            >
                <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Your Referral Code</p>
                <p style={{ margin: "4px 0 0", fontWeight: 700, fontSize: 20, letterSpacing: 2 }}>{member?.uid.slice(0, 8).toUpperCase()}</p>
                <button style={{ marginTop: 8 }} onClick={() => navigator.clipboard.writeText(member?.uid ?? "")}>
                    Copy Full Code
                </button>
            </div>
        </div>
    );
};

export default ReferralTree;
