import { useMemo, useRef, useState } from "react";
import { X, FileText, CheckCircle, Upload, Paperclip, Trash2, ChevronLeft } from "lucide-react";
import useAuth from "../../context/useAuth";
import { submitClaim, uploadClaimFiles } from "../../firebase/claims";
import { formatCurrency } from "../../utils/formatter";
import type { ClaimBenefit } from "../../utils/eligibility";

interface Props {
    memberName: string;
    benefits: ClaimBenefit[]; // the member's currently-claimable benefits
    onClose: () => void;
    onSuccess: () => void;
    initialBenefit?: string; // pre-select when opened from a specific benefit
}

export default function FileClaimModal({ memberName, benefits, onClose, onSuccess, initialBenefit }: Props) {
    const { currentUser } = useAuth();

    // A benefit is "locked in" when the modal was opened for a specific one (from
    // the timeline) or there's only one claimable — then there's no chooser.
    const locked = !!initialBenefit || benefits.length === 1;
    const [benefitLabel, setBenefitLabel] = useState(initialBenefit ?? (benefits.length === 1 ? benefits[0].label : ""));
    const selected = useMemo(() => benefits.find((b) => b.label === benefitLabel) ?? null, [benefits, benefitLabel]);

    const [customAmount, setCustomAmount] = useState(""); // for variable-amount benefits
    const [description, setDescription] = useState("");
    const [documents, setDocuments] = useState<string[]>([]);
    const [otherDoc, setOtherDoc] = useState(""); // free-text "Others" document
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Variable benefits: member enters the amount (defaults to the headline value).
    // Fixed benefits: auto-determined, not editable.
    const amount = selected ? (selected.variableAmount ? parseFloat(customAmount) || 0 : selected.amount) : 0;
    const isValid = !!selected && description.trim().length > 0 && amount > 0;

    const pickBenefit = (label: string) => {
        setBenefitLabel(label);
        setDocuments([]);
        setOtherDoc("");
        const b = benefits.find((x) => x.label === label);
        setCustomAmount(b?.variableAmount ? String(b.amount) : "");
    };
    const toggleDoc = (doc: string) => setDocuments((p) => (p.includes(doc) ? p.filter((d) => d !== doc) : [...p, doc]));
    const addFiles = (list: FileList | null) => {
        if (list) setFiles((prev) => [...prev, ...Array.from(list)]);
    };
    const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !selected || !isValid) return;
        setError("");
        setLoading(true);
        try {
            const uploads = files.length ? await uploadClaimFiles(currentUser.uid, files) : [];
            const allDocs = otherDoc.trim() ? [...documents, otherDoc.trim()] : documents;
            await submitClaim(currentUser.uid, memberName, {
                benefit: selected.label,
                amount,
                description: description.trim(),
                documents: allDocs,
                uploads,
            });
            setSuccess(true);
        } catch {
            setError("Failed to submit claim. Please check your files and try again.");
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
                        Your claim for <span className="text-fsc-navy font-semibold">{selected?.label}</span> (
                        {formatCurrency(amount)}) has been submitted. An admin will review it and update the status here.
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
                    <button onClick={onClose} className="text-fsc-stone hover:text-fsc-navy rounded-lg p-1 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {benefits.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-fsc-stone text-sm">
                            You have no benefits available to claim yet. Benefits unlock over time — check your Eligibility Timeline.
                        </p>
                        <button onClick={onClose} className="bg-fsc-navy mt-6 w-full rounded-xl py-3 text-sm font-medium text-white">
                            Close
                        </button>
                    </div>
                ) : !selected ? (
                    /* Benefit chooser (generic entry, multiple benefits) — cards, no dropdown */
                    <div className="space-y-2 p-6">
                        <p className="text-fsc-stone mb-1 text-sm">Which benefit are you claiming?</p>
                        {benefits.map((b) => (
                            <button
                                key={b.label}
                                type="button"
                                onClick={() => pickBenefit(b.label)}
                                className="border-fsc-cream-dark hover:border-fsc-green hover:bg-fsc-green/5 flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors"
                            >
                                <span className="text-fsc-navy text-sm font-medium">{b.label}</span>
                                <span className="text-fsc-stone text-xs">
                                    {b.variableAmount ? "up to " : ""}
                                    {formatCurrency(b.amount)}
                                </span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 p-6">
                        {/* Selected benefit — read-only (no dropdown) */}
                        <div>
                            <div className="mb-1.5 flex items-center justify-between">
                                <label className="text-fsc-navy block text-sm font-medium">Benefit</label>
                                {!locked && (
                                    <button
                                        type="button"
                                        onClick={() => setBenefitLabel("")}
                                        className="text-fsc-stone hover:text-fsc-navy flex items-center gap-0.5 text-xs"
                                    >
                                        <ChevronLeft size={12} /> Change
                                    </button>
                                )}
                            </div>
                            <div className="border-fsc-cream-dark bg-fsc-cream/40 text-fsc-navy rounded-xl border px-3 py-3 text-sm font-medium">
                                {selected.label}
                            </div>
                        </div>

                        {/* Amount — auto for fixed, editable for variable */}
                        <div>
                            <label className="text-fsc-navy mb-1.5 block text-sm font-medium">
                                {selected.variableAmount ? "Amount being claimed" : "Benefit amount"}
                            </label>
                            {selected.variableAmount ? (
                                <>
                                    <div className="relative">
                                        <span className="text-fsc-stone absolute top-1/2 left-3 -translate-y-1/2 text-sm">₱</span>
                                        <input
                                            type="number"
                                            min={1}
                                            max={selected.amount}
                                            step="0.01"
                                            value={customAmount}
                                            onChange={(e) => setCustomAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="border-fsc-cream-dark focus:border-fsc-green w-full rounded-xl border py-3 pr-3 pl-7 text-sm focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <p className="text-fsc-stone mt-1 text-xs">
                                        Up to {formatCurrency(selected.amount)} · the admin verifies the final amount.
                                    </p>
                                </>
                            ) : (
                                <div className="border-fsc-cream-dark bg-fsc-cream/40 flex items-center justify-between rounded-xl border px-3 py-3">
                                    <span className="font-display text-fsc-navy text-lg">{formatCurrency(selected.amount)}</span>
                                    <span className="text-fsc-stone text-xs">Fixed · admin verifies on review</span>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-fsc-navy mb-1.5 block text-sm font-medium">What happened?</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                placeholder="Briefly describe the reason for this claim…"
                                className="border-fsc-cream-dark focus:border-fsc-green w-full resize-none rounded-xl border px-3 py-3 text-sm focus:outline-none"
                                required
                            />
                        </div>

                        {/* Required documents for THIS benefit + an "Others" entry */}
                        <div>
                            <label className="text-fsc-navy mb-1.5 block text-sm font-medium">
                                Supporting documents <span className="text-fsc-stone font-normal">(tick what you have)</span>
                            </label>
                            <div className="space-y-2">
                                {selected.documents.map((doc) => (
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
                                    placeholder="Others (optional)"
                                    className="border-fsc-cream-dark focus:border-fsc-green mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Upload attachments */}
                        <div>
                            <label className="text-fsc-navy mb-1.5 block text-sm font-medium">
                                Attach files <span className="text-fsc-stone font-normal">(photos / scans · optional)</span>
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*,application/pdf"
                                onChange={(e) => {
                                    addFiles(e.target.files);
                                    e.target.value = ""; // allow re-picking the same file
                                }}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="border-fsc-cream-dark text-fsc-navy hover:bg-fsc-cream/40 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm font-medium transition-colors"
                            >
                                <Upload size={16} /> Upload documents
                            </button>
                            {files.length > 0 && (
                                <ul className="mt-2 space-y-1.5">
                                    {files.map((f, i) => (
                                        <li
                                            key={i}
                                            className="border-fsc-cream-dark flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs"
                                        >
                                            <span className="text-fsc-stone flex min-w-0 items-center gap-2">
                                                <Paperclip size={12} className="shrink-0" />
                                                <span className="truncate">{f.name}</span>
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(i)}
                                                className="text-fsc-stone hover:text-[#C41E1E] shrink-0 transition-colors"
                                                aria-label={`Remove ${f.name}`}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
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
                )}
            </div>
        </div>
    );
}
