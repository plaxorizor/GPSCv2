import { Navigate } from "react-router-dom";
import useAuth from "../context/useAuth";
import { useAdmin } from "../hooks/useAdmin";

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
    const { currentUser } = useAuth();
    const { isAdmin, loading } = useAdmin();
    if (loading) return null;
    if (!currentUser) return <>{children}</>;
    if (isAdmin) return <Navigate to="/admin" />;
    return <Navigate to="/dashboard" />;
};

export default GuestRoute;
