import MemberArea from "./member/MemberArea";
import AdminArea from "./admin/AdminArea";
import { useAdmin } from "../hooks/useAdmin";

// Routed at /dashboard — sends the signed-in user to the right area by role.
export default function RoleGate() {
    const { isAdmin } = useAdmin();
    if (isAdmin) return <AdminArea />;
    return <MemberArea />;
}