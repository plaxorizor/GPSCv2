import React, { useState } from "react";
import { Wallet, Clock, TrendingUp, RefreshCw } from "lucide-react";
import { StatCard } from "../../components/member/StatCard";
import type { Commission, Payout } from "../../utils/types";
import { formatCurrency, formatDate } from "../../utils/formatter";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import { isEligible, daysUntilEligible } from "../../utils/commission";

interface Props {
    availableToWithdraw: number;
    pendingHold: number;
    lifetimePaid: number;
    commissions: Commission[];
    payouts: Payout[];
    onRequestPayout: () => void;
    membershipActive?: boolean; // payouts are blocked unless the membership is active
    onRefreshCommissions?: () => void | Promise<void>;
    onRefreshPayouts?: () => void | Promise<void>;
}

export const MemberEarnings: React.FC<Props> = ({
    availableToWithdraw,
    pendingHold,
    lifetimePaid,
    commissions,
    payouts,
    onRequestPayout,
    membershipActive = true,
    onRefreshCommissions,
    onRefreshPayouts,
}) => {
    // Track WHICH refresh was triggered so only that control spins and only the
    // relevant table dims (mirrors the admin pages). "all" = page-level refresh.
    const [activeRefresh, setActiveRefresh] = useState<null | "all" | "commissions" | "payouts">(null);

    const triggerRefresh = async (key: "all" | "commissions" | "payouts") => {
        if (activeRefresh) return;
        setActiveRefresh(key);
        const started = Date.now();
        const tasks: Array<void | Promise<void>> = [];
        if (key === "all" || key === "commissions") tasks.push(onRefreshCommissions?.());
        if (key === "all" || key === "payouts") tasks.push(onRefreshPayouts?.());
        try {
            await Promise.all(tasks);
        } finally {
            // Keep the spinner visible for a short minimum so a fast refetch still registers.
            const elapsed = Date.now() - started;
            setTimeout(() => setActiveRefresh(null), Math.max(0, 500 - elapsed));
        }
    };

    const hasRefresh = !!(onRefreshCommissions || onRefreshPayouts);
    const commissionsDimmed = activeRefresh === "commissions" || activeRefresh === "all";
    const payoutsDimmed = activeRefresh === "payouts" || activeRefresh === "all";

    return (
    <div className="space-y-6">
        <div className="flex items-end justify-between">
            <h1 className="font-display text-fsc-navy text-3xl">Earnings</h1>
            {hasRefresh && (
                <button
                    onClick={() => triggerRefresh("all")}
                    disabled={activeRefresh === "all"}
                    className="text-fsc-green flex items-center gap-1 text-xs transition-colors hover:underline disabled:opacity-60"
                >
                    <RefreshCw size={16} className={activeRefresh === "all" ? "animate-spin" : ""} /> Refresh
                </button>
            )}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Available" value={formatCurrency(availableToWithdraw)} sub="Ready to claim" icon={Wallet} />
            <StatCard label="Pending hold" value={formatCurrency(pendingHold)} sub="Level 2–6 · 7-day hold" icon={Clock} />
            <StatCard label="Lifetime paid" value={formatCurrency(lifetimePaid)} sub="Since joining" icon={TrendingUp} />
        </div>
        <div className="border-fsc-cream-dark overflow-hidden rounded-2xl border bg-white">
            <div className="border-fsc-cream-dark flex flex-wrap items-center justify-between gap-4 border-b p-6">
                <div>
                    <h2 className="font-display text-fsc-navy text-lg">Commissions</h2>
                    <p className="text-fsc-stone text-xs">Every commission earned, by source</p>
                </div>
                <div className="flex items-center gap-2">
                    {onRefreshCommissions && (
                        <button
                            onClick={() => triggerRefresh("commissions")}
                            disabled={activeRefresh === "commissions"}
                            className="border-fsc-cream-dark hover:bg-fsc-cream/60 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors disabled:opacity-60"
                        >
                            <RefreshCw size={14} className={activeRefresh === "commissions" ? "animate-spin" : ""} />
                            Refresh
                        </button>
                    )}
                    <button
                        onClick={onRequestPayout}
                        disabled={!membershipActive}
                        title={membershipActive ? undefined : "Renew your membership to request a payout"}
                        className="bg-fsc-green rounded-lg px-4 py-2 text-xs font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Request Payout
                    </button>
                </div>
            </div>
            <div className={`overflow-x-auto transition-opacity ${commissionsDimmed ? "opacity-40" : ""}`}>
                <table className="w-full text-sm">
                    <thead className="bg-fsc-cream/50 text-fsc-stone text-xs tracking-wider uppercase">
                        <tr>
                            <th className="p-4 text-left">Date</th>
                            <th className="p-4 text-left">From Member</th>
                            <th className="p-4 text-left">Level</th>
                            <th className="p-4 text-right">Amount</th>
                            <th className="p-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {commissions.map((c) => (
                            <tr key={c.id} className="border-fsc-cream-dark border-t">
                                <td className="text-fsc-stone p-4">{formatDate(c.date)}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-fsc-navy">{c.fromMemberName}</span>
                                        {c.reason === "upgrade" && (
                                            <span className="bg-fsc-navy/10 text-fsc-navy inline-block rounded-full px-2 py-0.5 text-[10px] font-medium">
                                                Upgrade
                                            </span>
                                        )}
                                        {c.reason === "renewal" && (
                                            <span className="bg-fsc-green/12 text-fsc-green inline-block rounded-full px-2 py-0.5 text-[10px] font-medium">
                                                Renewal
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-fsc-stone text-xs">{c.fromMemberCity}</div>
                                </td>
                                <td className="text-fsc-stone p-4">L{c.level}</td>
                                <td className="text-fsc-navy p-4 text-right font-medium">+{formatCurrency(c.amount)}</td>
                                <td className="p-4 text-right">
                                    {c.status === "pending" ? (
                                        isEligible(c.level, c.date) ? (
                                            <span className="inline-block rounded-full bg-[#16A34A]/12 px-2.5 py-1 text-xs font-medium text-[#15803D]">
                                                Claimable
                                            </span>
                                        ) : (
                                            <span className="inline-block rounded-full bg-[#EAB308]/20 px-2.5 py-1 text-xs font-medium text-[#854D0E]">
                                                In {daysUntilEligible(c.level, c.date)}d
                                            </span>
                                        )
                                    ) : (
                                        <StatusBadge status={c.status} />
                                    )}
                                </td>
                            </tr>
                        ))}
                        {commissions.length === 0 && (
                            <tr>
                                <td colSpan={5}>
                                    <EmptyState
                                        icon={TrendingUp}
                                        title="No commissions yet"
                                        description="Commissions you earn from your referral network will show up here."
                                        compact
                                    />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        <div className="border-fsc-cream-dark overflow-hidden rounded-2xl border bg-white">
            <div className="border-fsc-cream-dark flex flex-wrap items-center justify-between gap-4 border-b p-6">
                <h2 className="font-display text-fsc-navy text-lg">Payout history</h2>
                {onRefreshPayouts && (
                    <button
                        onClick={() => triggerRefresh("payouts")}
                        disabled={activeRefresh === "payouts"}
                        className="border-fsc-cream-dark hover:bg-fsc-cream/60 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors disabled:opacity-60"
                    >
                        <RefreshCw size={14} className={activeRefresh === "payouts" ? "animate-spin" : ""} />
                        Refresh
                    </button>
                )}
            </div>
            <div className={`overflow-x-auto transition-opacity ${payoutsDimmed ? "opacity-40" : ""}`}>
                <table className="w-full text-sm">
                    <thead className="bg-fsc-cream/50 text-fsc-stone text-xs tracking-wider uppercase">
                        <tr>
                            <th className="p-4 text-left">Requested</th>
                            <th className="p-4 text-left">Method</th>
                            <th className="p-4 text-left">Reference</th>
                            <th className="p-4 text-right">Amount</th>
                            <th className="p-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payouts.map((p) => (
                            <tr key={p.id} className="border-fsc-cream-dark border-t">
                                <td className="text-fsc-stone p-4">{formatDate(p.dateRequested)}</td>
                                <td className="p-4">
                                    <div className="text-fsc-navy capitalize">{p.method}</div>
                                    {p.accountNumber && (
                                        <div className="text-fsc-stone font-mono text-xs">{p.accountNumber}</div>
                                    )}
                                </td>
                                <td className="text-fsc-stone p-4 font-mono text-xs">{p.reference || "—"}</td>
                                <td className="text-fsc-navy p-4 text-right font-medium">{formatCurrency(p.amount)}</td>
                                <td className="p-4 text-right">
                                    <StatusBadge status={p.status} />
                                </td>
                            </tr>
                        ))}
                        {payouts.length === 0 && (
                            <tr>
                                <td colSpan={5}>
                                    <EmptyState
                                        icon={Wallet}
                                        title="No payouts yet"
                                        description="Once you request a payout, its status and reference will appear here."
                                        compact
                                    />
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
