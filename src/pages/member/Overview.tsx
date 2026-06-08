import React, { useState } from "react";
import {
    Wallet, TrendingUp, Users, User, CheckCircle, Check, Heart, Rocket, Crown,
    ShieldCheck, Stethoscope, Award, Cake, Baby, CloudRainWind, Sparkles, type LucideIcon,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StatCard } from "./StatCard";
import { type Member, type EarningsTrendPoint } from "../../utils/types";
import { formatCurrency, formatDate } from "../../utils/formatter";
import ReferralCard from "./ReferralCard";
import FileClaimModal from "../../components/FileClaimModal";
import type { ClaimBenefit } from "../../utils/eligibility";

// Benefit → icon + brand colour, matched by keyword in the benefit label.
const benefitVisual = (label: string): { Icon: LucideIcon; color: string } => {
    const l = label.toLowerCase();
    if (l.includes("hospital")) return { Icon: Stethoscope, color: "#2563EB" }; // blue
    if (l.includes("senior")) return { Icon: Award, color: "#C9922A" }; // gold
    if (l.includes("calamit")) return { Icon: CloudRainWind, color: "#EA580C" }; // orange
    if (l.includes("maternity")) return { Icon: Baby, color: "#DB2777" }; // pink
    if (l.includes("birthday")) return { Icon: Cake, color: "#7C3AED" }; // violet
    if (l.includes("death")) return { Icon: ShieldCheck, color: "#14365C" }; // navy
    return { Icon: Sparkles, color: "#475569" }; // slate fallback
};

// Whole days until a benefit unlocks, from the eligibility base date.
const daysUntil = (base: Date | null, months: number): number | null => {
    if (!base) return null;
    const unlock = new Date(base);
    unlock.setMonth(unlock.getMonth() + months);
    return Math.ceil((unlock.getTime() - Date.now()) / 86_400_000);
};

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
    eligibilityTimeline: Array<{
        label: string;
        months: number;
        unlocked: boolean;
        amount: number;
        documents: string[];
        variableAmount?: boolean;
    }>;
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
    const currentIndex = PACKAGES.findIndex((p) => p.name.toLowerCase() === packageName.toLowerCase());

    // Hide if already on Premium or package not found
    if (currentIndex === -1 || currentIndex === PACKAGES.length - 1) return null;

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
            </div>

            {/* Actions */}
            <div className="flex shrink-0 flex-col items-end gap-2">
                <button
                    onClick={onComparePackages}
                    className="bg-fsc-green hover:bg-fsc-green-light rounded-xl px-4 py-2 text-xs font-medium whitespace-nowrap text-white transition-colors"
                >
                    Upgrade →
                </button>
            </div>

            {/* Dismiss */}
        </div>
    );
};

// ─── Beneficiaries Card ───────────────────────────────────────────────────────

const initialsOf = (name: string): string =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("");

