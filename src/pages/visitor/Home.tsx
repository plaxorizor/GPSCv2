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
import { Navigate } from "react-router-dom";
import useAuth from "../../context/useAuth";

export default function Home(): React.ReactElement {
    const { currentUser: user } = useAuth();
    if (user) return <Navigate to="/dashboard" />;

    return (
        <div className="font-body text-gpsc-ink min-h-screen antialiased">
            <GlobalStyles />
            <PublicNav />
            <Hero />
            <Pillars />
            <HowItWorks />
            <Packages onChoosePackage={(packageName: string) => console.log(packageName + " chosen")} />
            <Testimonial />
            <TrustStrip />
            <Footer />
        </div>
    );
}
