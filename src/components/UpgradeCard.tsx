import { useEffect, useState } from "react";
import { ArrowUpCircle, CheckCircle, Clock } from "lucide-react";
import type { Member } from "../utils/types";
import { formatCurrency } from "../utils/formatter";
import {
    upgradeTargets,
    upgradeCharge,
    graceDaysLeft,
    packageLabel,
    GRACE_DAYS,
    type PackageKey,
} from "../utils/upgrade";
import { requestUpgrade, getPendingUpgradeForMember, type UpgradeRequest } from "../firebase/upgrades";

// Offline payment destinations (same accounts members pay membership to).
const PAYMENT_ACCOUNTS = [
    { label: "GCash", value: "09XX-XXX-XXXX" },
    { label: "Maya", value: "09XX-XXX-XXXX" },
];

export default function UpgradeCard({ member }: { member: Member }) {
    const memberName = `${member.firstName} ${member.lastName}`.trim();
    const targets = upgradeTargets(member.package);
    // Grace runs from activation; fall back to join date for legacy/seeded
    // members that have no dateActivated.
    const daysLeft = graceDaysLeft(member.dateActivated ?? member.dateCreated);
    const inGrace = daysLeft > 0;
    // Upgrade is allowed any time (active + a higher tier exists). Grace only
    // changes the price: difference within grace, full package price after.
    const eligible = member.status === "active" && targets.length > 0;

    const [pending, setPending] = useState<UpgradeRequest | null>(null);
    const [loadingPending, setLoadingPending] = useState(true);
    const [selected, setSelected] = useState<PackageKey | null>(null);
    const [referenceNumber, setReferenceNumber] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);

    useEffect(() => {
        let cancelled = false;
        getPendingUpgradeForMember(member.uid)
            .then((p) => !cancelled && setPending(p))
            .finally(() => !cancelled && setLoadingPending(false));
        return () => {
            cancelled = true;
        };
    }, [member.uid]);

    const submit = async () => {
        if (!selected) return;
        if (!referenceNumber.trim()) {
            setError("Please enter the reference number from your payment receipt.");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            // TODO(backend): persist referenceNumber on the upgrade request so admins can verify it.
            await requestUpgrade({ memberId: member.uid, memberName, toPackage: selected });
            setDone(true);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "";
            if (msg === "ALREADY_PENDING") setError("You already have a pending upgrade request.");
            else setError("Could not submit the request. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingPending) return null;

    // ── Already requested → pending state ──
    if (pending || done) {
        const to = pending?.toPackage ?? selected ?? "";
        return (
            <div className="border-fsc-cream-dark rounded-2xl border bg-white p-6">
                <div className="flex items-center gap-3">
                    <Clock className="text-[#C9922A]" size={22} />
                    <div>
                        <h2 className="font-display text-fsc-navy text-lg">Upgrade pending</h2>
                        <p className="text-fsc-stone text-sm">
                            Your upgrade to <strong>{packageLabel(to)} Care</strong> is awaiting admin confirmation of your payment. Once verified,
                            your coverage upgrades immediately and your eligibility timeline restarts.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ── Top tier or not active — nothing to show ──
    if (!eligible) return null;

    // ── Eligible — show upgrade options ──
    return (
        <div className="border-fsc-cream-dark rounded-2xl border bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
                <ArrowUpCircle className="text-fsc-green" size={22} />
                <div>
                    <h2 className="font-display text-fsc-navy text-lg">Upgrade your coverage</h2>
                    <p className="text-fsc-stone text-sm">
                        {inGrace ? (
                            <>
                                Pay only the difference — <strong>{daysLeft} day{daysLeft === 1 ? "" : "s"} left</strong> in your {GRACE_DAYS}-day window.
                            </>
                        ) : (
                            <>
                                Your {GRACE_DAYS}-day discount window has ended — upgrade now by paying the <strong>full package price</strong>.
                            </>
                        )}
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                {targets.map((t) => {
                    const diff = upgradeCharge(member.package, t, inGrace);
                    const active = selected === t;
                    return (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setSelected(t)}
                            className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                                active ? "border-fsc-green bg-fsc-green/5" : "border-fsc-cream-dark hover:bg-fsc-cream/40"
                            }`}
                        >
                            <div>
                                <div className="text-fsc-navy font-medium">{packageLabel(t)} Care</div>
                                <div className="text-fsc-stone text-xs">Upgrade from {packageLabel(member.package)} Care</div>
                            </div>
                            <div className="text-right">
                                <div className="text-fsc-navy font-display text-lg">{formatCurrency(diff)}</div>
                                <div className="text-fsc-stone text-xs">to pay</div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {selected && (
                <div className="bg-fsc-cream/40 mt-4 rounded-xl p-4 text-sm">
                    <p className="text-fsc-navy font-medium">How to upgrade</p>
                    <ol className="text-fsc-stone mt-2 list-decimal space-y-1 pl-4 text-xs">
                        <li>
                            Send <strong>{formatCurrency(upgradeCharge(member.package, selected, inGrace))}</strong> to one of:
                            <ul className="mt-1 list-disc pl-4">
                                {PAYMENT_ACCOUNTS.map((a) => (
                                    <li key={a.label}>
                                        {a.label}: <span className="font-medium">{a.value}</span>
                                    </li>
                                ))}
                            </ul>
                        </li>
                        <li>Send your proof of payment to the admin (Messenger / email), including your name.</li>
                        <li>Tap "Submit upgrade request" — an admin will confirm and your upgrade applies immediately.</li>
                    </ol>
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-[#C9922A]/10 p-2 text-xs text-[#A87820]">
                        <CheckCircle size={14} className="mt-0.5 shrink-0" />
                        <span>On approval, your eligibility timeline restarts at 0 and your membership renews to 365 days.</span>
                    </div>

                    {/* TODO(backend) */}
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
                        <p className="text-fsc-stone mt-1 text-xs">
                            Enter the reference number shown on your transaction receipt.
                        </p>
                    </div>
                </div>
            )}

            {error && <p className="mt-3 text-sm text-[#C41E1E]">{error}</p>}

            <button
                type="button"
                onClick={submit}
                disabled={!selected || !referenceNumber.trim() || submitting}
                className="bg-fsc-green mt-4 w-full rounded-xl py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50"
            >
                {submitting ? "Submitting…" : "Submit upgrade request"}
            </button>
        </div>
    );
}
