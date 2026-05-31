import React from "react";
import { Wallet, Clock, TrendingUp, Download } from "lucide-react";
import { StatCard } from "./StatCard";
import type { Commission, Payout } from "../../utils/types";
import { formatCurrency, formatDate } from "../../utils/formatter";

interface Props {
    availableToWithdraw: number;
    pendingHold: number;
    lifetimePaid: number;
    commissions: Commission[];
    payouts: Payout[];
    onRequestPayout: () => void;
}

export const MemberEarnings: React.FC<Props> = ({ availableToWithdraw, pendingHold, lifetimePaid, commissions, payouts, onRequestPayout }) => (
    <div className="space-y-6">
        <div>
            <div className="text-gpsc-stone text-xs tracking-wider uppercase">Money in, money out</div>
            <h1 className="font-display text-gpsc-navy text-3xl">Earnings</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Available" value={formatCurrency(availableToWithdraw)} sub="Ready to withdraw" icon={Wallet} />
            <StatCard label="Pending hold" value={formatCurrency(pendingHold)} sub="Clears after 7 days" icon={Clock} />
            <StatCard label="Lifetime paid" value={formatCurrency(lifetimePaid)} sub="Since joining" icon={TrendingUp} />
        </div>
        <div className="border-gpsc-cream-dark overflow-hidden rounded-2xl border bg-white">
            <div className="border-gpsc-cream-dark flex flex-wrap items-center justify-between gap-4 border-b p-6">
                <div>
                    <h2 className="font-display text-gpsc-navy text-lg">Commission ledger</h2>
                    <p className="text-gpsc-stone text-xs">Every commission earned, by source</p>
                </div>
                <div className="flex gap-2">
                    <button className="border-gpsc-cream-dark flex items-center gap-1 rounded-lg border px-3 py-2 text-xs">
                        <Download size={12} /> CSV
                    </button>
                    <button onClick={onRequestPayout} className="bg-gpsc-green rounded-lg px-4 py-2 text-xs font-medium text-white">
                        Request payout
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gpsc-cream/50 text-gpsc-stone text-xs tracking-wider uppercase">
                        <tr>
                            <th className="p-4 text-left">Date</th>
                            <th className="p-4 text-left">From member</th>
                            <th className="p-4 text-left">Level</th>
                            <th className="p-4 text-right">Amount</th>
                            <th className="p-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {commissions.map((c) => (
                            <tr key={c.id} className="border-gpsc-cream-dark border-t">
                                <td className="text-gpsc-stone p-4">{formatDate(c.date)}</td>
                                <td className="p-4">
                                    <div className="text-gpsc-navy">{c.fromMemberName}</div>
                                    <div className="text-gpsc-stone text-xs">{c.fromMemberCity}</div>
                                </td>
                                <td className="text-gpsc-stone p-4">L{c.level}</td>
                                <td className="text-gpsc-navy p-4 text-right font-medium">+{formatCurrency(c.amount)}</td>
                                <td className="p-4 text-right">
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs ${c.status === "paid" ? "bg-gpsc-green/10 text-gpsc-green" : c.status === "pending" ? "bg-gpsc-navy/10 text-gpsc-navy" : "bg-amber-100 text-amber-700"}`}
                                    >
                                        {c.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {commissions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-gpsc-stone p-8 text-center">
                                    No commissions yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        <div className="border-gpsc-cream-dark overflow-hidden rounded-2xl border bg-white">
            <div className="border-gpsc-cream-dark border-b p-6">
                <h2 className="font-display text-gpsc-navy text-lg">Payout history</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gpsc-cream/50 text-gpsc-stone text-xs tracking-wider uppercase">
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
                            <tr key={p.id} className="border-gpsc-cream-dark border-t">
                                <td className="text-gpsc-stone p-4">{formatDate(p.requestedAt)}</td>
                                <td className="text-gpsc-navy p-4">{p.method}</td>
                                <td className="text-gpsc-stone p-4 font-mono text-xs">{p.reference || "—"}</td>
                                <td className="text-gpsc-navy p-4 text-right font-medium">{formatCurrency(p.amount)}</td>
                                <td className="p-4 text-right">
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs ${p.status === "sent" ? "bg-gpsc-green/10 text-gpsc-green" : "bg-amber-100 text-amber-700"}`}
                                    >
                                        {p.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {payouts.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-gpsc-stone p-8 text-center">
                                    No payouts yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);
