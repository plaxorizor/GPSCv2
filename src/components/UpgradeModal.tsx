import { useState } from "react";
import { X, ArrowRight, CheckCircle } from "lucide-react";
import { formatCurrency } from "../utils/formatter";
import { upgradeCharge, isWithinGrace, packageLabel, type PackageKey } from "../utils/upgrade";
import { requestUpgrade } from "../firebase/upgrades";
import type { Member } from "../utils/types";

// Offline payment destinations (same accounts used for membership / renewals).
const PAYMENT_ACCOUNTS = [
    { label: "GCash", value: "09XX-XXX-XXXX" },
    { label: "Maya", value: "09XX-XXX-XXXX" },
    { label: "GoTyme", value: "09XX-XXX-XXXX" },
];

interface Props {
    member: Member;
    toPackage: PackageKey;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UpgradeModal({ member, toPackage, onClose, onSuccess }: Props) {
    const memberName = `${member.firstName} ${member.lastName}`.trim();
    const inGrace = isWithinGrace(member.dateActivated ?? member.dateCreated);
    const amount = upgradeCharge(member.package ?? "", toPackage, inGrace);

    const [referenceNumber, setReferenceNumber] = useState("");
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
            await requestUpgrade({ memberId: member.uid, memberName, toPackage });
            setDone(true);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "";
            if (msg === "ALREADY_PENDING") setError("You already have a pending upgrade request.");
            else if (msg === "NOT_ACTIVE") setError("Your membership must be active to upgrade.");
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
                    <h2 className="font-display text-fsc-navy mb-2 text-xl font-semibold">Upgrade request submitted!</h2>
                    <p className="text-fsc-stone mb-6 text-sm">
                        Your upgrade to <span className="text-fsc-navy font-semibold">{packageLabel(toPackage)} Care</span> is awaiting admin
                        confirmation of your payment. Once verified, your coverage upgrades immediately and your eligibility timeline restarts.
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
            <div
                className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-display text-fsc-navy text-lg">Upgrade your coverage</h2>
                    <button onClick={onClose} className="text-fsc-stone hover:text-fsc-navy transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Summary */}
                <div className="border-fsc-cream-dark bg-fsc-cream/40 flex items-center justify-between rounded-xl border px-4 py-3">
                    <div>
                        <p className="text-fsc-stone text-xs tracking-wider uppercase">Your upgrade</p>
                        <p className="font-display text-fsc-navy flex items-center gap-2 text-base">
                            {packageLabel(member.package ?? "—")} Care
                            <ArrowRight size={14} className="text-[#C9922A]" />
                            {packageLabel(toPackage)} Care
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-fsc-stone text-xs tracking-wider uppercase">{inGrace ? "Difference" : "Full price"}</p>
                        <p className="font-display text-fsc-navy text-xl font-semibold">{formatCurrency(amount)}</p>
                    </div>
                </div>

                {/* Instructions */}
                <ol className="text-fsc-stone mt-4 list-decimal space-y-2 pl-4 text-sm">
                    <li>
                        Send <strong>{formatCurrency(amount)}</strong> to one of:
                        <ul className="mt-1 list-disc pl-4 text-xs">
                            {PAYMENT_ACCOUNTS.map((a) => (
                                <li key={a.label}>
                                    {a.label}: <span className="font-medium">{a.value}</span>
                                </li>
                            ))}
                        </ul>
                    </li>
                    <li>Send your proof of payment to the admin (Messenger / email), including your full name.</li>
                    <li>Submit the request below — an admin confirms and your upgrade applies immediately.</li>
                </ol>

                <div className="bg-fsc-green/10 mt-3 flex items-start gap-2 rounded-lg p-2 text-xs text-[#15803D]">
                    <CheckCircle size={14} className="mt-0.5 shrink-0" />
                    <span>On approval, your eligibility timeline restarts at 0 and your membership renews to 365 days.</span>
                </div>

                {/* Reference number */}
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

                {error && <p className="mt-3 text-sm text-[#C41E1E]">{error}</p>}

                <button
                    onClick={submit}
                    disabled={!referenceNumber.trim() || submitting}
                    className="bg-fsc-green mt-4 w-full rounded-xl py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50"
                >
                    {submitting ? "Submitting…" : "Submit upgrade request"}
                </button>
            </div>
        </div>
    );
}
