import React from "react";
import { GlobalStyles } from "../GlobalStyles";
import PublicNav from "../PublicNav";
import { Footer } from "../Footer";

const About: React.FC = () => {
    return (
        <div className="font-body text-gpsc-ink min-h-screen antialiased">
            <GlobalStyles />
            <PublicNav />

            {/* Hero */}
            <section className="gpsc-cream mx-auto max-w-4xl px-6 py-20 lg:px-8">
                <div className="text-gpsc-green mb-4 text-xs tracking-[0.2em] uppercase">About Faith Shield Care</div>
                <h1 className="font-display text-gpsc-navy mb-6 text-5xl leading-tight lg:text-6xl">Together in Christ, Stronger in Life.</h1>
                <p className="text-gpsc-stone max-w-2xl text-lg leading-relaxed">
                    Faith Shield Care is a community-based membership organization designed to provide affordable financial assistance,
                    emergency support, livelihood opportunities, and community care services for low-income and middle-income Filipino families.
                </p>
            </section>

            {/* Vision & Mission */}
            <section className="border-gpsc-cream-dark border-y bg-white">
                <div className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
                    <div className="grid gap-12 md:grid-cols-2">
                        <div>
                            <div className="font-display text-gpsc-green mb-4 text-sm tracking-widest uppercase">Vision</div>
                            <p className="font-display text-gpsc-navy text-2xl leading-snug">
                                To become a trusted community assistance organization that empowers families through compassion, financial support,
                                and sustainable community development.
                            </p>
                        </div>
                        <div>
                            <div className="font-display text-gpsc-green mb-4 text-sm tracking-widest uppercase">Mission</div>
                            <p className="font-display text-gpsc-navy text-2xl leading-snug">
                                To provide accessible assistance programs, financial support services, leadership opportunities, and community-based
                                livelihood initiatives that improve the quality of life of every member.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* What We Offer */}
            <section className="gpsc-cream mx-auto max-w-4xl px-6 py-20 lg:px-8">
                <div className="text-gpsc-green mb-4 text-xs tracking-[0.2em] uppercase">Program benefits</div>
                <h2 className="font-display text-gpsc-navy mb-10 text-3xl">What members receive</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    {[
                        { title: "Life Care", desc: "Financial support for natural and accidental death of members and beneficiaries." },
                        { title: "Emergency Assistance", desc: "Quick cash relief during calamities, accidents, and unexpected hardships." },
                        { title: "Hospital Support", desc: "Cash assistance for hospitalization to ease medical expenses." },
                        { title: "Burial Support", desc: "Immediate financial help to cover burial and funeral costs." },
                        { title: "Livelihood Opportunities", desc: "Training programs and livelihood initiatives to improve family income." },
                        { title: "Community Care Services", desc: "Medical missions, feeding programs, and community development activities." },
                    ].map((item, i) => (
                        <div key={i} className="border-gpsc-cream-dark rounded-2xl border bg-white p-6">
                            <div className="font-display text-gpsc-stone mb-1 text-xs">0{i + 1}</div>
                            <div className="font-display text-gpsc-navy mb-2 text-xl">{item.title}</div>
                            <div className="text-gpsc-stone text-sm leading-relaxed">{item.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Core Values */}
            <section className="border-gpsc-cream-dark border-y bg-white">
                <div className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
                    <div className="text-gpsc-green mb-4 text-xs tracking-[0.2em] uppercase">Core values</div>
                    <h2 className="font-display text-gpsc-navy mb-10 text-3xl">What guides every decision</h2>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {["Compassion", "Integrity", "Accountability", "Unity", "Service", "Faith and Hope", "Community Empowerment"].map((v, i) => (
                            <div key={i} className="border-gpsc-cream-dark rounded-2xl border px-5 py-4">
                                <div className="font-display text-gpsc-stone mb-1 text-xs">0{i + 1}</div>
                                <div className="font-display text-gpsc-navy text-xl">{v}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Objectives */}
            <section className="gpsc-cream mx-auto max-w-4xl px-6 py-20 lg:px-8">
                <div className="text-gpsc-green mb-4 text-xs tracking-[0.2em] uppercase">Objectives</div>
                <h2 className="font-display text-gpsc-navy mb-10 text-3xl">What we work toward</h2>
                <div className="space-y-4">
                    {[
                        "Provide affordable assistance programs for families.",
                        "Create sustainable community support systems.",
                        "Offer emergency financial assistance to qualified members.",
                        "Develop livelihood and training opportunities.",
                        "Encourage leadership and volunteerism.",
                        "Build long-term financial sustainability for the organization.",
                    ].map((obj, i) => (
                        <div key={i} className="border-gpsc-cream-dark flex items-center gap-4 rounded-2xl border bg-white px-6 py-4">
                            <div className="font-display text-gpsc-green/40 w-10 shrink-0 text-2xl">0{i + 1}</div>
                            <div className="text-gpsc-navy">{obj}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Officers */}
            <section className="border-gpsc-cream-dark border-t bg-white">
                <div className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
                    <div className="text-gpsc-green mb-4 text-xs tracking-[0.2em] uppercase">Leadership</div>
                    <h2 className="font-display text-gpsc-navy mb-10 text-3xl">Officers and board</h2>
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                        {[
                            { role: "CEO / President", note: "Governance, strategy, partnerships" },
                            { role: "VP for Finance / Treasurer", note: "Financial management, audit" },
                            { role: "VP for Sales & Marketing", note: "Operations, growth, member acquisition" },
                            { role: "Secretary", note: "Records, governance documents" },
                            { role: "Auditor", note: "Independent financial review" },
                            { role: "Public Relations Officer", note: "Communications, community" },
                        ].map((officer, i) => (
                            <div key={i} className="border-gpsc-cream-dark rounded-2xl border p-5">
                                <div className="bg-gpsc-cream-dark mb-4 h-12 w-12 rounded-full"></div>
                                <div className="font-display text-gpsc-navy text-base">{officer.role}</div>
                                <div className="text-gpsc-stone mt-1 text-sm">{officer.note}</div>
                                <div className="text-gpsc-stone mt-3 text-xs italic">Name to be added</div>
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
