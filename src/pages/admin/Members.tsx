// admin/Members.tsx
import React, { useState, useMemo } from "react";
import { Plus, Search, Download, RefreshCw, Copy, Check, ShieldCheck, ShieldOff, ChevronLeft, ChevronRight } from "lucide-react";
import { PACKAGE_INFO } from "../../utils/types";
import AllMembers from "./AllMembers";
import { useAllMembers } from "../../hooks/useAllMembers";
import { getEligibilityTimeline } from "../../utils/eligibility";

export interface MemberRow {
    uid: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile?: string;
    phone?: string;
    package: string;
    sponsorName?: string;
    referralCode?: string;
    city?: string;
    province?: string;
    civilStatus?: string;
    birthDate?: string;
    status: string;
    dateCreated?: { toDate?: () => Date };
    beneficiaries?: { name: string; relationship: string }[];
}

interface Props {
    onUpdateStatus: (memberId: string, status: "active" | "inactive") => Promise<void>;
    onExport: () => void;
    onAddMember?: () => void;
}

export const Members: React.FC<Props> = ({ onUpdateStatus, onExport, onAddMember }) => {
    const { members, loading, refetch } = useAllMembers();
    const [query, setQuery] = useState("");
    const [packageFilter, setPackageFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null);
    const [activating, setActivating] = useState(false);
    const [copied, setCopied] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [goToPage, setGoToPage] = useState("");

    // Get filtered members first
    const filteredMembers = useMemo(() => {
        let filtered = [...members];

        // Apply search filter
        if (query) {
            const lowerQuery = query.toLowerCase();
            filtered = filtered.filter(
                (member) =>
                    member.firstName?.toLowerCase().includes(lowerQuery) ||
                    member.lastName?.toLowerCase().includes(lowerQuery) ||
                    member.email?.toLowerCase().includes(lowerQuery) ||
                    member.city?.toLowerCase().includes(lowerQuery) ||
                    member.mobile?.includes(lowerQuery),
            );
        }

        // Apply package filter
        if (packageFilter !== "all") {
            filtered = filtered.filter((member) => member.package === packageFilter);
        }

        // Apply status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter((member) => member.status === statusFilter);
        }

        return filtered;
    }, [members, query, packageFilter, statusFilter]);

    // Pagination calculations
    const totalRecords = filteredMembers.length;
    const totalPages = Math.ceil(totalRecords / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pageNumbers.push(i);
                }
                pageNumbers.push("...");
                pageNumbers.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pageNumbers.push(1);
                pageNumbers.push("...");
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pageNumbers.push(i);
                }
            } else {
                pageNumbers.push(1);
                pageNumbers.push("...");
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pageNumbers.push(i);
                }
                pageNumbers.push("...");
                pageNumbers.push(totalPages);
            }
        }
        return pageNumbers;
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            setGoToPage("");
        }
    };

    const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page when changing rows per page
    };

    const handleGoToPage = () => {
        const pageNum = parseInt(goToPage);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            handlePageChange(pageNum);
        }
        setGoToPage("");
    };

    const handleCopyReferralCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleUpdateStatus = async () => {
        if (!selectedMember) return;
        setActivating(true);
        await onUpdateStatus(selectedMember.uid, selectedMember.status === "active" ? "inactive" : "active");
        await refetch();
        setActivating(false);
        setSelectedMember(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="font-display text-gpsc-navy text-3xl">Members</h1>
                </div>
                <div className="flex gap-2">
                    {onAddMember && (
                        <button
                            onClick={onAddMember}
                            className="bg-gpsc-navy hover:bg-gpsc-green flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white transition-colors"
                        >
                            <Plus size={14} /> Add user
                        </button>
                    )}
                    <button
                        onClick={onExport}
                        className="border-gpsc-navy text-gpsc-navy hover:bg-gpsc-navy flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors hover:text-white"
                    >
                        <Download size={14} /> Export
                    </button>
                </div>
            </div>

            <div className="border-gpsc-cream-dark overflow-hidden rounded-2xl border bg-white">
                <div className="border-gpsc-cream-dark flex flex-wrap gap-3 border-b p-4">
                    <div className="relative min-w-50 flex-1">
                        <Search size={16} className="text-gpsc-stone absolute top-1/2 left-3 -translate-y-1/2" />
                        <input
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setCurrentPage(1); // Reset to first page on search
                            }}
                            placeholder="Search by name, email, city..."
                            className="border-gpsc-cream-dark focus:ring-gpsc-green w-full rounded-lg border py-2 pr-4 pl-9 text-sm focus:ring-2 focus:outline-none"
                        />
                    </div>
                    <select
                        value={packageFilter}
                        onChange={(e) => {
                            setPackageFilter(e.target.value);
                            setCurrentPage(1); // Reset to first page on filter change
                        }}
                        className="border-gpsc-cream-dark focus:ring-gpsc-green rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                    >
                        <option value="all">All packages</option>
                        <option value="Basic">Basic Care</option>
                        <option value="Family">Family Care</option>
                        <option value="Premium">Premium Care</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1); // Reset to first page on filter change
                        }}
                        className="border-gpsc-cream-dark focus:ring-gpsc-green rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                    >
                        <option value="all">All statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                    </select>
                    <button
                        onClick={() => {
                            refetch();
                            setCurrentPage(1);
                        }}
                        disabled={loading}
                        className="border-gpsc-cream-dark hover:bg-gpsc-cream/60 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gpsc-cream/50 text-gpsc-stone text-xs tracking-wider uppercase">
                            <tr>
                                <th className="p-4 text-left">Member</th>
                                <th className="p-4 text-left">Package</th>
                                <th className="p-4 text-left">Sponsor</th>
                                <th className="p-4 text-left">Joined</th>
                                <th className="p-4 text-left">Status</th>
                            </tr>
                        </thead>

                        <AllMembers
                            members={paginatedMembers}
                            loading={loading}
                            query={query}
                            packageFilter={packageFilter}
                            statusFilter={statusFilter}
                            onSelectMember={setSelectedMember}
                            onUpdateStatus={onUpdateStatus}
                        />
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalRecords > 0 && (
                    <div className="border-gpsc-cream-dark flex flex-wrap items-center justify-between gap-4 border-t px-4 py-3">
                        <div className="text-gpsc-stone text-xs">
                            Showing {startIndex + 1} to {Math.min(endIndex, totalRecords)} of {totalRecords} records
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            {/* Page navigation buttons */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="border-gpsc-cream-dark hover:bg-gpsc-cream/60 rounded-lg border p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                {getPageNumbers().map((page, index) => (
                                    <React.Fragment key={index}>
                                        {page === "..." ? (
                                            <span className="text-gpsc-stone px-2">...</span>
                                        ) : (
                                            <button
                                                onClick={() => handlePageChange(page as number)}
                                                className={`min-w-[32px] rounded-lg px-2 py-1 text-sm transition-colors ${
                                                    currentPage === page
                                                        ? "bg-gpsc-navy text-white"
                                                        : "border-gpsc-cream-dark hover:bg-gpsc-cream/60 border"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        )}
                                    </React.Fragment>
                                ))}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="border-gpsc-cream-dark hover:bg-gpsc-cream/60 rounded-lg border p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            {/* Rows per page selector */}
                            <div className="flex items-center gap-2">
                                <span className="text-gpsc-stone text-sm">{rowsPerPage} /page</span>
                                <select
                                    value={rowsPerPage}
                                    onChange={handleRowsPerPageChange}
                                    className="border-gpsc-cream-dark focus:ring-gpsc-green rounded-lg border px-2 py-1 text-sm focus:ring-2 focus:outline-none"
                                >
                                    <option value={5}>5 /page</option>
                                    <option value={10}>10 /page</option>
                                    <option value={25}>25 /page</option>
                                    <option value={50}>50 /page</option>
                                    <option value={100}>100 /page</option>
                                </select>
                            </div>

                            {/* Go to page input */}
                            <div className="flex items-center gap-2">
                                <span className="text-gpsc-stone text-sm">Go To page:</span>
                                <input
                                    type="number"
                                    value={goToPage}
                                    onChange={(e) => setGoToPage(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                            handleGoToPage();
                                        }
                                    }}
                                    min={1}
                                    max={totalPages}
                                    className="border-gpsc-cream-dark focus:ring-gpsc-green w-16 rounded-lg border px-2 py-1 text-sm focus:ring-2 focus:outline-none"
                                />
                                <button
                                    onClick={handleGoToPage}
                                    className="bg-gpsc-navy hover:bg-gpsc-green rounded-lg px-3 py-1 text-sm text-white transition-colors"
                                >
                                    GO
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Member Detail Modal ── */}
            {selectedMember &&
                (() => {
                    const timeline = getEligibilityTimeline(selectedMember.dateCreated as any);
                    const unlockedCount = timeline.filter((m) => m.unlocked).length;
                    return (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                            onClick={() => {
                                if (!activating) setSelectedMember(null);
                            }}
                        >
                            <div
                                className="mx-4 flex w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* ── LEFT PANEL: Member Details ── */}
                                <div className="max-h-[90vh] flex-1 overflow-y-auto p-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h2 className="font-display text-gpsc-navy text-xl">Member Details</h2>
                                        <button
                                            onClick={() => setSelectedMember(null)}
                                            disabled={activating}
                                            className="text-gpsc-stone hover:text-gpsc-navy text-lg transition-colors disabled:opacity-40"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {/* Avatar + basic info */}
                                    <div className="bg-gpsc-cream mb-6 flex items-center gap-4 rounded-xl p-4">
                                        <div className="bg-gpsc-navy font-display flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white">
                                            {selectedMember.firstName.charAt(0).toUpperCase()}
                                            {selectedMember.lastName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-display text-gpsc-navy text-xl">
                                                {selectedMember.firstName} {selectedMember.lastName}
                                            </div>
                                            <div className="text-gpsc-stone text-sm">{selectedMember.email}</div>
                                            <div className="text-gpsc-stone text-sm">{selectedMember.mobile ?? selectedMember.phone ?? "—"}</div>
                                        </div>
                                    </div>

                                    {/* Detail grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: "Package", value: selectedMember.package ? `${selectedMember.package} Care` : "—" },
                                            {
                                                label: "Rank",
                                                value: selectedMember.package
                                                    ? (PACKAGE_INFO[selectedMember.package as keyof typeof PACKAGE_INFO]?.rank ?? "—")
                                                    : "—",
                                            },
                                            { label: "Sponsor", value: selectedMember.sponsorName ?? "—" },
                                            { label: "Referral Code", value: selectedMember.referralCode ?? "—" },
                                            { label: "City", value: selectedMember.city ?? "—" },
                                            { label: "Province", value: selectedMember.province ?? "—" },
                                            { label: "Civil Status", value: selectedMember.civilStatus ?? "—" },
                                            { label: "Birth Date", value: selectedMember.birthDate ?? "—" },
                                            { label: "Joined", value: selectedMember.dateCreated?.toDate?.()?.toLocaleDateString() ?? "—" },
                                            { label: "Status", value: selectedMember.status ?? "—" },
                                        ].map(({ label, value }) => (
                                            <div key={label}>
                                                <div className="text-gpsc-stone mb-0.5 text-xs">{label}</div>
                                                {label === "Referral Code" ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-gpsc-navy text-sm font-medium">{value}</span>
                                                        {selectedMember.referralCode && (
                                                            <button
                                                                onClick={() => handleCopyReferralCode(selectedMember.referralCode!)}
                                                                className="text-gpsc-stone hover:text-gpsc-navy transition-colors"
                                                                title="Copy referral code"
                                                            >
                                                                {copied ? <Check size={14} className="text-gpsc-green" /> : <Copy size={14} />}
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={`text-sm font-medium ${
                                                            label === "Status"
                                                                ? value === "active"
                                                                    ? "text-gpsc-green"
                                                                    : "text-red-500"
                                                                : "text-gpsc-navy"
                                                        }`}
                                                    >
                                                        {value}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Beneficiaries */}
                                    {(selectedMember.beneficiaries?.length ?? 0) > 0 && (
                                        <div className="mt-5">
                                            <div className="text-gpsc-stone mb-2 text-xs tracking-wider uppercase">Beneficiaries</div>
                                            <div className="space-y-2">
                                                {selectedMember.beneficiaries!.map((b, i) => (
                                                    <div key={i} className="bg-gpsc-cream flex justify-between rounded-lg px-3 py-2 text-sm">
                                                        <span className="text-gpsc-navy font-medium">{b.name}</span>
                                                        <span className="text-gpsc-stone">{b.relationship}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="mt-6 flex gap-3">
                                        <button
                                            onClick={() => setSelectedMember(null)}
                                            disabled={activating}
                                            className="border-gpsc-cream-dark text-gpsc-stone hover:bg-gpsc-cream/60 flex-1 rounded-lg border px-4 py-2 transition-colors disabled:opacity-40"
                                        >
                                            Close
                                        </button>
                                        <button
                                            onClick={handleUpdateStatus}
                                            disabled={activating}
                                            className={`flex-1 rounded-lg px-4 py-2 font-medium text-white transition-colors disabled:opacity-70 ${
                                                selectedMember.status === "active"
                                                    ? "bg-red-500 hover:bg-red-600"
                                                    : "bg-gpsc-green hover:bg-gpsc-green/80"
                                            }`}
                                        >
                                            {activating ? "Please wait..." : selectedMember.status === "active" ? "Deactivate" : "Activate"}
                                        </button>
                                    </div>
                                </div>

                                {/* ── RIGHT PANEL: Eligibility Timeline ── */}
                                <div className="bg-gpsc-cream/40 border-gpsc-cream-dark max-h-[90vh] w-72 shrink-0 overflow-y-auto border-l p-6">
                                    <div className="mb-1 flex items-center gap-2">
                                        <ShieldCheck size={16} className="text-gpsc-navy" />
                                        <h3 className="font-display text-gpsc-navy text-base">Benefit Eligibility</h3>
                                    </div>
                                    <p className="text-gpsc-stone mb-5 text-xs">
                                        {unlockedCount} of {timeline.length} benefits unlocked
                                    </p>

                                    {/* Progress bar */}
                                    <div className="bg-gpsc-cream-dark mb-6 h-1.5 w-full overflow-hidden rounded-full">
                                        <div
                                            className="bg-gpsc-green h-full rounded-full transition-all duration-500"
                                            style={{ width: `${(unlockedCount / timeline.length) * 100}%` }}
                                        />
                                    </div>

                                    {/* Timeline items */}
                                    <div className="relative">
                                        {/* Vertical line */}
                                        <div className="bg-gpsc-cream-dark absolute top-0 bottom-0 left-[11px] w-0.5" />

                                        <div className="space-y-5">
                                            {timeline.map((item, i) => (
                                                <div key={i} className="relative flex gap-3 pl-7">
                                                    {/* Dot */}
                                                    <div
                                                        className={`absolute top-0.5 left-0 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                                                            item.unlocked ? "border-gpsc-green bg-gpsc-green" : "border-gpsc-cream-dark bg-white"
                                                        }`}
                                                    >
                                                        {item.unlocked ? (
                                                            <ShieldCheck size={12} className="text-white" />
                                                        ) : (
                                                            <ShieldOff size={12} className="text-gpsc-stone/50" />
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div>
                                                        <div
                                                            className={`text-sm leading-tight font-medium ${
                                                                item.unlocked ? "text-gpsc-navy" : "text-gpsc-stone"
                                                            }`}
                                                        >
                                                            {item.label}
                                                        </div>
                                                        <div className="text-gpsc-stone mt-0.5 text-xs">
                                                            {item.months} month{item.months !== 1 ? "s" : ""} membership
                                                        </div>
                                                        {item.unlocked && (
                                                            <span className="bg-gpsc-green/10 text-gpsc-green mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium">
                                                                Unlocked
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}
        </div>
    );
};
