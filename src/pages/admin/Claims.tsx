// admin/Claims.tsx
import React, { useState } from "react";
import { Download, Eye, CheckCircle, XCircle, Clock, FileText, Search, X } from "lucide-react";
import type { Claim } from "../../utils/types";
import { formatCurrency, formatDate } from "./utils";

interface Props {
    claims: Claim[];
    loading: boolean;
    onUpdateStatus: (claimId: string, status: "Approved" | "Rejected" | "Released") => Promise<void>;
    onReviewClaim?: (claimId: string) => Promise<void>;
    onRefresh: () => void;
    onExport: () => void;
}

const statusColors: Record<string, string> = {
    submitted: "bg-gpsc-navy/10 text-gpsc-navy",
    under_review: "bg-amber-100 text-amber-700",
    approved: "bg-gpsc-green/10 text-gpsc-green",
    rejected: "bg-red-100 text-red-700",
    released: "bg-gpsc-green/20 text-gpsc-green",
};

const statusLabels: Record<string, string> = {
    submitted: "Submitted",
    under_review: "Under Review",
    approved: "Approved",
    rejected: "Rejected",
    released: "Released",
};

export const Claims: React.FC<Props> = ({ claims, loading, onUpdateStatus, onReviewClaim, onRefresh, onExport }) => {
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

    const filtered = claims.filter((c) => {
        const matchesStatus = statusFilter === "all" || c.status === statusFilter;
        const q = search.trim().toLowerCase();
        const matchesSearch =
            !q ||
            c.userId.toLowerCase().includes(q) ||
            c.id.toLowerCase().includes(q) ||
            c.benefit.toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
    });

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="bg-gpsc-cream-dark mb-4 h-8 w-32 rounded"></div>
                    <div className="bg-gpsc-cream-dark h-96 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    const handleStartReview = (claimId: string) => {
        if (onReviewClaim) {
            onReviewClaim(claimId);
        } else {
            onRefresh();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="font-display text-gpsc-navy text-3xl">Claims Operations</h1>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onExport}
                        className="border-gpsc-navy text-gpsc-navy hover:bg-gpsc-navy flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors hover:text-white"
                    >
                        <Download size={14} /> Export
                    </button>
                </div>
            </div>

            <div className="border-gpsc-cream-dark overflow-hidden rounded-2xl border bg-white">
                <div className="border-gpsc-cream-dark flex flex-wrap items-center justify-between gap-3 border-b p-4">
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Search bar */}
                        <div className="border-gpsc-cream-dark focus-within:ring-gpsc-green flex items-center gap-2 rounded-lg border px-3 py-2 text-sm focus-within:ring-2">
                            <Search size={14} className="text-gpsc-stone shrink-0" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by ID or benefit…"
                                className="w-44 bg-transparent outline-none placeholder:text-gpsc-stone/60"
                            />
                            {search && (
                                <button onClick={() => setSearch("")} className="text-gpsc-stone hover:text-gpsc-navy">
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                        {/* Status filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border-gpsc-cream-dark focus:ring-gpsc-green rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                        >
                            <option value="all">All statuses</option>
                            <option value="submitted">Submitted</option>
                            <option value="under_review">Under Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="released">Released</option>
                        </select>
                        <button
                            onClick={onRefresh}
                            className="border-gpsc-cream-dark hover:bg-gpsc-cream/60 rounded-lg border px-3 py-2 text-sm transition-colors"
                        >
                            Refresh
                        </button>
                    </div>
                    <div className="text-gpsc-stone bg-gpsc-cream rounded-full px-3 py-1 text-xs">
                        {claims.filter((c) => c.status === "submitted" || c.status === "under_review").length} pending
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gpsc-cream/50 text-gpsc-stone text-xs tracking-wider uppercase">
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
                                <tr key={claim.id} className="border-gpsc-cream-dark hover:bg-gpsc-cream/40 border-t transition-colors">
                                    <td className="p-4">
                                        <div className="text-gpsc-navy">ID: {claim.userId.slice(0, 8)}...</div>
                                        <div className="text-gpsc-stone font-mono text-xs">Claim #{claim.id.slice(0, 8)}</div>
                                    </td>
                                    <td className="text-gpsc-stone p-4">{claim.benefit}</td>
                                    <td className="text-gpsc-stone p-4">{formatDate(claim.submitted)}</td>
                                    <td className="text-gpsc-navy p-4 text-right font-medium">{formatCurrency(claim.amount)}</td>
                                    <td className="p-4">
                                        <span className={`rounded-full px-2 py-1 text-xs ${statusColors[claim.status] || "bg-gpsc-stone/10"}`}>
                                            {statusLabels[claim.status] || claim.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedClaim(claim)}
                                                className="text-gpsc-stone hover:bg-gpsc-cream rounded p-1 transition-colors"
                                                title="View details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {claim.status === "submitted" && (
                                                <button
                                                    onClick={() => handleStartReview(claim.id)}
                                                    className="rounded p-1 text-amber-600 transition-colors hover:bg-amber-50"
                                                    title="Start review"
                                                >
                                                    <Clock size={16} />
                                                </button>
                                            )}
                                            {claim.status === "under_review" && (
                                                <>
                                                    <button
                                                        onClick={() => onUpdateStatus(claim.id, "Rejected")}
                                                        className="rounded p-1 text-red-500 transition-colors hover:bg-red-50"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => onUpdateStatus(claim.id, "Approved")}
                                                        className="rounded p-1 text-gpsc-green transition-colors hover:bg-gpsc-green/10"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                </>
                                            )}
                                            {claim.status === "approved" && (
                                                <button
                                                    onClick={() => onUpdateStatus(claim.id, "Rejected")}
                                                    className="bg-gpsc-green hover:bg-gpsc-green-light rounded px-2 py-1 text-xs text-white transition-colors"
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
                                    <td colSpan={6} className="text-gpsc-stone p-8 text-center">
                                        {search || statusFilter !== "all" ? "No claims match your filters" : "No claims found"}
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
                            <h2 className="font-display text-gpsc-navy text-xl">Claim Details</h2>
                            <button onClick={() => setSelectedClaim(null)} className="text-gpsc-stone hover:text-gpsc-navy transition-colors">
                                ✕
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="bg-gpsc-cream rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gpsc-stone text-xs">Amount</span>
                                    <span className="font-display text-gpsc-navy text-2xl">{formatCurrency(selectedClaim.amount)}</span>
                                </div>
                                <div className="mt-2">
                                    <span className={`rounded-full px-2 py-1 text-xs ${statusColors[selectedClaim.status]}`}>
                                        {statusLabels[selectedClaim.status]}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <div className="text-gpsc-stone text-xs">Claim ID</div>
                                <div className="text-gpsc-navy font-mono text-sm">{selectedClaim.id}</div>
                            </div>
                            <div>
                                <div className="text-gpsc-stone text-xs">Benefit</div>
                                <div className="text-gpsc-navy">{selectedClaim.benefit}</div>
                            </div>
                            <div>
                                <div className="text-gpsc-stone text-xs">Submitted</div>
                                <div className="text-gpsc-navy">{formatDate(selectedClaim.submitted)}</div>
                            </div>
                            {selectedClaim.decided && (
                                <div>
                                    <div className="text-gpsc-stone text-xs">Decided</div>
                                    <div className="text-gpsc-navy">{formatDate(selectedClaim.decided)}</div>
                                </div>
                            )}
                            <div>
                                <div className="text-gpsc-stone mb-2 text-xs">Documents</div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedClaim.documents.map((d, i) => (
                                        <span
                                            key={i}
                                            className="bg-gpsc-cream text-gpsc-stone flex items-center gap-1 rounded-full px-3 py-1.5 text-xs"
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
                                className="border-gpsc-cream-dark text-gpsc-stone hover:bg-gpsc-cream/60 flex-1 rounded-lg border px-4 py-2 transition-colors"
                            >
                                Close
                            </button>
                            {selectedClaim.status === "submitted" && (
                                <button
                                    onClick={() => {
                                        handleStartReview(selectedClaim.id);
                                        setSelectedClaim(null);
                                    }}
                                    className="flex-1 rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition-colors hover:bg-amber-700"
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
                                        className="flex-1 rounded-lg border border-red-500 px-4 py-2 font-medium text-red-500 transition-colors hover:bg-red-50"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => {
                                            onUpdateStatus(selectedClaim.id, "Approved");
                                            setSelectedClaim(null);
                                        }}
                                        className="bg-gpsc-green hover:bg-gpsc-green-light flex-1 rounded-lg px-4 py-2 font-medium text-white transition-colors"
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
                                    className="bg-gpsc-navy hover:bg-gpsc-green flex-1 rounded-lg px-4 py-2 font-medium text-white transition-colors"
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