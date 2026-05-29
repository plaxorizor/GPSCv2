import { useContext } from "react";
import { createContext } from "react";
import { type User } from "firebase/auth";

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    loading: true,
});

const useAuth = () => {
    return useContext(AuthContext);
};
export default useAuth;
