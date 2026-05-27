import React, { useState, useEffect } from "react";
import { auth } from "../../firebase/config"; // ✅ 3 levels up to src/firebase/config
import type { User } from "firebase/auth"; // import type for the user parameter
import { GlobalStyles } from "./GlobalStyles";
import PublicNav from "./PublicNav";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { Pillars } from "./Pillars";
import { HowItWorks } from "./HowItWorks";
import { Packages } from "./Packages";
import { Testimonial } from "./Testimonial";
import { TrustStrip } from "./TrustStrip";

export default function Home(): React.ReactElement {
    const [loggedUser, setLoggedUser] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
            setLoggedUser(user?.email ?? null);
        });
        return unsubscribe;
    }, []);

    const handleCta = (action: string) => {
        alert(`${action} (demo mode)`);
    };

    return (
        <div className="min-h-screen font-body text-gpsc-ink antialiased">
            <GlobalStyles />
            <PublicNav loggedUser={loggedUser} />
            <Hero onCta={handleCta} />
            <Pillars />
            <HowItWorks />
            <Packages onChoosePackage={handleCta} />
            <Testimonial />
            <TrustStrip />
            <Footer />
        </div>
    );
}
