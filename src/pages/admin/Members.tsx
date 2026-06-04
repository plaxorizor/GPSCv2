// admin/Members.tsx
import React, { useState } from "react";
import { Plus, Search, Download, RefreshCw, Copy, Check, ShieldCheck, ShieldOff } from "lucide-react";
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

    const handleCopyReferralCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleUpdateStatus = async () => {
        if (!selectedMember) return;
        setActivating(true);
        await onUpdateStatus(
            selectedMember.uid,
            selectedMember.status === "active" ? "inactive" : "active",
        );
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
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by name, email, city..."
                            className="border-gpsc-cream-dark focus:ring-gpsc-green w-full rounded-lg border py-2 pr-4 pl-9 text-sm focus:ring-2 focus:outline-none"
                        />
                    </div>
                    <select
                        value={packageFilter}
                        onChange={(e) => setPackageFilter(e.target.value)}
                        className="border-gpsc-cream-dark focus:ring-gpsc-green rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                    >
                        <option value="all">All packages</option>
                        <option value="Basic">Basic Care</option>
                        <option value="Family">Family Care</option>
                        <option value="Premium">Premium Care</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border-gpsc-cream-dark focus:ring-gpsc-green rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                    >
                        <option value="all">All statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                    </select>
                    <button
                        onClick={refetch}
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
                            members={members}
                            loading={loading}
                            query={query}
                            packageFilter={packageFilter}
                            statusFilter={statusFilter}
                            onSelectMember={setSelectedMember}
                            onUpdateStatus={onUpdateStatus}
                        />
                    </table>
                </div>
            </div>

            {/* ── Member Detail Modal ── */}
            {selectedMember && (() => {
                const timeline = getEligibilityTimeline(selectedMember.dateCreated as any);
                const unlockedCount = timeline.filter(m => m.unlocked).length;
                return (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={() => { if (!activating) setSelectedMember(null); }}
                >
                    <div className="mx-4 flex w-full max-w-3xl rounded-2xl bg-white shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>

                        {/* ── LEFT PANEL: Member Details ── */}
                        <div className="flex-1 p-6 overflow-y-auto max-h-[90vh]">
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
                                                        {copied
                                                            ? <Check size={14} className="text-gpsc-green" />
                                                            : <Copy size={14} />
                                                        }
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
                                        selectedMember.status === "active" ? "bg-red-500 hover:bg-red-600" : "bg-gpsc-green hover:bg-gpsc-green/80"
                                    }`}
                                >
                                    {activating
                                        ? "Please wait..."
                                        : selectedMember.status === "active"
                                          ? "Deactivate"
                                          : "Activate"}
                                </button>
                            </div>
                        </div>

                        {/* ── RIGHT PANEL: Eligibility Timeline ── */}
                        <div className="bg-gpsc-cream/40 border-gpsc-cream-dark w-72 shrink-0 border-l p-6 overflow-y-auto max-h-[90vh]">
                            <div className="mb-1 flex items-center gap-2">
                                <ShieldCheck size={16} className="text-gpsc-navy" />
                                <h3 className="font-display text-gpsc-navy text-base">Benefit Eligibility</h3>
                            </div>
                            <p className="text-gpsc-stone mb-5 text-xs">
                                {unlockedCount} of {timeline.length} benefits unlocked
                            </p>

                            {/* Progress bar */}
                            <div className="bg-gpsc-cream-dark mb-6 h-1.5 w-full rounded-full overflow-hidden">
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
                                                className={`absolute left-0 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                                                    item.unlocked
                                                        ? "border-gpsc-green bg-gpsc-green"
                                                        : "border-gpsc-cream-dark bg-white"
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
                                                    className={`text-sm font-medium leading-tight ${
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