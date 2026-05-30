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

export default function Home(): React.ReactElement {

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
