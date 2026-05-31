// admin/Overview.tsx
import React from "react";
import { Users, TrendingUp, FileText, Wallet, UserCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { StatCard } from "./StatCard";
import type { PackageMixItem } from "../types";
import { formatCurrency } from "./utils";

import useAdminStats from "../../hooks/useAdminStats";

interface Props {
    loading: boolean;
    onRefresh: () => void;
}

export const Overview: React.FC<Props> = ({ loading, onRefresh }) => {
    const { stats: adminStats, loading: adminStatsLoading } = useAdminStats();

    if (loading || adminStatsLoading || !adminStats) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="bg-gpsc-cream-dark mb-4 h-8 w-48 rounded"></div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-gpsc-cream-dark h-32 rounded-2xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    //const pendingClaims = recentClaims.filter((c) => c.status === "submitted" || c.status === "under_review");

    // Package mix derived from adminStats — pie + legend always in sync
    const syncedPackageMix: PackageMixItem[] = [
        { name: "Basic", value: adminStats.packageCounts.Basic, color: "#4F46E5" },
        { name: "Family", value: adminStats.packageCounts.Family, color: "#65A30D" },
        { name: "Premium", value: adminStats.packageCounts.Premium, color: "#EAB308" },
    ].filter((p) => p.value > 0);

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between">
                <div>
                    <div className="text-gpsc-stone text-xs tracking-wider uppercase">Administrator overview</div>
                    <h1 className="font-display text-gpsc-navy text-3xl">Operations dashboard</h1>
                </div>
                <button onClick={onRefresh} className="text-gpsc-green flex items-center gap-1 text-xs transition-colors hover:underline">
                    <TrendingUp size={12} /> Refresh
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <StatCard label="Active members" value={adminStats.activeMembers} icon={Users} />
                <StatCard label="Total revenue" value={formatCurrency(adminStats.totalRevenue)} sub="From memberships" icon={TrendingUp} />
                <StatCard
                    label="Pending claims"
                    value={adminStats.pendingClaims}
                    sub={adminStats.pendingClaims === 0 ? "No pending claims" : ""}
                    icon={FileText}
                />
                <StatCard
                    label="Pending payouts"
                    value={adminStats.pendingPayouts}
                    sub={adminStats.pendingPayouts === 0 ? "No pending payouts" : ""}
                    icon={Wallet}
                />
                <StatCard
                    label="Pending accounts"
                    value={adminStats.pendingAccounts}
                    sub={adminStats.pendingAccounts === 0 ? "No pending accounts" : "Awaiting approval"}
                    icon={UserCheck}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* ── Membership Growth — from adminStats.growthData ── */}
                <div className="border-gpsc-cream-dark rounded-2xl border bg-white p-6 lg:col-span-2">
                    <h2 className="font-display text-gpsc-navy mb-1 text-lg">Membership growth</h2>
                    <p className="text-gpsc-stone mb-6 text-xs">New members per month (last 6 months)</p>
                    {adminStats.growthData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={adminStats.growthData}>
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B6862" }} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6B6862" }} axisLine={false} tickLine={false} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5DDC8" />
                                <Tooltip
                                    contentStyle={{ borderRadius: 12, border: "1px solid #E5DDC8" }}
                                    formatter={(value) => [`${value} members`, "New members"]}
                                />
                                <Bar dataKey="members" fill="#4A8A2C" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-gpsc-stone flex h-60 items-center justify-center">No growth data available</div>
                    )}
                </div>

                {/* ── Package Mix — synced from adminStats ── */}
                <div className="border-gpsc-cream-dark rounded-2xl border bg-white p-6">
                    <h2 className="font-display text-gpsc-navy mb-1 text-lg">Package mix</h2>
                    <p className="text-gpsc-stone mb-4 text-xs">By active memberships</p>

                    {syncedPackageMix.length > 0 ? (
                        <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                                <Pie data={syncedPackageMix} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} labelLine={false}>
                                    {syncedPackageMix.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: 12, border: "1px solid #E5DDC8" }}
                                    formatter={(value, name) => [value, `${name} Care`]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-gpsc-stone flex h-40 items-center justify-center">No package data available</div>
                    )}

                    <div className="mt-2 space-y-2">
                        {[
                            { label: "Basic Care", color: "#4F46E5", count: adminStats.packageCounts.Basic },
                            { label: "Family Care", color: "#65A30D", count: adminStats.packageCounts.Family },
                            { label: "Premium Care", color: "#EAB308", count: adminStats.packageCounts.Premium },
                        ].map(({ label, color, count }) => (
                            <div key={label} className="flex items-center gap-2 text-sm">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                                <span className="text-gpsc-stone">{label}</span>
                                <span className="text-gpsc-navy ml-auto font-medium">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* ── Top Recruiters — from adminStats.topRecruiters ── */}
                <div className="border-gpsc-cream-dark rounded-2xl border bg-white p-6">
                    <h2 className="font-display text-gpsc-navy mb-4 text-lg">Top recruiters this quarter</h2>
                    <div className="space-y-3">
                        {adminStats.topRecruiters.length > 0 ? (
                            adminStats.topRecruiters.map((r, i) => (
                                <div key={r.uid} className="flex items-center gap-3">
                                    <div className="font-display text-gpsc-stone w-6 text-xs">#{i + 1}</div>
                                    <div className="bg-gpsc-navy font-display flex h-10 w-10 items-center justify-center rounded-full text-xs text-white">
                                        {r.name
                                            .split(" ")
                                            .map((n: string) => n[0])
                                            .join("")
                                            .slice(0, 2)
                                            .toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-gpsc-navy text-sm">{r.name}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-display text-gpsc-navy text-lg">{r.referralCount}</div>
                                        <div className="text-gpsc-stone text-xs">referral{r.referralCount !== 1 ? "s" : ""}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-gpsc-stone py-8 text-center">No referral data yet</div>
                        )}
                    </div>
                </div>

                {/* ── Claims Queue ── */}
                <div className="border-gpsc-cream-dark rounded-2xl border bg-white p-6">
                    <h2 className="font-display text-gpsc-navy mb-4 text-lg">Claims queue</h2>
                    <div className="space-y-3">
                        <div className="text-gpsc-stone py-8 text-center">No pending claims</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
