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
            <h1 className="font-display text-fsc-navy text-3xl">Earnings</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Available" value={formatCurrency(availableToWithdraw)} sub="Ready to withdraw" icon={Wallet} />
            <StatCard label="Pending hold" value={formatCurrency(pendingHold)} sub="Pending admin release" icon={Clock} />
            <StatCard label="Lifetime paid" value={formatCurrency(lifetimePaid)} sub="Since joining" icon={TrendingUp} />
        </div>
        <div className="border-fsc-cream-dark overflow-hidden rounded-2xl border bg-white">
            <div className="border-fsc-cream-dark flex flex-wrap items-center justify-between gap-4 border-b p-6">
                <div>
                    <h2 className="font-display text-fsc-navy text-lg">Commissions</h2>
                    <p className="text-fsc-stone text-xs">Every commission earned, by source</p>
                </div>
                <div className="flex gap-2">
                    <button className="border-fsc-cream-dark flex items-center gap-1 rounded-lg border px-3 py-2 text-xs">
                        <Download size={12} /> CSV
                    </button>
                    <button onClick={onRequestPayout} className="bg-fsc-green rounded-lg px-4 py-2 text-xs font-medium text-white">
                        Request Payout
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
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
                                    <div className="text-fsc-navy">{c.fromMemberName}</div>
                                    <div className="text-fsc-stone text-xs">{c.fromMemberCity}</div>
                                </td>
                                <td className="text-fsc-stone p-4">L{c.level}</td>
                                <td className="text-fsc-navy p-4 text-right font-medium">+{formatCurrency(c.amount)}</td>
                                <td className="p-4 text-right">
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs ${
                                            c.status === "paid" ? "bg-fsc-green/10 text-fsc-green" : "bg-[#C9922A]/10 text-[#A87820]"
                                        }`}
                                    >
                                        {c.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {commissions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-fsc-stone p-8 text-center">
                                    No commissions yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        <div className="border-fsc-cream-dark overflow-hidden rounded-2xl border bg-white">
            <div className="border-fsc-cream-dark border-b p-6">
                <h2 className="font-display text-fsc-navy text-lg">Payout history</h2>
            </div>
            <div className="overflow-x-auto">
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
                                <td className="text-fsc-stone p-4">{formatDate(p.requestedAt)}</td>
                                <td className="p-4">
                                    <div className="text-fsc-navy capitalize">{p.method}</div>
                                    {p.accountNumber && (
                                        <div className="text-fsc-stone font-mono text-xs">{p.accountNumber}</div>
                                    )}
                                </td>
                                <td className="text-fsc-stone p-4 font-mono text-xs">{p.reference || "—"}</td>
                                <td className="text-fsc-navy p-4 text-right font-medium">{formatCurrency(p.amount)}</td>
                                <td className="p-4 text-right">
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs ${
                                            p.status === "sent" ? "bg-fsc-green/10 text-fsc-green" : "bg-[#C9922A]/10 text-[#A87820]"
                                        }`}
                                    >
                                        {p.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {payouts.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-fsc-stone p-8 text-center">
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
