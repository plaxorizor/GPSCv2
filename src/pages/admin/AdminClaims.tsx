import { useEffect, useState } from "react";
import { getAllClaims, updateClaimStatus } from "../../firebase/admin";

const STATUS_COLORS: Record<string, string> = {
    pending: "#f59e0b",
    approved: "#3b82f6",
    rejected: "#ef4444",
    released: "#22c55e",
};

const AdminClaims = () => {
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllClaims().then((data) => {
            setClaims(data);
            setLoading(false);
        });
    }, []);

    const handleStatus = async (id: string, status: "approved" | "rejected" | "released") => {
        await updateClaimStatus(id, status);
        setClaims((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    };

    if (loading) return <p>Loading claims...</p>;

    return (
        <div>
            <h2>Claims</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th>Member ID</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Documents</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {claims.map((c) => (
                        <tr key={c.id}>
                            <td>{c.memberId}</td>
                            <td>{c.type}</td>
                            <td style={{ color: STATUS_COLORS[c.status], fontWeight: 600 }}>{c.status.toUpperCase()}</td>
                            <td>
                                {c.documents?.map((url: string, i: number) => (
                                    <a key={i} href={url} target="_blank" rel="noreferrer">
                                        Doc {i + 1}{" "}
                                    </a>
                                ))}
                            </td>
                            <td style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => handleStatus(c.id, "approved")}>Approve</button>
                                <button onClick={() => handleStatus(c.id, "rejected")}>Reject</button>
                                <button onClick={() => handleStatus(c.id, "released")}>Release</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminClaims;
