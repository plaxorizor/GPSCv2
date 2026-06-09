import { useState } from "react";
import { X, Wallet, CheckCircle } from "lucide-react";
import useAuth from "../context/useAuth";
import { formatCurrency } from "../utils/formatter";
import { requestPayout } from "../firebase/payouts";
import { feeFor, netAfterFee, MIN_PAYOUT, PAYOUT_FEE_RATE } from "../utils/commission";
import type { Commission } from "../utils/types";

// Temporary: e-wallets only until payment methods are confirmed with the client.
const PAYMENT_METHODS = [
    { value: "gcash", label: "GCash" },
    { value: "maya", label: "Maya (PayMaya)" },
];

interface Props {
    claimableCommissions: Commission[]; // pending + eligible commissions
    memberName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RequestPayoutModal({ claimableCommissions, memberName, onClose, onSuccess }: Props) {
    const { currentUser } = useAuth();
    // All claimable commissions selected by default.
    const [selected, setSelected] = useState<Set<string>>(() => new Set(claimableCommissions.map((c) => c.id)));
    const [method, setMethod] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName] = useState(memberName);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [submittedNet, setSubmittedNet] = useState(0);

    const toggle = (id: string) =>
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    const allSelected = claimableCommissions.length > 0 && selected.size === claimableCommissions.length;
    const toggleAll = () =>
        setSelected(allSelected ? new Set() : new Set(claimableCommissions.map((c) => c.id)));

    const gross = claimableCommissions.filter((c) => selected.has(c.id)).reduce((sum, c) => sum + c.amount, 0);
    const fee = feeFor(gross);
    const net = netAfterFee(gross);
    const meetsMin = gross >= MIN_PAYOUT;
    const isEWallet = method === "gcash" || method === "maya";

