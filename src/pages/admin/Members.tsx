// admin/Members.tsx
import React, { useState, useMemo, useEffect, useCallback, lazy, Suspense } from "react";
import { Plus, Search, Download, RefreshCw, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import AllMembers from "./AllMembers";
import { useAllMembers } from "../../hooks/useAllMembers";
import { useAdmin } from "../../hooks/useAdmin";
import MemberDetailModal from "../../components/admin/MemberDetailModal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { hardDeleteMember, forceDeleteMember, getMemberDependencies } from "../../firebase/admin";

// Lazy: the encode-member form drags in the full PH address dataset (~5 MB of
// barangays) — don't load it until an admin actually clicks "Add Member".
const AddMemberModal = lazy(() => import("../../components/modals/AddMemberModal"));

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
    archived?: boolean;
    dateCreated?: { toDate?: () => Date };
    beneficiaries?: { name: string; relationship: string }[];
    paymentReference?: string;
    paymentMethod?: string;
    paymentReceiptUrl?: string;
}

interface Props {
    onExport: () => void;
    /** When set (e.g. clicked from the Overview leaderboard), opens that member's
        profile on load. `onFocusHandled` clears it after it's been consumed. */
    focusMemberId?: string | null;
    onFocusHandled?: () => void;
}

export const Members: React.FC<Props> = ({ onExport, focusMemberId, onFocusHandled }) => {
    const { members, loading, refetch } = useAllMembers();
    const { isSuperAdmin } = useAdmin();
    const [showAddMember, setShowAddMember] = useState(false);
    const [query, setQuery] = useState("");
    const [packageFilter, setPackageFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null);

    // Selection + bulk ops
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkMsg, setBulkMsg] = useState("");

    // Confirmation dialog (replaces window.confirm)
    const [confirmState, setConfirmState] = useState<{
        title: string;
        message: string;
        confirmLabel: string;
        danger?: boolean;
        action: () => Promise<void>;
    } | null>(null);
    const [confirmBusy, setConfirmBusy] = useState(false);

    const runConfirm = async () => {
        if (!confirmState) return;
        setConfirmBusy(true);
        try {
            await confirmState.action();
        } finally {
            setConfirmBusy(false);
            setConfirmState(null);
        }
    };

    const openMember = useCallback((m: MemberRow | null) => setSelectedMember(m), []);

    // Deep-link from the Overview leaderboard: open the focused member, then clear.
    useEffect(() => {
        if (!focusMemberId || loading) return;
        const found = members.find((m) => m.uid === focusMemberId) as MemberRow | undefined;
        // Defer state updates out of the synchronous effect body (avoids cascading renders).
        queueMicrotask(() => {
            if (found) openMember(found);
            onFocusHandled?.();
        });
    }, [focusMemberId, loading, members, openMember, onFocusHandled]);

    const toggleSelect = (uid: string) =>
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(uid)) next.delete(uid);
            else next.add(uid);
            return next;
        });

    const requestBulkDelete = () => {
        const targets = members.filter((m) => selectedIds.has(m.uid));
        if (targets.length === 0) {
            setBulkMsg("Nothing selected to delete.");
            return;
        }
        setBulkMsg("");
        setConfirmState({
            title: "Permanently delete members",
            message: `Permanently delete ${targets.length} selected member(s)? This cannot be undone. Anyone who still has downlines or commission history will be skipped — archive those instead. Their login accounts remain until the Blaze upgrade.`,
            confirmLabel: "Delete forever",
            danger: true,
            action: async () => {
                let ok = 0;
                let skipped = 0;
                let fail = 0;
                for (const m of targets) {
                    try {
                        const d = await getMemberDependencies(m.uid);
                        if (d.hasDownlines || d.hasCommissions) {
                            skipped++;
                            continue;
                        }
                        await hardDeleteMember(m.uid);
                        ok++;
                    } catch {
                        fail++;
                    }
                }
                await refetch();
                setSelectedIds(new Set());
                setBulkMsg(
                    `Deleted ${ok}${skipped ? `, skipped ${skipped} with dependencies` : ""}${fail ? `, ${fail} failed` : ""}.`,
                );
            },
        });
    };

    const requestBulkForceDelete = () => {
        const targets = members.filter((m) => selectedIds.has(m.uid));
        if (targets.length === 0) {
            setBulkMsg("Nothing selected to delete.");
            return;
        }
        setBulkMsg("");
        setConfirmState({
            title: "Force delete members",
            message: `Force delete ${targets.length} selected member(s)? This permanently removes them AND their commission records — it cannot be undone. Anyone who still has downlines is skipped to avoid orphaning the tree. Login accounts remain until the Blaze upgrade.`,
            confirmLabel: "Force delete",
            danger: true,
            action: async () => {
                let ok = 0;
                let skipped = 0;
                let fail = 0;
                for (const m of targets) {
                    try {
                        const d = await getMemberDependencies(m.uid);
                        if (d.hasDownlines) {
                            skipped++;
                            continue;
                        }
                        await forceDeleteMember(m.uid);
                        ok++;
                    } catch {
                        fail++;
                    }
                }
                await refetch();
                setSelectedIds(new Set());
                setBulkMsg(
                    `Force deleted ${ok}${skipped ? `, skipped ${skipped} with downlines` : ""}${fail ? `, ${fail} failed` : ""}.`,
                );
            },
        });
    };

    const requestHardDelete = () => {
        if (!selectedMember) return;
        const m = selectedMember;
        setConfirmState({
            title: "Permanently delete member",
            message: `Permanently delete ${m.firstName} ${m.lastName}? This cannot be undone. Their login account will remain until the Blaze upgrade.`,
            confirmLabel: "Delete forever",
            danger: true,
            action: async () => {
                try {
                    await hardDeleteMember(m.uid);
                    await refetch();
                    setSelectedMember(null);
                } catch {
                    window.alert("Delete failed. Make sure you're a super admin and the updated rules are published.");
                }
            },
        });
    };

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [goToPage, setGoToPage] = useState("");

    // Get filtered members first
    const filteredMembers = useMemo(() => {
        let filtered = [...members];

        // Apply search filter. Coerce every field to a string first — some docs
        // store mobile (and others) as numbers, and calling .includes/.toLowerCase
        // on a non-string throws and kills the whole filter.
        const lowerQuery = query.trim().toLowerCase();
        if (lowerQuery) {
            filtered = filtered.filter((member) => {
                const haystack = [
                    member.firstName,
                    member.lastName,
                    `${member.firstName ?? ""} ${member.lastName ?? ""}`,
                    member.email,
                    member.city,
                    member.province,
                    member.mobile,
                    member.referralCode,
                    member.sponsorName,
                ]
                    .map((v) => String(v ?? "").toLowerCase())
                    .join(" ");
                return haystack.includes(lowerQuery);
            });
        }

        // Apply package filter. member.package is stored lowercase
        // ("basic"/"family"/"premium") while the dropdown values are capitalized,
        // so compare case-insensitively.
        if (packageFilter !== "all") {
            filtered = filtered.filter((member) => (member.package ?? "").toLowerCase() === packageFilter.toLowerCase());
        }

        // Archived members are hidden unless you explicitly view the Archived filter.
        // Pending members live solely in the Approvals queue, so the directory never
        // lists them (not even under "All statuses").
        if (statusFilter === "archived") {
            filtered = filtered.filter((m) => m.archived === true);
        } else {
            filtered = filtered.filter((m) => !m.archived && m.status !== "pending");
            if (statusFilter !== "all") {
                filtered = filtered.filter((member) => member.status === statusFilter);
            }
        }

        return filtered;
    }, [members, query, packageFilter, statusFilter]);

    // Pagination calculations
    const totalRecords = filteredMembers.length;
    const totalPages = Math.ceil(totalRecords / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

    // Which rows can be selected for bulk actions:
    // - Regular admins only get bulk Activate, so only pending (non-archived) rows.
    // - Super admins also get bulk Archive/Delete, so any row is selectable.
    const isSelectable = (m: MemberRow) => (isSuperAdmin ? true : m.status === "pending" && !m.archived);

    // Select-all toggles the current page only.
    const pageIds = paginatedMembers.filter(isSelectable).map((m) => m.uid);
    const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
    const toggleSelectAll = () =>
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allPageSelected) pageIds.forEach((id) => next.delete(id));
            else pageIds.forEach((id) => next.add(id));
            return next;
        });

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

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="font-display text-fsc-navy text-3xl">Members</h1>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowAddMember(true)}
                        className="bg-fsc-navy hover:bg-fsc-green flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white transition-colors"
                    >
                        <Plus size={14} /> Add Member
                    </button>
                    <button
                        onClick={onExport}
                        className="border-fsc-navy text-fsc-navy hover:bg-fsc-navy flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors hover:text-white"
                    >
                        <Download size={14} /> Export
                    </button>
                </div>
            </div>

            <div className="border-fsc-cream-dark overflow-hidden rounded-2xl border bg-white">
                <div className="border-fsc-cream-dark flex flex-wrap gap-3 border-b p-4">
                    <div className="relative min-w-50 flex-1">
                        <Search size={16} className="text-fsc-stone absolute top-1/2 left-3 -translate-y-1/2" />
                        <input
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setCurrentPage(1); // Reset to first page on search
                            }}
                            placeholder="Search by name, referral code, sponsor, email, mobile, city..."
                            className="border-fsc-cream-dark focus:ring-fsc-green w-full rounded-lg border py-2 pr-4 pl-9 text-sm focus:ring-2 focus:outline-none"
                        />
                    </div>
                    <select
                        value={packageFilter}
                        onChange={(e) => {
                            setPackageFilter(e.target.value);
                            setCurrentPage(1); // Reset to first page on filter change
                        }}
                        className="border-fsc-cream-dark focus:ring-fsc-green rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
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
                        className="border-fsc-cream-dark focus:ring-fsc-green rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                    >
                        <option value="all">All statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="archived">Archived</option>
                    </select>
                    <button
                        onClick={() => {
                            refetch();
                            setCurrentPage(1);
                        }}
                        disabled={loading}
                        className="border-fsc-cream-dark hover:bg-fsc-cream/60 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-fsc-cream/50 text-fsc-stone text-xs tracking-wider uppercase">
                            <tr>
                                <th className="p-4 text-left">Member</th>
                                <th className="p-4 text-left">Package</th>
                                <th className="p-4 text-left">Sponsor</th>
                                <th className="p-4 text-left">Joined</th>
                                <th className="p-4 text-left">Status</th>
                                <th className="w-10 p-4 text-right">
                                    {pageIds.length > 0 && (
                                        <input
                                            type="checkbox"
                                            checked={allPageSelected}
                                            onChange={toggleSelectAll}
                                            className="accent-fsc-navy h-4 w-4 cursor-pointer"
                                            aria-label="Select all pending on this page"
                                        />
                                    )}
                                </th>
                            </tr>
                        </thead>

                        <AllMembers
                            members={paginatedMembers}
                            loading={loading}
                            query={query}
                            packageFilter={packageFilter}
                            statusFilter={statusFilter}
                            onSelectMember={openMember}
                            selectedIds={selectedIds}
                            onToggleSelect={toggleSelect}
                            canSelectActive={isSuperAdmin}
                        />
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalRecords > 0 && (
                    <div className="border-fsc-cream-dark flex flex-wrap items-center justify-between gap-4 border-t px-4 py-3">
                        <div className="text-fsc-stone flex items-center gap-3 text-xs">
                            <span>
                                Showing {startIndex + 1} to {Math.min(endIndex, totalRecords)} of {totalRecords} records
                            </span>
                            {bulkMsg && <span className="text-fsc-green">{bulkMsg}</span>}
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            {/* Page navigation buttons */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="border-fsc-cream-dark hover:bg-fsc-cream/60 rounded-lg border p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                {getPageNumbers().map((page, index) => (
                                    <React.Fragment key={index}>
                                        {page === "..." ? (
                                            <span className="text-fsc-stone px-2">...</span>
                                        ) : (
                                            <button
                                                onClick={() => handlePageChange(page as number)}
                                                className={`min-w-8 rounded-lg px-2 py-1 text-sm transition-colors ${
                                                    currentPage === page
                                                        ? "bg-fsc-navy text-white"
                                                        : "border-fsc-cream-dark hover:bg-fsc-cream/60 border"
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
                                    className="border-fsc-cream-dark hover:bg-fsc-cream/60 rounded-lg border p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            {/* Rows per page selector */}
                            <div className="flex items-center gap-2">
                                <span className="text-fsc-stone text-sm">{rowsPerPage} /page</span>
                                <select
                                    value={rowsPerPage}
                                    onChange={handleRowsPerPageChange}
                                    className="border-fsc-cream-dark focus:ring-fsc-green rounded-lg border px-2 py-1 text-sm focus:ring-2 focus:outline-none"
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
                                <span className="text-fsc-stone text-sm">Go To page:</span>
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
                                    className="border-fsc-cream-dark focus:ring-fsc-green w-16 rounded-lg border px-2 py-1 text-sm focus:ring-2 focus:outline-none"
                                />
                                <button
                                    onClick={handleGoToPage}
                                    className="bg-fsc-navy hover:bg-fsc-green rounded-lg px-3 py-1 text-sm text-white transition-colors"
                                >
                                    GO
                                </button>
                            </div>

                            {/* Bulk actions — to the right of Go, only when rows are selected */}
                            {selectedIds.size > 0 && (
                                <div className="border-fsc-cream-dark flex flex-wrap items-center gap-2 sm:border-l sm:pl-4">
                                    <span className="text-fsc-navy text-sm font-medium">{selectedIds.size} selected</span>
                                    {isSuperAdmin && (
                                        <>
                                            <button
                                                onClick={requestBulkDelete}
                                                className="flex items-center gap-1.5 rounded-lg border border-[#C41E1E]/25 px-3 py-1.5 text-sm text-[#C41E1E] transition-colors hover:bg-[#C41E1E]/5"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                            <button
                                                onClick={requestBulkForceDelete}
                                                className="flex items-center gap-1.5 rounded-lg bg-[#C41E1E] px-3 py-1.5 text-sm text-white transition-colors hover:bg-[#A31818]"
                                            >
                                                <Trash2 size={14} /> Force delete
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => {
                                            setSelectedIds(new Set());
                                            setBulkMsg("");
                                        }}
                                        className="text-fsc-stone hover:text-fsc-navy text-sm"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Member Detail Modal ── */}
            {selectedMember && (
                <MemberDetailModal
                    member={selectedMember}
                    isSuperAdmin={isSuperAdmin}
                    onClose={() => setSelectedMember(null)}
                    onRequestHardDelete={requestHardDelete}
                />
            )}

            {showAddMember && (
                <Suspense
                    fallback={
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-white"></div>
                        </div>
                    }
                >
                    <AddMemberModal onClose={() => setShowAddMember(false)} onSuccess={() => refetch()} />
                </Suspense>
            )}

            {confirmState && (
                <ConfirmDialog
                    title={confirmState.title}
                    message={confirmState.message}
                    confirmLabel={confirmState.confirmLabel}
                    danger={confirmState.danger}
                    busy={confirmBusy}
                    onConfirm={runConfirm}
                    onCancel={() => setConfirmState(null)}
                />
            )}
        </div>
    );
};
