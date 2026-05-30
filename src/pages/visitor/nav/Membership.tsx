import React from "react";
import { GlobalStyles } from "../GlobalStyles";
import { Footer } from "../Footer";

const Membership: React.FC = () => {
    return (
        <div className="font-body text-gpsc-ink min-h-screen antialiased">
            <GlobalStyles />
            <main className="mx-auto max-w-4xl px-6 py-20">
                <h1 className="font-display text-gpsc-navy mb-4 text-4xl">Membership Packages</h1>
                <p className="text-gpsc-stone">
                    Choose from Basic Care (₱698), Family Care (₱1,698), or Premium Care (₱4,998). Each package unlocks benefits like hospital cash,
                    accidental/natural death assistance, maternity aid, and more.
                </p>
            </main>
            <Footer />
        </div>
    );
};

export default Membership;
