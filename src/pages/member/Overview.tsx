import React, { useState } from "react";
import { Wallet, TrendingUp, Users, CheckCircle, Clock, Check, ShieldAlert, Rocket, Crown, X } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StatCard } from "./StatCard";
import { type Member, type EarningsTrendPoint } from "../../utils/types";
import { formatCurrency, formatDate } from "../../utils/formatter";
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
    onRequestPayout: () => void;
    onComparePackages: () => void;
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

// ─── Upgrade Banner ───────────────────────────────────────────────────────────

const PACKAGES = [
    { name: "basic", Icon: Check },
    { name: "Family", Icon: Users },
    { name: "Premium", Icon: Crown },
] as const;

const UpgradeBanner: React.FC<{ packageName: string; onComparePackages: () => void }> = ({ packageName, onComparePackages }) => {
    const [dismissed, setDismissed] = useState(false);

    const currentIndex = PACKAGES.findIndex((p) => p.name.toLowerCase() === packageName.toLowerCase());

    // Hide if already on Premium, not found, or dismissed
    if (dismissed || currentIndex === -1 || currentIndex === PACKAGES.length - 1) return null;

    return (
        <div className="border-fsc-cream-dark bg-fsc-cream relative flex items-center gap-5 overflow-hidden rounded-2xl border px-6 py-5">
            {/* Gold left accent bar */}
            <div className="bg-fsc-green absolute top-0 bottom-0 left-0 w-1 rounded-l-2xl" />

            {/* Icon */}
            <div className="border-fsc-cream-dark text-fsc-green flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-white">
                <Rocket size={20} />
            </div>

            {/* Body */}
            <div className="min-w-0 flex-1">
                <p className="font-display text-fsc-navy text-sm font-semibold">You're on {packageName} Care — unlock more benefits</p>
                <p className="text-fsc-stone mt-0.5 text-xs leading-relaxed">
                    Upgrade to Family or Premium Care for higher commissions, deeper level coverage, and faster payouts.
                </p>

                {/* Package progression pills */}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    {PACKAGES.map(({ name, Icon: PkgIcon }, i) => (
                        <React.Fragment key={name}>
                            <span
                                className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                    i === currentIndex
                                        ? "bg-fsc-navy border-fsc-navy text-white"
                                        : i === currentIndex + 1
                                          ? "bg-fsc-green border-fsc-green text-white"
                                          : "text-fsc-stone border-fsc-cream-dark bg-white"
                                }`}
                            >
                                <PkgIcon size={11} />
                                {name}
                            </span>
                            {i < PACKAGES.length - 1 && (
                                <span className="text-fsc-stone text-xs" aria-hidden="true">
                                    ›
                                </span>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 flex-col items-end gap-2">
                <button
                    onClick={onComparePackages}
                    className="bg-fsc-green hover:bg-fsc-green-light rounded-xl px-4 py-2 text-xs font-medium whitespace-nowrap text-white transition-colors"
                >
                    Upgrade →
                </button>
                <button
                    onClick={onComparePackages}
                    className="text-fsc-stone hover:text-fsc-navy text-xs underline underline-offset-2 transition-colors"
                >
                    Compare packages
                </button>
            </div>

            {/* Dismiss */}
            <button
                className="text-fsc-stone hover:text-fsc-navy absolute top-3 right-3 transition-colors"
                onClick={() => setDismissed(true)}
                aria-label="Dismiss upgrade banner"
            >
                <X size={14} />
            </button>
        </div>
    );
};

// ─── Contestability Card ──────────────────────────────────────────────────────

const ContestabilityCard: React.FC = () => (
    <div className="border-fsc-cream-dark rounded-2xl border bg-white p-6">
        <div className="mb-4 flex items-start justify-between">
            <div>
                <h2 className="font-display text-fsc-navy text-lg">Contestability Period</h2>
                <p className="text-fsc-stone mt-0.5 text-xs">
                    Claims may be investigated within the first 1 month of membership. Upgrade your package within this period.
                </p>
            </div>
            {/* TODO: swap className between active/cleared based on contestability status */}
            <span className="shrink-0 rounded-full bg-[#C9922A]/10 px-3 py-1 text-xs font-medium text-[#A87820]">
                {/* TODO: "Cleared" or "Active" */}
                Active
            </span>
        </div>

        <div className="text-fsc-stone mb-2 flex items-center justify-between text-xs">
            <span>Day 1</span>
            <span>Month 1</span>
        </div>

        <div className="bg-fsc-cream-dark relative h-3 w-full overflow-hidden rounded-full">
            {/* TODO: set width to progress percentage, swap color class for cleared state */}
            <div className="h-full w-1/2 rounded-full bg-[#C9922A] transition-all duration-700" />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
            {/* TODO: replace placeholder text with computed elapsed/remaining values */}
            <span className="text-fsc-stone">— of 1 month elapsed</span>
            <span className="flex items-center gap-1 text-[#A87820]">
                <ShieldAlert size={12} /> — days remaining
            </span>
        </div>

        <div className="border-fsc-cream-dark mt-4 grid grid-cols-3 gap-3 border-t pt-4">
            <div>
                <div className="text-fsc-stone text-xs">Period start</div>
                {/* TODO: fill with member enrollment date */}
                <div className="text-fsc-navy mt-0.5 text-sm">—</div>
            </div>
            <div>
                <div className="text-fsc-stone text-xs">Period end</div>
                {/* TODO: fill with enrollment date + 1 month */}
                <div className="text-fsc-navy mt-0.5 text-sm">—</div>
            </div>
            <div>
                <div className="text-fsc-stone text-xs">Progress</div>
                {/* TODO: fill with percentage */}
                <div className="text-fsc-navy mt-0.5 text-sm font-medium">—%</div>
            </div>
        </div>

        <div className="mt-4 rounded-xl bg-[#C9922A]/8 px-4 py-3" style={{ background: "rgba(201,146,42,0.08)" }}>
            <p className="text-xs font-medium text-[#A87820]">Upgrade required within 1 month</p>
            <p className="text-fsc-stone mt-1 text-xs leading-relaxed">
                Members must upgrade their package within the contestability period. Claims filed before an upgrade is completed may be subject to
                investigation or denial.
            </p>
        </div>
    </div>
);

// ─── Main Overview ────────────────────────────────────────────────────────────

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
    onRequestPayout,
    onComparePackages,
    eligibilityTimeline,
    recentCommissions,
}) => {
    const yAxisTickFormatter = (value: number) => `₱${value}`;

    const tooltipFormatter = (value: unknown): React.ReactNode => {
        if (typeof value === "number") return formatCurrency(value);
        if (typeof value === "string") return formatCurrency(Number(value));
        return formatCurrency(0);
    };

    return (
        <div className="space-y-6">
            {/* Member header */}
            <div>
                <h1 className="font-display text-fsc-navy text-3xl">
                    {member.firstName} {member.lastName} <span className="text-fsc-stone text-sm">({member.status})</span>
                </h1>
                <div className="text-fsc-stone mt-1 text-sm">
                    {rankName} · {packageName} Care
                </div>
                <div className="text-fsc-stone mt-1 text-sm">Member since: {member.dateCreated?.toDate?.()?.toLocaleDateString()}</div>
            </div>

            {/* Upgrade Banner — hidden automatically for Premium members */}
            <UpgradeBanner packageName={packageName} onComparePackages={onComparePackages} />

            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Available to withdraw"
                    value={formatCurrency(availableToWithdraw)}
                    sub="Cleared & ready"
                    icon={Wallet}
                    actionLabel="Request payout"
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

            {/* Eligibility Timeline + Referral card + Earnings Trend */}
            <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="border-fsc-cream-dark rounded-2xl border bg-white p-6 lg:col-span-2">
                        <h2 className="font-display text-fsc-navy mb-4 text-lg">Eligibility Timeline</h2>
                        <div className="space-y-3">
                            {eligibilityTimeline.map((item, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.unlocked ? "bg-fsc-green text-white" : "bg-fsc-cream-dark text-fsc-stone"}`}
                                    >
                                        {item.unlocked ? <Check size={14} /> : <Clock size={14} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-fsc-navy text-sm">{item.label}</div>
                                        <div className="text-fsc-stone text-xs">
                                            After {item.months} months · {item.unlocked ? "Active" : "Unlocks Soon"}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <ReferralCard member={member} />
                </div>

                {/* Earnings Trend - placed at the bottom */}
                <div className="border-fsc-cream-dark rounded-2xl border bg-white p-6">
                    <h2 className="font-display text-fsc-navy mb-1 text-lg">Earnings Trend</h2>
                    <p className="text-fsc-stone mb-6 text-xs">Last 6 months</p>
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
            </div>

            {/* Contestability Period */}
            <ContestabilityCard />

            {/* Recent Activity */}
            <div className="border-fsc-cream-dark rounded-2xl border bg-white p-6">
                <h2 className="font-display text-fsc-navy mb-4 text-lg">Recent Activity</h2>
                <div className="space-y-3">
                    {recentCommissions.map((c) => (
                        <div key={c.id} className="border-fsc-cream-dark flex items-center gap-4 border-b py-2 last:border-0">
                            <div className="bg-fsc-cream-dark text-fsc-navy font-display flex h-8 w-8 items-center justify-center rounded-full text-xs">
                                {c.fromMemberInitials}
                            </div>
                            <div className="flex-1">
                                <div className="text-fsc-navy text-sm">{c.fromMemberName}</div>
                                <div className="text-fsc-stone text-xs">
                                    Level {c.level} commission · {formatDate(c.date)}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-fsc-navy font-medium">+{formatCurrency(c.amount)}</div>
                                <div
                                    className={`text-xs ${c.status === "paid" ? "text-fsc-green" : c.status === "pending" ? "text-[#A87820]" : "text-fsc-stone"}`}
                                >
                                    {c.status}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
