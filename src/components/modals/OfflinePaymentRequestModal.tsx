// components/modals/OfflinePaymentRequestModal.tsx
//
// Shared modal for the two member-facing "pay offline, then submit a request"
// flows — upgrade and renewal. They are the same form (payment-method picker +
// QR card + reference number + optional receipt + submit, then a success
// screen); only the labels, the summary box, and the request function differ.
// Callers pass those in; this owns the form state and the submit lifecycle.

import { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import ReceiptUploadField from "../ui/ReceiptUploadField";
import { PAYMENT_ACCOUNTS } from "../../data/paymentAccounts";

interface Props {
    title: string;
    /** The summary box (e.g. "Basic → Family · ₱1,000"). */
    summary: React.ReactNode;
    /** The numbered "how to pay" instructions. */
    instructions: React.ReactNode;
    /** Optional callout under the QR (e.g. "eligibility restarts on approval"). */
    note?: React.ReactNode;
    submitLabel: string;
    doneTitle: string;
    doneBody: React.ReactNode;
    onClose: () => void;
    onSuccess: () => void;
    /** Performs the request; throw an Error whose message is a known code. */
    onSubmit: (data: { reference: string; method: string; receiptFile: File | null }) => Promise<void>;
    /** Map a thrown error code to a friendly message (falls back to a generic one). */
    mapError?: (code: string) => string | undefined;
}

export default function OfflinePaymentRequestModal({
    title,
    summary,
    instructions,
    note,
    submitLabel,
    doneTitle,
    doneBody,
    onClose,
    onSuccess,
    onSubmit,
    mapError,
}: Props) {
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
            await onSubmit({ reference: referenceNumber.trim(), method: selectedPaymentMethod, receiptFile });
            setDone(true);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "";
            setError(mapError?.(msg) ?? "Could not submit the request. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (done) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
                    <CheckCircle className="text-fsc-green mx-auto mb-4" size={48} />
                    <h2 className="font-display text-fsc-navy mb-2 text-xl font-semibold">{doneTitle}</h2>
                    <p className="text-fsc-stone mb-6 text-sm">{doneBody}</p>
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
                    <h2 className="font-display text-fsc-navy text-lg">{title}</h2>
                    <button onClick={onClose} className="text-fsc-stone hover:text-fsc-navy transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {summary}

                {instructions}

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
                        {/* Anti-tamper nudge — same as the signup payment step. */}
                        <p className="mt-3 rounded-lg border border-[#F5D9A8] bg-[#FEF3E2] px-3 py-2 text-center text-xs text-[#92400E]">
                            ⚠️ Before sending, confirm your app shows the account name <span className="font-semibold">{acct.accountName}</span>.
                        </p>
                    </div>
                ))}

                {note}

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
                    {submitting ? "Submitting…" : submitLabel}
                </button>
            </div>
        </div>
    );
}
