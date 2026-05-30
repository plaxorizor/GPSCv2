import MemberArea from "./member/MemberArea";
import AdminArea from "./admin/AdminArea";  // Changed from AdminDashboard to AdminArea
import { useAdmin } from "../hooks/useAdmin";

export default function Dashboard() {
    const { isAdmin } = useAdmin();
    if (isAdmin) return <AdminArea />;
    return <MemberArea />;
}