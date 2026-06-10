import { Check } from "lucide-react";
import { peso } from "../utils/types";
import { upgradeCharge } from "../utils/upgrade";

// ── Plan data (full benefit strings, mirrors Membership.tsx PLANS) ────────────
const PLANS = [
    {
        id: "basic",
        tag: "INDIVIDUAL",
        name: "Basic Care",
        price: 698,
        benefits: [
            "Accidental Death — ₱10,000 cash (1 month)",
            "Natural Death — ₱20,000 cash + ₱5,000 groceries (5 months)",
            "Natural/Accidental Death — ₱40,000 + ₱10,000 groceries + tribute, tarpaulin & wake flower (10 months)",
            "Hospital Cash Assistance — ₱5,000 + ₱800/day room, max 7 days (6 months)",
            "Senior Citizen Gift — ₱5,000 (age 60, 70, 80 ,90) / ₱25,000 (age 100)",
            "Agent commission (1st level rank)",
            "Local & international travel opportunity",
            "Livelihood project participation",
        ],
    },
    {
        id: "family",
        tag: "FAMILY OF 4",
        name: "Family Care",
        price: 1698,
        popular: true,
        benefits: [
            "Principal & Spouse full coverage, 2 beneficiaries at 50%",
            "Accidental Death — ₱10,000 cash (1 month)",
            "Natural Death — ₱20,000 + ₱5,000 groceries (5 months)",
            "Natural/Accidental Death — ₱40,000 + ₱10,000 groceries + tribute, tarpaulin & wake flower (10 months)",
            "Hospital Cash — ₱5,000, room ₱1,500/day max 7 days (6 months)",
            "Senior Citizen Gift — ₱5,000 (age 60, 70, 80 ,90) / ₱25,000 (age 100)",
            "Calamity Assistance — ₱5,000 act of nature (8 months)",
            "Leadership bonus up to 3rd level rank",
            "Chance to win a car",
            "Local & international travel opportunity",
            "Livelihood project participation",
        ],
    },
    {
        id: "premium",
        tag: "FAMILY OF 5",
        name: "Premium Care",
        price: 4998,
        benefits: [
            "Principal & Spouse full coverage, 3 beneficiaries at 50%",
            "Accidental Death — ₱20,000 (1 month)",
            "Natural Death — ₱40,000 + ₱10,000 groceries (5 months)",
            "Natural/Accidental Death — ₱80,000 + ₱20,000 groceries + tribute, tarpaulin & wake flower (10 months)",
            "Hospital Cash — ₱10,000, room ₱3,000/day max 7 days (6 months)",
            "Senior Citizen Gift — ₱20,000 (age 60, 70, 80 ,90) / ₱50,000 (age 100)",
            "Birthday Care — ₱5,000 + cake + tarpulin (8 months)",
            "Maternity — ₱10,000 normal / ₱20,000 caesarean (8 months)",
            "Calamity — ₱10,000 act of nature (8 months)",
            "Leadership bonus up to 6th level rank",
            "Chance to win a car",
            "Local & international travel opportunity",
            "Livelihood project participation",
        ],
    },
];

type Plan = (typeof PLANS)[number];
type Standing = "current" | "upgrade" | "lower";

interface Props {
    currentPackage: string;
    phase: "active" | "grace"; // renewal lifecycle
    inUpgradeGrace: boolean; // within the 90-day upgrade window (pay the difference)
    canUpgrade?: boolean; // false hides upgrade buttons (e.g. an upgrade is already pending)
    canRenew?: boolean; // false hides renew buttons (e.g. a renewal is already pending)
    onUpgrade?: (planId: string) => void;
    onRenew?: (planId: string) => void;
}

