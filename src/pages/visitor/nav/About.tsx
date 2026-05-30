import React, { useState, useEffect } from "react";
import { auth } from "../../../firebase/config";
import type { User } from "firebase/auth";
import { GlobalStyles } from "../GlobalStyles";
import PublicNav from "../PublicNav";
import { Footer } from "../Footer";

const About: React.FC = () => {
    const [loggedUser, setLoggedUser] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
            setLoggedUser(user?.email ?? null);
        });
        return unsubscribe;
    }, []);

    return (
        <div className="min-h-screen font-body text-gpsc-ink antialiased">
            <GlobalStyles />
            <PublicNav loggedUser={loggedUser} />

            {/* Hero */}
            <section className="gpsc-cream max-w-4xl mx-auto px-6 lg:px-8 py-20">
                <div className="text-xs tracking-[0.2em] uppercase text-gpsc-green mb-4">About GPSC</div>
                <h1 className="font-display text-5xl lg:text-6xl text-gpsc-navy leading-tight mb-6">
                    Together in Christ, Stronger in Life.
                </h1>
                <p className="text-gpsc-stone text-lg leading-relaxed max-w-2xl">
                    Green Pasture Shepherd's Care is a community-based membership organization designed to provide
                    affordable financial assistance, emergency support, livelihood opportunities, and community care
                    services for low-income and middle-income Filipino families.
                </p>
            </section>

            {/* Vision & Mission */}
            <section className="bg-white border-y border-gpsc-cream-dark">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <div className="font-display text-sm uppercase tracking-widest text-gpsc-green mb-4">Vision</div>
                            <p className="font-display text-2xl text-gpsc-navy leading-snug">
                                To become a trusted community assistance organization that empowers families through
                                compassion, financial support, and sustainable community development.
                            </p>
                        </div>
                        <div>
                            <div className="font-display text-sm uppercase tracking-widest text-gpsc-green mb-4">Mission</div>
                            <p className="font-display text-2xl text-gpsc-navy leading-snug">
                                To provide accessible assistance programs, financial support services, leadership
                                opportunities, and community-based livelihood initiatives that improve the quality
                                of life of every member.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* What We Offer */}
            <section className="gpsc-cream max-w-4xl mx-auto px-6 lg:px-8 py-20">
                <div className="text-xs tracking-[0.2em] uppercase text-gpsc-green mb-4">Program benefits</div>
                <h2 className="font-display text-3xl text-gpsc-navy mb-10">What members receive</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    {[
                        { title: "Life Care", desc: "Financial support for natural and accidental death of members and beneficiaries." },
                        { title: "Emergency Assistance", desc: "Quick cash relief during calamities, accidents, and unexpected hardships." },
                        { title: "Hospital Support", desc: "Cash assistance for hospitalization to ease medical expenses." },
                        { title: "Burial Support", desc: "Immediate financial help to cover burial and funeral costs." },
                        { title: "Livelihood Opportunities", desc: "Training programs and livelihood initiatives to improve family income." },
                        { title: "Community Care Services", desc: "Medical missions, feeding programs, and community development activities." },
                    ].map((item, i) => (
                        <div key={i} className="border border-gpsc-cream-dark rounded-2xl p-6 bg-white">
                            <div className="font-display text-xs text-gpsc-stone mb-1">0{i + 1}</div>
                            <div className="font-display text-xl text-gpsc-navy mb-2">{item.title}</div>
                            <div className="text-sm text-gpsc-stone leading-relaxed">{item.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Core Values */}
            <section className="bg-white border-y border-gpsc-cream-dark">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20">
                    <div className="text-xs tracking-[0.2em] uppercase text-gpsc-green mb-4">Core values</div>
                    <h2 className="font-display text-3xl text-gpsc-navy mb-10">What guides every decision</h2>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {["Compassion", "Integrity", "Accountability", "Unity", "Service", "Faith and Hope", "Community Empowerment"].map((v, i) => (
                            <div key={i} className="border border-gpsc-cream-dark rounded-2xl px-5 py-4">
                                <div className="font-display text-xs text-gpsc-stone mb-1">0{i + 1}</div>
                                <div className="font-display text-xl text-gpsc-navy">{v}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Objectives */}
            <section className="gpsc-cream max-w-4xl mx-auto px-6 lg:px-8 py-20">
                <div className="text-xs tracking-[0.2em] uppercase text-gpsc-green mb-4">Objectives</div>
                <h2 className="font-display text-3xl text-gpsc-navy mb-10">What we work toward</h2>
                <div className="space-y-4">
                    {[
                        "Provide affordable assistance programs for families.",
                        "Create sustainable community support systems.",
                        "Offer emergency financial assistance to qualified members.",
                        "Develop livelihood and training opportunities.",
                        "Encourage leadership and volunteerism.",
                        "Build long-term financial sustainability for the organization.",
                    ].map((obj, i) => (
                        <div key={i} className="border border-gpsc-cream-dark rounded-2xl px-6 py-4 bg-white flex items-center gap-4">
                            <div className="font-display text-2xl text-gpsc-green/40 w-10 shrink-0">0{i + 1}</div>
                            <div className="text-gpsc-navy">{obj}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Officers */}
            <section className="bg-white border-t border-gpsc-cream-dark">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20">
                    <div className="text-xs tracking-[0.2em] uppercase text-gpsc-green mb-4">Leadership</div>
                    <h2 className="font-display text-3xl text-gpsc-navy mb-10">Officers and board</h2>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {[
                            { role: "CEO / President", note: "Governance, strategy, partnerships" },
                            { role: "VP for Finance / Treasurer", note: "Financial management, audit" },
                            { role: "VP for Sales & Marketing", note: "Operations, growth, member acquisition" },
                            { role: "Secretary", note: "Records, governance documents" },
                            { role: "Auditor", note: "Independent financial review" },
                            { role: "Public Relations Officer", note: "Communications, community" },
                        ].map((officer, i) => (
                            <div key={i} className="border border-gpsc-cream-dark rounded-2xl p-5">
                                <div className="w-12 h-12 rounded-full bg-gpsc-cream-dark mb-4"></div>
                                <div className="font-display text-base text-gpsc-navy">{officer.role}</div>
                                <div className="text-sm text-gpsc-stone mt-1">{officer.note}</div>
                                <div className="text-xs text-gpsc-stone mt-3 italic">Name to be added</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default About;