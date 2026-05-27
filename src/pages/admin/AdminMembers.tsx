import { useEffect, useState } from "react";
import { getAllMembers, updateMemberStatus } from "../../firebase/admin";

const AdminMembers = () => {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllMembers().then((data) => {
            setMembers(data);
            setLoading(false);
        });
    }, []);

    const handleStatus = async (uid: string, status: "active" | "inactive") => {
        await updateMemberStatus(uid, status);
        setMembers((prev) => prev.map((m) => (m.id === uid ? { ...m, status } : m)));
    };

    if (loading) return <p>Loading members...</p>;

    return (
        <div>
            <h2>Members</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Package</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map((m) => (
                        <tr key={m.id}>
                            <td>{m.fullName}</td>
                            <td>{m.email}</td>
                            <td>{m.package ?? "—"}</td>
                            <td>{m.status}</td>
                            <td style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => handleStatus(m.id, "active")}>Activate</button>
                                <button onClick={() => handleStatus(m.id, "inactive")}>Deactivate</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminMembers;
