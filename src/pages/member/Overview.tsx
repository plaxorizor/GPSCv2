import React from 'react';
import { Wallet, TrendingUp, Users, CheckCircle, Copy, Share2, Clock, Check } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard } from './StatCard';
import type { User, EarningsTrendPoint } from './types';
import { formatCurrency, formatDate } from './utils';

interface Props {
  user: User;
  packageName: string;
  rankName: string;
  availableToWithdraw: number;
  totalEarned: number;
  activeReferralsCount: number;
  totalReferralsCount: number;
  approvedClaimsCount: number;
  approvedClaimsTotal: number;
  earningsTrend: EarningsTrendPoint[];
  referralLink: string;
  onCopyReferralLink: () => void;
  onShareReferralLink: (method: 'copy' | 'messenger' | 'whatsapp') => void;
  onRequestPayout: () => void;
  eligibilityTimeline: Array<{ label: string; months: number; unlocked: boolean }>;
  recentCommissions: Array<{ id: string; fromMemberName: string; fromMemberInitials: string; level: number; amount: number; status: string; date: string }>;
}

export const MemberOverview: React.FC<Props> = ({
  user, packageName, rankName, availableToWithdraw, totalEarned, activeReferralsCount, totalReferralsCount,
  approvedClaimsCount, approvedClaimsTotal, earningsTrend, referralLink, onCopyReferralLink, onShareReferralLink,
  onRequestPayout, eligibilityTimeline, recentCommissions,
}) => {
  // Static QR placeholder (no random)
  const qrPlaceholder = Array.from({ length: 49 }).map((_, i) => i % 2 === 0);

  // YAxis tick formatter
  const yAxisTickFormatter = (value: number) => `₱${value}`;

  // Tooltip formatter that safely handles any value type from recharts
  const tooltipFormatter = (value: unknown): React.ReactNode => {
    if (typeof value === 'number') return formatCurrency(value);
    if (typeof value === 'string') return formatCurrency(Number(value));
    return formatCurrency(0);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-wider text-gpsc-stone">Welcome back</div>
        <h1 className="font-display text-3xl text-gpsc-navy">{user.firstName} {user.lastName}</h1>
        <div className="text-sm text-gpsc-stone mt-1">{rankName} · {packageName} member since {formatDate(user.memberSince)}</div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Available to withdraw" value={formatCurrency(availableToWithdraw)} sub="Cleared & ready" icon={Wallet} actionLabel="Request payout" onAction={onRequestPayout} />
        <StatCard label="Total earned" value={formatCurrency(totalEarned)} sub="Lifetime commissions" icon={TrendingUp} />
        <StatCard label="Active referrals" value={activeReferralsCount.toString()} sub={`${totalReferralsCount} total`} icon={Users} />
        <StatCard label="Approved claims" value={approvedClaimsCount.toString()} sub={formatCurrency(approvedClaimsTotal)} icon={CheckCircle} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gpsc-cream-dark">
          <h2 className="font-display text-lg text-gpsc-navy mb-1">Earnings trend</h2>
          <p className="text-xs text-gpsc-stone mb-6">Last 6 months</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={earningsTrend}>
              <defs>
                <linearGradient id="earnings-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5DAB3A" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#5DAB3A" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B6862' }} axisLine={false} tickLine={false}/>
              <YAxis 
                tickFormatter={yAxisTickFormatter} 
                tick={{ fontSize: 11, fill: '#6B6862' }} 
                axisLine={false} 
                tickLine={false}
              />
              <CartesianGrid strokeDasharray="3 3" stroke="#E5DDC8"/>
              <Tooltip 
                formatter={tooltipFormatter} 
                contentStyle={{ borderRadius: 12, border: '1px solid #E5DDC8' }}
              />
              <Area type="monotone" dataKey="amount" stroke="#4A8A2C" strokeWidth={2} fill="url(#earnings-grad)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gpsc-navy rounded-2xl p-6 text-white">
          <div className="text-xs uppercase tracking-wider text-white/60 mb-4">Your referral link</div>
          <div className="bg-white/10 rounded-xl px-4 py-3 text-sm font-mono mb-4 break-all">{referralLink}</div>
          <div className="flex gap-2 mb-6">
            <button onClick={onCopyReferralLink} className="flex-1 bg-white text-gpsc-navy py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"><Copy size={14}/> Copy</button>
            <button onClick={() => onShareReferralLink('messenger')} className="flex-1 bg-gpsc-green py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"><Share2 size={14}/> Share</button>
          </div>
          <div className="pt-6 border-t border-white/10">
            <div className="text-xs uppercase tracking-wider text-white/60 mb-2">QR code</div>
            <div className="bg-white p-3 rounded-xl w-32 h-32 mx-auto flex items-center justify-center">
              <div className="grid grid-cols-7 gap-0.5">
                {qrPlaceholder.map((isDark, i) => (
                  <div key={i} className={`w-2 h-2 ${isDark ? 'bg-gpsc-navy' : ''}`}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gpsc-cream-dark">
        <h2 className="font-display text-lg text-gpsc-navy mb-4">Eligibility timeline</h2>
        <div className="space-y-3">
          {eligibilityTimeline.map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.unlocked ? 'bg-gpsc-green text-white' : 'bg-gpsc-cream-dark text-gpsc-stone'}`}>
                {item.unlocked ? <Check size={14}/> : <Clock size={14}/>}
              </div>
              <div className="flex-1"><div className="text-sm text-gpsc-navy">{item.label}</div><div className="text-xs text-gpsc-stone">After {item.months} months · {item.unlocked ? 'Active' : 'Unlocks soon'}</div></div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gpsc-cream-dark">
        <h2 className="font-display text-lg text-gpsc-navy mb-4">Recent activity</h2>
        <div className="space-y-3">
          {recentCommissions.map((c) => (
            <div key={c.id} className="flex items-center gap-4 py-2 border-b border-gpsc-cream-dark last:border-0">
              <div className="w-8 h-8 rounded-full bg-gpsc-cream-dark flex items-center justify-center text-xs text-gpsc-navy font-display">{c.fromMemberInitials}</div>
              <div className="flex-1"><div className="text-sm text-gpsc-navy">{c.fromMemberName}</div><div className="text-xs text-gpsc-stone">Level {c.level} commission · {formatDate(c.date)}</div></div>
              <div className="text-right"><div className="font-medium text-gpsc-navy">+{formatCurrency(c.amount)}</div><div className={`text-xs ${c.status === 'paid' ? 'text-gpsc-green' : c.status === 'pending' ? 'text-amber-600' : 'text-gpsc-navy-light'}`}>{c.status}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};