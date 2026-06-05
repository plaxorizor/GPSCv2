// admin/Commissions.tsx
import React, { useState, useEffect } from "react";
import { Send, Clock, CheckCircle, Download, Search, X, RefreshCw } from "lucide-react";
import type { PendingCommission, CommissionRecord } from "../../utils/types";
import { formatCurrency, formatDate } from "./utils";

interface Props {
    pendingCommissions: PendingCommission[];
    commissionHistory: CommissionRecord[];
    loading: boolean;
    onRelease: (commissionId: string, earnedBy: string, amount: number, reference: string) => Promise<void>;
    onRefresh: () => void;
    refreshing?: boolean;
}

export const Commissions: React.FC<Props> = ({ pendingCommissions, commissionHistory, loading, onRelease, onRefresh, refreshing }) => {
    const [selectedCommission, setSelectedCommission] = useState<PendingCommission | null>(null);
    const [reference, setReference] = useState("");

    // Track WHICH refresh button was clicked so only that one spins.
    const [activeRefresh, setActiveRefresh] = useState<null | "all" | "pending" | "history">(null);
    const triggerRefresh = (key: "all" | "pending" | "history") => {
        setActiveRefresh(key);
        onRefresh();
    };
    // Keep the spinner visible until the fetch is done AND a short minimum has
    // elapsed, so a fast refetch still registers visually.
    useEffect(() => {
        if (refreshing || activeRefresh === null) return;
        const t = setTimeout(() => setActiveRefresh(null), 500);
        return () => clearTimeout(t);
    }, [refreshing, activeRefresh]);

    // Pending filters
    const [pendingSearch, setPendingSearch] = useState("");
    const [pendingLevelFilter, setPendingLevelFilter] = useState("all");

    // History filters
    const [historySearch, setHistorySearch] = useState("");
    const [historyLevelFilter, setHistoryLevelFilter] = useState("all");

    const handleRelease = async () => {
        if (!selectedCommission) return;
        await onRelease(selectedCommission.id, selectedCommission.recipientName, selectedCommission.amount, reference || "");
        setSelectedCommission(null);
        setReference("");
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="bg-gpsc-cream-dark mb-4 h-8 w-32 rounded"></div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="bg-gpsc-cream-dark h-32 rounded-2xl"></div>
                        <div className="bg-gpsc-cream-dark h-32 rounded-2xl"></div>
                    </div>
                    <div className="bg-gpsc-cream-dark mt-6 h-96 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    const totalPending = pendingCommissions.reduce((sum, c) => sum + c.amount, 0);
    const totalHistory = commissionHistory.reduce((sum, c) => sum + c.amount, 0);

    // Unique levels for filter dropdowns
    const pendingLevels = Array.from(new Set(pendingCommissions.map((c) => c.level))).sort();
    const historyLevels = Array.from(new Set(commissionHistory.map((c) => c.level))).sort();

    const filteredPending = pendingCommissions.filter((c) => {
        const matchesLevel = pendingLevelFilter === "all" || String(c.level) === pendingLevelFilter;
        const q = pendingSearch.trim().toLowerCase();
        const matchesSearch =
            !q || c.recipientName.toLowerCase().includes(q) || c.recipientId.toLowerCase().includes(q) || c.fromMemberName.toLowerCase().includes(q);
        return matchesLevel && matchesSearch;
    });

    const filteredHistory = commissionHistory.slice(0, 20).filter((c) => {
        const matchesLevel = historyLevelFilter === "all" || String(c.level) === historyLevelFilter;
        const q = historySearch.trim().toLowerCase();
        const matchesSearch =
            !q ||
            (c.recipientName ?? "").toLowerCase().includes(q) ||
            c.recipientId.toLowerCase().includes(q) ||
            c.fromMemberName.toLowerCase().includes(q);
        return matchesLevel && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between">
                <div>
                    <div className="text-gpsc-stone text-xs tracking-wider uppercase">Commission management</div>
                    <h1 className="font-display text-gpsc-navy text-3xl">Commissions</h1>
                </div>
                <button
                    onClick={() => triggerRefresh("all")}
                    disabled={activeRefresh === "all"}
                    className="text-gpsc-green flex items-center gap-1 text-xs transition-colors hover:underline disabled:opacity-60"
                >
                    <RefreshCw size={16} className={activeRefresh === "all" ? "animate-spin" : ""} /> Refresh
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="border-gpsc-cream-dark rounded-2xl border bg-white p-6 transition-all hover:shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                            <Clock size={20} className="text-amber-600" />
                        </div>
                        <div>
                            <div className="font-display text-gpsc-navy text-2xl">{pendingCommissions.length}</div>
                            <div className="text-gpsc-stone text-xs">Pending Release</div>
                        </div>
                    </div>
                    <div className="text-gpsc-stone text-sm">Total: {formatCurrency(totalPending)}</div>
                </div>
                <div className="border-gpsc-cream-dark rounded-2xl border bg-white p-6 transition-all hover:shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="bg-gpsc-green/20 flex h-10 w-10 items-center justify-center rounded-full">
                            <CheckCircle size={20} className="text-gpsc-green" />
                        </div>
                        <div>
                            <div className="font-display text-gpsc-navy text-2xl">{commissionHistory.length}</div>
                            <div className="text-gpsc-stone text-xs">Released This Month</div>
                        </div>
                    </div>
                    <div className="text-gpsc-stone text-sm">Total: {formatCurrency(totalHistory)}</div>
                </div>
            </div>

            {/* Pending Commissions */}
            <div className="border-gpsc-cream-dark overflow-hidden rounded-2xl border bg-white">
                <div className="border-gpsc-cream-dark flex flex-wrap items-center justify-between gap-3 border-b p-4">
                    <div>
                        <h2 className="font-display text-gpsc-navy text-lg">Pending Commissions</h2>
                        <p className="text-gpsc-stone text-xs">Commissions awaiting release to consultants</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Pending search */}
                        <div className="border-gpsc-cream-dark focus-within:ring-gpsc-green flex items-center gap-2 rounded-lg border px-3 py-2 text-sm focus-within:ring-2">
                            <Search size={14} className="text-gpsc-stone shrink-0" />
                            <input
                                type="text"
                                value={pendingSearch}
                                onChange={(e) => setPendingSearch(e.target.value)}
                                placeholder="Search by name…"
                                className="placeholder:text-gpsc-stone/60 w-40 bg-transparent outline-none"
                            />
                            {pendingSearch && (
                                <button onClick={() => setPendingSearch("")} className="text-gpsc-stone hover:text-gpsc-navy">
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                        {/* Level filter */}
                        {pendingLevels.length > 1 && (
                            <select
                                value={pendingLevelFilter}
                                onChange={(e) => setPendingLevelFilter(e.target.value)}
                                className="border-gpsc-cream-dark focus:ring-gpsc-green rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                            >
                                <option value="all">All levels</option>
                                {pendingLevels.map((l) => (
                                    <option key={l} value={String(l)}>
                                        Level {l}
                                    </option>
                                ))}
                            </select>
                        )}
                        <button className="text-gpsc-stone hover:text-gpsc-navy flex items-center gap-1 text-xs">
                            <Download size={12} /> Export
                        </button>
                        <button
                            onClick={() => triggerRefresh("pending")}
                            disabled={activeRefresh === "pending"}
                            className="border-gpsc-cream-dark hover:bg-gpsc-cream/60 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors disabled:opacity-60"
                        >
                            <RefreshCw size={14} className={activeRefresh === "pending" ? "animate-spin" : ""} />
                            Refresh
                        </button>
                    </div>
                </div>
                <div className={`overflow-x-auto transition-opacity ${activeRefresh === "pending" || activeRefresh === "all" ? "opacity-40" : ""}`}>
                    <table className="w-full text-sm">
                        <thead className="bg-gpsc-cream/50 text-gpsc-stone text-xs tracking-wider uppercase">
                            <tr>
                                <th className="p-4 text-left">Earned By</th>
                                <th className="p-4 text-left">From Member</th>
                                <th className="p-4 text-left">Level</th>
                                <th className="p-4 text-right">Amount</th>
                                <th className="p-4 text-left">Date</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPending.map((comm) => (
                                <tr key={comm.id} className="border-gpsc-cream-dark hover:bg-gpsc-cream/40 border-t transition-colors">
                                    <td className="p-4">
                                        <div className="text-gpsc-navy font-medium">{comm.recipientName}</div>
                                        {comm.recipientReferralCode && (
                                            <div className="text-gpsc-stone font-mono text-xs">{comm.recipientReferralCode}</div>
                                        )}
                                    </td>
                                    <td className="text-gpsc-stone p-4">{comm.fromMemberName}</td>
                                    <td className="text-gpsc-stone p-4">Level {comm.level}</td>
                                    <td className="text-gpsc-navy p-4 text-right font-medium">{formatCurrency(comm.amount)}</td>
                                    <td className="text-gpsc-stone p-4">{formatDate(comm.date)}</td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => setSelectedCommission(comm)}
                                            className="bg-gpsc-green hover:bg-gpsc-green-light ml-auto flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors"
                                        >
                                            <Send size={12} /> Release
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredPending.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-gpsc-stone p-8 text-center">
                                        {pendingSearch || pendingLevelFilter !== "all"
                                            ? "No commissions match your filters"
                                            : "No pending commissions"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Commission History */}
            <div className="border-gpsc-cream-dark overflow-hidden rounded-2xl border bg-white">
                <div className="border-gpsc-cream-dark flex flex-wrap items-center justify-between gap-3 border-b p-4">
                    <div>
                        <h2 className="font-display text-gpsc-navy text-lg">Release History</h2>
                        <p className="text-gpsc-stone text-xs">Recently released commissions</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* History search */}
                        <div className="border-gpsc-cream-dark focus-within:ring-gpsc-green flex items-center gap-2 rounded-lg border px-3 py-2 text-sm focus-within:ring-2">
                            <Search size={14} className="text-gpsc-stone shrink-0" />
                            <input
                                type="text"
                                value={historySearch}
                                onChange={(e) => setHistorySearch(e.target.value)}
                                placeholder="Search by name…"
                                className="placeholder:text-gpsc-stone/60 w-40 bg-transparent outline-none"
                            />
                            {historySearch && (
                                <button onClick={() => setHistorySearch("")} className="text-gpsc-stone hover:text-gpsc-navy">
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                        {/* Level filter */}
                        {historyLevels.length > 1 && (
                            <select
                                value={historyLevelFilter}
                                onChange={(e) => setHistoryLevelFilter(e.target.value)}
                                className="border-gpsc-cream-dark focus:ring-gpsc-green rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                            >
                                <option value="all">All levels</option>
                                {historyLevels.map((l) => (
                                    <option key={l} value={String(l)}>
                                        Level {l}
                                    </option>
                                ))}
                            </select>
                        )}
                        <button
                            onClick={() => triggerRefresh("history")}
                            disabled={activeRefresh === "history"}
                            className="border-gpsc-cream-dark hover:bg-gpsc-cream/60 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors disabled:opacity-60"
                        >
                            <RefreshCw size={14} className={activeRefresh === "history" ? "animate-spin" : ""} />
                            Refresh
                        </button>
                    </div>
                </div>
                <div className={`overflow-x-auto transition-opacity ${activeRefresh === "history" || activeRefresh === "all" ? "opacity-40" : ""}`}>
                    <table className="w-full text-sm">
                        <thead className="bg-gpsc-cream/50 text-gpsc-stone text-xs tracking-wider uppercase">
                            <tr>
                                <th className="p-4 text-left">Recipient</th>
                                <th className="p-4 text-left">From</th>
                                <th className="p-4 text-left">Level</th>
                                <th className="p-4 text-right">Amount</th>
                                <th className="p-4 text-left">Date</th>
                                <th className="p-4 text-left">Reference</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.map((comm) => (
                                <tr key={comm.id} className="border-gpsc-cream-dark hover:bg-gpsc-cream/40 border-t transition-colors">
                                    <td className="p-4">
                                        <div className="text-gpsc-navy">{comm.recipientName || comm.recipientReferralCode || "—"}</div>
                                        {comm.recipientReferralCode && (
                                            <div className="text-gpsc-stone font-mono text-xs">{comm.recipientReferralCode}</div>
                                        )}
                                    </td>
                                    <td className="text-gpsc-stone p-4">{comm.fromMemberName}</td>
                                    <td className="text-gpsc-stone p-4">Level {comm.level}</td>
                                    <td className="text-gpsc-navy p-4 text-right font-medium">{formatCurrency(comm.amount)}</td>
                                    <td className="text-gpsc-stone p-4">{formatDate(comm.date)}</td>
                                    <td className="text-gpsc-stone p-4 font-mono text-xs">{comm.reference || "—"}</td>
                                </tr>
                            ))}
                            {filteredHistory.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-gpsc-stone p-8 text-center">
                                        {historySearch || historyLevelFilter !== "all" ? "No history matches your filters" : "No release history"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Release Modal */}
            {selectedCommission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedCommission(null)}>
                    <div className="animate-fade-up mx-4 w-full max-w-md rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
                        <h2 className="font-display text-gpsc-navy mb-1 text-xl">Release Commission</h2>
                        <p className="text-gpsc-stone mb-4 text-xs">
                            This marks the commission as available for the member to withdraw. <br />{" "}
                            <span className="text-red-700">No money is sent yet.</span> The member will submit a payout request and you'll process it
                            separately.
                        </p>
                        <div className="space-y-4">
                            <div className="bg-gpsc-cream rounded-xl p-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gpsc-stone">Recipient:</span>
                                    <span className="text-gpsc-navy font-medium">{selectedCommission.recipientName}</span>
                                </div>
                                <div className="mt-2 flex justify-between text-sm">
                                    <span className="text-gpsc-stone">Amount:</span>
                                    <span className="text-gpsc-navy font-display text-lg">{formatCurrency(selectedCommission.amount)}</span>
                                </div>
                                <div className="mt-2 flex justify-between text-sm">
                                    <span className="text-gpsc-stone">From member:</span>
                                    <span className="text-gpsc-navy font-medium">{selectedCommission.fromMemberName}</span>
                                </div>
                                <div className="mt-2 flex justify-between text-sm">
                                    <span className="text-gpsc-stone">Level:</span>
                                    <span className="text-gpsc-navy font-medium">Level {selectedCommission.level}</span>
                                </div>
                            </div>
                            <div>
                                <input
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                    placeholder="Notes (optional)"
                                    className="border-gpsc-cream-dark focus:ring-gpsc-green w-full rounded-xl border px-4 py-2 focus:ring-2 focus:outline-none"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setSelectedCommission(null)}
                                className="border-gpsc-cream-dark text-gpsc-stone hover:bg-gpsc-cream/60 flex-1 rounded-lg border px-4 py-2 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRelease}
                                className="bg-gpsc-green hover:bg-gpsc-green-light flex-1 rounded-lg px-4 py-2 font-medium text-white transition-colors"
                            >
                                Confirm Release
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
