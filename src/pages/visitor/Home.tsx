import React from "react";
import { GlobalStyles } from "./GlobalStyles";
import PublicNav from "./PublicNav";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { Pillars } from "./Pillars";
import { HowItWorks } from "./HowItWorks";
import { Packages } from "./Packages";
import { Testimonial } from "./Testimonial";
import { TrustStrip } from "./TrustStrip";
import { Navigate } from "react-router";
import useAuth from "../../context/useAuth";

export default function Home(): React.ReactElement {
    // If there's a logged in user, redirect to dashboard
    const { currentUser: user } = useAuth();
    if (user) return <Navigate to="/dashboard" />;

    const handleCta = (action: string) => {
        alert(`${action} (demo mode)`);
    };

    return (
        <div className="min-h-screen font-body text-gpsc-ink antialiased">
            <GlobalStyles />
            <PublicNav />
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
