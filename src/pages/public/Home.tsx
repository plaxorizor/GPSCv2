import { auth } from "../../firebase/config";
import { useState } from "react";

export default function Home() {
    const [loggedUser, setLoggedUser] = useState<string | null>(null);

    auth.onAuthStateChanged((user) => {
        if (user) {
            setLoggedUser(user.email);
        } else {
            setLoggedUser(null);
        }
    });

    return (
        <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-5xl font-bold text-gpsc-navy">Welcome to GPSC!</h1>
            {loggedUser && <p className="mt-4 text-lg text-gray-600">{loggedUser}</p>}

        </div>
    );
}
