// admin/Overview.tsx
import React from 'react';
import { Users, TrendingUp, FileText, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StatCard } from './StatCard';
import type { DashboardStats, GrowthDataPoint, PackageMixItem, TopRecruiter } from './types';
import type { Claim } from '../member/types';
import { formatCurrency } from './utils';


interface Props {
  stats: DashboardStats;
  growthData: GrowthDataPoint[];
  packageMix: PackageMixItem[];
  topRecruiters: TopRecruiter[];
  recentClaims: Claim[];
  loading: boolean;
  onRefresh: () => void;
}

export const Overview: React.FC<Props> = ({ 
  stats, 
  growthData, 
  packageMix, 
  topRecruiters, 
  recentClaims, 
  loading, 
  onRefresh 
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gpsc-cream-dark rounded w-48 mb-4"></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gpsc-cream-dark rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Filter claims that are still pending (not approved, rejected, or released)
  const pendingClaims = recentClaims.filter(c => 
    c.status === 'submitted' || c.status === 'under_review'
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <div className="text-xs uppercase tracking-wider text-gpsc-stone">Administrator overview</div>
          <h1 className="font-display text-3xl text-gpsc-navy">Operations dashboard</h1>
        </div>
        <button 
          onClick={onRefresh} 
          className="text-xs text-gpsc-green hover:underline flex items-center gap-1 transition-colors"
        >
          <TrendingUp size={12} /> Refresh
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Active members" 
          value={stats.activeMembers.toLocaleString()} 
          sub="+12 this month" 
          icon={Users} 
        />
        <StatCard 
          label="Total revenue" 
          value={formatCurrency(stats.totalRevenue)} 
          sub="From memberships" 
          icon={TrendingUp} 
        />
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

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gpsc-cream-dark">
          <h2 className="font-display text-lg text-gpsc-navy mb-1">Membership growth</h2>
          <p className="text-xs text-gpsc-stone mb-6">New members per month</p>
          {growthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={growthData}>
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 11, fill: '#6B6862' }} 
                  axisLine={false} 
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#6B6862' }} 
                  axisLine={false} 
                  tickLine={false}
                />
                <CartesianGrid strokeDasharray="3 3" stroke="#E5DDC8"/>
                <Tooltip 
                  contentStyle={{ borderRadius: 12, border: '1px solid #E5DDC8' }}
                  formatter={(value) => [`${value} members`, 'New members']}
                />
                <Bar dataKey="members" fill="#4A8A2C" radius={[6, 6, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-gpsc-stone">
              No growth data available
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gpsc-cream-dark">
          <h2 className="font-display text-lg text-gpsc-navy mb-1">Package mix</h2>
          <p className="text-xs text-gpsc-stone mb-4">By active memberships</p>
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
                      <Cell key={i} fill={entry.color}/>
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: 12, border: '1px solid #E5DDC8' }}
                    formatter={(value) => [value, 'Members']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {packageMix.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></div>
                    <span className="text-gpsc-stone">{p.name}</span>
                    <span className="ml-auto text-gpsc-navy font-medium">{p.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-60 flex items-center justify-center text-gpsc-stone">
              No package data available
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gpsc-cream-dark">
          <h2 className="font-display text-lg text-gpsc-navy mb-4">Top recruiters this quarter</h2>
          <div className="space-y-3">
            {topRecruiters.length > 0 ? (
              topRecruiters.map((recruiter, i) => (
                <div key={recruiter.id} className="flex items-center gap-3">
                  <div className="font-display text-xs text-gpsc-stone w-6">#{i + 1}</div>
                  <div className="w-10 h-10 rounded-full bg-gpsc-navy text-white flex items-center justify-center text-xs font-display">
                    {recruiter.initials}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gpsc-navy">{recruiter.firstName} {recruiter.lastName}</div>
                    <div className="text-xs text-gpsc-stone">{recruiter.city}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg text-gpsc-navy">{recruiter.referrals}</div>
                    <div className="text-xs text-gpsc-stone">referrals</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gpsc-stone py-8">No recruiter data available</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gpsc-cream-dark">
          <h2 className="font-display text-lg text-gpsc-navy mb-4">Claims queue</h2>
          <div className="space-y-3">
            {pendingClaims.length > 0 ? (
              pendingClaims.map((claim) => (
                <div key={claim.id} className="flex items-center gap-3 p-3 border border-gpsc-cream-dark rounded-xl hover:bg-gpsc-cream/40 transition-colors">
                  <div className={`w-2 h-12 rounded-full ${claim.status === 'under_review' ? 'bg-amber-400' : 'bg-gpsc-navy'}`}></div>
                  <div className="flex-1">
                    <div className="text-sm text-gpsc-navy">{claim.benefit}</div>
                    <div className="text-xs text-gpsc-stone">Claimant ID: {claim.userId.slice(0, 8)}</div>
                    <div className="text-xs text-gpsc-stone mt-0.5">{claim.status.replace('_', ' ')}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gpsc-navy text-sm">{formatCurrency(claim.amount)}</div>
                    <button className="text-xs text-gpsc-green hover:underline">Review →</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gpsc-stone py-8">No pending claims</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};