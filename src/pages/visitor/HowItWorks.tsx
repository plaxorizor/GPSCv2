import React from "react";

export const HowItWorks: React.FC = () => (
    <section className="gpsc-cream">
        <div className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-12">
                <div className="lg:col-span-4">
                    <div className="text-gpsc-green mb-4 text-xs tracking-[0.2em] uppercase">How it works</div>
                    <h2 className="font-display text-gpsc-navy text-4xl leading-tight">A simple path from joining to thriving.</h2>
                </div>
                <div className="space-y-8 lg:col-span-8">
                    {[
                        {
                            n: "01",
                            title: "Choose your package",
                            desc: "Basic Care at ₱698, Family Care at ₱1,698, or Premium Care at ₱4,998 — a one-time contribution.",
                        },
                        {
                            n: "02",
                            title: "Activate benefits over time",
                            desc: "Each benefit becomes available after its eligibility window (1, 5, 6, 8, or 10 months of active membership).",
                        },
                        {
                            n: "03",
                            title: "Share with your community",
                            desc: "Use your personal referral link. Earn 20% on direct sales, plus 5%, 3%, 2%, 1%, 1% across five upline levels.",
                        },
                        {
                            n: "04",
                            title: "Claim when needed",
                            desc: "Submit your documents online or in person. Approved claims pay out via GCash, bank transfer, or in-person within 7 days.",
                        },
                    ].map((step, i) => (
                        <div key={i} className="group flex gap-6">
                            <div className="font-display text-gpsc-green/40 group-hover:text-gpsc-green w-16 shrink-0 text-4xl transition-colors">
                                {step.n}
                            </div>
                            <div className="border-gpsc-cream-dark flex-1 border-b pt-1 pb-8">
                                <h3 className="font-display text-gpsc-navy mb-2 text-2xl">{step.title}</h3>
                                <p className="text-gpsc-stone leading-relaxed">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </section>
);
