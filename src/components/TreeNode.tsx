import { type TreeNode } from "../firebase/referral";

const PACKAGE_COLORS: Record<string, string> = {
    basic: "#6366f1",
    family: "#0ea5e9",
    premium: "#f59e0b",
};

const STATUS_COLORS: Record<string, string> = {
    active: "#22c55e",
    pending: "#f59e0b",
    inactive: "#ef4444",
};

const TreeNodeCard = ({ node }: { node: TreeNode }) => {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Node card */}
            <div
                style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: `2px solid ${PACKAGE_COLORS[node.package ?? ""] ?? "#ddd"}`,
                    textAlign: "center",
                    minWidth: 120,
                    background: "#fff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                }}
            >
                <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{node.fullName}</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#888" }}>
                    Level {node.level} · {node.package ?? "no package"}
                </p>
                <span
                    style={{
                        display: "inline-block",
                        marginTop: 4,
                        fontSize: 10,
                        padding: "1px 8px",
                        borderRadius: 10,
                        background: STATUS_COLORS[node.status] ?? "#ddd",
                        color: "#fff",
                        fontWeight: 600,
                    }}
                >
                    {node.status.toUpperCase()}
                </span>
            </div>

            {/* Children */}
            {node.children.length > 0 && (
                <>
                    {/* Vertical line down */}
                    <div style={{ width: 2, height: 24, background: "#ddd" }} />

                    {/* Horizontal line spanning children */}
                    <div style={{ display: "flex", gap: 16, position: "relative" }}>
                        {node.children.map((child) => (
                            <div
                                key={child.uid}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                }}
                            >
                                {/* Vertical line to child */}
                                <div style={{ width: 2, height: 24, background: "#ddd" }} />
                                <TreeNodeCard node={child} />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default TreeNodeCard;
