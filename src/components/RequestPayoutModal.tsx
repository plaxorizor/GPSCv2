import { useState } from "react";
import { X, Wallet, CheckCircle } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import useAuth from "../context/useAuth";
import { formatCurrency } from "../utils/formatter";

const PAYMENT_METHODS = [
    { value: "gcash",      label: "GCash" },
    { value: "maya",       label: "Maya (PayMaya)" },
    { value: "bdo",        label: "BDO" },
    { value: "bpi",        label: "BPI" },
    { value: "unionbank",  label: "UnionBank" },
    { value: "metrobank",  label: "Metrobank" },
    { value: "landbank",   label: "Landbank" },
];

const MIN_PAYOUT = 100;

interface Props {
    availableToWithdraw: number;
    memberName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RequestPayoutModal({ availableToWithdraw, memberName, onClose, onSuccess }: Props) {
    const { currentUser } = useAuth();
    const [amount, setAmount]               = useState("");
    const [method, setMethod]               = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName]     = useState(memberName);
    const [loading, setLoading]             = useState(false);
    const [error, setError]                 = useState("");
    const [success, setSuccess]             = useState(false);
    const [submittedAmount, setSubmittedAmount] = useState(0);

    const numAmount = parseFloat(amount) || 0;
    const amountOk = numAmount >= MIN_PAYOUT && numAmount <= availableToWithdraw;
    const isValid  = amountOk && method && accountNumber.trim() && accountName.trim();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !isValid) return;
        setError("");
        setLoading(true);
        try {
            await addDoc(collection(db, "payouts"), {
                memberId:      currentUser.uid,
                memberName,
                amount:        numAmount,
                method,
                accountNumber: accountNumber.trim(),
                accountName:   accountName.trim(),
                status:        "requested",
                requestedAt:   serverTimestamp(),
                sentAt:        null,
                reference:     null,
            });
            setSubmittedAmount(numAmount);
            setSuccess(true);
        } catch {
            setError("Failed to submit request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const isEWallet = method === "gcash" || method === "maya";

    if (success) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
                    <CheckCircle className="text-gpsc-green mx-auto mb-4" size={48} />
                    <h2 className="font-display text-gpsc-navy mb-2 text-xl font-semibold">Request Submitted!</h2>
                    <p className="text-gpsc-stone mb-6 text-sm">
                        Your payout of{" "}
                        <span className="text-gpsc-navy font-semibold">{formatCurrency(submittedAmount)}</span> has been
                        submitted. The admin will process it within 3–5 business days.
                    </p>
                    <button
                        onClick={() => { onSuccess(); onClose(); }}
                        className="bg-gpsc-green w-full rounded-xl py-3 font-medium text-white"
                    >
                        Done
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
                {/* Header */}
                <div className="border-gpsc-cream-dark flex items-center justify-between border-b p-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-gpsc-green/10 flex h-9 w-9 items-center justify-center rounded-xl">
                            <Wallet className="text-gpsc-green" size={18} />
                        </div>
                        <div>
                            <h2 className="font-display text-gpsc-navy font-semibold">Request Payout</h2>
                            <p className="text-gpsc-stone text-xs">
                                Available: {formatCurrency(availableToWithdraw)}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gpsc-stone hover:text-gpsc-navy rounded-lg p-1 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    {/* Amount */}
                    <div>
                        <label className="text-gpsc-navy mb-1.5 block text-sm font-medium">Amount</label>
                        <div className="relative">
                            <span className="text-gpsc-stone absolute top-1/2 left-3 -translate-y-1/2 text-sm">₱</span>
                            <input
                                type="number"
                                min={MIN_PAYOUT}
                                max={availableToWithdraw}
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder={`Min ₱${MIN_PAYOUT}`}
                                className="border-gpsc-cream-dark focus:border-gpsc-green w-full rounded-xl border py-3 pr-3 pl-7 text-sm focus:outline-none"
                                required
                            />
                        </div>
                        {numAmount > 0 && numAmount < MIN_PAYOUT && (
                            <p className="mt-1 text-xs text-red-500">Minimum payout is {formatCurrency(MIN_PAYOUT)}</p>
                        )}
                        {numAmount > availableToWithdraw && (
                            <p className="mt-1 text-xs text-red-500">
                                Exceeds available balance of {formatCurrency(availableToWithdraw)}
                            </p>
                        )}
                        {/* Quick-fill buttons */}
                        <div className="mt-2 flex gap-2">
                            {[0.25, 0.5, 1].map((frac) => {
                                const val = Math.floor(availableToWithdraw * frac);
                                if (val < MIN_PAYOUT) return null;
                                return (
                                    <button
                                        key={frac}
                                        type="button"
                                        onClick={() => setAmount(val.toString())}
                                        className="border-gpsc-cream-dark text-gpsc-stone hover:bg-gpsc-cream rounded-lg border px-2.5 py-1 text-xs transition-colors"
                                    >
                                        {frac === 1 ? "Max" : `${frac * 100}%`}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Payment method */}
                    <div>
                        <label className="text-gpsc-navy mb-1.5 block text-sm font-medium">Payment Method</label>
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="border-gpsc-cream-dark focus:border-gpsc-green w-full rounded-xl border px-3 py-3 text-sm focus:outline-none"
                            required
                        >
                            <option value="">Select method…</option>
                            {PAYMENT_METHODS.map((m) => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Account number */}
                    <div>
                        <label className="text-gpsc-navy mb-1.5 block text-sm font-medium">
                            {isEWallet ? "Mobile Number" : "Account Number"}
                        </label>
                        <input
                            type="text"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            placeholder={isEWallet ? "09XXXXXXXXX" : "Enter account number"}
                            className="border-gpsc-cream-dark focus:border-gpsc-green w-full rounded-xl border px-3 py-3 text-sm focus:outline-none"
                            required
                        />
                    </div>

                    {/* Account name */}
                    <div>
                        <label className="text-gpsc-navy mb-1.5 block text-sm font-medium">Account Name</label>
                        <input
                            type="text"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                            placeholder="Name on account"
                            className="border-gpsc-cream-dark focus:border-gpsc-green w-full rounded-xl border px-3 py-3 text-sm focus:outline-none"
                            required
                        />
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="border-gpsc-cream-dark flex-1 rounded-xl border py-3 text-sm font-medium transition-colors hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !isValid}
                            className="bg-gpsc-green flex-1 rounded-xl py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50"
                        >
                            {loading ? "Submitting…" : "Submit Request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
