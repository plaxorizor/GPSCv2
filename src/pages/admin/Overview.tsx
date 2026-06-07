// admin/Overview.tsx
import React from "react";
import { Users, TrendingUp, FileText, Wallet, UserCheck, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { StatCard } from "./StatCard";
import type { PackageMixItem } from "../../utils/types";
import { formatCurrency, formatDate } from "./utils";

import useAdminStats from "../../hooks/useAdminStats";

interface Props {
    loading: boolean;
}

export const Overview: React.FC<Props> = ({ loading }) => {
    const { stats: adminStats, loading: adminStatsLoading, refetch } = useAdminStats();

    if (loading || adminStatsLoading || !adminStats) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="bg-fsc-cream-dark mb-4 h-8 w-48 rounded"></div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-fsc-cream-dark h-32 rounded-2xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    //const pendingClaims = recentClaims.filter((c) => c.status === "submitted" || c.status === "under_review");

    // Package mix derived from adminStats — pie + legend always in sync
    const syncedPackageMix: PackageMixItem[] = [
        { name: "Basic", value: adminStats.packageCounts.basic, color: "#1B2D6B" },
        { name: "Family", value: adminStats.packageCounts.family, color: "#C9922A" },
        { name: "Premium", value: adminStats.packageCounts.premium, color: "#C41E1E" },
    ].filter((p) => p.value > 0);

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="font-display text-fsc-navy text-3xl">Operations Dashboard</h1>
                </div>
                <button onClick={refetch} className="text-fsc-green flex items-center gap-1 text-xs transition-colors hover:underline">
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <StatCard label="Active Members" value={adminStats.activeMembers} sub="From Subscriptions" icon={Users} />
                <StatCard label="Total Revenue" value={formatCurrency(adminStats.totalRevenue)} sub="From Memberships" icon={TrendingUp} />
                <StatCard
                    label="Pending Claims"
                    value={adminStats.pendingClaims}
                    sub={adminStats.pendingClaims === 0 ? "No Pending Claims" : ""}
                    icon={FileText}
                />
                <StatCard
                    label="Pending Payouts"
                    value={adminStats.pendingPayouts}
                    sub={adminStats.pendingPayouts === 0 ? "No Pending Payouts" : ""}
                    icon={Wallet}
                />
                <StatCard
                    label="Pending accounts"
                    value={adminStats.pendingAccounts}
                    sub={adminStats.pendingAccounts === 0 ? "No Pending Accounts" : "Awaiting Approval"}
                    icon={UserCheck}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* ── Membership Growth — from adminStats.growthData ── */}
                <div className="border-fsc-cream-dark rounded-2xl border bg-white p-6 lg:col-span-2">
                    <h2 className="font-display text-fsc-navy mb-1 text-lg">Membership Growth</h2>
                    <p className="text-fsc-stone mb-6 text-xs">New members per month (last 6 months)</p>
                    {adminStats.growthData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={adminStats.growthData}>
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B6862" }} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6B6862" }} axisLine={false} tickLine={false} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#D0D2D8" />
                                <Tooltip
                                    contentStyle={{ borderRadius: 12, border: "1px solid #D0D2D8" }}
                                    formatter={(value) => [`${value} members`, "New members"]}
                                />
                                <Bar dataKey="members" fill="#C9922A" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-fsc-stone flex h-60 items-center justify-center">No growth data available</div>
                    )}
                </div>

                {/* ── Package Mix — synced from adminStats ── */}
                <div className="border-fsc-cream-dark rounded-2xl border bg-white p-6">
                    <h2 className="font-display text-fsc-navy mb-1 text-lg">Package Mix</h2>
                    <p className="text-fsc-stone mb-4 text-xs">By active memberships</p>

                    {syncedPackageMix.length > 0 ? (
                        <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                                <Pie data={syncedPackageMix} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} labelLine={false}>
                                    {syncedPackageMix.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: 12, border: "1px solid #D0D2D8" }}
                                    formatter={(value, name) => [value, `${name} Care`]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-fsc-stone flex h-40 items-center justify-center">No package data available</div>
                    )}

                    <div className="mt-2 space-y-2">
                        {[
                            { label: "Basic Care", color: "#1B2D6B", count: adminStats.packageCounts.basic },
                            { label: "Family Care", color: "#C9922A", count: adminStats.packageCounts.family },
                            { label: "Premium Care", color: "#C41E1E", count: adminStats.packageCounts.premium },
                        ].map(({ label, color, count }) => (
                            <div key={label} className="flex items-center gap-2 text-sm">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                                <span className="text-fsc-stone">{label}</span>
                                <span className="text-fsc-navy ml-auto font-medium">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* ── Top Recruiters — from adminStats.topRecruiters ── */}
                <div className="border-fsc-cream-dark rounded-2xl border bg-white p-6">
                    <h2 className="font-display text-fsc-navy mb-4 text-lg">Top Recruiters</h2>
                    <div className="space-y-3">
                        {adminStats.topRecruiters.length > 0 ? (
                            adminStats.topRecruiters.map((r, i) => (
                                <div key={r.uid} className="flex items-center gap-3">
                                    <div className="font-display text-fsc-stone w-6 text-xs">#{i + 1}</div>
                                    <div className="bg-fsc-navy font-display flex h-10 w-10 items-center justify-center rounded-full text-xs text-white">
                                        
                                        {r.name
                                            .split(" ")
                                            .map((n: string) => n[0])
                                            .join("")
                                            .slice(0, 2)
                                            .toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-fsc-navy text-sm">{r.name}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-display text-fsc-navy text-lg">{r.referralCount}</div>
                                        <div className="text-fsc-stone text-xs">referral{r.referralCount !== 1 ? "s" : ""}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-fsc-stone py-8 text-center">No referral data yet</div>
                        )}
                    </div>
                </div>

                {/* ── Claims Queue — oldest pending claims first ── */}
                <div className="border-fsc-cream-dark rounded-2xl border bg-white p-6">
                    <h2 className="font-display text-fsc-navy mb-4 text-lg">Claims Queue</h2>
                    <div className="space-y-3">
                        {adminStats.pendingClaimsList.length > 0 ? (
                            adminStats.pendingClaimsList.map((c) => (
                                <div key={c.id} className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="text-fsc-navy truncate text-sm">{c.benefit || "Claim"}</div>
                                        <div className="text-fsc-stone truncate text-xs">
                                            {c.memberName}
                                            {c.submitted ? ` · ${formatDate(c.submitted)}` : ""}
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-3">
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs ${
                                                c.status === "under_review"
                                                    ? "bg-[#C9922A]/10 text-[#A87820]"
                                                    : "bg-fsc-navy/10 text-fsc-navy"
                                            }`}
                                        >
                                            {c.status === "under_review" ? "In review" : "New"}
                                        </span>
                                        <span className="text-fsc-navy text-sm font-medium">{formatCurrency(c.amount)}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-fsc-stone py-8 text-center">No pending claims</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
