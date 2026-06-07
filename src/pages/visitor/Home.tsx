import React from "react";
import PublicNav from "./PublicNav";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { Pillars } from "./Pillars";
import { HowItWorks } from "./HowItWorks";
import { Packages } from "./Packages";
import { Testimonial } from "./Testimonial";
import { TrustStrip } from "./TrustStrip";
import { CTABanner } from "./CTABanner";
import { Navigate, useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";

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
            <Testimonial />
            <TrustStrip />
            <CTABanner />
            <Footer />
        </div>
    );
}
