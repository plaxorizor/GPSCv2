// admin/Claims.tsx
import React, { useState, useEffect } from "react";
import { Download, Eye, CheckCircle, XCircle, Clock, FileText, Search, X, RefreshCw } from "lucide-react";
import type { Claim } from "../../utils/types";
import { formatCurrency, formatDate } from "./utils";

interface Props {
    claims: Claim[];
    loading: boolean;
    onUpdateStatus: (claimId: string, status: "Approved" | "Rejected" | "Released") => Promise<void>;
    onReviewClaim?: (claimId: string) => Promise<void>;
    onRefresh: () => void;
    refreshing?: boolean;
    onExport: () => void;
}

const statusColors: Record<string, string> = {
    submitted: "bg-fsc-navy/10 text-fsc-navy",
    under_review: "bg-[#C9922A]/10 text-[#A87820]",
    approved: "bg-fsc-green/10 text-fsc-green",
    rejected: "bg-[#C41E1E]/10 text-[#C41E1E]",
    released: "bg-fsc-green/20 text-fsc-green",
};

const statusLabels: Record<string, string> = {
    submitted: "Submitted",
    under_review: "Under Review",
    approved: "Approved",
    rejected: "Rejected",
    released: "Released",
};

export const Claims: React.FC<Props> = ({ claims, loading, onUpdateStatus, onReviewClaim, onRefresh, refreshing, onExport }) => {
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

    const [spinning, setSpinning] = useState(false);
    const handleRefresh = () => {
        setSpinning(true);
        onRefresh();
    };
    // Keep the spinner visible until the fetch finishes AND a short minimum has
    // elapsed, so a fast refetch still registers visually.
    useEffect(() => {
        if (refreshing || !spinning) return;
        const t = setTimeout(() => setSpinning(false), 500);
        return () => clearTimeout(t);
    }, [refreshing, spinning]);

    const filtered = claims.filter((c) => {
        const matchesStatus = statusFilter === "all" || c.status === statusFilter;
        const q = search.trim().toLowerCase();
        const matchesSearch =
            !q ||
            c.memberName.toLowerCase().includes(q) ||
            c.memberId.toLowerCase().includes(q) ||
            c.id.toLowerCase().includes(q) ||
            c.benefit.toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
    });

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="bg-fsc-cream-dark mb-4 h-8 w-32 rounded"></div>
                    <div className="bg-fsc-cream-dark h-96 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    const handleStartReview = (claimId: string) => {
        if (onReviewClaim) {
            onReviewClaim(claimId);
        } else {
            handleRefresh();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="font-display text-fsc-navy text-3xl">Claims Operations</h1>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onExport}
                        className="border-fsc-navy text-fsc-navy hover:bg-fsc-navy flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors hover:text-white"
                    >
                        <Download size={14} /> Export
                    </button>
                </div>
            </div>

            <div className="border-fsc-cream-dark overflow-hidden rounded-2xl border bg-white">
                <div className="border-fsc-cream-dark flex flex-wrap items-center justify-between gap-3 border-b p-4">
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Search bar */}
                        <div className="border-fsc-cream-dark focus-within:ring-fsc-green flex items-center gap-2 rounded-lg border px-3 py-2 text-sm focus-within:ring-2">
                            <Search size={14} className="text-fsc-stone shrink-0" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by ID or benefit…"
                                className="w-44 bg-transparent outline-none placeholder:text-fsc-stone/60"
                            />
                            {search && (
                                <button onClick={() => setSearch("")} className="text-fsc-stone hover:text-fsc-navy">
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                        {/* Status filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border-fsc-cream-dark focus:ring-fsc-green rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                        >
                            <option value="all">All statuses</option>
                            <option value="submitted">Submitted</option>
                            <option value="under_review">Under Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="released">Released</option>
                        </select>
                        <button
                            onClick={handleRefresh}
                            disabled={spinning}
                            className="border-fsc-cream-dark hover:bg-fsc-cream/60 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors disabled:opacity-60"
                        >
                            <RefreshCw size={14} className={spinning ? "animate-spin" : ""} />
                            Refresh
                        </button>
                    </div>
                    <div className="text-fsc-stone bg-fsc-cream rounded-full px-3 py-1 text-xs">
                        {claims.filter((c) => c.status === "submitted" || c.status === "under_review").length} pending
                    </div>
                </div>

                <div className={`overflow-x-auto transition-opacity ${spinning ? "opacity-40" : ""}`}>
                    <table className="w-full text-sm">
                        <thead className="bg-fsc-cream/50 text-fsc-stone text-xs tracking-wider uppercase">
                            <tr>
                                <th className="p-4 text-left">Claimant</th>
                                <th className="p-4 text-left">Benefit</th>
                                <th className="p-4 text-left">Submitted</th>
                                <th className="p-4 text-right">Amount</th>
                                <th className="p-4 text-left">Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((claim) => (
                                <tr key={claim.id} className="border-fsc-cream-dark hover:bg-fsc-cream/40 border-t transition-colors">
                                    <td className="p-4">
                                        <div className="text-fsc-navy">{claim.memberName || "Unknown"}</div>
                                        <div className="text-fsc-stone font-mono text-xs">Claim #{claim.id.slice(0, 8)}</div>
                                    </td>
                                    <td className="text-fsc-stone p-4">{claim.benefit}</td>
                                    <td className="text-fsc-stone p-4">{formatDate(claim.submitted)}</td>
                                    <td className="text-fsc-navy p-4 text-right font-medium">{formatCurrency(claim.amount)}</td>
                                    <td className="p-4">
                                        <span className={`rounded-full px-2 py-1 text-xs ${statusColors[claim.status] || "bg-fsc-stone/10"}`}>
                                            {statusLabels[claim.status] || claim.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedClaim(claim)}
                                                className="text-fsc-stone hover:bg-fsc-cream rounded p-1 transition-colors"
                                                title="View details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {claim.status === "submitted" && (
                                                <button
                                                    onClick={() => handleStartReview(claim.id)}
                                                    className="rounded p-1 text-[#A87820] transition-colors hover:bg-[#C9922A]/10"
                                                    title="Start review"
                                                >
                                                    <Clock size={16} />
                                                </button>
                                            )}
                                            {claim.status === "under_review" && (
                                                <>
                                                    <button
                                                        onClick={() => onUpdateStatus(claim.id, "Rejected")}
                                                        className="rounded p-1 text-[#C41E1E] transition-colors hover:bg-[#C41E1E]/10"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => onUpdateStatus(claim.id, "Approved")}
                                                        className="rounded p-1 text-fsc-green transition-colors hover:bg-fsc-green/10"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                </>
                                            )}
                                            {claim.status === "approved" && (
                                                <button
                                                    onClick={() => onUpdateStatus(claim.id, "Released")}
                                                    className="bg-fsc-green hover:bg-fsc-green-light rounded px-2 py-1 text-xs text-white transition-colors"
                                                >
                                                    Release
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="px-6 py-14 text-center">
                                            {search || statusFilter !== "all" ? (
                                                <>
                                                    <div className="bg-fsc-cream mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                                                        <Search size={22} className="text-fsc-stone" />
                                                    </div>
                                                    <div className="font-display text-fsc-navy text-lg">No claims match</div>
                                                    <div className="text-fsc-stone mt-1 text-sm">Try adjusting your search or status filter.</div>
                                                    <button
                                                        onClick={() => { setSearch(""); setStatusFilter("all"); }}
                                                        className="text-fsc-green mt-4 text-sm hover:underline"
                                                    >
                                                        Clear filters
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="bg-fsc-cream mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                                                        <FileText size={22} className="text-fsc-stone" />
                                                    </div>
                                                    <div className="font-display text-fsc-navy text-lg">No claims yet</div>
                                                    <div className="text-fsc-stone mt-1 text-sm">Claims submitted by members will appear here.</div>
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

            {/* Claim Detail Modal */}
            {selectedClaim && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedClaim(null)}>
                    <div className="animate-fade-up mx-4 w-full max-w-lg rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-display text-fsc-navy text-xl">Claim Details</h2>
                            <button onClick={() => setSelectedClaim(null)} className="text-fsc-stone hover:text-fsc-navy transition-colors">
                                ✕
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="bg-fsc-cream rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-fsc-stone text-xs">Amount</span>
                                    <span className="font-display text-fsc-navy text-2xl">{formatCurrency(selectedClaim.amount)}</span>
                                </div>
                                <div className="mt-2">
                                    <span className={`rounded-full px-2 py-1 text-xs ${statusColors[selectedClaim.status]}`}>
                                        {statusLabels[selectedClaim.status]}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <div className="text-fsc-stone text-xs">Claimant</div>
                                <div className="text-fsc-navy">{selectedClaim.memberName || "Unknown"}</div>
                                <div className="text-fsc-stone font-mono text-xs">{selectedClaim.memberId}</div>
                            </div>
                            <div>
                                <div className="text-fsc-stone text-xs">Claim ID</div>
                                <div className="text-fsc-navy font-mono text-sm">{selectedClaim.id}</div>
                            </div>
                            <div>
                                <div className="text-fsc-stone text-xs">Benefit</div>
                                <div className="text-fsc-navy">{selectedClaim.benefit}</div>
                            </div>
                            {selectedClaim.description && (
                                <div>
                                    <div className="text-fsc-stone text-xs">Reason</div>
                                    <div className="text-fsc-navy text-sm">{selectedClaim.description}</div>
                                </div>
                            )}
                            <div>
                                <div className="text-fsc-stone text-xs">Submitted</div>
                                <div className="text-fsc-navy">{formatDate(selectedClaim.submitted)}</div>
                            </div>
                            {selectedClaim.decided && (
                                <div>
                                    <div className="text-fsc-stone text-xs">Decided</div>
                                    <div className="text-fsc-navy">{formatDate(selectedClaim.decided)}</div>
                                </div>
                            )}
                            <div>
                                <div className="text-fsc-stone mb-2 text-xs">Documents</div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedClaim.documents.map((d, i) => (
                                        <span
                                            key={i}
                                            className="bg-fsc-cream text-fsc-stone flex items-center gap-1 rounded-full px-3 py-1.5 text-xs"
                                        >
                                            <FileText size={10} /> {d}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setSelectedClaim(null)}
                                className="border-fsc-cream-dark text-fsc-stone hover:bg-fsc-cream/60 flex-1 rounded-lg border px-4 py-2 transition-colors"
                            >
                                Close
                            </button>
                            {selectedClaim.status === "submitted" && (
                                <button
                                    onClick={() => {
                                        handleStartReview(selectedClaim.id);
                                        setSelectedClaim(null);
                                    }}
                                    className="bg-[#C9922A] hover:bg-[#A87820] flex-1 rounded-lg px-4 py-2 font-medium text-white transition-colors"
                                >
                                    Start Review
                                </button>
                            )}
                            {selectedClaim.status === "under_review" && (
                                <div className="flex flex-1 gap-2">
                                    <button
                                        onClick={() => {
                                            onUpdateStatus(selectedClaim.id, "Rejected");
                                            setSelectedClaim(null);
                                        }}
                                        className="flex-1 rounded-lg border border-[#C41E1E] px-4 py-2 font-medium text-[#C41E1E] transition-colors hover:bg-[#C41E1E]/10"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => {
                                            onUpdateStatus(selectedClaim.id, "Approved");
                                            setSelectedClaim(null);
                                        }}
                                        className="bg-fsc-green hover:bg-fsc-green-light flex-1 rounded-lg px-4 py-2 font-medium text-white transition-colors"
                                    >
                                        Approve
                                    </button>
                                </div>
                            )}
                            {selectedClaim.status === "approved" && (
                                <button
                                    onClick={() => {
                                        onUpdateStatus(selectedClaim.id, "Released");
                                        setSelectedClaim(null);
                                    }}
                                    className="bg-fsc-navy hover:bg-fsc-green flex-1 rounded-lg px-4 py-2 font-medium text-white transition-colors"
                                >
                                    Release Funds
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};