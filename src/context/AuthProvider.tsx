import { useEffect, useState, type ReactNode } from "react";
import { onAuthChange } from "../firebase/auth";
import { AuthContext } from "./AuthContext"; // Import from the new file
import type { User } from "firebase/auth";

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [User, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthChange((user) => {
            setUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    return <AuthContext.Provider value={{ User, loading }}>{!loading && children}</AuthContext.Provider>;
}
