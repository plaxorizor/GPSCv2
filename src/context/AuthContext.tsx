import { createContext, useContext } from "react";
import type { User } from "firebase/auth";

interface AuthContextType {
    User: User | null;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
    User: null,
    loading: true,
});

export function useAuth() {
    const context = useContext(AuthContext);
    return context;
}
