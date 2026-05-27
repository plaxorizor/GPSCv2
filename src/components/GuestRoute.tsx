import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAdmin } from "../hooks/useAdmin";

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
    const { User } = useAuth();
    const { isAdmin, loading } = useAdmin();

    if (loading) return <p>Loading...</p>;
    if (!User) return <>{children}</>;
    if (isAdmin) return <Navigate to="/admin" />;
    return <Navigate to="/dashboard" />;
};

export default GuestRoute;
