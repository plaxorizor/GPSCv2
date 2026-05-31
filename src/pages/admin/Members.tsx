// admin/Members.tsx
import React, { useState } from "react";
import { Plus, Search, Download } from "lucide-react";
import { PACKAGE_INFO } from "../../utils/types";
import AllMembers from "./AllMembers";

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
    loading: boolean;
    onUpdateStatus: (memberId: string, status: "Active" | "Inactive") => Promise<void>;
    onExport: () => void;
    onAddMember?: () => void;
}

export const Members: React.FC<Props> = ({ onUpdateStatus, onExport, onAddMember }) => {
    const [query, setQuery] = useState("");
    const [packageFilter, setPackageFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div className="text-gpsc-stone text-xs tracking-wider uppercase">Management</div>
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
                    <button className="border-gpsc-cream-dark hover:bg-gpsc-cream/60 rounded-lg border px-3 py-2 text-sm transition-colors">
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
                                <th className="p-4 text-left">Rank</th>
                                <th className="p-4 text-left">Joined</th>
                                <th className="p-4 text-left">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <AllMembers
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
            {selectedMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedMember(null)}>
                    <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-display text-gpsc-navy text-xl">Member Details</h2>
                            <button
                                onClick={() => setSelectedMember(null)}
                                className="text-gpsc-stone hover:text-gpsc-navy text-lg transition-colors"
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
                                { label: "Referral code", value: selectedMember.referralCode ?? "—" },
                                { label: "City", value: selectedMember.city ?? "—" },
                                { label: "Province", value: selectedMember.province ?? "—" },
                                { label: "Civil status", value: selectedMember.civilStatus ?? "—" },
                                { label: "Birth date", value: selectedMember.birthDate ?? "—" },
                                { label: "Joined", value: selectedMember.dateCreated?.toDate?.()?.toLocaleDateString() ?? "—" },
                                { label: "Status", value: selectedMember.status ?? "—" },
                            ].map(({ label, value }) => (
                                <div key={label}>
                                    <div className="text-gpsc-stone mb-0.5 text-xs">{label}</div>
                                    <div
                                        className={`text-sm font-medium ${
                                            label === "Status" ? (value === "active" ? "text-gpsc-green" : "text-red-500") : "text-gpsc-navy"
                                        }`}
                                    >
                                        {value}
                                    </div>
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
                                className="border-gpsc-cream-dark text-gpsc-stone hover:bg-gpsc-cream/60 flex-1 rounded-lg border px-4 py-2 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    onUpdateStatus(selectedMember.uid, selectedMember.status === "Active" ? "Inactive" : "Active");
                                    setSelectedMember(null);
                                }}
                                className={`flex-1 rounded-lg px-4 py-2 font-medium text-white transition-colors ${
                                    selectedMember.status === "active" ? "bg-red-500 hover:bg-red-600" : "bg-gpsc-green hover:bg-gpsc-green/80"
                                }`}
                            >
                                {selectedMember.status === "active" ? "Deactivate" : "Activate"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
