import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Check, X, Receipt } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { formatCurrency } from "../utils/formatter";
import { packageLabel } from "../utils/upgrade";
import { subscribePendingRenewalRequests, approveRenewal, rejectRenewal, type RenewalRequest } from "../firebase/renewals";
import ApprovalDetailModal, { type ApprovalDetail } from "./ApprovalDetailModal";

// Admin panel: lists pending membership-renewal requests and lets an admin confirm
// (re-activate the member at the chosen tier) or reject them. Click a row to inspect.
export default function PendingRenewalsPanel({ search = "" }: { search?: string }) {
    const [requests, setRequests] = useState<RenewalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [selected, setSelected] = useState<{ req: RenewalRequest; rows: { label: string; value: string }[] } | null>(null);

    // Live subscription so new renewal requests appear without a manual refresh.
    useEffect(() => {
        const unsub = subscribePendingRenewalRequests((reqs) => {
            setRequests(reqs);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return requests;
        return requests.filter((r) =>
            [r.memberName, r.paymentReference, r.fromPackage, r.toPackage].some((v) => (v ?? "").toLowerCase().includes(q)),
        );
    }, [requests, search]);

    const act = async (id: string, kind: "approve" | "reject") => {
        if (busyId) return;
        setBusyId(id);
        try {
            if (kind === "approve") await approveRenewal(id);
            else await rejectRenewal(id);
            setSelected(null);
            // The listener updates the list automatically.
        } finally {
            setBusyId(null);
        }
    };

    const openDetail = async (req: RenewalRequest) => {
        let rows = [{ label: "Member", value: req.memberName }];
        try {
            const snap = await getDoc(doc(db, "members", req.memberId));
            if (snap.exists()) {
                const d = snap.data();
                rows = [
                    { label: "Email", value: (d.email as string) || "—" },
                    { label: "Mobile", value: (d.mobile as string) || "—" },
                    { label: "City", value: (d.city as string) || "—" },
                ];
            }
        } catch {
            /* keep the fallback rows */
        }
        setSelected({ req, rows });
    };

    const detailFor = (req: RenewalRequest, rows: { label: string; value: string }[]): ApprovalDetail => {
        const tierChange = req.fromPackage?.toLowerCase() !== req.toPackage?.toLowerCase();
        return {
            kindLabel: "Renewal request",
            name: req.memberName,
            subtitle: tierChange
                ? `${packageLabel(req.fromPackage)} → ${packageLabel(req.toPackage)} Care`
                : `Renew ${packageLabel(req.toPackage)} Care`,
            amount: `${formatCurrency(req.amountDue)} · 365 days`,
            reference: req.paymentReference ?? null,
            method: req.paymentMethod ?? null,
            receiptUrl: req.paymentReceiptUrl ?? null,
            date: req.dateRequested || null,
            rows,
            confirmLabel: "Confirm & renew",
        };
    };

    if (loading || requests.length === 0) return null; // hide when nothing pending

    return (
        <div className="border-fsc-cream-dark mb-6 overflow-hidden rounded-2xl border bg-white">
            <div className="border-fsc-cream-dark flex items-center gap-2 border-b p-4">
                <RefreshCw className="text-fsc-green" size={18} />
                <h2 className="font-display text-fsc-navy text-lg">Pending renewals</h2>
                <span className="bg-fsc-green/10 text-fsc-green ml-2 rounded-full px-2 py-0.5 text-xs font-medium">{filtered.length}</span>
            </div>
            <div className="divide-fsc-cream-dark divide-y">
                {filtered.map((r) => {
                    const tierChange = r.fromPackage?.toLowerCase() !== r.toPackage?.toLowerCase();
                    return (
                        <div
                            key={r.id}
                            onClick={() => openDetail(r)}
                            className="hover:bg-fsc-cream/40 flex cursor-pointer flex-wrap items-center justify-between gap-3 p-4 transition-colors"
                        >
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-fsc-navy font-medium">{r.memberName}</span>
                                    {tierChange && (
                                        <span className="rounded-full bg-[#C9922A]/15 px-2 py-0.5 text-[10px] font-medium text-[#A87820]">
                                            Tier change
                                        </span>
                                    )}
                                </div>
                                <div className="text-fsc-stone text-xs">
                                    {tierChange ? (
                                        <>
                                            {packageLabel(r.fromPackage)} → <strong>{packageLabel(r.toPackage)}</strong> Care
                                        </>
                                    ) : (
                                        <>
                                            Renew <strong>{packageLabel(r.toPackage)}</strong> Care
                                        </>
                                    )}{" "}
                                    · pays {formatCurrency(r.amountDue)} · 365 days
                                </div>
                                <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                                    <Receipt size={13} className="text-fsc-stone shrink-0" />
                                    {r.paymentReference ? (
                                        <span className="text-fsc-navy font-mono">
                                            {r.paymentReference}
                                            {r.paymentMethod ? <span className="text-fsc-stone font-sans"> · {r.paymentMethod}</span> : null}
                                        </span>
                                    ) : (
                                        <span className="text-fsc-stone italic">No reference provided</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => act(r.id, "reject")}
                                    disabled={busyId === r.id}
                                    className="border-fsc-cream-dark text-fsc-stone hover:bg-fsc-cream/60 flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                                >
                                    <X size={12} /> Reject
                                </button>
                                <button
                                    onClick={() => act(r.id, "approve")}
                                    disabled={busyId === r.id}
                                    className="bg-fsc-green hover:bg-fsc-green-light flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors disabled:opacity-50"
                                >
                                    <Check size={12} /> {busyId === r.id ? "Working…" : "Confirm payment & renew"}
                                </button>
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="text-fsc-stone p-4 text-center text-xs">No pending renewals match your search.</div>
                )}
            </div>

            {selected && (
                <ApprovalDetailModal
                    detail={detailFor(selected.req, selected.rows)}
                    busy={busyId === selected.req.id}
                    onConfirm={() => act(selected.req.id, "approve")}
                    onReject={() => act(selected.req.id, "reject")}
                    onClose={() => setSelected(null)}
                />
            )}
        </div>
    );
}
