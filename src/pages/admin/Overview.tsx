// admin/Overview.tsx
import React from "react";
import { Users, TrendingUp, FileText, Wallet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { StatCard } from "./StatCard";
import type { DashboardStats, GrowthDataPoint, PackageMixItem, TopRecruiter } from "./types";
import type { Claim } from "../types";
import { formatCurrency } from "./utils";

import useAdminStats from "../../hooks/useAdminStats";

interface Props {
    stats: DashboardStats;
    growthData: GrowthDataPoint[];
    packageMix: PackageMixItem[];
    topRecruiters: TopRecruiter[];
    recentClaims: Claim[];
    loading: boolean;
    onRefresh: () => void;
}

export const Overview: React.FC<Props> = ({ stats, growthData, packageMix, topRecruiters, recentClaims, loading, onRefresh }) => {

    const { stats: adminStats, loading: adminStatsLoading } = useAdminStats();

    if (loading || adminStatsLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="bg-gpsc-cream-dark mb-4 h-8 w-48 rounded"></div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-gpsc-cream-dark h-32 rounded-2xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Filter claims that are still pending (not approved, rejected, or released)
    const pendingClaims = recentClaims.filter((c) => c.status === "submitted" || c.status === "under_review");

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

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Active members" value={adminStats?.activeMembers} sub="+12 this month" icon={Users} />
                <StatCard label="Total revenue" value={formatCurrency(stats.totalRevenue)} sub="From memberships" icon={TrendingUp} />
                <StatCard
                    label="Pending claims"
                    value={stats.pendingClaims.toString()}
                    sub={`Avg. ${stats.avgClaimTimeDays} day TAT`}
                    icon={FileText}
                />
                <StatCard
                    label="Pending payouts"
                    value={stats.pendingPayouts.toString()}
                    sub={formatCurrency(stats.totalRevenue * 0.2)}
                    icon={Wallet}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="border-gpsc-cream-dark rounded-2xl border bg-white p-6 lg:col-span-2">
                    <h2 className="font-display text-gpsc-navy mb-1 text-lg">Membership growth</h2>
                    <p className="text-gpsc-stone mb-6 text-xs">New members per month</p>
                    {growthData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={growthData}>
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B6862" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "#6B6862" }} axisLine={false} tickLine={false} />
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

                <div className="border-gpsc-cream-dark rounded-2xl border bg-white p-6">
                    <h2 className="font-display text-gpsc-navy mb-1 text-lg">Package mix</h2>
                    <p className="text-gpsc-stone mb-4 text-xs">By active memberships</p>
                    {packageMix.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie
                                        data={packageMix}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={40}
                                        outerRadius={70}
                                        label={({ name, percent }) => {
                                            const percentage = percent ? (percent * 100).toFixed(0) : 0;
                                            return `${name}: ${percentage}%`;
                                        }}
                                        labelLine={false}
                                    >
                                        {packageMix.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: 12, border: "1px solid #E5DDC8" }}
                                        formatter={(value) => [value, "Members"]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-2 space-y-2">
                                {packageMix.map((p, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }}></div>
                                        <span className="text-gpsc-stone">{p.name}</span>
                                        <span className="text-gpsc-navy ml-auto font-medium">{p.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-gpsc-stone flex h-60 items-center justify-center">No package data available</div>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="border-gpsc-cream-dark rounded-2xl border bg-white p-6">
                    <h2 className="font-display text-gpsc-navy mb-4 text-lg">Top recruiters this quarter</h2>
                    <div className="space-y-3">
                        {topRecruiters.length > 0 ? (
                            topRecruiters.map((recruiter, i) => (
                                <div key={recruiter.id} className="flex items-center gap-3">
                                    <div className="font-display text-gpsc-stone w-6 text-xs">#{i + 1}</div>
                                    <div className="bg-gpsc-navy font-display flex h-10 w-10 items-center justify-center rounded-full text-xs text-white">
                                        {recruiter.initials}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-gpsc-navy text-sm">
                                            {recruiter.firstName} {recruiter.lastName}
                                        </div>
                                        <div className="text-gpsc-stone text-xs">{recruiter.city}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-display text-gpsc-navy text-lg">{recruiter.referrals}</div>
                                        <div className="text-gpsc-stone text-xs">referrals</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-gpsc-stone py-8 text-center">No recruiter data available</div>
                        )}
                    </div>
                </div>

                <div className="border-gpsc-cream-dark rounded-2xl border bg-white p-6">
                    <h2 className="font-display text-gpsc-navy mb-4 text-lg">Claims queue</h2>
                    <div className="space-y-3">
                        {pendingClaims.length > 0 ? (
                            pendingClaims.map((claim) => (
                                <div
                                    key={claim.id}
                                    className="border-gpsc-cream-dark hover:bg-gpsc-cream/40 flex items-center gap-3 rounded-xl border p-3 transition-colors"
                                >
                                    <div
                                        className={`h-12 w-2 rounded-full ${claim.status === "under_review" ? "bg-amber-400" : "bg-gpsc-navy"}`}
                                    ></div>
                                    <div className="flex-1">
                                        <div className="text-gpsc-navy text-sm">{claim.benefit}</div>
                                        <div className="text-gpsc-stone text-xs">Claimant ID: {claim.userId.slice(0, 8)}</div>
                                        <div className="text-gpsc-stone mt-0.5 text-xs">{claim.status.replace("_", " ")}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-gpsc-navy text-sm font-medium">{formatCurrency(claim.amount)}</div>
                                        <button className="text-gpsc-green text-xs hover:underline">Review →</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-gpsc-stone py-8 text-center">No pending claims</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
