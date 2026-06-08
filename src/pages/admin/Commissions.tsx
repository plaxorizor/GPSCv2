// admin/Commissions.tsx
import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, Download, Search, X, RefreshCw } from "lucide-react";
import type { PendingCommission, CommissionRecord } from "../../utils/types";
import { formatCurrency, formatDate } from "./utils";

interface Props {
    pendingCommissions: PendingCommission[];
    commissionHistory: CommissionRecord[];
    loading: boolean;
    onRefresh: () => void;
    refreshing?: boolean;
}

export const Commissions: React.FC<Props> = ({ pendingCommissions, commissionHistory, loading, onRefresh, refreshing }) => {
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

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="bg-fsc-cream-dark mb-4 h-8 w-32 rounded"></div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="bg-fsc-cream-dark h-32 rounded-2xl"></div>
                        <div className="bg-fsc-cream-dark h-32 rounded-2xl"></div>
                    </div>
                    <div className="bg-fsc-cream-dark mt-6 h-96 rounded-2xl"></div>
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
                    <div className="text-fsc-stone text-xs tracking-wider uppercase">Commission management</div>
                    <h1 className="font-display text-fsc-navy text-3xl">Commissions</h1>
                </div>
                <button
                    onClick={() => triggerRefresh("all")}
                    disabled={activeRefresh === "all"}
                    className="text-fsc-green flex items-center gap-1 text-xs transition-colors hover:underline disabled:opacity-60"
                >
                    <RefreshCw size={16} className={activeRefresh === "all" ? "animate-spin" : ""} /> Refresh
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="border-fsc-cream-dark rounded-2xl border bg-white p-6 transition-all hover:shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9922A]/10">
                            <Clock size={20} className="text-[#C9922A]" />
                        </div>
                        <div>
                            <div className="font-display text-fsc-navy text-2xl">{pendingCommissions.length}</div>
                            <div className="text-fsc-stone text-xs">Unclaimed / pending</div>
                        </div>
                    </div>
                    <div className="text-fsc-stone text-sm">Total: {formatCurrency(totalPending)}</div>
                </div>
                <div className="border-fsc-cream-dark rounded-2xl border bg-white p-6 transition-all hover:shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="bg-fsc-green/20 flex h-10 w-10 items-center justify-center rounded-full">
                            <CheckCircle size={20} className="text-fsc-green" />
                        </div>
                        <div>
                            <div className="font-display text-fsc-navy text-2xl">{commissionHistory.length}</div>
                            <div className="text-fsc-stone text-xs">Paid out</div>
                        </div>
                    </div>
                    <div className="text-fsc-stone text-sm">Total: {formatCurrency(totalHistory)}</div>
                </div>
            </div>

            {/* Pending Commissions */}
            <div className="border-fsc-cream-dark overflow-hidden rounded-2xl border bg-white">
                <div className="border-fsc-cream-dark flex flex-wrap items-center justify-between gap-3 border-b p-4">
                    <div>
                        <h2 className="font-display text-fsc-navy text-lg">Pending Commissions</h2>
                        <p className="text-fsc-stone text-xs">Commissions awaiting release to consultants</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Pending search */}
                        <div className="border-fsc-cream-dark focus-within:ring-fsc-green flex items-center gap-2 rounded-lg border px-3 py-2 text-sm focus-within:ring-2">
                            <Search size={14} className="text-fsc-stone shrink-0" />
                            <input
                                type="text"
                                value={pendingSearch}
                                onChange={(e) => setPendingSearch(e.target.value)}
                                placeholder="Search by name…"
                                className="placeholder:text-fsc-stone/60 w-40 bg-transparent outline-none"
                            />
                            {pendingSearch && (
                                <button onClick={() => setPendingSearch("")} className="text-fsc-stone hover:text-fsc-navy">
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                        {/* Level filter */}
                        {pendingLevels.length > 1 && (
                            <select
                                value={pendingLevelFilter}
                                onChange={(e) => setPendingLevelFilter(e.target.value)}
                                className="border-fsc-cream-dark focus:ring-fsc-green rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                            >
                                <option value="all">All levels</option>
                                {pendingLevels.map((l) => (
                                    <option key={l} value={String(l)}>
                                        Level {l}
                                    </option>
                                ))}
                            </select>
                        )}
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
                                <tr key={comm.id} className="border-fsc-cream-dark hover:bg-fsc-cream/40 border-t transition-colors">
                                    <td className="p-4">
                                        <div className="text-fsc-navy font-medium">{comm.recipientName}</div>
                                        {comm.recipientReferralCode && (
                                            <div className="text-fsc-stone font-mono text-xs">{comm.recipientReferralCode}</div>
                                        )}
                                    </td>
                                    <td className="text-fsc-stone p-4">
                                        <div className="flex items-center gap-2">
                                            <span>{comm.fromMemberName}</span>
                                            {comm.reason === "upgrade" && (
                                                <span className="bg-fsc-navy/10 text-fsc-navy inline-block rounded-full px-2 py-0.5 text-[10px] font-medium">
                                                    Upgrade
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="text-fsc-stone p-4">Level {comm.level}</td>
                                    <td className="text-fsc-navy p-4 text-right font-medium">{formatCurrency(comm.amount)}</td>
                                    <td className="text-fsc-stone p-4">{formatDate(comm.date)}</td>
                                    <td className="p-4 text-right">
                                        <span className="text-fsc-stone text-xs italic">Awaiting member claim</span>
                                    </td>
                                </tr>
                            ))}
                            {filteredPending.length === 0 && (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="px-6 py-14 text-center">
                                            {pendingSearch || pendingLevelFilter !== "all" ? (
                                                <>
                                                    <div className="bg-fsc-cream mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                                                        <Search size={22} className="text-fsc-stone" />
                                                    </div>
                                                    <div className="font-display text-fsc-navy text-lg">No matches</div>
                                                    <div className="text-fsc-stone mt-1 text-sm">Try adjusting your search or level filter.</div>
                                                    <button
                                                        onClick={() => { setPendingSearch(""); setPendingLevelFilter("all"); }}
                                                        className="text-fsc-green mt-4 text-sm hover:underline"
                                                    >
                                                        Clear filters
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="bg-fsc-cream mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                                                        <CheckCircle size={22} className="text-fsc-stone" />
                                                    </div>
                                                    <div className="font-display text-fsc-navy text-lg">All caught up</div>
                                                    <div className="text-fsc-stone mt-1 text-sm">No commissions are waiting to be released.</div>
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

            {/* Commission History */}
            <div className="border-fsc-cream-dark overflow-hidden rounded-2xl border bg-white">
                <div className="border-fsc-cream-dark flex flex-wrap items-center justify-between gap-3 border-b p-4">
                    <div>
                        <h2 className="font-display text-fsc-navy text-lg">Paid Commissions</h2>
                        <p className="text-fsc-stone text-xs">Recently released commissions</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* History search */}
                        <div className="border-fsc-cream-dark focus-within:ring-fsc-green flex items-center gap-2 rounded-lg border px-3 py-2 text-sm focus-within:ring-2">
                            <Search size={14} className="text-fsc-stone shrink-0" />
                            <input
                                type="text"
                                value={historySearch}
                                onChange={(e) => setHistorySearch(e.target.value)}
                                placeholder="Search by name…"
                                className="placeholder:text-fsc-stone/60 w-40 bg-transparent outline-none"
                            />
                            {historySearch && (
                                <button onClick={() => setHistorySearch("")} className="text-fsc-stone hover:text-fsc-navy">
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                        {/* Level filter */}
                        {historyLevels.length > 1 && (
                            <select
                                value={historyLevelFilter}
                                onChange={(e) => setHistoryLevelFilter(e.target.value)}
                                className="border-fsc-cream-dark focus:ring-fsc-green rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
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
                                <tr key={comm.id} className="border-fsc-cream-dark hover:bg-fsc-cream/40 border-t transition-colors">
                                    <td className="p-4">
                                        <div className="text-fsc-navy">{comm.recipientName || comm.recipientReferralCode || "—"}</div>
                                        {comm.recipientReferralCode && (
                                            <div className="text-fsc-stone font-mono text-xs">{comm.recipientReferralCode}</div>
                                        )}
                                    </td>
                                    <td className="text-fsc-stone p-4">
                                        <div className="flex items-center gap-2">
                                            <span>{comm.fromMemberName}</span>
                                            {comm.reason === "upgrade" && (
                                                <span className="bg-fsc-navy/10 text-fsc-navy inline-block rounded-full px-2 py-0.5 text-[10px] font-medium">
                                                    Upgrade
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="text-fsc-stone p-4">Level {comm.level}</td>
                                    <td className="text-fsc-navy p-4 text-right font-medium">{formatCurrency(comm.amount)}</td>
                                    <td className="text-fsc-stone p-4">{formatDate(comm.date)}</td>
                                    <td className="text-fsc-stone p-4 font-mono text-xs">{comm.reference || "—"}</td>
                                </tr>
                            ))}
                            {filteredHistory.length === 0 && (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="px-6 py-14 text-center">
                                            {historySearch || historyLevelFilter !== "all" ? (
                                                <>
                                                    <div className="bg-fsc-cream mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                                                        <Search size={22} className="text-fsc-stone" />
                                                    </div>
                                                    <div className="font-display text-fsc-navy text-lg">No matches</div>
                                                    <div className="text-fsc-stone mt-1 text-sm">Try adjusting your search or level filter.</div>
                                                    <button
                                                        onClick={() => { setHistorySearch(""); setHistoryLevelFilter("all"); }}
                                                        className="text-fsc-green mt-4 text-sm hover:underline"
                                                    >
                                                        Clear filters
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="bg-fsc-cream mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                                                        <Clock size={22} className="text-fsc-stone" />
                                                    </div>
                                                    <div className="font-display text-fsc-navy text-lg">No release history yet</div>
                                                    <div className="text-fsc-stone mt-1 text-sm">Released commissions will appear here.</div>
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

        </div>
    );
};
