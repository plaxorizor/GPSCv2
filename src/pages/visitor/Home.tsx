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
import useAuth from "../../context/useAuth";
import { useAdmin } from "../../hooks/useAdmin";
import { Navigate } from "react-router";

export default function Home(): React.ReactElement {
    const { User } = useAuth(); // Get the current user from Firebase Auth
    const { isAdmin, loading } = useAdmin(); // Get admin status and loading state
    
    const handleCta = (action: string) => {
        alert(`${action} (demo mode)`);
    };

    if (loading) return <p>Loading...</p>; // Show loading state while checking admin status
    if (!User)
        // visitor → show landing page
        return (
            <div className="min-h-screen font-body text-gpsc-ink antialiased">
                <GlobalStyles />
                <PublicNav loggedUser={User} />
                <Hero onCta={handleCta} />
                <Pillars />
                <HowItWorks />
                <Packages onChoosePackage={handleCta} />
                <Testimonial />
                <TrustStrip />
                <Footer />
            </div>
        );

    if (isAdmin) return <Navigate to="/admin" />; // Show redirecting state if user is admin
    return <Navigate to="/dashboard" />; // Redirect logged-in users to dashboard
}
