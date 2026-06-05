import { Navigate } from "react-router-dom";
import useAuth from "../context/useAuth";

// Wraps guest-only pages (signin, signup). Any signed-in user is bounced to
// /dashboard, which itself renders AdminArea or MemberArea based on isAdmin.
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
    const { currentUser, loading } = useAuth();
    if (loading) return null;
    if (currentUser) return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
};

export default GuestRoute;
