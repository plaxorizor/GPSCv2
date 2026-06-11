import React, { useState } from "react";
import { Wallet, TrendingUp, Users, CheckCircle, Check, Heart, Rocket, Crown, CalendarClock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StatCard } from "../../components/member/StatCard";
import { type Member, type EarningsTrendPoint } from "../../utils/types";
import { formatCurrency, formatDate } from "../../utils/formatter";
import ReferralCard from "../../components/member/ReferralCard";
import FileClaimModal from "../../components/modals/FileClaimModal";
import EligibilityTimeline from "../../components/member/EligibilityTimeline";
import { membershipPhase, graceDaysRemaining, daysUntilExpiry } from "../../utils/membership";
import type { ClaimBenefit } from "../../utils/eligibility";

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

    // Membership lifecycle (derived from dates): active → grace (30d) → expired.
    const phase = membershipPhase(member);
    const graceLeft = graceDaysRemaining(member);
    const expiresIn = daysUntilExpiry(member);

    const yAxisTickFormatter = (value: number) => `₱${value}`;

    const tooltipFormatter = (value: unknown): React.ReactNode => {
        if (typeof value === "number") return formatCurrency(value);
        if (typeof value === "string") return formatCurrency(Number(value));
        return formatCurrency(0);
    };

    return (
        <div className="space-y-6">
            {/* Renewal grace banner — shown after the 365-day term, during the 30-day grace */}
            {phase === "grace" && (
                <div className="flex items-start gap-3 rounded-2xl border border-[#C9922A]/30 bg-[#C9922A]/10 p-4">
                    <CalendarClock className="mt-0.5 shrink-0 text-[#A87820]" size={20} />
                    <div className="text-sm">
                        <p className="font-medium text-[#A87820]">Your membership has expired — you're in the renewal grace period.</p>
                        <p className="text-fsc-stone mt-0.5 text-xs">
                            Renew within <strong>{graceLeft} day{graceLeft === 1 ? "" : "s"}</strong> to keep your benefits and earnings.
                            Contact an administrator to confirm your renewal payment.
                        </p>
                    </div>
                </div>
            )}

            {/* Member header */}
            <div>
                <h1 className="font-display text-fsc-navy text-3xl">
                    {member.firstName} {member.lastName} <span className="text-fsc-stone text-base font-normal">({rankName})</span>
                </h1>
                <p className="mt-1 text-sm">
                    <span className="text-fsc-navy font-medium">{packageName} Care</span>
                    {phase === "active" && expiresIn != null && (
                        <span className="text-fsc-stone">
                            {" · "}Membership expires in {expiresIn} day{expiresIn === 1 ? "" : "s"}
                        </span>
                    )}
                    {phase === "grace" && <span className="text-[#A87820]">{" · "}In renewal grace</span>}
                </p>
            </div>

            {/* Upgrade Banner — Premium members and lapsed (grace) members don't see it */}
            {phase === "active" && <UpgradeBanner packageName={packageName} onComparePackages={onComparePackages} />}

            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Available to withdraw"
                    value={formatCurrency(availableToWithdraw)}
                    sub={phase === "active" ? "Cleared & ready" : "Renew to withdraw"}
                    icon={Wallet}
                    actionLabel={phase === "active" ? "Request payout" : undefined}
                    onAction={phase === "active" ? onRequestPayout : undefined}
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
                    <EligibilityTimeline
                        timeline={eligibilityTimeline}
                        eligBase={eligBase}
                        onClaim={setClaimBenefit}
                        className="lg:col-span-2"
                    />

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
