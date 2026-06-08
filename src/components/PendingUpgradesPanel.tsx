import { useCallback, useEffect, useState } from "react";
import { ArrowUpCircle, Check, X } from "lucide-react";
import { formatCurrency } from "../utils/formatter";
import { packageLabel } from "../utils/upgrade";
import { getPendingUpgradeRequests, approveUpgrade, rejectUpgrade, type UpgradeRequest } from "../firebase/upgrades";

// Admin panel: lists pending package-upgrade requests and lets an admin confirm
// (apply the upgrade) or reject them. Self-contained — fetches its own data.
export default function PendingUpgradesPanel({ onChange }: { onChange?: () => void }) {
    const [requests, setRequests] = useState<UpgradeRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);

    const load = useCallback(() => {
        setLoading(true);
        getPendingUpgradeRequests()
            .then(setRequests)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => load(), [load]);

    const act = async (id: string, kind: "approve" | "reject") => {
        if (busyId) return;
        setBusyId(id);
        try {
            if (kind === "approve") await approveUpgrade(id);
            else await rejectUpgrade(id);
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
                <ArrowUpCircle className="text-fsc-green" size={18} />
                <h2 className="font-display text-fsc-navy text-lg">Pending upgrades</h2>
                <span className="bg-fsc-green/10 text-fsc-green ml-2 rounded-full px-2 py-0.5 text-xs font-medium">{requests.length}</span>
            </div>
            <div className="divide-fsc-cream-dark divide-y">
                {requests.map((r) => (
                    <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-fsc-navy font-medium">{r.memberName}</span>
                                {r.basis === "full" && (
                                    <span className="rounded-full bg-[#C9922A]/15 px-2 py-0.5 text-[10px] font-medium text-[#A87820]">
                                        Full price · after grace
                                    </span>
                                )}
                            </div>
                            <div className="text-fsc-stone text-xs">
                                {packageLabel(r.fromPackage)} → <strong>{packageLabel(r.toPackage)}</strong> Care · pays{" "}
                                {formatCurrency(r.amountDue)}
                                {r.basis === "full" ? " (full)" : " (difference)"}
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
                                <Check size={12} /> {busyId === r.id ? "Working…" : "Confirm payment & upgrade"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
