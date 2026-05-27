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
        <div className="min-h-screen bg-gray-50">
            <h1 className="text-4xl font-bold text-center pt-20">Welcome to GPSC</h1>
            <div className="text-center">{loggedUser && <p className="mt-4 text-lg text-gray-600">{loggedUser}</p>}</div>

            <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl border">
                {loggedUser ? (
                    <button
                        className="bg-red-50 text-red-700 font-medium rounded-xl px-6 py-3 hover:bg-red-100 transition-colors"
                        onClick={() => auth.signOut()}
                    >
                        Log OuZ
                    </button>
                ) : (
                    <div className="flex space-x-4">
                        <a
                            href="/signup"
                            className="bg-green-50 text-green-700 font-medium rounded-xl px-6 py-3 hover:bg-green-100 transition-colors"
                        >
                            Sign Up
                        </a>
                        <a href="/signin" className="bg-blue-50 text-blue-700 font-medium rounded-xl px-6 py-3 hover:bg-blue-100 transition-colors">
                            Sign In
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
