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
import { Navigate, useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";

export default function Home(): React.ReactElement {
    const { currentUser: user } = useAuth();
    if (user) return <Navigate to="/dashboard" />;

    const navigate = useNavigate();

    return (
        <div className="min-h-screen font-body text-gpsc-ink antialiased">
            <GlobalStyles />
            <PublicNav />
            <Hero />
            <Pillars />
            <HowItWorks />
            <Packages onChoosePackage={() => navigate("/signup")} />
            <Testimonial />
            <TrustStrip />
            <Footer />
        </div>
    );
}