// admin/Upgrades.tsx
//
// Pending package-upgrade requests: members who paid the price difference offline
// and are waiting for an admin to verify the payment and apply the upgrade.
// LAYOUT ONLY — uses static mock data. TODO(backend): wire to firebase/upgrades.
import React, { useState } from "react";
import { ArrowUpCircle, Clock, CheckCircle, Search, X, Hash, RefreshCw } from "lucide-react";
import { packageLabel } from "../../utils/upgrade";
import { formatCurrency, formatDate } from "./utils";

interface UpgradeRow {
    id: string;
    memberName: string;
    memberId: string;
    fromPackage: string;
    toPackage: string;
    amountDue: number;
    referenceNumber: string;
    dateRequested: string;
}

// TODO(backend): replace with getPendingUpgradeRequests().
const MOCK_UPGRADES: UpgradeRow[] = [
    {
        id: "u1",
        memberName: "Maria Santos",
        memberId: "FSC-001245",
        fromPackage: "basic",
        toPackage: "family",
        amountDue: 3000,
        referenceNumber: "1029 3847 5610",
        dateRequested: "2026-06-06",
    },
    {
        id: "u2",
        memberName: "Juan Dela Cruz",
        memberId: "FSC-000981",
        fromPackage: "family",
        toPackage: "premium",
        amountDue: 5000,
        referenceNumber: "7741 0093 2218",
        dateRequested: "2026-06-05",
    },
    {
        id: "u3",
        memberName: "Ana Reyes",
        memberId: "FSC-001310",
        fromPackage: "basic",
        toPackage: "premium",
        amountDue: 8000,
        referenceNumber: "5523 8890 1004",
        dateRequested: "2026-06-03",
    },
];

