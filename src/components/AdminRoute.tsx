import { Navigate } from "react-router-dom";
import { useAdmin } from "../hooks/useAdmin";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
    const { isAdmin, loading } = useAdmin();
    if (loading) return <p>Loading...</p>;
    return isAdmin ? <>{children}</> : <Navigate to="/dashboard" />;
}
