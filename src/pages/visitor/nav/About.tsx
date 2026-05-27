import React, { useState, useEffect } from "react";
import { auth } from "../../../firebase/config";
import type { User } from "firebase/auth";
import { GlobalStyles } from "../GlobalStyles";
import PublicNav from "../PublicNav";
import { Footer } from "../Footer";

const About: React.FC = () => {
    const [loggedUser, setLoggedUser] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
            setLoggedUser(user?.email ?? null);
        });
        return unsubscribe;
    }, []);

    return (
        <div className="min-h-screen font-body text-gpsc-ink antialiased">
            <GlobalStyles />
            <PublicNav loggedUser={loggedUser} />
            <main className="max-w-4xl mx-auto px-6 py-20">
                <h1 className="font-display text-4xl text-gpsc-navy mb-4">About Us</h1>
                <p className="text-gpsc-stone">
                    Green Pasture Shepherd's Care is a community-owned membership program dedicated to providing financial assistance, livelihood
                    opportunities, and a supportive network for Filipino families.
                </p>
            </main>
            <Footer />
        </div>
    );
};

export default About;