export const Upgrades: React.FC = () => {
    const [requests, setRequests] = useState<UpgradeRow[]>(MOCK_UPGRADES);
    const [search, setSearch] = useState("");
    const [busyId, setBusyId] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // No backend — actions just drop the row from the local list for now.
    const act = (id: string) => {
        setBusyId(id);
        setRequests((prev) => prev.filter((r) => r.id !== id));
        setBusyId(null);
    };

    // TODO(backend): re-fetch from getPendingUpgradeRequests(). For now, just
    // restore the mock list with a brief spinner so the control behaves.
    const refresh = () => {
        if (refreshing) return;
        setRefreshing(true);
        setTimeout(() => {
            setRequests(MOCK_UPGRADES);
            setRefreshing(false);
        }, 500);
    };

    const filtered = requests.filter((r) => {
        const q = search.trim().toLowerCase();
        return (
            !q ||
            r.memberName.toLowerCase().includes(q) ||
            r.memberId.toLowerCase().includes(q) ||
            r.referenceNumber.toLowerCase().includes(q)
        );
    });

    const totalDue = requests.reduce((s, r) => s + r.amountDue, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <div className="text-fsc-stone text-xs tracking-wider uppercase">Upgrade management</div>
                    <h1 className="font-display text-fsc-navy text-3xl">Pending Upgrades</h1>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="border-fsc-cream-dark rounded-2xl border bg-white p-6">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9922A]/10">
                            <Clock size={20} className="text-[#C9922A]" />
                        </div>
                        <div>
                            <div className="font-display text-fsc-navy text-2xl">{requests.length}</div>
                            <div className="text-fsc-stone text-xs">Pending Requests</div>
                        </div>
                    </div>
                    <div className="text-fsc-stone text-sm">Members waiting for payment verification</div>
                </div>
                <div className="border-fsc-cream-dark rounded-2xl border bg-white p-6">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="bg-fsc-green/10 flex h-10 w-10 items-center justify-center rounded-full">
                            <ArrowUpCircle size={20} className="text-fsc-green" />
                        </div>
                        <div>
                            <div className="font-display text-fsc-navy text-2xl">{formatCurrency(totalDue)}</div>
                            <div className="text-fsc-stone text-xs">Total Being Paid</div>
                        </div>
                    </div>
                    <div className="text-fsc-stone text-sm">Combined upgrade difference across requests</div>
                </div>
            </div>

            {/* Pending list */}
            <div className="border-fsc-cream-dark overflow-hidden rounded-2xl border bg-white">
                <div className="border-fsc-cream-dark flex flex-wrap items-center justify-between gap-3 border-b p-4">
                    <div>
                        <h2 className="font-display text-fsc-navy text-lg">Upgrade Requests</h2>
                        <p className="text-fsc-stone text-xs">Verify the reference number against your receipts, then confirm</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="border-fsc-cream-dark focus-within:ring-fsc-green flex items-center gap-2 rounded-lg border px-3 py-2 text-sm focus-within:ring-2">
                            <Search size={14} className="text-fsc-stone shrink-0" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search member, ID, or reference…"
                                className="w-52 bg-transparent outline-none placeholder:text-fsc-stone/60"
                            />
                            {search && (
                                <button onClick={() => setSearch("")} className="text-fsc-stone hover:text-fsc-navy">
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={refresh}
                            disabled={refreshing}
                            className="border-fsc-cream-dark hover:bg-fsc-cream/60 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors disabled:opacity-60"
                        >
                            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                            Refresh
                        </button>
                    </div>
                </div>

                <div className={`overflow-x-auto transition-opacity ${refreshing ? "opacity-40" : ""}`}>
                    <table className="w-full text-sm">
                        <thead className="bg-fsc-cream/50 text-fsc-stone text-xs tracking-wider uppercase">
                            <tr>
                                <th className="p-4 text-left">Member</th>
                                <th className="p-4 text-left">Upgrade</th>
                                <th className="p-4 text-right">Amount Paid</th>
                                <th className="p-4 text-left">Reference No.</th>
                                <th className="p-4 text-left">Requested</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r) => (
                                <tr key={r.id} className="border-fsc-cream-dark hover:bg-fsc-cream/40 border-t transition-colors">
                                    <td className="p-4">
                                        <div className="text-fsc-navy font-medium">{r.memberName}</div>
                                        <div className="text-fsc-stone text-xs">{r.memberId}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-fsc-navy">
                                            {packageLabel(r.fromPackage)} → <strong>{packageLabel(r.toPackage)}</strong> Care
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="text-fsc-navy font-medium">{formatCurrency(r.amountDue)}</div>
                                        <div className="text-fsc-stone text-xs">difference</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-fsc-navy flex items-center gap-1 font-mono text-xs">
                                            <Hash size={12} className="text-fsc-stone" />
                                            {r.referenceNumber}
                                        </div>
                                    </td>
                                    <td className="text-fsc-stone p-4 text-sm">{formatDate(r.dateRequested)}</td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => act(r.id)}
                                                disabled={busyId === r.id}
                                                className="border-fsc-cream-dark text-fsc-stone hover:bg-fsc-cream/60 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => act(r.id)}
                                                disabled={busyId === r.id}
                                                className="bg-fsc-green hover:bg-fsc-green-light flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors disabled:opacity-50"
                                            >
                                                <CheckCircle size={12} /> Confirm payment & upgrade
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="px-6 py-14 text-center">
                                            {search ? (
                                                <>
                                                    <div className="bg-fsc-cream mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                                                        <Search size={22} className="text-fsc-stone" />
                                                    </div>
                                                    <div className="font-display text-fsc-navy text-lg">No matches</div>
                                                    <div className="text-fsc-stone mt-1 text-sm">Try adjusting your search.</div>
                                                    <button
                                                        onClick={() => setSearch("")}
                                                        className="text-fsc-green mt-4 text-sm hover:underline"
                                                    >
                                                        Clear search
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="bg-fsc-cream mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                                                        <CheckCircle size={22} className="text-fsc-stone" />
                                                    </div>
                                                    <div className="font-display text-fsc-navy text-lg">All clear</div>
                                                    <div className="text-fsc-stone mt-1 text-sm">No upgrade requests are waiting to be verified.</div>
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
