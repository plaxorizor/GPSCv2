import { useEffect, useMemo, useState } from "react";
import { UserPlus, Check, X, Receipt } from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import { activateMember, hardDeleteMember } from "../firebase/admin";
import { PACKAGE_INFO, peso } from "../utils/types";
import ApprovalDetailModal, { type ApprovalDetail } from "./ApprovalDetailModal";

interface PendingSignup {
    uid: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile?: string;
    package?: string;
    city?: string;
    province?: string;
    paymentReference?: string;
    paymentMethod?: string;
    paymentReceiptUrl?: string;
    dateCreated?: { toDate?: () => Date };
    archived?: boolean;
    isAdmin?: boolean;
}

const titleCase = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");

// Admin panel: members who just signed up and are awaiting activation. Surfaces
// the payment reference so the admin can match it against the receipt. Click a row
// to inspect full details; or use the inline buttons as a fast path.
export default function PendingSignupsPanel({ search = "" }: { search?: string }) {
    const [rows, setRows] = useState<PendingSignup[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [selected, setSelected] = useState<PendingSignup | null>(null);

    // Live subscription so brand-new signups appear without a manual refresh.
    useEffect(() => {
        const unsub = onSnapshot(query(collection(db, "members"), where("status", "==", "pending")), (snap) => {
            setRows(
                snap.docs
                    .map((d) => ({ uid: d.id, ...(d.data() as Omit<PendingSignup, "uid">) }))
                    .filter((m) => !m.archived && !m.isAdmin),
            );
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((m) =>
            [`${m.firstName} ${m.lastName}`, m.email, m.paymentReference, m.package].some((v) =>
                (v ?? "").toLowerCase().includes(q),
            ),
        );
    }, [rows, search]);

    const act = async (uid: string, kind: "approve" | "reject") => {
        if (busyId) return;
        setBusyId(uid);
        try {
            // Reject = permanently delete the never-activated applicant (per policy:
            // members are never archived; a bogus pending signup is just removed).
            if (kind === "approve") await activateMember(uid);
            else await hardDeleteMember(uid);
            setSelected(null);
            // The listener updates the list automatically.
        } finally {
            setBusyId(null);
        }
    };

    const detailFor = (m: PendingSignup): ApprovalDetail => {
        const pkg = (m.package ?? "").toLowerCase() as keyof typeof PACKAGE_INFO;
        return {
            kindLabel: "New signup",
            name: `${m.firstName} ${m.lastName}`.trim(),
            subtitle: `${titleCase(m.package)} Care`,
            amount: PACKAGE_INFO[pkg] ? peso(PACKAGE_INFO[pkg].price) : undefined,
            reference: m.paymentReference ?? null,
            method: m.paymentMethod ?? null,
            receiptUrl: m.paymentReceiptUrl ?? null,
            date: m.dateCreated?.toDate?.()?.toISOString?.() ?? null,
            rows: [
                { label: "Email", value: m.email || "—" },
                { label: "Mobile", value: m.mobile || "—" },
                { label: "City", value: m.city || "—" },
                { label: "Province", value: m.province || "—" },
            ],
            confirmLabel: "Confirm & activate",
        };
    };

    if (loading || rows.length === 0) return null; // hide when nothing pending

    return (
        <div className="border-fsc-cream-dark mb-6 overflow-hidden rounded-2xl border bg-white">
            <div className="border-fsc-cream-dark flex items-center gap-2 border-b p-4">
                <UserPlus className="text-fsc-green" size={18} />
                <h2 className="font-display text-fsc-navy text-lg">Pending signups</h2>
                <span className="bg-fsc-green/10 text-fsc-green ml-2 rounded-full px-2 py-0.5 text-xs font-medium">{filtered.length}</span>
            </div>
            <div className="divide-fsc-cream-dark divide-y">
                {filtered.map((m) => (
                    <div
                        key={m.uid}
                        onClick={() => setSelected(m)}
                        className="hover:bg-fsc-cream/40 flex cursor-pointer flex-wrap items-center justify-between gap-3 p-4 transition-colors"
                    >
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-fsc-navy font-medium">
                                    {m.firstName} {m.lastName}
                                </span>
                                <span className="bg-fsc-navy/10 text-fsc-navy rounded-full px-2 py-0.5 text-[10px] font-medium">
                                    {titleCase(m.package)} Care
                                </span>
                            </div>
                            <div className="text-fsc-stone text-xs">
                                {m.email}
                                {m.city ? ` · ${m.city}` : ""}
                            </div>
                            <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                                <Receipt size={13} className="text-fsc-stone shrink-0" />
                                {m.paymentReference ? (
                                    <span className="text-fsc-navy font-mono">
                                        {m.paymentReference}
                                        {m.paymentMethod ? <span className="text-fsc-stone font-sans"> · {m.paymentMethod}</span> : null}
                                    </span>
                                ) : (
                                    <span className="text-fsc-stone italic">No reference provided</span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => act(m.uid, "reject")}
                                disabled={busyId === m.uid}
                                className="border-fsc-cream-dark text-fsc-stone hover:bg-fsc-cream/60 flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                            >
                                <X size={12} /> Reject
                            </button>
                            <button
                                onClick={() => act(m.uid, "approve")}
                                disabled={busyId === m.uid}
                                className="bg-fsc-green hover:bg-fsc-green-light flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors disabled:opacity-50"
                            >
                                <Check size={12} /> {busyId === m.uid ? "Working…" : "Confirm payment & activate"}
                            </button>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="text-fsc-stone p-4 text-center text-xs">No pending signups match your search.</div>
                )}
            </div>

            {selected && (
                <ApprovalDetailModal
                    detail={detailFor(selected)}
                    busy={busyId === selected.uid}
                    onConfirm={() => act(selected.uid, "approve")}
                    onReject={() => act(selected.uid, "reject")}
                    onClose={() => setSelected(null)}
                />
            )}
        </div>
    );
}
