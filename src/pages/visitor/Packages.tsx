import React, { useState } from "react";
import { Check } from "lucide-react";
import { packages, peso } from "../../utils/types";

interface PackagesProps {
    onChoosePackage: (packageName: string) => void;
}

interface PackageCardProps {
    pkg: (typeof packages)[0];
    onChoosePackage: (packageName: string) => void;
}

// Maps package id (or index) to a tier name and label.
// Adjust the ids here to match your actual packages array order/ids.
const TIER_MAP: Record<string, { tier: "bronze" | "silver" | "gold"; label: string }> = {
    basic: { tier: "bronze", label: "Bronze" },
    family: { tier: "silver", label: "Silver" },
    premium: { tier: "gold", label: "Gold" },
};

// Fallback by index if pkg.id doesn't match the map above
const TIER_BY_INDEX: Array<{ tier: "bronze" | "silver" | "gold"; label: string }> = [
    { tier: "bronze", label: "Bronze" },
    { tier: "silver", label: "Silver" },
    { tier: "gold", label: "Gold" },
];

const PackageCard: React.FC<PackageCardProps & { index: number }> = ({ pkg, onChoosePackage, index }) => {
    const [hovered, setHovered] = useState(false);
    const tierInfo = TIER_MAP[pkg.id] ?? TIER_BY_INDEX[index] ?? TIER_BY_INDEX[0];
    const { tier } = tierInfo;
    const isFeatured = tier === "silver"; // silver card gets the scale-up + badge treatment

    return (
        <div
            className={`tier-${tier} relative rounded-3xl p-8 transition-all duration-200 ${isFeatured ? "scale-105 shadow-2xl" : ""}`}
            style={{ transform: isFeatured ? (hovered ? "scale(1.06) translateY(-4px)" : "scale(1.05)") : hovered ? "translateY(-4px)" : undefined }}
        >
            {isFeatured && (
                <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold whitespace-nowrap text-white"
                    style={{ background: "linear-gradient(135deg, #6BA8C8 0%, #8FBFD8 100%)", boxShadow: "0 2px 10px rgba(108,168,200,0.4)" }}
                >
                    ✦ Most popular
                </div>
            )}

            {/* Coverage label */}
            <div className="tier-coverage mb-1 text-xs font-medium tracking-[0.16em] uppercase">{pkg.coverage}</div>

            {/* Package name */}
            <h3 className="tier-name font-display mb-2 text-3xl">{pkg.name}</h3>

            {/* Tagline */}
            <p className="tier-tagline font-display mb-6 text-sm italic">{pkg.tagline}</p>

            {/* Price */}
            <div className="mb-8">
                <span className="tier-price font-display text-5xl">{peso(pkg.price)}</span>
                <span className="tier-price-note ml-2 text-sm">one-time</span>
            </div>

            {/* Divider */}
            <div className="tier-divider mb-6 h-px"></div>

            {/* Benefits list */}
            <ul className="mb-8 space-y-3">
                {pkg.benefits.slice(0, 5).map((b, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                        <Check size={16} className="tier-check mt-0.5 shrink-0" />
                        <div>
                            <div className="tier-benefit-name font-medium">{b.label}</div>
                            <div className="tier-benefit-amt text-xs">{b.amount}</div>
                        </div>
                    </li>
                ))}
                {pkg.benefits.length > 5 && <li className="tier-more pl-6 text-xs italic">+ {pkg.benefits.length - 5} more benefits</li>}
            </ul>

            {/* CTA button */}
            <button
                onClick={() => onChoosePackage(pkg.name)}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="tier-btn w-full cursor-pointer rounded-full py-3 text-sm font-semibold transition-colors"
            >
                Choose {pkg.name}
            </button>
        </div>
    );
};

export const Packages: React.FC<PackagesProps> = ({ onChoosePackage }) => (
    <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
            <div className="mb-16 text-center">
                <div className="text-gpsc-green mb-4 text-xs tracking-[0.2em] uppercase">Membership packages</div>
                <h2 className="font-display text-gpsc-navy text-4xl lg:text-5xl">Pick the cover that fits your family.</h2>
            </div>
            <div className="grid items-center gap-6 md:grid-cols-3">
                {packages.map((pkg, i) => (
                    <PackageCard key={pkg.id} pkg={pkg} onChoosePackage={onChoosePackage} index={i} />
                ))}
            </div>
        </div>
    </section>
);
