import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../firebase/auth";
import useMember from "../../hooks/useMember";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalMembers: 0,
        activeMembers: 0,
        pendingClaims: 0,
        pendingCommissions: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const [membersSnap, claimsSnap, commissionsSnap] = await Promise.all([
                getDocs(collection(db, "members")),
                getDocs(query(collection(db, "claims"), where("status", "==", "pending"))),
                getDocs(query(collection(db, "commissions"), where("status", "==", "pending"))),
            ]);

            const allMembers = membersSnap.docs.map((d) => d.data());

            setStats({
                totalMembers: allMembers.length,
                activeMembers: allMembers.filter((m) => m.status === "active").length,
                pendingClaims: claimsSnap.size,
                pendingCommissions: commissionsSnap.size,
            });
            setLoading(false);
        };
        fetchStats();
    }, []);

    const handleLogout = async () => {
        await logoutUser();
        navigate("/");
    };

    const { member } = useMember();

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>Welcome, {member?.firstName}</div>
                <h2>Admin Dashboard</h2>
                <button onClick={handleLogout}>Logout</button>
            </div>

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                <StatCard label="Total Members" value={stats.totalMembers} />
                <StatCard label="Active Members" value={stats.activeMembers} />
                <StatCard label="Pending Claims" value={stats.pendingClaims} color="#f59e0b" />
                <StatCard label="Pending Commissions" value={stats.pendingCommissions} color="#f59e0b" />
            </div>

            {/* Navigation */}
            <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                <button onClick={() => navigate("/admin/members")}>Manage Members</button>
                <button onClick={() => navigate("/admin/claims")}>Review Claims</button>
                <button onClick={() => navigate("/admin/commissions")}>Release Commissions</button>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, color = "#000" }: { label: string; value: number; color?: string }) => (
    <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8, textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{label}</p>
        <p style={{ margin: "4px 0 0", fontWeight: 700, fontSize: 24, color }}>{value}</p>
    </div>
);

export default AdminDashboard;
