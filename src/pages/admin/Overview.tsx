// admin/Overview.tsx
import React from "react";
import { Users, TrendingUp, FileText, Wallet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { StatCard } from "./StatCard";
import type { GrowthDataPoint, PackageMixItem, TopRecruiter } from "./types";
import type { Claim } from "../types";
import { formatCurrency } from "./utils";

import useAdminStats from "../../hooks/useAdminStats";

interface Props {
    growthData: GrowthDataPoint[];
    packageMix: PackageMixItem[];
    topRecruiters: TopRecruiter[];
    recentClaims: Claim[];
    loading: boolean;
    onRefresh: () => void;
}

export const Overview: React.FC<Props> = ({ growthData, packageMix, topRecruiters, recentClaims, loading, onRefresh }) => {
    const { stats: adminStats, loading: adminStatsLoading } = useAdminStats();

    if (loading || adminStatsLoading || !adminStats) {
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
                        </>
                    ) : (
                        <div className="text-gpsc-stone flex h-60 items-center justify-center">No package data available</div>
                    )}

                    <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="h-3 w-3 rounded-full bg-indigo-600"></div>
                            <span className="text-gpsc-stone">Basic Care</span>
                            <span className="text-gpsc-navy ml-auto font-medium">{adminStats.packageCounts.Basic}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="h-3 w-3 rounded-full bg-lime-600"></div>
                            <span className="text-gpsc-stone">Family Care</span>
                            <span className="text-gpsc-navy ml-auto font-medium">{adminStats.packageCounts.Family}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                            <span className="text-gpsc-stone">Premium Care</span>
                            <span className="text-gpsc-navy ml-auto font-medium">{adminStats.packageCounts.Premium}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="border-gpsc-cream-dark rounded-2xl border bg-white p-6">
                    <h2 className="font-display text-gpsc-navy mb-4 text-lg">Top recruiters this quarter</h2>
                    
                    {/* Top recruiters */}
                    <div className="rounded-2xl border bg-white p-6">
                        <h3 className="mb-4 font-medium">Top Recruiters</h3>
                        <div className="space-y-3">
                            {adminStats.topRecruiters.map((r, i) => (
                                <div key={r.uid} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-gray-400">#{i + 1}</span>
                                        <span className="text-sm font-medium">{r.name}</span>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {r.referralCount} referral{r.referralCount !== 1 ? "s" : ""}
                                    </span>
                                </div>
                            ))}
                            {adminStats.topRecruiters.length === 0 && <p className="text-sm text-gray-400">No referrals yet.</p>}
                        </div>
                    </div>

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
