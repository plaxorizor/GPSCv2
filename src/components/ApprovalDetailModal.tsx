import { X, Receipt, Check, Image as ImageIcon } from "lucide-react";

export interface ApprovalDetail {
    kindLabel: string; // "New signup" | "Upgrade request" | "Renewal request"
    name: string;
    subtitle?: string; // package, or "Basic → Family Care"
    amount?: string; // formatted, e.g. "₱3,000 (difference)"
    reference?: string | null;
    method?: string | null;
    date?: string | null; // ISO of when requested/created
    rows: { label: string; value: string }[]; // contact / extra info
    confirmLabel: string; // e.g. "Confirm & activate"
}

interface Props {
    detail: ApprovalDetail;
    busy: boolean;
    onConfirm: () => void;
    onReject: () => void;
    onClose: () => void;
}

const fmtDate = (iso?: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "—" : d.toLocaleString();
};

// Shared detail view for an item in the admin Approvals queue. Shows who the
// request is from, what they're paying for, the payment proof (reference + method)
// to verify against the receipt, and Confirm / Reject actions.
export default function ApprovalDetailModal({ detail, busy, onConfirm, onReject, onClose }: Props) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div
                className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="border-fsc-cream-dark flex items-start justify-between border-b p-5">
                    <div className="min-w-0">
                        <div className="text-fsc-stone text-xs tracking-wider uppercase">{detail.kindLabel}</div>
                        <h2 className="font-display text-fsc-navy text-xl">{detail.name}</h2>
                        {detail.subtitle && <p className="text-fsc-stone text-sm">{detail.subtitle}</p>}
                    </div>
                    <button onClick={onClose} className="text-fsc-stone hover:text-fsc-navy transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-4 p-5">
                    {detail.amount && (
                        <div className="bg-fsc-cream/50 flex items-center justify-between rounded-xl px-4 py-3">
                            <span className="text-fsc-stone text-xs tracking-wider uppercase">Amount</span>
                            <span className="font-display text-fsc-navy text-lg">{detail.amount}</span>
                        </div>
                    )}

                    {/* Proof of payment */}
                    <div className="border-fsc-cream-dark rounded-xl border p-4">
                        <div className="text-fsc-navy mb-1 flex items-center gap-1.5 text-sm font-medium">
                            <Receipt size={15} /> Proof of payment
                        </div>
                        {detail.reference ? (
                            <div className="text-fsc-navy font-mono text-sm">
                                {detail.reference}
                                {detail.method ? <span className="text-fsc-stone font-sans"> · {detail.method}</span> : null}
                            </div>
                        ) : (
                            <div className="text-fsc-stone text-sm italic">No reference provided</div>
                        )}

                        {/* Receipt screenshot placeholder — wired once file uploads are
                            available on the Blaze plan (members will attach proof at
                            signup / upgrade / renewal, and it renders here). */}
                        <div className="border-fsc-cream-dark bg-fsc-cream/30 mt-3 flex aspect-video w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed">
                            <ImageIcon size={20} className="text-fsc-stone/50" />
                            <span className="text-fsc-stone/70 text-xs">Receipt upload coming soon</span>
                        </div>

                        <p className="text-fsc-stone mt-2 text-xs">
                            For now, match the reference against the receipt the member sent (Messenger / email).
                        </p>
                    </div>

                    {/* Info rows */}
                    <div className="grid grid-cols-2 gap-3">
                        {detail.rows.map((r) => (
                            <div key={r.label}>
                                <div className="text-fsc-stone text-xs">{r.label}</div>
                                <div className="text-fsc-navy text-sm font-medium break-words">{r.value}</div>
                            </div>
                        ))}
                        <div>
                            <div className="text-fsc-stone text-xs">Requested</div>
                            <div className="text-fsc-navy text-sm font-medium">{fmtDate(detail.date)}</div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="border-fsc-cream-dark flex gap-2 border-t p-5">
                    <button
                        onClick={onReject}
                        disabled={busy}
                        className="border-fsc-cream-dark text-fsc-stone hover:bg-fsc-cream/60 flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        Reject
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={busy}
                        className="bg-fsc-green hover:bg-fsc-green-light flex flex-1 items-center justify-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
                    >
                        <Check size={14} /> {busy ? "Working…" : detail.confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
