import { useEffect, useState } from "react";
import { getPendingCommissions, releaseCommission } from "../../firebase/admin";

const AdminCommissions = () => {
    const [commissions, setCommissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [references, setReferences] = useState<Record<string, string>>({});

    useEffect(() => {
        getPendingCommissions().then((data) => {
            setCommissions(data);
            setLoading(false);
        });
    }, []);

    const handleRelease = async (c: any) => {
        const ref = references[c.id];
        if (!ref) return alert("Please enter a reference number first.");
        await releaseCommission(c.id, c.earnedBy, c.amount, ref);
        setCommissions((prev) => prev.filter((x) => x.id !== c.id));
    };

    if (loading) return <p>Loading commissions...</p>;

    return (
        <div>
            <h2>Pending Commissions</h2>
            {commissions.length === 0 ? (
                <p>No pending commissions.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th>Earned By</th>
                            <th>Level</th>
                            <th>Amount</th>
                            <th>Reference</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {commissions.map((c) => (
                            <tr key={c.id}>
                                <td>{c.earnedBy}</td>
                                <td>Level {c.level}</td>
                                <td>₱{c.amount.toLocaleString()}</td>
                                <td>
                                    <input
                                        placeholder="GCash / bank ref"
                                        value={references[c.id] ?? ""}
                                        onChange={(e) =>
                                            setReferences((prev) => ({
                                                ...prev,
                                                [c.id]: e.target.value,
                                            }))
                                        }
                                    />
                                </td>
                                <td>
                                    <button onClick={() => handleRelease(c)}>Release</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminCommissions;
