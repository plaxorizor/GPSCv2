import React from "react";
import PublicNav from "../components/layout/PublicNav";
import { Footer } from "../components/layout/Footer";
import { Hero } from "../components/landing/Hero";
import { Pillars } from "../components/landing/Pillars";
import { HowItWorks } from "../components/landing/HowItWorks";
import { Packages } from "../components/landing/Packages";
import { TrustStrip } from "../components/landing/TrustStrip";
import { CTABanner } from "../components/landing/CTABanner";
import { Navigate, useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth";

export default function Home(): React.ReactElement {
    const { currentUser: user } = useAuth();
    const navigate = useNavigate();
    if (user) return <Navigate to="/dashboard" />;

    return (
        <div className="font-body text-fsc-ink min-h-screen antialiased">
            <PublicNav />
            <Hero />
            <Pillars />
            <HowItWorks />
            <Packages onChoosePackage={() => navigate("/signup")} />
            <TrustStrip />
            <CTABanner />
            <Footer />
        </div>
    );
}
