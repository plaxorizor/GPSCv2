import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { peso } from "../utils/types";

// ── Payment details (mirrors SignUp.tsx PAYMENT_INFO) ─────────────────────────
const PAYMENT_INFO = {
    accounts: [
        { label: "GCash",   accountName: "Faith Shield Care Official", number: "09XX-XXX-XXXX", qr: "" },
        { label: "Maya",    accountName: "Faith Shield Care Official", number: "09XX-XXX-XXXX", qr: "" },
        { label: "GoTyme",  accountName: "Faith Shield Care Official", number: "09XX-XXX-XXXX", qr: "" },
    ],
    receiptContacts: [
        { label: "Messenger", value: "Faith Shield Care Official" },
        { label: "Email",     value: "payments@faithshieldcare.com" },
    ],
    verificationDays: "1–2 business days",
};

// ── Plan data (full benefit strings, mirrors Membership.tsx PLANS) ────────────
const PLANS = [
    {
        id: "basic",
        tier: "bronze" as const,
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
        tier: "silver" as const,
        tag: "FAMILY OF 4",
        name: "Family Care",
        price: 1698,
        popular: true,
        benefits: [
            "Principal & spouse full coverage, 2 beneficiaries at 50%",
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
        tier: "gold" as const,
        tag: "FAMILY OF 5",
        name: "Premium Care",
        price: 4998,
        benefits: [
            "Principal & spouse full coverage, 3 beneficiaries at 50%",
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

// ── PlanCard ──────────────────────────────────────────────────────────────────
type Plan = (typeof PLANS)[number];

function PlanCard({ plan, isCurrent, isUpgrade, onChoose }: { plan: Plan; isCurrent: boolean; isUpgrade: boolean; onChoose: () => void }) {
    // Popular card keeps a subtle static emphasis; no hover transform.
    const transform = plan.popular ? "scale(1.03)" : "translateY(0)";
    const boxShadow = plan.popular ? "0 8px 32px rgba(0,0,0,0.10)" : "0 2px 12px rgba(0,0,0,0.06)";

    return (
        <div className="relative">
            {plan.popular && (
                <div
                    className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold whitespace-nowrap text-white"
                    style={{ background: "#C9922A", boxShadow: "0 2px 8px rgba(201,146,42,0.35)" }}
                >
                    ✦ Most popular
                </div>
            )}
            <div
                className={`tier-${plan.tier} rounded-2xl p-7 flex flex-col`}
                style={{ transform, boxShadow }}
            >
                <div className="tier-coverage mb-1 text-xs font-medium tracking-[0.15em] uppercase">{plan.tag}</div>
                <h3 className="tier-name font-display mb-4 text-3xl">{plan.name}</h3>

                <div className="mb-5">
                    <span className="tier-price font-display text-5xl">{peso(plan.price)}</span>
                    <span className="tier-price-note ml-2 text-sm">one-time</span>
                </div>

                <div className="tier-divider mb-5 h-px" />

                <ul className="mb-5 flex-1 space-y-2.5">
                    {plan.benefits.map((b, bi) => (
                        <li key={bi} className="flex items-start gap-2.5 text-sm">
                            <Check size={14} className="tier-check mt-0.5 shrink-0" />
                            <span className="tier-benefit-name">{b}</span>
                        </li>
                    ))}
                </ul>

                <div className="mt-5">
                    {isCurrent ? (
                        <div
                            className="rounded-full py-2 text-center text-xs font-medium"
                            style={{ backgroundColor: "rgba(27,45,107,0.08)", color: "#1B2D6B" }}
                        >
                            Your current plan
                        </div>
                    ) : isUpgrade ? (
                        <button
                            onClick={onChoose}
                            className="tier-btn w-full rounded-xl py-2.5 text-sm font-medium transition-colors"
                        >
                            Choose {plan.name} →
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props {
    currentPackage: string;
    initialTarget?: string | null;
    variant?: "page" | "modal";
    onClose?: () => void;
}

export default function PackageComparison({ currentPackage, initialTarget = null, variant = "page", onClose }: Props) {
    const cur = (currentPackage ?? "").toLowerCase();
    const currentIndex = PLANS.findIndex((p) => p.id === cur);
    const currentPlan = PLANS[currentIndex] ?? null;

    const validInitial = initialTarget && PLANS.findIndex((p) => p.id === initialTarget) > currentIndex ? initialTarget : null;
    const [target, setTarget] = useState<string | null>(validInitial);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_INFO.accounts[0].label);

    const targetPlan = PLANS.find((p) => p.id === target) ?? null;
    const priceDiff = targetPlan && currentPlan ? Math.max(targetPlan.price - currentPlan.price, 0) : 0;

    // ── Compare grid ──────────────────────────────────────────────────────────
    const grid = (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3 items-start">
                {PLANS.map((plan, i) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        isCurrent={i === currentIndex}
                        isUpgrade={i > currentIndex}
                        onChoose={() => setTarget(plan.id)}
                    />
                ))}
            </div>
            <p className="border-t border-fsc-cream-dark pt-4 text-xs leading-relaxed text-fsc-stone">
                <span className="font-medium text-fsc-navy">Disclaimer:</span> The benefits presented, including coverage for natural calamity, accidental incidents, natural death, maternity-related assistance, and hospitalization, are governed by official policy contracts, benefit limitations, and company guidelines. Availability of benefits and claims approval are subject to plan provisions and evaluation.
            </p>
        </div>
    );

    // ── Payment step ──────────────────────────────────────────────────────────
    const payment = targetPlan && (
        <div className="space-y-5">
            <button
                onClick={() => setTarget(null)}
                className="text-fsc-stone hover:text-fsc-navy flex items-center gap-1.5 text-sm transition-colors"
            >
                <ArrowLeft size={14} /> Back to plans
            </button>

            {/* Upgrade summary */}
            <div className="flex items-center justify-between rounded-2xl px-5 py-4" style={{ backgroundColor: "#F2F3F5", border: "1px solid #D0D2D8" }}>
                <div>
                    <p className="text-xs uppercase tracking-wider" style={{ color: "#6B6862" }}>Your upgrade</p>
                    <p className="font-display flex items-center gap-2 text-xl" style={{ color: "#1B2D6B" }}>
                        {currentPlan?.name ?? "Current"}
                        <ArrowRight size={16} style={{ color: "#C9922A" }} />
                        {targetPlan.name}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs uppercase tracking-wider" style={{ color: "#6B6862" }}>Amount due</p>
                    <p className="font-display text-2xl font-semibold" style={{ color: "#1B2D6B" }}>{peso(priceDiff)}</p>
                </div>
            </div>

            {/* Payment method selector */}
            <div className="flex gap-2">
                {PAYMENT_INFO.accounts.map((acct) => {
                    const active = selectedPaymentMethod === acct.label;
                    return (
                        <button
                            key={acct.label}
                            type="button"
                            onClick={() => setSelectedPaymentMethod(acct.label)}
                            className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors"
                            style={{
                                backgroundColor: active ? "#1B2D6B" : "#F2F3F5",
                                color: active ? "#fff" : "#6B6862",
                                border: `1px solid ${active ? "#1B2D6B" : "#D0D2D8"}`,
                            }}
                        >
                            {acct.label}
                        </button>
                    );
                })}
            </div>

            {/* Selected payment method card */}
            {PAYMENT_INFO.accounts.filter((a) => a.label === selectedPaymentMethod).map((acct) => (
                <div key={acct.label} className="flex flex-col items-center rounded-2xl p-6" style={{ border: "1px solid #D0D2D8", backgroundColor: "#fff" }}>
                    {acct.qr ? (
                        <img src={acct.qr} alt={`${acct.label} QR code`} className="h-64 w-64 rounded-xl object-contain" style={{ border: "1px solid #D0D2D8" }} />
                    ) : (
                        <div className="flex h-64 w-64 items-center justify-center rounded-xl text-xs" style={{ backgroundColor: "#F3F4F6", color: "#9CA3AF", border: "2px dashed #D1D5DB" }}>
                            QR placeholder
                        </div>
                    )}
                    <p className="mt-3 text-xs" style={{ color: "#6B6862" }}>
                        Account name: <span className="font-medium" style={{ color: "#1B2D6B" }}>{acct.accountName}</span>
                    </p>
                    <p className="text-xs" style={{ color: "#6B6862" }}>
                        Number: <span className="font-medium" style={{ color: "#1B2D6B" }}>{acct.number}</span>
                    </p>
                </div>
            ))}

            {/* After paying instructions */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#F2F3F5", border: "1px solid #D0D2D8" }}>
                <p className="text-sm font-semibold" style={{ color: "#1B2D6B" }}>After paying, send your proof of payment</p>
                <p className="mt-1 text-xs" style={{ color: "#6B6862" }}>
                    Take a screenshot or photo of your transaction receipt and send it to us, including your full name, so we can match your payment and upgrade your account:
                </p>
                <ul className="mt-3 space-y-1 text-sm" style={{ color: "#1B2D6B" }}>
                    {PAYMENT_INFO.receiptContacts.map((c) => (
                        <li key={c.label}>{c.label}: <span className="font-medium">{c.value}</span></li>
                    ))}
                </ul>
                <p className="mt-3 text-xs" style={{ color: "#6B6862" }}>
                    Your plan stays on <span className="font-medium">{currentPlan?.name ?? "your current tier"}</span> until our team confirms your payment, usually within {PAYMENT_INFO.verificationDays}.
                </p>
            </div>

            {variant === "modal" && (
                <button
                    onClick={onClose}
                    className="bg-fsc-navy hover:bg-fsc-green w-full rounded-xl py-2.5 text-sm font-medium text-white transition-colors"
                >
                    Got it
                </button>
            )}
        </div>
    );

    const body = target ? payment : grid;

    if (variant === "modal") {
        return createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
                <div
                    className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="border-fsc-cream-dark flex items-start justify-between border-b px-6 py-4">
                        <div>
                            <h2 className="font-display text-fsc-navy text-xl">
                                {target ? `Upgrade to ${targetPlan?.name}` : "Compare packages"}
                            </h2>
                            <p className="text-fsc-stone mt-0.5 text-sm">
                                {target ? "Send payment to upgrade your plan" : "Choose a higher tier to see payment details"}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            aria-label="Close"
                            className="text-fsc-stone hover:text-fsc-navy hover:bg-fsc-cream -mr-1 flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <div className="overflow-y-auto p-6">{body}</div>
                </div>
            </div>,
            document.body,
        );
    }

    return body;
}
