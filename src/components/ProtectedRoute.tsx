import { Navigate } from "react-router-dom";
import useAuth from "../context/useAuth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { currentUser } = useAuth();
    return currentUser ? <>{children}</> : <Navigate to="/" />;
}
