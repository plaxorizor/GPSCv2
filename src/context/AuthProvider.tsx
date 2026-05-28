import { useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { AuthContext } from "./AuthContext"; // Import from the new file
import type { User } from "firebase/auth";

export default function AuthProvider({ children }: { children: ReactNode }) {
    const auth = getAuth();
    const [User, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setLoading(false);
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });
        return () => {
            if (unsubscribe) unsubscribe(); // Unsubscribe from auth changes on unmount
        }; // Cleanup on unmount
    }, []);

    return <AuthContext.Provider value={{ User, loading }}>{!loading && children}</AuthContext.Provider>;
}
