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

const PackageCard: React.FC<PackageCardProps> = ({ pkg, onChoosePackage }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className={`relative rounded-3xl p-8 transition-all ${
                pkg.popular ? "bg-gpsc-navy scale-105 text-white shadow-2xl" : "border-gpsc-cream-dark border bg-white"
            }`}
        >
            {pkg.popular && (
                <div className="bg-gpsc-green absolute -top-3 left-8 rounded-full px-3 py-1 text-xs font-medium text-white">Most popular</div>
            )}
            <div className={`mb-2 text-xs tracking-widest uppercase ${pkg.popular ? "text-gpsc-green-light" : "text-gpsc-green"}`}>
                {pkg.coverage}
            </div>
            <h3 className={`font-display mb-2 text-3xl ${pkg.popular ? "text-white" : "text-gpsc-navy"}`}>{pkg.name}</h3>
            <p className={`mb-6 text-sm italic ${pkg.popular ? "text-white/70" : "text-gpsc-stone"}`}>{pkg.tagline}</p>
            <div className="mb-8">
                <span className={`font-display text-5xl ${pkg.popular ? "text-white" : "text-gpsc-navy"}`}>{peso(pkg.price)}</span>
                <span className={`ml-2 text-sm ${pkg.popular ? "text-white/60" : "text-gpsc-stone"}`}>one-time</span>
            </div>
            <div className={`mb-6 h-px ${pkg.popular ? "bg-white/20" : "bg-gpsc-cream-dark"}`}></div>
            <ul className="mb-8 space-y-3">
                {pkg.benefits.slice(0, 5).map((b, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                        <Check size={16} className={`mt-0.5 shrink-0 ${pkg.popular ? "text-gpsc-green-light" : "text-gpsc-green"}`} />
                        <div>
                            <div className={pkg.popular ? "text-white" : "text-gpsc-navy"}>{b.label}</div>
                            <div className={`text-xs ${pkg.popular ? "text-white/60" : "text-gpsc-stone"}`}>{b.amount}</div>
                        </div>
                    </li>
                ))}
                {pkg.benefits.length > 5 && (
                    <li className={`text-xs italic ${pkg.popular ? "text-white/50" : "text-gpsc-stone"}`}>
                        + {pkg.benefits.length - 5} more benefits
                    </li>
                )}
            </ul>
            <button
                onClick={() => onChoosePackage(pkg.name)}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={
                    pkg.popular
                        ? { backgroundColor: hovered ? "#4A8A2C" : "#5DAB3A", color: "#ffffff" }
                        : { backgroundColor: hovered ? "#14365C" : "transparent", color: hovered ? "#ffffff" : "#14365C" }
                }
                className="border-gpsc-navy w-full cursor-pointer rounded-full border py-3 font-medium transition-colors"
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
            <div className="grid gap-6 md:grid-cols-3">
                {packages.map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} onChoosePackage={onChoosePackage} />
                ))}
            </div>
        </div>
    </section>
);
