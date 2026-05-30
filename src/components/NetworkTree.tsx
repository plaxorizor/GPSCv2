import type { ReferralNode } from "../pages/types";

const NODE_COLORS: Record<string, string> = {
    Basic: "#6366f1",
    Family: "#0ea5e9",
    Premium: "#f59e0b",
    "": "#94a3b8",
};

const TreeNode = ({ node, isLast = false }: { node: ReferralNode; isLast?: boolean }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Connector line */}
        <div style={{ width: 2, height: 24, background: "#e2e8f0" }} />

        {/* Node card */}
        <div
            style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: `2px solid ${NODE_COLORS[node.packageName] ?? "#e2e8f0"}`,
                background: "#fff",
                textAlign: "center",
                minWidth: 110,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
        >
            <div
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: NODE_COLORS[node.packageName] ?? "#94a3b8",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    margin: "0 auto 4px",
                }}
            >
                {node.initials}
            </div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>
                {node.firstName} {node.lastName}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 10, color: "#94a3b8" }}>
                {node.packageName || "No package"} · L{node.level + 1}
            </p>
            <span
                style={{
                    display: "inline-block",
                    marginTop: 4,
                    fontSize: 10,
                    padding: "1px 8px",
                    borderRadius: 10,
                    background: node.status === "active" ? "#dcfce7" : "#fef9c3",
                    color: node.status === "active" ? "#16a34a" : "#a16207",
                }}
            >
                {node.status}
            </span>
        </div>

        {/* Children */}
        {node.downline?.length > 0 && (
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginTop: 0 }}>
                {node.downline.map((child, i) => (
                    <TreeNode key={child.id} node={child} isLast={i === node.downline.length - 1} />
                ))}
            </div>
        )}
    </div>
);

const NetworkTree = ({ nodes }: { nodes: ReferralNode[] }) => {
    if (nodes.length === 0)
        return (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8" }}>
                <p style={{ fontSize: 32 }}>🌱</p>
                <p>No referrals yet. Share your referral link to grow your network!</p>
            </div>
        );

    return (
        <div style={{ overflowX: "auto", paddingBottom: 16 }}>
            <div style={{ display: "flex", gap: 24, justifyContent: "center", paddingTop: 8 }}>
                {nodes.map((node) => (
                    <TreeNode key={node.id} node={node} />
                ))}
            </div>
        </div>
    );
};

export default NetworkTree;
