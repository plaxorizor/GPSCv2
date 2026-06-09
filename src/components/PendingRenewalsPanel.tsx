import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Check, X } from "lucide-react";
import { formatCurrency } from "../utils/formatter";
import { packageLabel } from "../utils/upgrade";
import { getPendingRenewalRequests, approveRenewal, rejectRenewal, type RenewalRequest } from "../firebase/renewals";

// Admin panel: lists pending membership-renewal requests and lets an admin confirm
// (re-activate the member at the chosen tier) or reject them.
export default function PendingRenewalsPanel({ onChange }: { onChange?: () => void }) {
    const [requests, setRequests] = useState<RenewalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);

    const load = useCallback(() => {
        setLoading(true);
        getPendingRenewalRequests()
            .then(setRequests)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => load(), [load]);

    const act = async (id: string, kind: "approve" | "reject") => {
        if (busyId) return;
        setBusyId(id);
        try {
            if (kind === "approve") await approveRenewal(id);
            else await rejectRenewal(id);
            load();
            onChange?.();
        } finally {
            setBusyId(null);
        }
    };

    if (loading || requests.length === 0) return null; // hide when nothing pending

    return (
        <div className="border-fsc-cream-dark mb-6 overflow-hidden rounded-2xl border bg-white">
            <div className="border-fsc-cream-dark flex items-center gap-2 border-b p-4">
                <RefreshCw className="text-fsc-green" size={18} />
                <h2 className="font-display text-fsc-navy text-lg">Pending renewals</h2>
                <span className="bg-fsc-green/10 text-fsc-green ml-2 rounded-full px-2 py-0.5 text-xs font-medium">{requests.length}</span>
            </div>
            <div className="divide-fsc-cream-dark divide-y">
                {requests.map((r) => {
                    const tierChange = r.fromPackage?.toLowerCase() !== r.toPackage?.toLowerCase();
                    return (
                        <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                            <div>
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
                            </div>
                            <div className="flex items-center gap-2">
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
            </div>
        </div>
    );
}
