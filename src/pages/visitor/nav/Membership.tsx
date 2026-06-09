import React, { useState } from "react";
import { Check } from "lucide-react";
import PublicNav from "../PublicNav";
import { Footer } from "../Footer";

const PLANS = [
    {
        tier: "bronze" as const,
        tag: "Individual",
        name: "Basic Care",
        price: "₱698",
        benefits: [
            "Accidental Death — ₱10,000 cash (1 month)",
            "Natural Death — ₱20,000 cash + ₱5,000 groceries (5 months)",
            "Natural/Accidental Death — ₱40,000 + ₱10,000 groceries + tribute, tarpaulin & wake flower (10 months)",
            "Hospital Cash Assistance — ₱5,000 + ₱800/day room, max 7 days (6 months)",
            "Senior Citizen Gift — ₱5,000 (age 60,70,80,90) / ₱25,000 (age 100)",
            "Agent commission (1st level rank)",
            "Local & international travel opportunity",
            "Livelihood project participation",
        ],
    },
    {
        tier: "silver" as const,
        tag: "Family of 4",
        name: "Family Care",
        price: "₱1,698",
        featured: true,
        benefits: [
            "Principal & spouse full coverage, 2 beneficiaries at 50%",
            "Accidental Death — ₱10,000 cash (1 month)",
            "Natural Death — ₱20,000 + ₱5,000 groceries (5 months)",
            "Natural/Accidental Death — ₱40,000 + ₱10,000 groceries + tribute, tarpaulin & wake flower (10 months)",
            "Hospital Cash — ₱5,000, room ₱1,500/day max 7 days (6 months)",
            "Senior Citizen Gift — ₱5,000 (age 60,70,80,90) / ₱25,000 (age 100)",
            "Calamity Assistance — ₱5,000 (fire or flood, 8 months)",
            "Leadership bonus up to 3rd level rank",
            "Chance to win a car",
            "Local & international travel opportunity",
            "Livelihood project participation",
        ],
    },
    {
        tier: "gold" as const,
        tag: "Family of 5",
        name: "Premium Care",
        price: "₱4,998",
        benefits: [
            "Principal & spouse full coverage, 3 beneficiaries at 50%",
            "Accidental Death — ₱20,000 (1 month)",
            "Natural Death — ₱40,000 + ₱10,000 groceries (5 months)",
            "Natural/Accidental Death — ₱80,000 + ₱20,000 groceries + tribute, tarpaulin & wake flower (10 months)",
            "Hospital Cash — ₱10,000, room ₱3,000/day max 7 days (6 months)",
            "Senior Citizen Gift — ₱20,000 (age 60,70,80,90) / ₱50,000 (age 100)",
            "Birthday Care — ₱5,000 + cake + tarpulin (8 months)",
            "Maternity — ₱10,000 normal / ₱20,000 caesarean (8 months)",
            "Calamity — ₱10,000 fire or flood (8 months)",
            "Leadership bonus up to 6th level rank",
            "Chance to win a car",
            "Local & international travel opportunity",
            "Livelihood project participation",
        ],
    },
];

