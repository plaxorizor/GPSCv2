import { useState } from "react";
import { X, FileText, CheckCircle } from "lucide-react";
import useAuth from "../context/useAuth";
import { submitClaim } from "../firebase/claims";
import { formatCurrency } from "../utils/formatter";

// Default benefit types — easy to edit later, or swap to a fixed schedule.
const BENEFITS = [
    "Hospital Cash Assistance",
    "Medical Reimbursement",
    "Accident Assistance",
    "Bereavement / Death Benefit",
    "Calamity Assistance",
    "Other",
];

// Common supporting documents members check off (no uploads yet — admin
// verifies the physical/emailed copies during review).
const DOCUMENT_OPTIONS = [
    "Valid ID",
    "Medical Certificate",
    "Official Receipt / Billing Statement",
    "Hospital Records",
    "Police Report",
    "Death Certificate",
    "Barangay Certificate",
];

interface Props {
    memberName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function FileClaimModal({ memberName, onClose, onSuccess }: Props) {
    const { currentUser } = useAuth();
    const [benefit, setBenefit] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [documents, setDocuments] = useState<string[]>([]);
    const [otherDoc, setOtherDoc] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const numAmount = parseFloat(amount) || 0;
    const isValid = benefit && numAmount > 0 && description.trim().length > 0;

    const toggleDoc = (doc: string) => {
        setDocuments((prev) => (prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !isValid) return;
        setError("");
        setLoading(true);
        try {
            const docs = [...documents];
            if (otherDoc.trim()) docs.push(otherDoc.trim());
            await submitClaim(currentUser.uid, memberName, {
                benefit,
                amount: numAmount,
                description: description.trim(),
                documents: docs,
            });
            setSuccess(true);
        } catch {
            setError("Failed to submit claim. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
                    <CheckCircle className="text-fsc-green mx-auto mb-4" size={48} />
                    <h2 className="font-display text-fsc-navy mb-2 text-xl font-semibold">Claim Submitted!</h2>
                    <p className="text-fsc-stone mb-6 text-sm">
                        Your claim for <span className="text-fsc-navy font-semibold">{benefit}</span> (
                        {formatCurrency(numAmount)}) has been submitted. An admin will review it and update
                        the status here.
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
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-xl">
                {/* Header */}
                <div className="border-fsc-cream-dark sticky top-0 flex items-center justify-between border-b bg-white p-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-fsc-navy/10 flex h-9 w-9 items-center justify-center rounded-xl">
                            <FileText className="text-fsc-navy" size={18} />
                        </div>
                        <h2 className="font-display text-fsc-navy font-semibold">File a Claim</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-fsc-stone hover:text-fsc-navy rounded-lg p-1 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    {/* Benefit */}
                    <div>
                        <label className="text-fsc-navy mb-1.5 block text-sm font-medium">Benefit</label>
                        <select
                            value={benefit}
                            onChange={(e) => setBenefit(e.target.value)}
                            className="border-fsc-cream-dark focus:border-fsc-green w-full rounded-xl border px-3 py-3 text-sm focus:outline-none"
                            required
                        >
                            <option value="">Select benefit…</option>
                            {BENEFITS.map((b) => (
                                <option key={b} value={b}>
                                    {b}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="text-fsc-navy mb-1.5 block text-sm font-medium">
                            Amount being claimed
                        </label>
                        <div className="relative">
                            <span className="text-fsc-stone absolute top-1/2 left-3 -translate-y-1/2 text-sm">₱</span>
                            <input
                                type="number"
                                min={1}
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="border-fsc-cream-dark focus:border-fsc-green w-full rounded-xl border py-3 pr-3 pl-7 text-sm focus:outline-none"
                                required
                            />
                        </div>
                        <p className="text-fsc-stone mt-1 text-xs">
                            The admin will verify this amount during review.
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-fsc-navy mb-1.5 block text-sm font-medium">
                            What happened?
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Briefly describe the reason for this claim…"
                            className="border-fsc-cream-dark focus:border-fsc-green w-full resize-none rounded-xl border px-3 py-3 text-sm focus:outline-none"
                            required
                        />
                    </div>

                    {/* Documents checklist */}
                    <div>
                        <label className="text-fsc-navy mb-1.5 block text-sm font-medium">
                            Supporting documents you have
                        </label>
                        <div className="space-y-2">
                            {DOCUMENT_OPTIONS.map((doc) => (
                                <label key={doc} className="flex cursor-pointer items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={documents.includes(doc)}
                                        onChange={() => toggleDoc(doc)}
                                        className="accent-fsc-green h-4 w-4 rounded"
                                    />
                                    <span className="text-fsc-stone">{doc}</span>
                                </label>
                            ))}
                            <input
                                type="text"
                                value={otherDoc}
                                onChange={(e) => setOtherDoc(e.target.value)}
                                placeholder="Other document (optional)"
                                className="border-fsc-cream-dark focus:border-fsc-green mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-[#C41E1E]">{error}</p>}

                    <div className="flex gap-3 pt-2">
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
                            className="bg-fsc-navy flex-1 rounded-xl py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50"
                        >
                            {loading ? "Submitting…" : "Submit Claim"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
