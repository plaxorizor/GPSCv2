// admin/Members.tsx
import React, { useState, useMemo } from "react";
import {
    Plus,
    Search,
    Download,
    RefreshCw,
    Copy,
    Check,
    ShieldCheck,
    ShieldOff,
    ChevronLeft,
    ChevronRight,
    Archive,
    RotateCcw,
    Trash2,
} from "lucide-react";
import { PACKAGE_INFO } from "../../utils/types";
import AllMembers from "./AllMembers";
import { useAllMembers } from "../../hooks/useAllMembers";
import { useAdmin } from "../../hooks/useAdmin";
import { getEligibilityTimeline } from "../../utils/eligibility";
import AddMemberModal from "../../components/AddMemberModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { sendMemberPasswordReset, archiveMember, restoreMember, hardDeleteMember, forceDeleteMember, getMemberDependencies } from "../../firebase/admin";

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
}

interface Props {
    onUpdateStatus: (memberId: string, status: "active" | "inactive") => Promise<void>;
    onExport: () => void;
}

export const Members: React.FC<Props> = ({ onUpdateStatus, onExport }) => {
    const { members, loading, refetch } = useAllMembers();
    const { isSuperAdmin } = useAdmin();
    const [showAddMember, setShowAddMember] = useState(false);
    const [query, setQuery] = useState("");
    const [packageFilter, setPackageFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null);
    const [activating, setActivating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [resetMsg, setResetMsg] = useState("");

    // Selection + bulk ops
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkMsg, setBulkMsg] = useState("");

    // Super-admin per-member actions
    const [deps, setDeps] = useState<{ hasDownlines: boolean; hasCommissions: boolean } | null>(null);
    const [memberActionBusy, setMemberActionBusy] = useState(false);

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

    const openMember = (m: MemberRow | null) => {
        setResetMsg("");
        setDeps(null);
        setSelectedMember(m);
        // For super admins, check whether this member is safe to hard-delete.
        if (m && isSuperAdmin) {
            getMemberDependencies(m.uid)
                .then(setDeps)
                .catch(() => setDeps(null));
        }
    };

    const toggleSelect = (uid: string) =>
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(uid)) next.delete(uid);
            else next.add(uid);
            return next;
        });

    const requestBulkActivate = () => {
        const targets = members.filter((m) => selectedIds.has(m.uid) && m.status === "pending" && !m.archived);
        const skipped = selectedIds.size - targets.length;
        if (targets.length === 0) {
            setBulkMsg("No pending members in the selection.");
            return;
        }
        setBulkMsg("");
        setConfirmState({
            title: "Activate members",
            message: `Activate ${targets.length} pending member(s)? This generates their referral codes and pays upline commissions.${
                skipped ? ` ${skipped} non-pending member(s) will be skipped.` : ""
            }`,
            confirmLabel: "Activate",
            action: async () => {
                let ok = 0;
                let fail = 0;
                for (const m of targets) {
                    try {
                        await onUpdateStatus(m.uid, "active");
                        ok++;
                    } catch {
                        fail++;
                    }
                }
                await refetch();
                setSelectedIds(new Set());
                setBulkMsg(`Activated ${ok}${fail ? `, ${fail} failed` : ""}${skipped ? `, skipped ${skipped} non-pending` : ""}.`);
            },
        });
    };

    const requestBulkArchive = () => {
        const targets = members.filter((m) => selectedIds.has(m.uid) && !m.archived);
        if (targets.length === 0) {
            setBulkMsg("Nothing to archive in the selection.");
            return;
        }
        setBulkMsg("");
        setConfirmState({
            title: "Archive members",
            message: `Archive ${targets.length} member(s)? They'll be hidden from the lists but their data is kept and can be restored.`,
            confirmLabel: "Archive",
            action: async () => {
                let ok = 0;
                let fail = 0;
                for (const m of targets) {
                    try {
                        await archiveMember(m.uid);
                        ok++;
                    } catch {
                        fail++;
                    }
                }
                await refetch();
                setSelectedIds(new Set());
                setBulkMsg(`Archived ${ok}${fail ? `, ${fail} failed` : ""}.`);
            },
        });
    };

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

    const requestArchiveOne = () => {
        if (!selectedMember) return;
        const m = selectedMember;
        setConfirmState({
            title: "Archive member",
            message: `Archive ${m.firstName} ${m.lastName}? They'll be hidden but their data is kept and can be restored.`,
            confirmLabel: "Archive",
            action: async () => {
                await archiveMember(m.uid);
                await refetch();
                setSelectedMember(null);
            },
        });
    };

    const handleRestoreOne = async () => {
        if (!selectedMember) return;
        setMemberActionBusy(true);
        try {
            await restoreMember(selectedMember.uid);
            await refetch();
            setSelectedMember(null);
        } finally {
            setMemberActionBusy(false);
        }
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

    const handleSendReset = async () => {
        if (!selectedMember?.email) return;
        setResetting(true);
        setResetMsg("");
        try {
            await sendMemberPasswordReset(selectedMember.email);
            setResetMsg(`Reset link sent to ${selectedMember.email}`);
        } catch {
            setResetMsg("Could not send the reset link. Please try again.");
        } finally {
            setResetting(false);
        }
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

        // Archived members are hidden unless you explicitly view the Archived filter
        if (statusFilter === "archived") {
            filtered = filtered.filter((m) => m.archived === true);
        } else {
            filtered = filtered.filter((m) => !m.archived);
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
                        <option value="pending">Pending</option>
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
                            onUpdateStatus={onUpdateStatus}
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
                                    <button
                                        onClick={requestBulkActivate}
                                        className="bg-fsc-green flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-white transition-opacity hover:opacity-90"
                                    >
                                        <Check size={14} /> Activate
                                    </button>
                                    {isSuperAdmin && (
                                        <>
                                            <button
                                                onClick={requestBulkArchive}
                                                className="border-fsc-cream-dark text-fsc-navy hover:bg-fsc-cream flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors"
                                            >
                                                <Archive size={14} /> Archive
                                            </button>
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
                                        <h2 className="font-display text-fsc-navy text-xl">Member Details</h2>
                                        <button
                                            onClick={() => setSelectedMember(null)}
                                            disabled={activating}
                                            className="text-fsc-stone hover:text-fsc-navy text-lg transition-colors disabled:opacity-40"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {/* Avatar + basic info */}
                                    <div className="bg-fsc-cream mb-6 flex items-center gap-4 rounded-xl p-4">
                                        <div className="bg-fsc-navy font-display flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white">
                                            {selectedMember.firstName.charAt(0).toUpperCase()}
                                            {selectedMember.lastName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-display text-fsc-navy text-xl">
                                                {selectedMember.firstName} {selectedMember.lastName}
                                            </div>
                                            <div className="text-fsc-stone text-sm">{selectedMember.email}</div>
                                            <div className="text-fsc-stone text-sm">{selectedMember.mobile ?? selectedMember.phone ?? "—"}</div>
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
                                                <div className="text-fsc-stone mb-0.5 text-xs">{label}</div>
                                                {label === "Referral Code" ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-fsc-navy text-sm font-medium">{value}</span>
                                                        {selectedMember.referralCode && (
                                                            <button
                                                                onClick={() => handleCopyReferralCode(selectedMember.referralCode!)}
                                                                className="text-fsc-stone hover:text-fsc-navy transition-colors"
                                                                title="Copy referral code"
                                                            >
                                                                {copied ? <Check size={14} className="text-fsc-green" /> : <Copy size={14} />}
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={`text-sm font-medium ${
                                                            label === "Status"
                                                                ? value === "active"
                                                                    ? "text-fsc-green"
                                                                    : "text-[#C41E1E]"
                                                                : "text-fsc-navy"
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
                                            <div className="text-fsc-stone mb-2 text-xs tracking-wider uppercase">Beneficiaries</div>
                                            <div className="space-y-2">
                                                {selectedMember.beneficiaries!.map((b, i) => (
                                                    <div key={i} className="bg-fsc-cream flex justify-between rounded-lg px-3 py-2 text-sm">
                                                        <span className="text-fsc-navy font-medium">{b.name}</span>
                                                        <span className="text-fsc-stone">{b.relationship}</span>
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
                                            className="border-fsc-cream-dark text-fsc-stone hover:bg-fsc-cream/60 flex-1 rounded-lg border px-4 py-2 transition-colors disabled:opacity-40"
                                        >
                                            Close
                                        </button>
                                        <button
                                            onClick={handleUpdateStatus}
                                            disabled={activating}
                                            className={`flex-1 rounded-lg px-4 py-2 font-medium text-white transition-colors disabled:opacity-70 ${
                                                selectedMember.status === "active"
                                                    ? "bg-[#C41E1E] hover:bg-[#A31818]"
                                                    : "bg-fsc-green hover:bg-fsc-green/80"
                                            }`}
                                        >
                                            {activating ? "Please wait..." : selectedMember.status === "active" ? "Deactivate" : "Activate"}
                                        </button>
                                    </div>

                                    {/* Password reset */}
                                    <div className="border-fsc-cream-dark mt-4 border-t pt-4">
                                        {selectedMember.email ? (
                                            <button
                                                onClick={handleSendReset}
                                                disabled={resetting}
                                                className="border-fsc-cream-dark text-fsc-navy hover:bg-fsc-cream/60 w-full rounded-lg border px-4 py-2 text-sm transition-colors disabled:opacity-60"
                                            >
                                                {resetting ? "Sending…" : "Send password reset link"}
                                            </button>
                                        ) : (
                                            <p className="text-fsc-stone text-xs">
                                                No email on file — this member logs in with their mobile-based ID. Resetting their password needs the
                                                Blaze upgrade; for now, re-encode or have them change it themselves.
                                            </p>
                                        )}
                                        {resetMsg && <p className="text-fsc-green mt-2 text-xs">{resetMsg}</p>}
                                    </div>

                                    {/* Super-admin: archive / restore / permanently delete */}
                                    {isSuperAdmin && (
                                        <div className="mt-4 space-y-2 rounded-xl border border-[#C41E1E]/20 bg-[#C41E1E]/5 p-3">
                                            <div className="text-xs font-medium tracking-wider text-[#C41E1E]/80 uppercase">Super admin</div>
                                            {selectedMember.archived ? (
                                                <button
                                                    onClick={handleRestoreOne}
                                                    disabled={memberActionBusy}
                                                    className="border-fsc-cream-dark text-fsc-navy hover:bg-fsc-cream/60 flex w-full items-center justify-center gap-1.5 rounded-lg border bg-white px-4 py-2 text-sm transition-colors disabled:opacity-50"
                                                >
                                                    <RotateCcw size={14} /> Restore member
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={requestArchiveOne}
                                                    disabled={memberActionBusy}
                                                    className="border-fsc-cream-dark text-fsc-navy hover:bg-fsc-cream/60 flex w-full items-center justify-center gap-1.5 rounded-lg border bg-white px-4 py-2 text-sm transition-colors disabled:opacity-50"
                                                >
                                                    <Archive size={14} /> Archive member
                                                </button>
                                            )}

                                            {deps && !deps.hasDownlines && !deps.hasCommissions && (
                                                <button
                                                    onClick={requestHardDelete}
                                                    disabled={memberActionBusy}
                                                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#C41E1E] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#A31818] disabled:opacity-50"
                                                >
                                                    <Trash2 size={14} /> Permanently delete
                                                </button>
                                            )}
                                            {deps && (deps.hasDownlines || deps.hasCommissions) && (
                                                <p className="text-xs text-[#C41E1E]/80">
                                                    Can't permanently delete — this member has {deps.hasDownlines ? "downlines" : ""}
                                                    {deps.hasDownlines && deps.hasCommissions ? " and " : ""}
                                                    {deps.hasCommissions ? "commission history" : ""}. Archive instead to keep the tree intact.
                                                </p>
                                            )}
                                            {!deps && <p className="text-fsc-stone text-xs">Checking delete eligibility…</p>}
                                        </div>
                                    )}
                                </div>

                                {/* ── RIGHT PANEL: Eligibility Timeline ── */}
                                <div className="bg-fsc-cream/40 border-fsc-cream-dark max-h-[90vh] w-72 shrink-0 overflow-y-auto border-l p-6">
                                    <div className="mb-1 flex items-center gap-2">
                                        <ShieldCheck size={16} className="text-fsc-navy" />
                                        <h3 className="font-display text-fsc-navy text-base">Benefit Eligibility</h3>
                                    </div>
                                    <p className="text-fsc-stone mb-5 text-xs">
                                        {unlockedCount} of {timeline.length} benefits unlocked
                                    </p>

                                    {/* Progress bar */}
                                    <div className="bg-fsc-cream-dark mb-6 h-1.5 w-full overflow-hidden rounded-full">
                                        <div
                                            className="bg-fsc-green h-full rounded-full transition-all duration-500"
                                            style={{ width: `${(unlockedCount / timeline.length) * 100}%` }}
                                        />
                                    </div>

                                    {/* Timeline items */}
                                    <div className="relative">
                                        {/* Vertical line */}
                                        <div className="bg-fsc-cream-dark absolute top-0 bottom-0 left-2.75 w-0.5" />

                                        <div className="space-y-5">
                                            {timeline.map((item, i) => (
                                                <div key={i} className="relative flex gap-3 pl-7">
                                                    {/* Dot */}
                                                    <div
                                                        className={`absolute top-0.5 left-0 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                                                            item.unlocked ? "border-fsc-green bg-fsc-green" : "border-fsc-cream-dark bg-white"
                                                        }`}
                                                    >
                                                        {item.unlocked ? (
                                                            <ShieldCheck size={12} className="text-white" />
                                                        ) : (
                                                            <ShieldOff size={12} className="text-fsc-stone/50" />
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div>
                                                        <div
                                                            className={`text-sm leading-tight font-medium ${
                                                                item.unlocked ? "text-fsc-navy" : "text-fsc-stone"
                                                            }`}
                                                        >
                                                            {item.label}
                                                        </div>
                                                        <div className="text-fsc-stone mt-0.5 text-xs">
                                                            {item.months} month{item.months !== 1 ? "s" : ""} membership
                                                        </div>
                                                        {item.unlocked && (
                                                            <span className="bg-fsc-green/10 text-fsc-green mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium">
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

            {showAddMember && <AddMemberModal onClose={() => setShowAddMember(false)} onSuccess={() => refetch()} />}

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
