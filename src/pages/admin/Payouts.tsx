// admin/Payouts.tsx
import React, { useState, useEffect } from "react";
import { Wallet, Clock, CheckCircle, Download, Send, Search, X, RefreshCw } from "lucide-react";
import type { AdminPayout } from "../../utils/types";
import { formatCurrency, formatDate } from "./utils";

const METHOD_LABELS: Record<string, string> = {
    gcash:      "GCash",
    maya:       "Maya",
    bdo:        "BDO",
    bpi:        "BPI",
    unionbank:  "UnionBank",
    metrobank:  "Metrobank",
    landbank:   "Landbank",
};

const methodLabel = (m: string) => METHOD_LABELS[m] ?? m.charAt(0).toUpperCase() + m.slice(1);

interface Props {
    payouts: AdminPayout[];
    loading: boolean;
    onMarkSent: (payoutId: string, reference: string) => Promise<void>;
    onReject: (payoutId: string, reason: string) => Promise<void>;
    onRefresh: () => void;
    refreshing?: boolean;
}

export const Payouts: React.FC<Props> = ({ payouts, loading, onMarkSent, onReject, onRefresh, refreshing }) => {
    const [selected, setSelected] = useState<AdminPayout | null>(null);
    const [reference, setReference] = useState("");
    const [processing, setProcessing] = useState(false);
    const [rejectingId, setRejectingId] = useState<string | null>(null);

    const handleReject = async (p: AdminPayout) => {
        if (rejectingId) return;
        setRejectingId(p.id);
        try {
            await onReject(p.id, "");
        } finally {
            setRejectingId(null);
        }
    };

    // Pending filters
    const [pendingSearch, setPendingSearch] = useState("");

    // History filters
    const [historySearch, setHistorySearch] = useState("");
    const [methodFilter, setMethodFilter] = useState("all");

    // Track WHICH refresh button was clicked so only that one spins.
    const [activeRefresh, setActiveRefresh] = useState<null | "all" | "pending" | "history">(null);
    const triggerRefresh = (key: "all" | "pending" | "history") => {
        setActiveRefresh(key);
        onRefresh();
    };
    // Keep the spinner visible until the fetch finishes AND a short minimum has
    // elapsed, so a fast refetch still registers visually.
    useEffect(() => {
        if (refreshing || activeRefresh === null) return;
        const t = setTimeout(() => setActiveRefresh(null), 500);
        return () => clearTimeout(t);
    }, [refreshing, activeRefresh]);

    const pending = payouts.filter((p) => {
        if (p.status !== "requested") return false;
        const q = pendingSearch.trim().toLowerCase();
        return (
            !q ||
            p.memberName.toLowerCase().includes(q) ||
            p.memberId.toLowerCase().includes(q) ||
            p.accountNumber.toLowerCase().includes(q)
        );
    });

    const history = payouts.filter((p) => {
        if (p.status !== "sent") return false;
        const matchesMethod = methodFilter === "all" || p.method === methodFilter;
        const q = historySearch.trim().toLowerCase();
        const matchesSearch =
            !q ||
            p.memberName.toLowerCase().includes(q) ||
            p.accountNumber.toLowerCase().includes(q) ||
            (p.reference ?? "").toLowerCase().includes(q);
        return matchesMethod && matchesSearch;
    });

    const allPending = payouts.filter((p) => p.status === "requested");
    const allHistory = payouts.filter((p) => p.status === "sent");
    const totalPending = allPending.reduce((s, p) => s + p.amount, 0);
    const totalSent    = allHistory.reduce((s, p) => s + p.amount, 0);

    // Unique methods available in history for the method filter dropdown
    const availableMethods = Array.from(new Set(allHistory.map((p) => p.method)));

    const handleMarkSent = async () => {
        if (!selected || !reference.trim()) return;
        setProcessing(true);
        try {
            await onMarkSent(selected.id, reference.trim());
            setSelected(null);
            setReference("");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="bg-fsc-cream-dark h-8 w-32 rounded mb-4" />
                <div className="grid gap-4 sm:grid-cols-3">
                    {[1, 2, 3].map((i) => <div key={i} className="bg-fsc-cream-dark h-28 rounded-2xl" />)}
                </div>
                <div className="bg-fsc-cream-dark h-72 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <div className="text-fsc-stone text-xs tracking-wider uppercase">Payout management</div>
                    <h1 className="font-display text-fsc-navy text-3xl">Payouts</h1>
                </div>
                <button
                    onClick={() => triggerRefresh("all")}
                    disabled={activeRefresh === "all"}
                    className="text-fsc-green flex items-center gap-1 text-xs transition-colors hover:underline disabled:opacity-60"
                >
                    <RefreshCw size={16} className={activeRefresh === "all" ? "animate-spin" : ""} /> Refresh
                </button>
            </div>

            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="border-fsc-cream-dark rounded-2xl border bg-white p-6">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9922A]/10">
                            <Clock size={20} className="text-[#C9922A]" />
                        </div>
                        <div>
                            <div className="font-display text-fsc-navy text-2xl">{allPending.length}</div>
                            <div className="text-fsc-stone text-xs">Pending Requests</div>
                        </div>
                    </div>
                    <div className="text-fsc-stone text-sm">Total: {formatCurrency(totalPending)}</div>
                </div>
                <div className="border-fsc-cream-dark rounded-2xl border bg-white p-6">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="bg-fsc-green/10 flex h-10 w-10 items-center justify-center rounded-full">
                            <CheckCircle size={20} className="text-fsc-green" />
                        </div>
                        <div>
                            <div className="font-display text-fsc-navy text-2xl">{allHistory.length}</div>
                            <div className="text-fsc-stone text-xs">Processed</div>
                        </div>
                    </div>
                    <div className="text-fsc-stone text-sm">Total sent: {formatCurrency(totalSent)}</div>
                </div>
                <div className="border-fsc-cream-dark rounded-2xl border bg-white p-6">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="bg-fsc-navy/10 flex h-10 w-10 items-center justify-center rounded-full">
                            <Wallet size={20} className="text-fsc-navy" />
                        </div>
                        <div>
                            <div className="font-display text-fsc-navy text-2xl">{formatCurrency(totalPending)}</div>
                            <div className="text-fsc-stone text-xs">Awaiting Transfer</div>
                        </div>
                    </div>
                    <div className="text-fsc-stone text-sm">Amount to send out</div>
                </div>
            </div>

            {/* Pending requests */}
            <div className="border-fsc-cream-dark overflow-hidden rounded-2xl border bg-white">
                <div className="border-fsc-cream-dark flex flex-wrap items-center justify-between gap-3 border-b p-4">
                    <div>
                        <h2 className="font-display text-fsc-navy text-lg">Pending Requests</h2>
                        <p className="text-fsc-stone text-xs">Members waiting to receive their payout</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Pending search */}
                        <div className="border-fsc-cream-dark focus-within:ring-fsc-green flex items-center gap-2 rounded-lg border px-3 py-2 text-sm focus-within:ring-2">
                            <Search size={14} className="text-fsc-stone shrink-0" />
                            <input
                                type="text"
                                value={pendingSearch}
                                onChange={(e) => setPendingSearch(e.target.value)}
                                placeholder="Search member or account…"
                                className="w-44 bg-transparent outline-none placeholder:text-fsc-stone/60"
                            />
                            {pendingSearch && (
                                <button onClick={() => setPendingSearch("")} className="text-fsc-stone hover:text-fsc-navy">
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                        <button className="text-fsc-stone hover:text-fsc-navy flex items-center gap-1 text-xs">
                            <Download size={12} /> Export
                        </button>
                        <button
                            onClick={() => triggerRefresh("pending")}
                            disabled={activeRefresh === "pending"}
                            className="border-fsc-cream-dark hover:bg-fsc-cream/60 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors disabled:opacity-60"
                        >
                            <RefreshCw size={14} className={activeRefresh === "pending" ? "animate-spin" : ""} />
                            Refresh
                        </button>
                    </div>
                </div>
                <div className={`overflow-x-auto transition-opacity ${activeRefresh === "pending" || activeRefresh === "all" ? "opacity-40" : ""}`}>
                    <table className="w-full text-sm">
                        <thead className="bg-fsc-cream/50 text-fsc-stone text-xs tracking-wider uppercase">
                            <tr>
                                <th className="p-4 text-left">Member</th>
                                <th className="p-4 text-left">Method & Account</th>
                                <th className="p-4 text-right">Amount</th>
                                <th className="p-4 text-left">Requested</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pending.map((p) => (
                                <tr key={p.id} className="border-fsc-cream-dark hover:bg-fsc-cream/40 border-t transition-colors">
                                    <td className="p-4">
                                        <div className="text-fsc-navy font-medium">{p.memberName}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-fsc-navy">{methodLabel(p.method)}</div>
                                        <div className="text-fsc-stone text-xs">{p.accountNumber}</div>
                                        <div className="text-fsc-stone text-xs">{p.accountName}</div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="text-fsc-navy font-medium">{formatCurrency(p.amount)}</div>
                                        <div className="text-fsc-stone text-xs">
                                            gross {formatCurrency(p.grossAmount ?? p.amount)} · −{formatCurrency(p.feeAmount ?? 0)} fee
                                        </div>
                                    </td>
                                    <td className="text-fsc-stone p-4 text-sm">{formatDate(p.dateRequested)}</td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleReject(p)}
                                                disabled={rejectingId === p.id}
                                                className="border-fsc-cream-dark text-fsc-stone hover:bg-fsc-cream/60 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                                            >
                                                {rejectingId === p.id ? "Rejecting…" : "Reject"}
                                            </button>
                                            <button
                                                onClick={() => setSelected(p)}
                                                className="bg-fsc-green hover:bg-fsc-green-light flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors"
                                            >
                                                <Send size={12} /> Mark as Sent
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {pending.length === 0 && (
                                <tr>
                                    <td colSpan={5}>
                                        <div className="px-6 py-14 text-center">
                                            {pendingSearch ? (
                                                <>
                                                    <div className="bg-fsc-cream mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                                                        <Search size={22} className="text-fsc-stone" />
                                                    </div>
                                                    <div className="font-display text-fsc-navy text-lg">No matches</div>
                                                    <div className="text-fsc-stone mt-1 text-sm">Try adjusting your search.</div>
                                                    <button
                                                        onClick={() => setPendingSearch("")}
                                                        className="text-fsc-green mt-4 text-sm hover:underline"
                                                    >
                                                        Clear search
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="bg-fsc-cream mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                                                        <CheckCircle size={22} className="text-fsc-stone" />
                                                    </div>
                                                    <div className="font-display text-fsc-navy text-lg">All clear</div>
                                                    <div className="text-fsc-stone mt-1 text-sm">No payout requests are waiting to be processed.</div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* History */}
            <div className="border-fsc-cream-dark overflow-hidden rounded-2xl border bg-white">
                <div className="border-fsc-cream-dark flex flex-wrap items-center justify-between gap-3 border-b p-4">
                    <div>
                        <h2 className="font-display text-fsc-navy text-lg">Payout History</h2>
                        <p className="text-fsc-stone text-xs">All processed payouts</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* History search */}
                        <div className="border-fsc-cream-dark focus-within:ring-fsc-green flex items-center gap-2 rounded-lg border px-3 py-2 text-sm focus-within:ring-2">
                            <Search size={14} className="text-fsc-stone shrink-0" />
                            <input
                                type="text"
                                value={historySearch}
                                onChange={(e) => setHistorySearch(e.target.value)}
                                placeholder="Search member or reference…"
                                className="w-44 bg-transparent outline-none placeholder:text-fsc-stone/60"
                            />
                            {historySearch && (
                                <button onClick={() => setHistorySearch("")} className="text-fsc-stone hover:text-fsc-navy">
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                        {/* Method filter */}
                        {availableMethods.length > 0 && (
                            <select
                                value={methodFilter}
                                onChange={(e) => setMethodFilter(e.target.value)}
                                className="border-fsc-cream-dark focus:ring-fsc-green rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                            >
                                <option value="all">All methods</option>
                                {availableMethods.map((m) => (
                                    <option key={m} value={m}>{methodLabel(m)}</option>
                                ))}
                            </select>
                        )}
                        <button
                            onClick={() => triggerRefresh("history")}
                            disabled={activeRefresh === "history"}
                            className="border-fsc-cream-dark hover:bg-fsc-cream/60 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors disabled:opacity-60"
                        >
                            <RefreshCw size={14} className={activeRefresh === "history" ? "animate-spin" : ""} />
                            Refresh
                        </button>
                    </div>
                </div>
                <div className={`overflow-x-auto transition-opacity ${activeRefresh === "history" || activeRefresh === "all" ? "opacity-40" : ""}`}>
                    <table className="w-full text-sm">
                        <thead className="bg-fsc-cream/50 text-fsc-stone text-xs tracking-wider uppercase">
                            <tr>
                                <th className="p-4 text-left">Member</th>
                                <th className="p-4 text-left">Method & Account</th>
                                <th className="p-4 text-right">Amount</th>
                                <th className="p-4 text-left">Reference</th>
                                <th className="p-4 text-left">Sent</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((p) => (
                                <tr key={p.id} className="border-fsc-cream-dark hover:bg-fsc-cream/40 border-t transition-colors">
                                    <td className="p-4">
                                        <div className="text-fsc-navy font-medium">{p.memberName}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-fsc-navy">{methodLabel(p.method)}</div>
                                        <div className="text-fsc-stone text-xs">{p.accountNumber}</div>
                                    </td>
                                    <td className="text-fsc-navy p-4 text-right font-medium">
                                        {formatCurrency(p.amount)}
                                    </td>
                                    <td className="text-fsc-stone p-4 font-mono text-xs">
                                        {p.reference ?? "—"}
                                    </td>
                                    <td className="text-fsc-stone p-4 text-sm">{formatDate(p.dateSent)}</td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan={5}>
                                        <div className="px-6 py-14 text-center">
                                            {historySearch || methodFilter !== "all" ? (
                                                <>
                                                    <div className="bg-fsc-cream mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                                                        <Search size={22} className="text-fsc-stone" />
                                                    </div>
                                                    <div className="font-display text-fsc-navy text-lg">No matches</div>
                                                    <div className="text-fsc-stone mt-1 text-sm">Try adjusting your search or method filter.</div>
                                                    <button
                                                        onClick={() => { setHistorySearch(""); setMethodFilter("all"); }}
                                                        className="text-fsc-green mt-4 text-sm hover:underline"
                                                    >
                                                        Clear filters
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="bg-fsc-cream mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                                                        <Wallet size={22} className="text-fsc-stone" />
                                                    </div>
                                                    <div className="font-display text-fsc-navy text-lg">No payout history</div>
                                                    <div className="text-fsc-stone mt-1 text-sm">Processed payouts will appear here.</div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mark as Sent modal */}
            {selected && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={() => { setSelected(null); setReference(""); }}
                >
                    <div
                        className="animate-fade-up mx-4 w-full max-w-md rounded-2xl bg-white p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="font-display text-fsc-navy mb-1 text-xl">Mark Payout as Sent</h2>
                        <p className="text-fsc-stone mb-4 text-xs">
                            Enter the GCash/bank reference number you received after sending the money.
                        </p>
                        <div className="space-y-4">
                            <div className="bg-fsc-cream rounded-xl p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-fsc-stone">Member:</span>
                                    <span className="text-fsc-navy font-medium">{selected.memberName}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-fsc-stone">Gross:</span>
                                    <span className="text-fsc-navy">{formatCurrency(selected.grossAmount ?? selected.amount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-fsc-stone">Fee (5%):</span>
                                    <span className="text-fsc-stone">− {formatCurrency(selected.feeAmount ?? 0)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-fsc-stone">Send this amount:</span>
                                    <span className="font-display text-fsc-navy text-lg">{formatCurrency(selected.amount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-fsc-stone">Send to:</span>
                                    <div className="text-right">
                                        <div className="text-fsc-navy font-medium">{methodLabel(selected.method)}</div>
                                        <div className="text-fsc-stone text-xs">{selected.accountNumber} · {selected.accountName}</div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-fsc-stone mb-1 block text-xs">
                                    Reference Number <span className="text-[#C41E1E]">*</span>
                                </label>
                                <input
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                    placeholder="e.g., 09123456789 · 1234567890"
                                    className="border-fsc-cream-dark focus:ring-fsc-green w-full rounded-xl border px-4 py-2 focus:ring-2 focus:outline-none"
                                    autoFocus
                                />
                                <p className="text-fsc-stone mt-1 text-xs">
                                    Copy this from your GCash / banking app after the transfer.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => { setSelected(null); setReference(""); }}
                                className="border-fsc-cream-dark text-fsc-stone hover:bg-fsc-cream/60 flex-1 rounded-lg border px-4 py-2 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleMarkSent}
                                disabled={!reference.trim() || processing}
                                className="bg-fsc-green hover:bg-fsc-green-light flex-1 rounded-lg px-4 py-2 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing ? "Saving…" : "Confirm Sent"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};