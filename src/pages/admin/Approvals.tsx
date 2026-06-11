import { useState } from "react";
import { ClipboardCheck, Search, X } from "lucide-react";
import PendingSignupsPanel from "../../components/admin/PendingSignupsPanel";
import PendingUpgradesPanel from "../../components/admin/PendingUpgradesPanel";
import PendingRenewalsPanel from "../../components/admin/PendingRenewalsPanel";
import EmptyState from "../../components/ui/EmptyState";
import type { PendingApprovalsCount } from "../../hooks/usePendingApprovalsCount";

interface Props {
    counts: PendingApprovalsCount;
    loading: boolean;
}

// Unified admin queue for everything that needs a confirmation: new signups
// (verify payment → activate), package upgrades, and membership renewals. Every
// panel is real-time (onSnapshot), so requests appear/disappear live — no refresh
// button needed. The search box filters all three panels by name / reference.
export function Approvals({ counts, loading }: Props) {
    const [search, setSearch] = useState("");

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="font-display text-fsc-navy text-3xl">Approvals</h1>
                    <p className="text-fsc-stone mt-1 text-sm">
                        New members, upgrades, and renewals awaiting your confirmation.
                    </p>
                </div>
                {counts.total > 0 && (
                    <div className="border-fsc-cream-dark focus-within:ring-fsc-green flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm focus-within:ring-2">
                        <Search size={14} className="text-fsc-stone shrink-0" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name or reference…"
                            className="placeholder:text-fsc-stone/60 w-52 bg-transparent outline-none"
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="text-fsc-stone hover:text-fsc-navy">
                                <X size={12} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            <PendingSignupsPanel search={search} />
            <PendingUpgradesPanel search={search} />
            <PendingRenewalsPanel search={search} />

            {!loading && counts.total === 0 && (
                <div className="border-fsc-cream-dark overflow-hidden rounded-2xl border bg-white">
                    <EmptyState
                        icon={ClipboardCheck}
                        title="All caught up"
                        description="There are no signups, upgrades, or renewals waiting for approval right now."
                    />
                </div>
            )}
        </div>
    );
}

export default Approvals;
