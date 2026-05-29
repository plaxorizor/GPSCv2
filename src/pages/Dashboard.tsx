import MemberArea from "./member/MemberArea";
import AdminDashboard from "./admin/AdminDashboard";
import { useAdmin } from "../hooks/useAdmin";

export default function Dashboard() {
    const { isAdmin } = useAdmin();
    if (isAdmin) return <AdminDashboard />;
    return <MemberArea />;
}
