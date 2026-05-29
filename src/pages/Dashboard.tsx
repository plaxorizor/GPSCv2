import { useAdmin } from "../hooks/useAdmin";
import { Navigate } from "react-router-dom";
import MemberArea from "./member/MemberArea";

export default function Dashboard() {
    const { isAdmin, loading } = useAdmin();

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (isAdmin) return <Navigate to="/admin" />;

    return <MemberArea />;
}