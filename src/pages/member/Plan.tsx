import React, { useState } from "react";
import { X, CalendarClock, RefreshCw } from "lucide-react";
import PackageComparison from "../../components/PackageComparison";
import UpgradeCard from "../../components/UpgradeCard";
import { membershipPhase } from "../../utils/membership";
import { isWithinGrace, packagePrice, packageLabel } from "../../utils/upgrade";
import { peso } from "../../utils/types";
import type { Member } from "../../utils/types";

interface Props {
    /** Member's current package, e.g. "Basic" / "Family" / "Premium". */
    packageName: string;
    member: Member;
}

// Offline payment destinations (same accounts used for membership / upgrades).
const PAYMENT_ACCOUNTS = [
    { label: "GCash", value: "09XX-XXX-XXXX" },
    { label: "Maya", value: "09XX-XXX-XXXX" },
    { label: "GoTyme", value: "09XX-XXX-XXXX" },
];

export const MemberPlan: React.FC<Props> = ({ packageName, member }) => {
    const phase = membershipPhase(member);
    const inUpgradeGrace = isWithinGrace(member.dateActivated ?? member.dateCreated);
    const [showRenew, setShowRenew] = useState(false);

    const renewalFee = packagePrice(member.package);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display text-fsc-navy text-3xl">Plans</h1>
                <p className="text-fsc-stone mt-1 text-sm">Compare tiers and upgrade your coverage.</p>
            </div>

            {phase === "active" ? (
                // Active → can upgrade
                <UpgradeCard member={member} />
            ) : (
                // Grace → renew first
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#C9922A]/30 bg-[#C9922A]/10 p-4">
                    <div className="flex items-start gap-3">
                        <CalendarClock className="mt-0.5 shrink-0 text-[#A87820]" size={20} />
                        <div className="text-sm">
                            <p className="font-medium text-[#A87820]">Your membership needs renewal</p>
                            <p className="text-fsc-stone mt-0.5 text-xs">
                                You're in the renewal grace period. Renew your {packageLabel(member.package)} Care to restore full access,
                                then you can upgrade.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowRenew(true)}
                        className="bg-fsc-green flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-white transition-all hover:brightness-110"
                    >
                        <RefreshCw size={14} /> Renew now
                    </button>
                </div>
            )}

            {/* Read-only comparison of all tiers */}
            <div>
                <h2 className="font-display text-fsc-navy mb-4 text-lg">Compare all plans</h2>
                <PackageComparison
                    currentPackage={packageName}
                    phase={phase === "active" ? "active" : "grace"}
                    inUpgradeGrace={inUpgradeGrace}
                    onRenew={() => setShowRenew(true)}
                />
            </div>

            {/* Renewal instructions modal */}
            {showRenew && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowRenew(false)}>
                    <div
                        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-display text-fsc-navy text-lg">Renew your membership</h2>
                            <button onClick={() => setShowRenew(false)} className="text-fsc-stone hover:text-fsc-navy transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="border-fsc-cream-dark bg-fsc-cream/40 flex items-center justify-between rounded-xl border px-4 py-3">
                            <div>
                                <p className="text-fsc-stone text-xs tracking-wider uppercase">Renewal fee</p>
                                <p className="text-fsc-navy text-sm font-medium">{packageLabel(member.package)} Care · 365 days</p>
                            </div>
                            <p className="font-display text-fsc-navy text-2xl">{peso(renewalFee)}</p>
                        </div>

                        <ol className="text-fsc-stone mt-4 list-decimal space-y-2 pl-4 text-sm">
                            <li>
                                Send <strong>{peso(renewalFee)}</strong> to one of:
                                <ul className="mt-1 list-disc pl-4 text-xs">
                                    {PAYMENT_ACCOUNTS.map((a) => (
                                        <li key={a.label}>
                                            {a.label}: <span className="font-medium">{a.value}</span>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                            <li>Send your proof of payment to the admin (Messenger / email), including your full name.</li>
                            <li>An admin will confirm and re-activate your account for another 365 days.</li>
                        </ol>

                        <button
                            onClick={() => setShowRenew(false)}
                            className="bg-fsc-navy mt-6 w-full rounded-xl py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
