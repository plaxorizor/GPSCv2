// admin/Members.tsx
import React, { useState } from "react";
import { Plus, Search, Download } from "lucide-react";
import type { User } from "../types";
import { formatDate } from "./utils";

import AllMembers from "./AllMembers";

interface Props {
    members: User[];
    loading: boolean;
    onUpdateStatus: (memberId: string, status: "active" | "inactive") => Promise<void>;
    onRefresh: () => void;
    onExport: () => void;
    onAddMember?: () => void;
}

const packageNames: Record<string, string> = { basic: "Basic Care", family: "Family Care", premium: "Premium Care" };
const rankNames: Record<string, string> = {
    sales_consultant: "Sales Consultant",
    team_consultant: "Team Consultant",
    sales_manager: "Sales Manager",
    provincial_director: "Provincial Director",
    regional_director: "Regional Director",
    national_director: "National Director",
};

export const Members: React.FC<Props> = ({ onUpdateStatus, onRefresh, onExport, onAddMember }) => {
    const [query, setQuery] = useState("");
    const [packageFilter, setPackageFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedMember, setSelectedMember] = useState<User | null>(null);

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
                    <div className="relative min-w-[200px] flex-1">
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
                        <option value="basic">Basic Care</option>
                        <option value="family">Family Care</option>
                        <option value="premium">Premium Care</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border-gpsc-cream-dark focus:ring-gpsc-green rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                    >
                        <option value="all">All statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending_kyc">Pending KYC</option>
                    </select>
                    <button
                        onClick={onRefresh}
                        className="border-gpsc-cream-dark hover:bg-gpsc-cream/60 rounded-lg border px-3 py-2 text-sm transition-colors"
                    >
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

                        <AllMembers />
                    </table>
                </div>
            </div>

            {/* Member Detail Modal */}
            {selectedMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedMember(null)}>
                    <div className="animate-fade-up mx-4 w-full max-w-lg rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-display text-gpsc-navy text-xl">Member Details</h2>
                            <button onClick={() => setSelectedMember(null)} className="text-gpsc-stone hover:text-gpsc-navy transition-colors">
                                ✕
                            </button>
                        </div>
                        <div className="bg-gpsc-cream mb-6 flex items-center gap-4 rounded-xl p-4">
                            <div className="bg-gpsc-navy font-display flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white">
                                {selectedMember.initials}
                            </div>
                            <div>
                                <div className="font-display text-gpsc-navy text-xl">
                                    {selectedMember.firstName} {selectedMember.lastName}
                                </div>
                                <div className="text-gpsc-stone text-sm">{selectedMember.email}</div>
                                <div className="text-gpsc-stone text-sm">{selectedMember.phone}</div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className="text-gpsc-stone text-xs">Package</div>
                                    <div className="text-gpsc-navy">{selectedMember.packageId ? packageNames[selectedMember.packageId] : "—"}</div>
                                </div>
                                <div>
                                    <div className="text-gpsc-stone text-xs">Rank</div>
                                    <div className="text-gpsc-navy">{rankNames[selectedMember.rankId] || "Member"}</div>
                                </div>
                                <div>
                                    <div className="text-gpsc-stone text-xs">City</div>
                                    <div className="text-gpsc-navy">{selectedMember.city || "—"}</div>
                                </div>
                                <div>
                                    <div className="text-gpsc-stone text-xs">Province</div>
                                    <div className="text-gpsc-navy">{selectedMember.province || "—"}</div>
                                </div>
                                <div>
                                    <div className="text-gpsc-stone text-xs">Member since</div>
                                    <div className="text-gpsc-navy">{formatDate(selectedMember.memberSince)}</div>
                                </div>
                                <div>
                                    <div className="text-gpsc-stone text-xs">Status</div>
                                    <div className={`${selectedMember.status === "active" ? "text-gpsc-green" : "text-red-500"}`}>
                                        {selectedMember.status}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setSelectedMember(null)}
                                className="border-gpsc-cream-dark text-gpsc-stone hover:bg-gpsc-cream/60 flex-1 rounded-lg border px-4 py-2 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    onUpdateStatus(selectedMember.id, selectedMember.status === "active" ? "inactive" : "active");
                                    setSelectedMember(null);
                                }}
                                className="bg-gpsc-navy hover:bg-gpsc-green flex-1 rounded-lg px-4 py-2 font-medium text-white transition-colors"
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
