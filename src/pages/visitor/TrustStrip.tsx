import React from "react";

export const TrustStrip: React.FC = () => (
    <section className="bg-gpsc-navy text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
            <div className="grid items-center gap-12 md:grid-cols-2">
                <div>
                    <h2 className="font-display mb-4 text-3xl leading-tight lg:text-4xl">A community you can verify.</h2>
                    <p className="leading-relaxed text-white/70">
                        Every officer, registration, and benefit payout is on the record. We publish audited financials annually and welcome members
                        to attend board meetings.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: "Board of Directors", value: "7 named officers" },
                        { label: "Audited financials", value: "Published yearly" },
                        { label: "Average claim time", value: "4.2 days" },
                        { label: "Member satisfaction", value: "94%" },
                    ].map((s, i) => (
                        <div key={i} className="rounded-2xl border border-white/20 p-5">
                            <div className="mb-1 text-xs tracking-wider text-white/50 uppercase">{s.label}</div>
                            <div className="font-display text-xl">{s.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </section>
);
