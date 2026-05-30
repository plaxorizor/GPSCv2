import React from "react";
import { GlobalStyles } from "../GlobalStyles";
import { Footer } from "../Footer";

const Referral: React.FC = () => {
    return (
        <div className="font-body text-gpsc-ink min-h-screen antialiased">
            <GlobalStyles />
            <main className="mx-auto max-w-4xl px-6 py-20">
                <h1 className="font-display text-gpsc-navy mb-4 text-4xl">Referral Program</h1>
                <p className="text-gpsc-stone">
                    Earn 20% commission on direct referrals plus overrides from your downline. Unlock higher ranks like Team Consultant, Sales
                    Manager, and National Director as your team grows.
                </p>
            </main>
            <Footer />
        </div>
    );
};

export default Referral;