const BeneficiariesCard: React.FC<{ beneficiaries: Member["beneficiaries"] }> = ({ beneficiaries }) => {
    const list = beneficiaries ?? [];
    return (
        <div className="border-fsc-cream-dark rounded-2xl border bg-white p-6">
            <div className="mb-4 flex items-start justify-between">
                <div>
                    <h2 className="font-display text-fsc-navy text-lg">Beneficiaries</h2>
                    <p className="text-fsc-stone mt-0.5 text-xs">People who will receive your benefits.</p>
                </div>
                <span className="bg-fsc-cream text-fsc-navy shrink-0 rounded-full px-3 py-1 text-xs font-medium">
                    {list.length} {list.length === 1 ? "beneficiary" : "beneficiaries"}
                </span>
            </div>

            {list.length === 0 ? (
                <div className="px-6 py-10 text-center">
                    <div className="bg-fsc-cream mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                        <Heart size={20} className="text-fsc-stone" />
                    </div>
                    <div className="text-fsc-navy text-sm font-medium">No beneficiaries yet</div>
                    <div className="text-fsc-stone mt-1 text-xs">Add beneficiaries from your profile to keep your coverage up to date.</div>
                </div>
            ) : (
                <div className="divide-fsc-cream-dark divide-y">
                    {list.map((b, i) => (
                        <div key={b.id ?? i} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                            <div className="bg-fsc-cream-dark text-fsc-navy font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs">
                                {initialsOf(b.name) || <Heart size={14} />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-fsc-navy truncate text-sm font-medium">{b.name || "—"}</div>
                                <div className="text-fsc-stone text-xs">{b.relationship || "—"}</div>
                            </div>
                            {b.coverage != null && (
                                <div className="text-right">
                                    <div className="text-fsc-navy text-sm font-medium">{formatCurrency(b.coverage)}</div>
                                    <div className="text-fsc-stone text-xs">coverage</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

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
    // Eligibility countdowns run from the timeline base (resets on upgrade).
    const eligBase: Date | null = member.dateEligibility?.toDate?.() ?? member.dateCreated?.toDate?.() ?? null;

    // Benefit a member is filing a claim for (opens FileClaimModal pre-selected).
    const [claimBenefit, setClaimBenefit] = useState<ClaimBenefit | null>(null);

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
                <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="text-fsc-stone">{rankName} ·</span>
                    <span className="bg-fsc-navy inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white">
                        {packageName.toLowerCase() === "basic" ? <User size={13} /> : <Users size={13} />}
                        {packageName} Care
                    </span>
                </div>

                <div className="text-fsc-stone mt-2 text-sm">Member since: {member.dateCreated?.toDate?.()?.toLocaleDateString()}</div>
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
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="font-display text-fsc-navy text-lg">Eligibility Timeline</h2>
                            <span className="bg-fsc-green/10 text-fsc-green rounded-full px-2.5 py-1 text-xs font-medium">
                                {eligibilityTimeline.filter((b) => b.unlocked).length}/{eligibilityTimeline.length} active
                            </span>
                        </div>
                        <div className="relative space-y-1">
                            {/* vertical rail behind the icons */}
                            <div className="bg-fsc-cream-dark absolute top-4 bottom-4 left-[19px] w-px" />
                            {eligibilityTimeline.map((item, i) => {
                                const { Icon, color } = benefitVisual(item.label);
                                const left = daysUntil(eligBase, item.months);
                                const countdown =
                                    left == null
                                        ? `${item.months}-month wait`
                                        : left > 60
                                          ? `~${Math.round(left / 30)} months left`
                                          : `${Math.max(1, left)} day${Math.max(1, left) === 1 ? "" : "s"} left`;
                                return (
                                    <div key={i} className="relative flex items-center gap-4 py-2">
                                        {/* icon */}
                                        <div
                                            className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-4 ring-white"
                                            style={{
                                                backgroundColor: `${color}1A`,
                                                opacity: item.unlocked ? 1 : 0.85,
                                            }}
                                        >
                                            <Icon size={18} style={{ color }} />
                                            {item.unlocked && (
                                                <span className="bg-fsc-green absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full text-white ring-2 ring-white">
                                                    <Check size={10} strokeWidth={3} />
                                                </span>
                                            )}
                                        </div>
                                        {/* text */}
                                        <div className="min-w-0 flex-1">
                                            <div className="text-fsc-navy text-sm font-medium">{item.label}</div>
                                            <div className="text-fsc-stone text-xs">Requires {item.months}-month membership</div>
                                        </div>
                                        {/* status / action */}
                                        {item.unlocked ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setClaimBenefit({
                                                        label: item.label,
                                                        amount: item.amount,
                                                        documents: item.documents,
                                                        variableAmount: item.variableAmount,
                                                    })
                                                }
                                                className="bg-fsc-green shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium text-white transition-all hover:brightness-110"
                                            >
                                                Claim
                                            </button>
                                        ) : (
                                            <span className="text-fsc-stone shrink-0 rounded-full bg-[#C9922A]/12 px-2.5 py-1 text-xs font-medium text-[#A87820]">
                                                {countdown}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
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

            {/* Beneficiaries */}
            <BeneficiariesCard beneficiaries={member.beneficiaries} />

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

            {claimBenefit && (
                <FileClaimModal
                    memberName={`${member.firstName} ${member.lastName}`.trim()}
                    benefits={[claimBenefit]}
                    initialBenefit={claimBenefit.label}
                    onClose={() => setClaimBenefit(null)}
                    onSuccess={() => setClaimBenefit(null)}
                />
            )}
        </div>
    );
};
