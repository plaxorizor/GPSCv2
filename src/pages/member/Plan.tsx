import React, { useEffect, useState } from "react";
import { CalendarClock, RefreshCw, Clock, Sparkles } from "lucide-react";
import PackageComparison from "../../components/member/PackageComparison";
import UpgradeModal from "../../components/modals/UpgradeModal";
import OfflinePaymentRequestModal from "../../components/modals/OfflinePaymentRequestModal";
import { membershipPhase } from "../../utils/membership";
import { isWithinGrace, graceDaysLeft, upgradeTargets, packagePrice, packageLabel, GRACE_DAYS, type PackageKey } from "../../utils/upgrade";
import { getPendingUpgradeForMember, type UpgradeRequest } from "../../firebase/upgrades";
import { requestRenewal, getPendingRenewalForMember, type RenewalRequest } from "../../firebase/renewals";
import { peso } from "../../utils/types";
import type { Member } from "../../utils/types";

interface Props {
    /** Member's current package, e.g. "Basic" / "Family" / "Premium". */
    packageName: string;
    member: Member;
}

export const MemberPlan: React.FC<Props> = ({ packageName, member }) => {
    const memberName = `${member.firstName} ${member.lastName}`.trim();
    const phase = membershipPhase(member);
    const inUpgradeGrace = isWithinGrace(member.dateActivated ?? member.dateCreated);
    const upgradeDaysLeft = graceDaysLeft(member.dateActivated ?? member.dateCreated);
    const hasHigherTier = upgradeTargets(member.package ?? "").length > 0;

    const [upgradeTarget, setUpgradeTarget] = useState<PackageKey | null>(null);
    const [renewTarget, setRenewTarget] = useState<string | null>(null);
    const [pendingUpgrade, setPendingUpgrade] = useState<UpgradeRequest | null>(null);
    const [pendingRenewal, setPendingRenewal] = useState<RenewalRequest | null>(null);

    const loadPending = () => {
        getPendingUpgradeForMember(member.uid)
            .then(setPendingUpgrade)
            .catch(() => {});
        getPendingRenewalForMember(member.uid)
            .then(setPendingRenewal)
            .catch(() => {});
    };
    useEffect(loadPending, [member.uid]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display text-fsc-navy text-3xl">Plans</h1>
                <p className="text-fsc-stone mt-1 text-sm">Compare tiers, upgrade, or renew your coverage.</p>
            </div>

            {/* Status banners */}
            {phase === "grace" ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#C9922A]/30 bg-[#C9922A]/10 p-4">
                    <div className="flex items-start gap-3">
                        <CalendarClock className="mt-0.5 shrink-0 text-[#A87820]" size={20} />
                        <div className="text-sm">
                            <p className="font-medium text-[#A87820]">Your membership needs renewal</p>
                            <p className="text-fsc-stone mt-0.5 text-xs">
                                You're in the renewal grace period. Renew any tier to restore full access (you pay that tier's full price).
                            </p>
                        </div>
                    </div>
                    {!pendingRenewal && (
                        <button
                            onClick={() => setRenewTarget(member.package ?? "")}
                            className="bg-fsc-green flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-white transition-all hover:brightness-110"
                        >
                            <RefreshCw size={14} /> Renew now
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* 90-day discounted-upgrade indicator */}
                    {hasHigherTier && inUpgradeGrace && (
                        <div className="border-fsc-green/30 bg-fsc-green/10 flex items-start gap-3 rounded-2xl border p-4">
                            <Sparkles className="text-fsc-green mt-0.5 shrink-0" size={20} />
                            <div className="text-sm">
                                <p className="text-fsc-green font-medium">Discounted upgrade window — pay only the difference</p>
                                <p className="text-fsc-stone mt-0.5 text-xs">
                                    <strong>
                                        {upgradeDaysLeft} day{upgradeDaysLeft === 1 ? "" : "s"} left
                                    </strong>{" "}
                                    of your {GRACE_DAYS}-day window. After it ends, upgrades cost the full package price.
                                </p>
                            </div>
                        </div>
                    )}
                    {hasHigherTier && !inUpgradeGrace && (
                        <div className="border-fsc-cream-dark text-fsc-stone rounded-2xl border bg-white p-4 text-xs">
                            Your {GRACE_DAYS}-day discounted-upgrade window has ended — upgrades now cost the full package price.
                        </div>
                    )}
                    {pendingUpgrade && (
                        <div className="flex items-start gap-3 rounded-2xl border border-[#C9922A]/30 bg-[#C9922A]/10 p-4">
                            <Clock className="mt-0.5 shrink-0 text-[#A87820]" size={20} />
                            <div className="text-sm">
                                <p className="font-medium text-[#A87820]">Upgrade to {packageLabel(pendingUpgrade.toPackage)} Care pending</p>
                                <p className="text-fsc-stone mt-0.5 text-xs">
                                    Awaiting admin confirmation of your payment. It applies as soon as it's verified.
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Plan cards — Upgrade (active) / Renew (grace) on each card */}
            <div>
                <h2 className="font-display text-fsc-navy mb-4 text-lg">Choose a plan</h2>
                <PackageComparison
                    currentPackage={packageName}
                    phase={phase === "active" ? "active" : "grace"}
                    inUpgradeGrace={inUpgradeGrace}
                    canUpgrade={phase === "active" && !pendingUpgrade}
                    canRenew={!pendingRenewal}
                    onUpgrade={(id) => setUpgradeTarget(id as PackageKey)}
                    onRenew={(id) => setRenewTarget(id)}
                />
            </div>

            {/* Upgrade flow */}
            {upgradeTarget && (
                <UpgradeModal member={member} toPackage={upgradeTarget} onClose={() => setUpgradeTarget(null)} onSuccess={loadPending} />
            )}

            {/* Renewal flow — fee follows the selected plan (full price) */}
            {renewTarget && (
                <RenewModal
                    memberId={member.uid}
                    memberName={memberName}
                    toPackage={renewTarget as PackageKey}
                    onClose={() => setRenewTarget(null)}
                    onSuccess={loadPending}
                />
            )}
        </div>
    );
};

// ── Renewal modal ─────────────────────────────────────────────────────────────
function RenewModal({
    memberId,
    memberName,
    toPackage,
    onClose,
    onSuccess,
}: {
    memberId: string;
    memberName: string;
    toPackage: PackageKey;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const fee = packagePrice(toPackage);
    return (
        <OfflinePaymentRequestModal
            title="Renew your membership"
            submitLabel="Submit renewal request"
            doneTitle="Renewal request submitted!"
            doneBody={
                <>
                    Your renewal at <span className="text-fsc-navy font-semibold">{packageLabel(toPackage)} Care</span> is awaiting admin
                    confirmation. Once verified, your membership re-activates for another 365 days.
                </>
            }
            summary={
                <div className="border-fsc-cream-dark bg-fsc-cream/40 flex items-center justify-between rounded-xl border px-4 py-3">
                    <div>
                        <p className="text-fsc-stone text-xs tracking-wider uppercase">Renewal fee</p>
                        <p className="text-fsc-navy text-sm font-medium">{packageLabel(toPackage)} Care · 365 days</p>
                    </div>
                    <p className="font-display text-fsc-navy text-2xl">{peso(fee)}</p>
                </div>
            }
            instructions={
                <ol className="text-fsc-stone mt-4 list-decimal space-y-2 pl-4 text-sm">
                    <li>
                        Send <strong>{peso(fee)}</strong> using one of the payment methods below.
                    </li>
                    <li>Send your proof of payment to the admin (Facebook), including your full name.</li>
                    <li>Submit the request below — an admin confirms and re-activates your account for 365 days.</li>
                </ol>
            }
            onClose={onClose}
            onSuccess={onSuccess}
            onSubmit={({ reference, method, receiptFile }) => requestRenewal({ memberId, memberName, toPackage, reference, method, receiptFile })}
            mapError={(msg) => (msg === "ALREADY_PENDING" ? "You already have a pending renewal request." : undefined)}
        />
    );
}
