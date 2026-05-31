import React from "react";
import { GlobalStyles } from "../GlobalStyles";
import PublicNav from "../PublicNav";
import { Footer } from "../Footer";

const Membership: React.FC = () => {

    return (
        <div className="min-h-screen font-body text-gpsc-ink antialiased">
            <GlobalStyles />
            <PublicNav />

            {/* Hero */}
            <section className="gpsc-cream max-w-4xl mx-auto px-6 lg:px-8 py-20">
                <div className="text-xs tracking-[0.2em] uppercase text-gpsc-green mb-4">Membership Packages</div>
                <h1 className="font-display text-5xl lg:text-6xl text-gpsc-navy leading-tight mb-6">
                    Choose the plan that fits your family.
                </h1>
                <p className="text-gpsc-stone text-lg leading-relaxed max-w-2xl">
                    Every membership gives your family access to financial assistance, emergency support, and community care — rooted in compassion and the Bayanihan spirit.
                </p>
            </section>

            {/* Package Cards */}
            <section className="bg-white border-y border-gpsc-cream-dark">
                <div className="max-w-5xl mx-auto px-6 lg:px-8 py-20">
                    <div className="text-xs tracking-[0.2em] uppercase text-gpsc-green mb-4">Packages</div>
                    <h2 className="font-display text-3xl text-gpsc-navy mb-10">Three tiers, one community</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                name: "Basic Care",
                                price: "₱698",
                                tag: "Individual",
                                color: "border-gpsc-cream-dark",
                                benefits: [
                                    "Accidental Death — ₱10,000 cash (1 month)",
                                    "Natural Death — ₱20,000 cash + ₱5,000 groceries (5 months)",
                                    "Natural/Accidental Death — ₱40,000 + ₱10,000 groceries + tribute (10 months)",
                                    "Hospital Cash Assistance — ₱5,000 (6 months)",
                                    "Room ₱1,500/day max 7 days",
                                    "Senior Citizen Gift — ₱5,000 (age 60–90) / ₱25,000 (age 100)",
                                    "Agent commission (1st level rank)",
                                    "Local & international travel opportunity",
                                    "Livelihood project participation",
                                ],
                                docs: ["Death Certificate", "Police Report (if accident)", "Valid ID", "Medical Certificate"],
                            },
                            {
                                name: "Family Care",
                                price: "₱1,698",
                                tag: "Family of 4",
                                color: "border-gpsc-green",
                                highlight: true,
                                benefits: [
                                    "Principal & spouse full coverage, 2 beneficiaries at 50%",
                                    "Accidental Death — ₱10,000 cash (1 month)",
                                    "Natural Death — ₱20,000 + ₱5,000 groceries (5 months)",
                                    "Natural/Accidental Death — ₱40,000 + ₱10,000 groceries + tribute (10 months)",
                                    "Hospital Cash — ₱5,000, room ₱1,500/day max 7 days (6 months)",
                                    "Senior Citizen Gift — ₱5,000 / ₱25,000 at age 100 (6 months)",
                                    "Calamity Assistance — ₱5,000 (fire or flood, 8 months)",
                                    "Leadership bonus up to 3rd level rank",
                                    "Chance to win a car",
                                    "Local & international travel opportunity",
                                ],
                                docs: ["Death Certificate", "Police Report", "Medical Certificate", "Valid ID"],
                            },
                            {
                                name: "Premium Care",
                                price: "₱4,998",
                                tag: "Family of 5",
                                color: "border-gpsc-navy",
                                benefits: [
                                    "Principal & spouse full coverage, 3 beneficiaries at 50%",
                                    "Accidental Death — ₱20,000 (1 month)",
                                    "Natural Death — ₱40,000 + ₱10,000 groceries (5 months)",
                                    "Natural/Accidental Death — ₱80,000 + ₱20,000 groceries + tribute (10 months)",
                                    "Hospital Cash — ₱10,000, room ₱3,000/day max 7 days (6 months)",
                                    "Senior Citizen Gift — ₱20,000 / ₱50,000 at age 100 (6 months)",
                                    "Birthday Care — ₱5,000 + cake + tarpulin (8 months)",
                                    "Maternity — ₱10,000 normal / ₱20,000 caesarean (8 months)",
                                    "Calamity — ₱10,000 fire or flood (8 months)",
                                    "Leadership bonus up to 6th level rank",
                                    "Chance to win a car",
                                    "Local & international travel opportunity",
                                ],
                                docs: ["Death Certificate", "Police Report", "Medical Certificate", "Valid ID", "Birth Certificate (NSO)", "Senior Citizen ID"],
                            },
                        ].map((pkg, i) => (
                            <div key={i} className={`border-2 ${pkg.color} rounded-2xl p-6 flex flex-col ${pkg.highlight ? "bg-gpsc-green/5" : "bg-white"}`}>
                                <div className="mb-6">
                                    <div className="text-xs uppercase tracking-widest text-gpsc-stone mb-1">{pkg.tag}</div>
                                    <div className="font-display text-2xl text-gpsc-navy mb-1">{pkg.name}</div>
                                    <div className="font-display text-4xl text-gpsc-green">{pkg.price}</div>
                                    <div className="text-xs text-gpsc-stone mt-1">one-time membership fee</div>
                                </div>
                                <div className="flex-1 space-y-2 mb-6">
                                    {pkg.benefits.map((b, j) => (
                                        <div key={j} className="flex gap-2 text-sm text-gpsc-stone">
                                            <span className="text-gpsc-green mt-0.5 shrink-0">✓</span>
                                            <span>{b}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-gpsc-cream-dark pt-4">
                                    <div className="text-xs uppercase tracking-widest text-gpsc-stone mb-2">Required documents</div>
                                    {pkg.docs.map((d, j) => (
                                        <div key={j} className="text-xs text-gpsc-stone">• {d}</div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Overview */}
            <section className="gpsc-cream max-w-4xl mx-auto px-6 lg:px-8 py-20">
                <div className="text-xs tracking-[0.2em] uppercase text-gpsc-green mb-4">All services</div>
                <h2 className="font-display text-3xl text-gpsc-navy mb-10">What the program covers</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    {[
                        { title: "Financial Assistance", items: ["Emergency cash assistance", "Hospital support", "Burial assistance", "Birthday care gift", "Senior citizen recognition gift", "Maternity assistance", "Calamity assistance"] },
                        { title: "Community Care Services", items: ["Counseling and family support", "Prayer and spiritual care", "Community feeding programs", "Medical missions"] },
                        { title: "Livelihood Programs", items: ["Skills training", "Small business support", "Livelihood starter kits", "Financial literacy seminars"] },
                        { title: "Member Rewards & Leadership", items: ["Referral incentives", "Leadership development", "Community service recognition", "Team-building opportunities"] },
                    ].map((section, i) => (
                        <div key={i} className="border border-gpsc-cream-dark rounded-2xl p-6 bg-white">
                            <div className="font-display text-base text-gpsc-navy mb-3">{section.title}</div>
                            {section.items.map((item, j) => (
                                <div key={j} className="flex gap-2 text-sm text-gpsc-stone py-1 border-b border-gpsc-cream-dark last:border-0">
                                    <span className="text-gpsc-green shrink-0">•</span>
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </section>

            {/* Target Market */}
            <section className="bg-white border-t border-gpsc-cream-dark">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20">
                    <div className="text-xs tracking-[0.2em] uppercase text-gpsc-green mb-4">Who this is for</div>
                    <h2 className="font-display text-3xl text-gpsc-navy mb-10">Built for every Filipino family</h2>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {["Low income households", "Informal workers", "Small business owners", "Senior citizens", "Church communities", "Community associations", "Cooperatives and local groups"].map((m, i) => (
                            <div key={i} className="border border-gpsc-cream-dark rounded-2xl px-5 py-4">
                                <div className="font-display text-xs text-gpsc-stone mb-1">0{i + 1}</div>
                                <div className="font-display text-lg text-gpsc-navy">{m}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Membership;