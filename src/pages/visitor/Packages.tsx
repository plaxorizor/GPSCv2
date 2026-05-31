import React, { useState } from "react";
import { Check } from "lucide-react";
import { packages, peso } from "./types";

interface PackagesProps {
  onChoosePackage: (packageName: string) => void;
}

interface PackageCardProps {
  pkg: typeof packages[0];
  onChoosePackage: (packageName: string) => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ pkg, onChoosePackage }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`relative rounded-3xl p-8 transition-all ${
        pkg.popular ? "bg-gpsc-navy text-white scale-105 shadow-2xl" : "border border-gpsc-cream-dark bg-white"
      }`}
    >
      {pkg.popular && (
        <div className="absolute -top-3 left-8 bg-gpsc-green text-white text-xs px-3 py-1 rounded-full font-medium">
          Most popular
        </div>
      )}
      <div className={`text-xs tracking-widest uppercase mb-2 ${pkg.popular ? "text-gpsc-green-light" : "text-gpsc-green"}`}>
        {pkg.coverage}
      </div>
      <h3 className={`font-display text-3xl mb-2 ${pkg.popular ? "text-white" : "text-gpsc-navy"}`}>
        {pkg.name}
      </h3>
      <p className={`text-sm mb-6 italic ${pkg.popular ? "text-white/70" : "text-gpsc-stone"}`}>
        {pkg.tagline}
      </p>
      <div className="mb-8">
        <span className={`font-display text-5xl ${pkg.popular ? "text-white" : "text-gpsc-navy"}`}>
          {peso(pkg.price)}
        </span>
        <span className={`text-sm ml-2 ${pkg.popular ? "text-white/60" : "text-gpsc-stone"}`}>one-time</span>
      </div>
      <div className={`h-px mb-6 ${pkg.popular ? "bg-white/20" : "bg-gpsc-cream-dark"}`}></div>
      <ul className="space-y-3 mb-8">
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
        className="w-full py-3 rounded-full font-medium transition-colors cursor-pointer border border-gpsc-navy"
      >
        Choose {pkg.name}
      </button>
    </div>
  );
};

export const Packages: React.FC<PackagesProps> = ({ onChoosePackage }) => (
  <section className="bg-white">
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-24">
      <div className="text-center mb-16">
        <div className="text-xs tracking-[0.2em] uppercase text-gpsc-green mb-4">Membership packages</div>
        <h2 className="font-display text-4xl lg:text-5xl text-gpsc-navy">Pick the cover that fits your family.</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} onChoosePackage={onChoosePackage} />
        ))}
      </div>
    </div>
  </section>
);