const MemberCard: React.FC<{ plan: (typeof PLANS)[0] }> = ({ plan }) => {
    const [hovered, setHovered] = useState(false);
    const { tier, tag, name, price, benefits, featured } = plan;
    const isFeatured = !!featured;

    const transform = isFeatured
        ? hovered ? "scale(1.05) translateY(-6px)" : "scale(1.03)"
        : hovered ? "translateY(-6px)" : "translateY(0)";
    const boxShadow = hovered
        ? "0 20px 48px rgba(0,0,0,0.12)"
        : isFeatured
            ? "0 8px 32px rgba(0,0,0,0.10)"
            : "0 2px 12px rgba(0,0,0,0.06)";

    return (
        <div className="relative">
            {isFeatured && (
                <div
                    className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold whitespace-nowrap text-white"
                    style={{ background: "#C9922A", boxShadow: "0 2px 8px rgba(201,146,42,0.35)" }}
                >
                    ✦ Most popular
                </div>
            )}
            <div
                className={`tier-${tier} rounded-2xl p-8 flex flex-col`}
                style={{ transform, boxShadow, transition: "transform 0.25s ease, box-shadow 0.25s ease" }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <div className="tier-coverage mb-1 text-xs font-medium tracking-[0.15em] uppercase">{tag}</div>
                <h3 className="tier-name font-display mb-4 text-3xl">{name}</h3>

                <div className="mb-6">
                    <span className="tier-price font-display text-5xl">{price}</span>
                    <span className="tier-price-note ml-2 text-sm">one-time</span>
                </div>

                <div className="tier-divider mb-6 h-px" />

                <ul className="mb-6 flex-1 space-y-3">
                    {benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                            <Check size={15} className="tier-check mt-0.5 shrink-0" />
                            <span className="tier-benefit-name">{b}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const Membership: React.FC = () => {

    return (
        <div className="min-h-screen font-body text-fsc-ink antialiased flex flex-col">
            <PublicNav />
            <div className="anim-fade-up flex-1">
            {/* Hero */}
            <section className="fsc-cream">
                <div className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
                    <div className="text-xs tracking-[0.2em] uppercase text-fsc-green mb-4">Membership Packages</div>
                    <h1 className="font-display text-5xl lg:text-6xl text-fsc-navy leading-tight mb-6">
                        Choose the plan that fits your family.
                    </h1>
                    <p className="text-fsc-stone text-lg leading-relaxed max-w-2xl">
                        Every Faith Shield Care membership gives your family access to financial assistance, emergency support, and community care services — guided by faith and driven by compassion.
                    </p>
                </div>
            </section>

            {/* Package Cards */}
            <section className="bg-white border-y border-fsc-cream-dark">
                <div className="max-w-5xl mx-auto px-6 lg:px-8 py-20">
                    <div className="text-xs tracking-[0.2em] uppercase text-fsc-green mb-4">Packages</div>
                    <h2 className="font-display text-3xl text-fsc-navy mb-10">Three tiers, one community</h2>
                    <div className="grid md:grid-cols-3 gap-6 items-center">
                        {PLANS.map((plan) => (
                            <MemberCard key={plan.name} plan={plan} />
                        ))}
                    </div>
                    <p className="mt-10 border-t border-fsc-cream-dark pt-6 text-xs leading-relaxed text-fsc-stone">
                        <span className="font-medium text-fsc-navy">Disclaimer:</span> The benefits presented, including coverage for natural calamity, accidental incidents, natural death, maternity-related assistance, and hospitalization, are governed by official policy contracts, benefit limitations, and company guidelines. Availability of benefits and claims approval are subject to plan provisions and evaluation.
                    </p>
                </div>
            </section>

            {/* Services Overview */}
            <section className="fsc-cream">
                <div className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
                    <div className="text-xs tracking-[0.2em] uppercase text-fsc-green mb-4">All services</div>
                    <h2 className="font-display text-3xl text-fsc-navy mb-10">What the program covers</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {[
                            { title: "Financial Assistance", items: ["Emergency cash assistance", "Hospital support", "Burial assistance", "Birthday care gift", "Senior citizen recognition gift", "Maternity assistance", "Calamity assistance"] },
                            { title: "Community Care Services", items: ["Counseling and family support", "Prayer and spiritual care", "Community feeding programs", "Medical missions"] },
                            { title: "Livelihood Programs", items: ["Skills training", "Small business support", "Livelihood starter kits", "Financial literacy seminars"] },
                            { title: "Member Rewards & Leadership", items: ["Referral incentives", "Leadership development", "Community service recognition", "Team-building opportunities"] },
                        ].map((section, i) => (
                            <div key={i} className="border border-fsc-cream-dark rounded-2xl p-6 bg-white">
                                <div className="font-display text-base text-fsc-navy mb-3">{section.title}</div>
                                {section.items.map((item, j) => (
                                    <div key={j} className="flex gap-2 text-sm text-fsc-stone py-1 border-b border-fsc-cream-dark last:border-0">
                                        <span className="text-fsc-green shrink-0">•</span>
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Target Market */}
            <section className="bg-white border-t border-fsc-cream-dark">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20">
                    <div className="text-xs tracking-[0.2em] uppercase text-fsc-green mb-4">Who this is for</div>
                    <h2 className="font-display text-3xl text-fsc-navy mb-10">Built for every Filipino family</h2>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {["Low income households", "Informal workers", "Small business owners", "Senior citizens", "Church communities", "Community associations", "Cooperatives and local groups", "Persons with disabilities (PWD)", "Single parents"].map((m, i) => (
                            <div key={i} className="border border-fsc-cream-dark rounded-2xl px-5 py-4">
                                <div className="font-display text-xs text-fsc-stone mb-1">0{i + 1}</div>
                                <div className="font-display text-lg text-fsc-navy">{m}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            </div>
            <Footer />
        </div>
    );
};

export default Membership;