    // PH mobile helpers (match signup / encode-member): digits only, "9XX XXX XXXX".
    const handleMobileChange = (raw: string) => setAccountNumber(raw.replace(/\D/g, "").slice(0, 10));
    const formatPHMobile = (d: string) => [d.slice(0, 3), d.slice(3, 6), d.slice(6, 10)].filter(Boolean).join(" ");
    const accountOk = isEWallet ? /^9\d{9}$/.test(accountNumber) : accountNumber.trim().length > 0;
    const isValid = selected.size > 0 && meetsMin && method && accountOk && accountName.trim();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !isValid) return;
        setError("");
        setLoading(true);
        try {
            const res = await requestPayout({
                memberId: currentUser.uid,
                memberName,
                commissionIds: [...selected],
                method,
                accountNumber: isEWallet ? `+63${accountNumber}` : accountNumber.trim(),
                accountName: accountName.trim(),
            });
            setSubmittedNet(res.net);
            setSuccess(true);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "";
            if (msg === "BELOW_MINIMUM") setError(`Minimum payout is ${formatCurrency(MIN_PAYOUT)}.`);
            else if (msg === "ALREADY_CLAIMED") setError("Some commissions were already claimed. Please reopen and try again.");
            else if (msg === "NOT_YET_ELIGIBLE") setError("Some commissions aren't claimable yet.");
            else if (msg === "MEMBERSHIP_NOT_ACTIVE") setError("Renew your membership to request a payout.");
            else setError("Failed to submit request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
                    <CheckCircle className="text-fsc-green mx-auto mb-4" size={48} />
                    <h2 className="font-display text-fsc-navy mb-2 text-xl font-semibold">Request Submitted!</h2>
                    <p className="text-fsc-stone mb-6 text-sm">
                        Your payout of <span className="text-fsc-navy font-semibold">{formatCurrency(submittedNet)}</span> (net of the 5% fee) has been
                        submitted. The admin will verify it, send the money, and share the proof with you.
                    </p>
                    <button
                        onClick={() => {
                            onSuccess();
                            onClose();
                        }}
                        className="bg-fsc-green w-full rounded-xl py-3 font-medium text-white"
                    >
                        Done
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-xl">
                {/* Header */}
                <div className="border-fsc-cream-dark flex items-center justify-between border-b p-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-fsc-green/10 flex h-9 w-9 items-center justify-center rounded-xl">
                            <Wallet className="text-fsc-green" size={18} />
                        </div>
                        <div>
                            <h2 className="font-display text-fsc-navy font-semibold">Request Payout</h2>
                            <p className="text-fsc-stone text-xs">Pick the commissions to claim</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-fsc-stone hover:text-fsc-navy rounded-lg p-1 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
                        {claimableCommissions.length === 0 ? (
                            <p className="text-fsc-stone py-6 text-center text-sm">
                                You have no claimable commissions right now. Level 2–6 commissions become claimable 7 days after they're earned.
                            </p>
                        ) : (
                            <>
                                {/* Commission picker */}
                                <div className="border-fsc-cream-dark overflow-hidden rounded-xl border">
                                    <button
                                        type="button"
                                        onClick={toggleAll}
                                        className="bg-fsc-cream/50 text-fsc-navy flex w-full items-center justify-between px-3 py-2 text-xs font-medium"
                                    >
                                        <span>{allSelected ? "Clear all" : "Select all"}</span>
                                        <span className="text-fsc-stone">
                                            {selected.size} of {claimableCommissions.length} selected
                                        </span>
                                    </button>
                                    <div className="max-h-48 overflow-y-auto">
                                        {claimableCommissions.map((c) => (
                                            <label
                                                key={c.id}
                                                className="border-fsc-cream-dark hover:bg-fsc-cream/30 flex cursor-pointer items-center gap-3 border-t px-3 py-2.5"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selected.has(c.id)}
                                                    onChange={() => toggle(c.id)}
                                                    className="accent-fsc-green h-4 w-4 shrink-0"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-fsc-navy truncate text-sm">{c.fromMemberName}</div>
                                                    <div className="text-fsc-stone text-xs">Level {c.level}</div>
                                                </div>
                                                <div className="text-fsc-navy shrink-0 text-sm font-medium">{formatCurrency(c.amount)}</div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Totals */}
                                <div className="border-fsc-cream-dark space-y-1 rounded-xl border p-3 text-sm">
                                    <Row label="Gross" value={formatCurrency(gross)} />
                                    <Row label={`Transaction fee (${PAYOUT_FEE_RATE * 100}%)`} value={`− ${formatCurrency(fee)}`} muted />
                                    <div className="border-fsc-cream-dark mt-1 border-t pt-1">
                                        <Row label="You receive" value={formatCurrency(net)} strong />
                                    </div>
                                </div>
                                {!meetsMin && gross > 0 && (
                                    <p className="text-xs text-[#C41E1E]">Minimum payout is {formatCurrency(MIN_PAYOUT)} (gross).</p>
                                )}

                                {/* Payment method */}
                                <div>
                                    <label className="text-fsc-navy mb-1.5 block text-sm font-medium">Payment Method</label>
                                    <select
                                        value={method}
                                        onChange={(e) => {
                                            setMethod(e.target.value);
                                            setAccountNumber(""); // reset — format differs per method
                                        }}
                                        className="border-fsc-cream-dark focus:border-fsc-green w-full rounded-xl border px-3 py-3 text-sm focus:outline-none"
                                        required
                                    >
                                        <option value="">Select method…</option>
                                        {PAYMENT_METHODS.map((m) => (
                                            <option key={m.value} value={m.value}>
                                                {m.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Account number */}
                                <div>
                                    <label className="text-fsc-navy mb-1.5 block text-sm font-medium">
                                        {isEWallet ? "Mobile Number" : "Account Number"}
                                    </label>
                                    {isEWallet ? (
                                        <div className="border-fsc-cream-dark focus-within:border-fsc-green flex items-stretch overflow-hidden rounded-xl border bg-white">
                                            <span className="bg-fsc-cream/50 text-fsc-navy flex select-none items-center gap-1 border-r border-[#e5ddc8] px-2.5 text-sm">
                                                +63
                                            </span>
                                            <input
                                                type="tel"
                                                inputMode="numeric"
                                                value={formatPHMobile(accountNumber)}
                                                onChange={(e) => handleMobileChange(e.target.value)}
                                                placeholder="9XX XXX XXXX"
                                                className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                                                required
                                            />
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            value={accountNumber}
                                            onChange={(e) => setAccountNumber(e.target.value)}
                                            placeholder="Enter account number"
                                            className="border-fsc-cream-dark focus:border-fsc-green w-full rounded-xl border px-3 py-3 text-sm focus:outline-none"
                                            required
                                        />
                                    )}
                                </div>

                                {/* Account name */}
                                <div>
                                    <label className="text-fsc-navy mb-1.5 block text-sm font-medium">Account Name</label>
                                    <input
                                        type="text"
                                        value={accountName}
                                        onChange={(e) => setAccountName(e.target.value)}
                                        placeholder="Name on account"
                                        className="border-fsc-cream-dark focus:border-fsc-green w-full rounded-xl border px-3 py-3 text-sm focus:outline-none"
                                        required
                                    />
                                </div>

                                {error && <p className="text-sm text-[#C41E1E]">{error}</p>}
                            </>
                        )}
                    </div>

                    {/* Footer actions */}
                    <div className="border-fsc-cream-dark flex gap-3 border-t p-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="border-fsc-cream-dark flex-1 rounded-xl border py-3 text-sm font-medium transition-colors hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !isValid}
                            className="bg-fsc-green flex-1 rounded-xl py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50"
                        >
                            {loading ? "Submitting…" : `Request ${formatCurrency(net)}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Row({ label, value, muted, strong }: { label: string; value: string; muted?: boolean; strong?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className={muted ? "text-fsc-stone" : "text-fsc-navy"}>{label}</span>
            <span className={`${strong ? "text-fsc-navy font-semibold" : muted ? "text-fsc-stone" : "text-fsc-navy"}`}>{value}</span>
        </div>
    );
}
