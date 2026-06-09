import React from "react";
import { Link } from "react-router-dom";
import PublicNav from "../PublicNav";
import { Footer } from "../Footer";

export interface LegalSection {
    heading: string;
    body: React.ReactNode;
}

interface Props {
    title: string;
    effectiveDate: string;
    intro?: React.ReactNode;
    sections: LegalSection[];
}

// Shared shell for the Legal pages (Privacy Policy, Terms of Service, Data
// Privacy). Matches the visitor page layout: nav, centered prose, footer.
const LegalPage: React.FC<Props> = ({ title, effectiveDate, intro, sections }) => (
    <div className="font-body text-fsc-ink flex min-h-screen flex-col antialiased">
        <PublicNav />
        <main className="anim-fade-up mx-auto w-full max-w-3xl flex-1 px-6 py-20">
            <h1 className="font-display text-fsc-navy mb-2 text-4xl">{title}</h1>
            <p className="text-fsc-stone mb-10 text-sm">Effective date: {effectiveDate}</p>

            {intro && <div className="text-fsc-stone mb-10 space-y-3 leading-relaxed">{intro}</div>}

            <div className="space-y-8">
                {sections.map((s, i) => (
                    <section key={i}>
                        <h2 className="font-display text-fsc-navy mb-3 text-xl">
                            {i + 1}. {s.heading}
                        </h2>
                        <div className="text-fsc-stone space-y-3 leading-relaxed">{s.body}</div>
                    </section>
                ))}
            </div>

            <div className="text-fsc-stone mt-10 leading-relaxed">
                Questions about this document? Reach us through our{" "}
                <Link to="/contact" className="text-fsc-green hover:underline">
                    Contact page
                </Link>
                .
            </div>
        </main>
        <Footer />
    </div>
);

export default LegalPage;
