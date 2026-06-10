import React, { useEffect, useState } from "react";
import { X, CalendarClock, RefreshCw, Clock, Sparkles, CheckCircle } from "lucide-react";
import PackageComparison from "../../components/PackageComparison";
import UpgradeModal from "../../components/UpgradeModal";
import ReceiptUploadField from "../../components/ReceiptUploadField";
import { PAYMENT_ACCOUNTS } from "../../data/paymentAccounts";
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
    const [referenceNumber, setReferenceNumber] = useState("");
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_ACCOUNTS[0].label);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);

    const submit = async () => {
        if (!referenceNumber.trim()) {
            setError("Please enter the reference number from your payment receipt.");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            await requestRenewal({ memberId, memberName, toPackage, reference: referenceNumber.trim(), method: selectedPaymentMethod, receiptFile });
            setDone(true);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "";
            if (msg === "ALREADY_PENDING") setError("You already have a pending renewal request.");
            else setError("Could not submit the request. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (done) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
                    <CheckCircle className="text-fsc-green mx-auto mb-4" size={48} />
                    <h2 className="font-display text-fsc-navy mb-2 text-xl font-semibold">Renewal request submitted!</h2>
                    <p className="text-fsc-stone mb-6 text-sm">
                        Your renewal at <span className="text-fsc-navy font-semibold">{packageLabel(toPackage)} Care</span> is awaiting admin
                        confirmation. Once verified, your membership re-activates for another 365 days.
                    </p>
                    <button
                        onClick={() => {
                            onSuccess();
                            onClose();
                        }}
                        className="bg-fsc-green w-full rounded-xl py-3 text-sm font-medium text-white"
                    >
                        Done
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-display text-fsc-navy text-lg">Renew your membership</h2>
                    <button onClick={onClose} className="text-fsc-stone hover:text-fsc-navy transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="border-fsc-cream-dark bg-fsc-cream/40 flex items-center justify-between rounded-xl border px-4 py-3">
                    <div>
                        <p className="text-fsc-stone text-xs tracking-wider uppercase">Renewal fee</p>
                        <p className="text-fsc-navy text-sm font-medium">{packageLabel(toPackage)} Care · 365 days</p>
                    </div>
                    <p className="font-display text-fsc-navy text-2xl">{peso(fee)}</p>
                </div>

                <ol className="text-fsc-stone mt-4 list-decimal space-y-2 pl-4 text-sm">
                    <li>
                        Send <strong>{peso(fee)}</strong> using one of the payment methods below.
                    </li>
                    <li>Send your proof of payment to the admin (Messenger / email), including your full name.</li>
                    <li>Submit the request below — an admin confirms and re-activates your account for 365 days.</li>
                </ol>

                {/* Payment method selector */}
                <div className="mt-4 flex gap-2">
                    {PAYMENT_ACCOUNTS.map((acct) => {
                        const active = selectedPaymentMethod === acct.label;
                        return (
                            <button
                                key={acct.label}
                                type="button"
                                onClick={() => setSelectedPaymentMethod(acct.label)}
                                className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                                    active
                                        ? "border-fsc-navy bg-fsc-navy text-white"
                                        : "border-fsc-cream-dark bg-fsc-cream/40 text-fsc-stone hover:bg-fsc-cream"
                                }`}
                            >
                                {acct.label}
                            </button>
                        );
                    })}
                </div>

                {/* QR holder for the selected method */}
                {PAYMENT_ACCOUNTS.filter((a) => a.label === selectedPaymentMethod).map((acct) => (
                    <div key={acct.label} className="border-fsc-cream-dark mt-3 flex flex-col items-center rounded-2xl border bg-white p-5">
                        {acct.qr ? (
                            <img
                                src={acct.qr}
                                alt={`${acct.label} QR code`}
                                className="aspect-square w-full max-w-[14rem] rounded-xl object-contain"
                            />
                        ) : (
                            <div className="border-fsc-cream-dark bg-fsc-cream/40 text-fsc-stone flex aspect-square w-full max-w-[14rem] items-center justify-center rounded-xl border-2 border-dashed text-xs">
                                QR placeholder
                            </div>
                        )}
                        <p className="text-fsc-stone mt-3 text-xs">
                            Account name: <span className="text-fsc-navy font-medium">{acct.accountName}</span>
                        </p>
                        <p className="text-fsc-stone text-xs">
                            Number: <span className="text-fsc-navy font-medium">{acct.number}</span>
                        </p>
                    </div>
                ))}

                <div className="mt-4">
                    <label className="text-fsc-navy text-sm font-medium">
                        Reference number <span className="text-[#C41E1E]">*</span>
                    </label>
                    <input
                        type="text"
                        inputMode="numeric"
                        placeholder="e.g. 1234 5678 9012"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        className="border-fsc-cream-dark focus:border-fsc-green mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none"
                    />
                </div>

                {/* Receipt screenshot (optional) */}
                <div className="mt-4">
                    <label className="text-fsc-navy text-sm font-medium">
                        Receipt screenshot <span className="text-fsc-stone font-normal">(optional)</span>
                    </label>
                    <div className="mt-1">
                        <ReceiptUploadField file={receiptFile} onChange={setReceiptFile} />
                    </div>
                </div>

                {error && <p className="mt-3 text-sm text-[#C41E1E]">{error}</p>}

                <button
                    onClick={submit}
                    disabled={!referenceNumber.trim() || submitting}
                    className="bg-fsc-green mt-4 w-full rounded-xl py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50"
                >
                    {submitting ? "Submitting…" : "Submit renewal request"}
                </button>
            </div>
        </div>
    );
}
