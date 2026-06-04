import React from "react";
import { Wallet, TrendingUp, Users, CheckCircle, Clock, Check } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StatCard } from "./StatCard";
import { type Member, type EarningsTrendPoint } from "../../utils/types";
import { formatCurrency, formatDate } from "../../utils/formatter";

// import ReferralCard
import ReferralCard from "./ReferralCard";

interface Props {
    member: Member;
    packageName: string;
    rankName: string;
    availableToWithdraw: number;
    totalEarned: number;
    activeReferralsCount: number;
    totalReferralsCount: number;
    approvedClaimsCount: number;
    approvedClaimsTotal: number;
    earningsTrend: EarningsTrendPoint[];
    //referralLink: string;
    onRequestPayout: () => void;
    eligibilityTimeline: Array<{ label: string; months: number; unlocked: boolean }>;
    recentCommissions: Array<{
        id: string;
        fromMemberName: string;
        fromMemberInitials: string;
        level: number;
        amount: number;
        status: string;
        date: string;
    }>;
}

export const MemberOverview: React.FC<Props> = ({
    member,
    packageName,
    rankName,
    availableToWithdraw,
    totalEarned,
    activeReferralsCount,
    totalReferralsCount,
    approvedClaimsCount,
    approvedClaimsTotal,
    earningsTrend,
    //referralLink,
    onRequestPayout,
    eligibilityTimeline,
    recentCommissions,
}) => {
    // Static QR placeholder (no random)
    //const qrPlaceholder = Array.from({ length: 49 }).map((_, i) => i % 2 === 0);

    // YAxis tick formatter
    const yAxisTickFormatter = (value: number) => `₱${value}`;

    // Tooltip formatter that safely handles any value type from recharts
    const tooltipFormatter = (value: unknown): React.ReactNode => {
        if (typeof value === "number") return formatCurrency(value);
        if (typeof value === "string") return formatCurrency(Number(value));
        return formatCurrency(0);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display text-gpsc-navy text-3xl">
                    {member.firstName} {member.lastName} <span className="text-gpsc-stone text-sm">({member.status})</span>
                </h1>
                <div className="text-gpsc-stone mt-1 text-sm">
                    {rankName} · {packageName} Care
                </div>
                <div className="text-gpsc-stone mt-1 text-sm">Member since: {member.dateCreated?.toDate?.()?.toLocaleDateString()}</div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Available to withdraw"
                    value={formatCurrency(availableToWithdraw)}
                    sub="Cleared & ready"
                    icon={Wallet}
                    actionLabel="Request Payout"
                    onAction={onRequestPayout}
                />
                <StatCard label="Total Earned" value={formatCurrency(totalEarned)} sub="Lifetime Commissions" icon={TrendingUp} />
                <StatCard label="Active Referrals" value={activeReferralsCount.toString()} sub={`${totalReferralsCount} total`} icon={Users} />
                <StatCard
                    label="Approved claims"
                    value={approvedClaimsCount.toString()}
                    sub={formatCurrency(approvedClaimsTotal)}
                    icon={CheckCircle}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="border-gpsc-cream-dark rounded-2xl border bg-white p-6 lg:col-span-2">
                    <h2 className="font-display text-gpsc-navy mb-1 text-lg">Earnings Trend</h2>
                    <p className="text-gpsc-stone mb-6 text-xs">Last 6 months</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={earningsTrend}>
                            <defs>
                                <linearGradient id="earnings-grad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#5DAB3A" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="#5DAB3A" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B6862" }} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={yAxisTickFormatter} tick={{ fontSize: 11, fill: "#6B6862" }} axisLine={false} tickLine={false} />
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5DDC8" />
                            <Tooltip formatter={tooltipFormatter} contentStyle={{ borderRadius: 12, border: "1px solid #E5DDC8" }} />
                            <Area type="monotone" dataKey="amount" stroke="#4A8A2C" strokeWidth={2} fill="url(#earnings-grad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <ReferralCard member={member} />
            </div>

            <div className="border-gpsc-cream-dark rounded-2xl border bg-white p-6">
                <h2 className="font-display text-gpsc-navy mb-4 text-lg">Eligibility Timeline</h2>
                <div className="space-y-3">
                    {eligibilityTimeline.map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.unlocked ? "bg-gpsc-green text-white" : "bg-gpsc-cream-dark text-gpsc-stone"}`}
                            >
                                {item.unlocked ? <Check size={14} /> : <Clock size={14} />}
                            </div>
                            <div className="flex-1">
                                <div className="text-gpsc-navy text-sm">{item.label}</div>
                                <div className="text-gpsc-stone text-xs">
                                    After {item.months} months · {item.unlocked ? "Active" : "Unlocks Soon"}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-gpsc-cream-dark rounded-2xl border bg-white p-6">
                <h2 className="font-display text-gpsc-navy mb-4 text-lg">Recent Commissions</h2>
                {recentCommissions.length === 0 ? (
                    <div className="text-gpsc-stone py-6 text-center text-sm">
                        No commissions yet — share your referral link to start earning.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentCommissions.map((c) => {
                            const isPaid = c.status === "released" || c.status === "paid";
                            const statusLabel = isPaid ? "Paid" : "Pending";
                            const statusClass = isPaid ? "text-gpsc-green" : "text-amber-600";
                            return (
                                <div key={c.id} className="border-gpsc-cream-dark flex items-center gap-4 border-b py-2 last:border-0">
                                    <div className="bg-gpsc-cream-dark text-gpsc-navy font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs">
                                        {c.fromMemberInitials}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-gpsc-navy text-sm">{c.fromMemberName}</div>
                                        <div className="text-gpsc-stone text-xs">
                                            Level {c.level} commission · {formatDate(c.date)}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-gpsc-navy font-medium">+{formatCurrency(c.amount)}</div>
                                        <div className={`text-xs ${statusClass}`}>{statusLabel}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
