import { useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, getAuth, type User as FirebaseUser } from "firebase/auth";
import { AuthContext } from "./useAuth";

export default function AuthProvider({ children }: { children: ReactNode }) {
    const auth = getAuth();
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, [auth]);

    return <AuthContext.Provider value={{ currentUser, loading }}>{!loading && children}</AuthContext.Provider>;
}
