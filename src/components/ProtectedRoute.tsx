import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { User } = useAuth();
    return User ? <>{children}</> : <Navigate to="/" />;
}