// ── PlanCard ──────────────────────────────────────────────────────────────────
function PlanCard({
    plan,
    standing,
    phase,
    inUpgradeGrace,
    currentPackage,
    canUpgrade,
    canRenew,
    onUpgrade,
    onRenew,
}: {
    plan: Plan;
    standing: Standing;
    phase: "active" | "grace";
    inUpgradeGrace: boolean;
    currentPackage: string;
    canUpgrade?: boolean;
    canRenew?: boolean;
    onUpgrade?: (planId: string) => void;
    onRenew?: (planId: string) => void;
}) {
    // When active & this is an upgrade, the headline price reflects our upgrade
    // calculation (difference within the 90-day window, otherwise full price).
    const isUpgrade = standing === "upgrade";
    const showUpgradePrice = phase === "active" && isUpgrade;
    const upgradeAmount = showUpgradePrice ? upgradeCharge(currentPackage, plan.id, inUpgradeGrace) : 0;

    return (
        <div className="relative">
            {plan.popular && (
                <div className="bg-fsc-green absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold whitespace-nowrap text-white shadow-sm">
                    ✦ Most popular
                </div>
            )}
            <div
                className={`flex flex-col rounded-2xl border bg-white p-7 ${
                    plan.popular ? "border-fsc-green shadow-md" : "border-fsc-cream-dark shadow-sm"
                }`}
            >
                <div className="text-fsc-stone mb-1 text-xs font-medium tracking-[0.15em] uppercase">{plan.tag}</div>
                <h3 className="font-display text-fsc-navy mb-4 text-3xl">{plan.name}</h3>

                {/* Price — full, or the calculated upgrade amount when applicable */}
                <div className="mb-5">
                    {showUpgradePrice ? (
                        <>
                            <span className="font-display text-fsc-navy text-5xl">{peso(upgradeAmount)}</span>
                            {inUpgradeGrace && (
                                <p className="text-fsc-stone mt-1 text-xs">
                                    Full price {peso(plan.price)} · you only pay the difference
                                </p>
                            )}
                        </>
                    ) : (
                        <>
                            <span className="font-display text-fsc-navy text-5xl">{peso(plan.price)}</span>
                        </>
                    )}
                </div>

                <ul className="mb-5 flex-1 space-y-2.5">
                    {plan.benefits.map((b, bi) => (
                        <li key={bi} className="flex items-start gap-2.5 text-sm">
                            <Check size={14} className="text-fsc-green mt-0.5 shrink-0" />
                            <span className="text-fsc-navy/80">{b}</span>
                        </li>
                    ))}
                </ul>

                {/* Footer — Renew during grace · Upgrade when active · badge otherwise */}
                <div className="mt-5">
                    {phase === "grace" ? (
                        canRenew ? (
                            <button
                                type="button"
                                onClick={() => onRenew?.(plan.id)}
                                className="bg-fsc-green w-full rounded-xl py-2.5 text-sm font-medium text-white transition-all hover:brightness-110"
                            >
                                Renew
                            </button>
                        ) : (
                            <div className="text-fsc-stone rounded-full bg-black/[0.04] py-2 text-center text-xs font-medium">Renewal pending</div>
                        )
                    ) : standing === "current" ? (
                        <div className="bg-fsc-navy/8 text-fsc-navy rounded-full py-2 text-center text-xs font-medium">✓ Your current plan</div>
                    ) : standing === "upgrade" ? (
                        canUpgrade ? (
                            <button
                                type="button"
                                onClick={() => onUpgrade?.(plan.id)}
                                className="bg-fsc-green w-full rounded-xl py-2.5 text-sm font-medium text-white transition-all hover:brightness-110"
                            >
                                Upgrade →
                            </button>
                        ) : (
                            <div className="text-fsc-stone rounded-full bg-black/[0.04] py-2 text-center text-xs font-medium">Upgrade pending</div>
                        )
                    ) : (
                        <div className="text-fsc-stone rounded-full bg-black/[0.04] py-2 text-center text-xs font-medium">Lower tier</div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Main component — read-only comparison grid ────────────────────────────────
export default function PackageComparison({ currentPackage, phase, inUpgradeGrace, canUpgrade = true, canRenew = true, onUpgrade, onRenew }: Props) {
    const cur = (currentPackage ?? "").toLowerCase();
    const currentIndex = PLANS.findIndex((p) => p.id === cur);

    return (
        <div className="space-y-6">
            <div className="grid items-start gap-6 md:grid-cols-3">
                {PLANS.map((plan, i) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        standing={i === currentIndex ? "current" : i > currentIndex ? "upgrade" : "lower"}
                        phase={phase}
                        inUpgradeGrace={inUpgradeGrace}
                        currentPackage={cur}
                        canUpgrade={canUpgrade}
                        canRenew={canRenew}
                        onUpgrade={onUpgrade}
                        onRenew={onRenew}
                    />
                ))}
            </div>
            <p className="border-fsc-cream-dark text-fsc-stone border-t pt-4 text-xs leading-relaxed">
                <span className="text-fsc-navy font-medium">Disclaimer:</span> The benefits presented, including coverage for natural
                calamity, accidental incidents, natural death, maternity-related assistance, and hospitalization, are governed by
                official policy contracts, benefit limitations, and company guidelines. Availability of benefits and claims approval
                are subject to plan provisions and evaluation.
            </p>
        </div>
    );
}
