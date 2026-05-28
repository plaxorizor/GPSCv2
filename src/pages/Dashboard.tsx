import { useAdmin } from "../hooks/useAdmin.ts";
import useMember from "../hooks/useMember.ts";
import { useCommissions } from "../hooks/useCommissions.ts";
import { Navigate } from "react-router-dom";

const PACKAGE_LABELS = {
    basic: "Basic — ₱698",
    family: "Family — ₱1,698",
    premium: "Premium — ₱4,998",
};

export default function Dashboard() {
    const { isAdmin } = useAdmin();
    const { member, loading: memberLoading } = useMember();
    const { commissions, totalEarned, loading: commLoading } = useCommissions();

    if (memberLoading) return <p>Loading...</p>;

    if (isAdmin) return <Navigate to="/admin" />;

    return (
        <div>
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold">Welcome, {member?.firstName}!</h2>
            </div>

            {/* Status cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard label="Membership" value={member?.package ? PACKAGE_LABELS[member.package] : "No package yet"} />
                <StatCard label="Status" value={member?.status} />
                <StatCard label="Total Earnings" value={`₱${totalEarned.toLocaleString()}`} />
            </div>

            {/* Commission history */}
            <h3 className="text-lg font-semibold mt-6">Commission History</h3>
            {commLoading ? (
                <p>Loading commissions...</p>
            ) : commissions.length === 0 ? (
                <p>No commissions yet. Start referring members!</p>
            ) : (
                <table className="w-full mt-4 border-collapse">
                    <thead>
                        <tr>
                            <th>Level</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {commissions.map((c) => (
                            <tr key={c.id}>
                                <td>Level {c.level}</td>
                                <td>₱{c.amount.toLocaleString()}</td>
                                <td>{c.status}</td>
                                <td>{c.dateCreated?.toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Quick links */}
            <div className="mt-6 space-x-4">
                <a href="/claims" className="text-blue-500 hover:underline">
                    Submit a Claim
                </a>
                <a href="/referral" className="text-blue-500 hover:underline">
                    My Referral Tree
                </a>
                <a href="/profile" className="text-blue-500 hover:underline">
                    My Profile
                </a>
            </div>
        </div>
    );
}

// Reusable stat card component
const StatCard = ({ label, value }: { label: string; value: string }) => (
    <div className="p-4 bg-white rounded shadow">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-semibold">{value}</p>
    </div>
);
