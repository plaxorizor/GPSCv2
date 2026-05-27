import { logoutUser } from "../firebase/auth";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
    const navigate = useNavigate();
    const handleLogout = async () => {
        await logoutUser();
        navigate("/login");
    };
    return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
