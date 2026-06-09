import React, { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { packages, peso } from "../../utils/types";
import { useScrollReveal } from "../../hooks/useScrollReveal";

interface PackagesProps {
    onChoosePackage: (packageName: string) => void;
}

const TIER_MAP: Record<string, "bronze" | "silver" | "gold"> = {
    basic:   "bronze",
    family:  "silver",
    premium: "gold",
};

const TIER_BY_INDEX: Array<"bronze" | "silver" | "gold"> = ["bronze", "silver", "gold"];

const PackageCard: React.FC<{
    pkg: (typeof packages)[0];
    onChoosePackage: (name: string) => void;
    index: number;
}> = ({ pkg, onChoosePackage, index }) => {
    const [hovered, setHovered] = useState(false);
    const tier = TIER_MAP[pkg.id] ?? TIER_BY_INDEX[index] ?? "bronze";
    const isFeatured = tier === "silver";

    return (
        <div className="relative">
            <div
                className={`tier-${tier} relative rounded-2xl p-8`}
                style={{
                    transform:  isFeatured
                        ? hovered ? "scale(1.05) translateY(-6px)" : "scale(1.03)"
                        : hovered ? "translateY(-6px)" : "translateY(0)",
                    boxShadow:  hovered
                        ? "0 20px 48px rgba(0,0,0,0.12)"
                        : isFeatured
                            ? "0 8px 32px rgba(0,0,0,0.10)"
                            : "0 2px 12px rgba(0,0,0,0.06)",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {isFeatured && (
                    <div
                        className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold whitespace-nowrap text-white"
                        style={{ background: "#C9922A", boxShadow: "0 2px 8px rgba(201,146,42,0.35)" }}
                    >
                        ✦ Most popular
                    </div>
                )}

                <div className="tier-coverage mb-1 text-xs font-medium tracking-[0.15em] uppercase">{pkg.coverage}</div>
                <h3 className="tier-name font-display mb-1 text-3xl">{pkg.name}</h3>
                <p className="tier-tagline font-display mb-6 text-sm italic">{pkg.tagline}</p>

                <div className="mb-8">
                    <span className="tier-price font-display text-5xl">{peso(pkg.price)}</span>
                    <span className="tier-price-note ml-2 text-sm">one-time</span>
                </div>

                <div className="tier-divider mb-6 h-px" />

                <ul className="mb-8 space-y-3">
                    {pkg.benefits.slice(0, 5).map((b, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                            <Check size={15} className="tier-check mt-0.5 shrink-0" />
                            <div>
                                <div className="tier-benefit-name font-medium">{b.label}</div>
                                <div className="tier-benefit-amt text-xs">{b.amount}</div>
                            </div>
                        </li>
                    ))}
                    {pkg.benefits.length > 5 && (
                        <li className="tier-more pl-5 text-xs italic">+ {pkg.benefits.length - 5} more benefits</li>
                    )}
                </ul>

                <button
                    onClick={() => onChoosePackage(pkg.name)}
                    className="tier-btn w-full cursor-pointer rounded-full py-3 text-sm font-semibold transition-colors"
                >
                    Choose {pkg.name}
                </button>
            </div>
        </div>
    );
};

export const Packages: React.FC<PackagesProps> = ({ onChoosePackage }) => {
    const { ref, inView } = useScrollReveal();
    const navigate = useNavigate();
    return (
    <section className="bg-white">
        <div ref={ref} className={`mx-auto max-w-6xl px-6 py-24 lg:px-8 scroll-reveal ${inView ? "in-view" : ""}`}>
            <div className="mb-16 text-center">
                <div className="text-fsc-green mb-4 text-xs tracking-[0.2em] uppercase">Membership packages</div>
                <h2 className="font-display text-fsc-navy text-4xl lg:text-5xl">Pick the cover that fits your family.</h2>
            </div>
            <div className="grid items-center gap-6 md:grid-cols-3">
                {packages.map((pkg, i) => (
                    <PackageCard key={pkg.id} pkg={pkg} onChoosePackage={onChoosePackage} index={i} />
                ))}
            </div>
            <div className="mt-10 text-center">
                <button
                    onClick={() => navigate("/membership")}
                    className="text-fsc-stone hover:text-fsc-navy inline-flex cursor-pointer items-center gap-1 text-sm transition-colors"
                >
                    See full comparison <ArrowRight size={13} />
                </button>
            </div>
        </div>
    </section>
    );
};
