import React from 'react';
import { Wallet, Clock, TrendingUp, Download } from 'lucide-react';
import { StatCard } from './StatCard';
import type { Commission, Payout } from './types';
import { formatCurrency, formatDate } from './utils';

interface Props {
  availableToWithdraw: number;
  pendingHold: number;
  lifetimePaid: number;
  commissions: Commission[];
  payouts: Payout[];
  onRequestPayout: () => void;
}

export const MemberEarnings: React.FC<Props> = ({ availableToWithdraw, pendingHold, lifetimePaid, commissions, payouts, onRequestPayout }) => (
  <div className="space-y-6">
    <div><div className="text-xs uppercase tracking-wider text-gpsc-stone">Money in, money out</div><h1 className="font-display text-3xl text-gpsc-navy">Earnings</h1></div>
    <div className="grid sm:grid-cols-3 gap-4">
      <StatCard label="Available" value={formatCurrency(availableToWithdraw)} sub="Ready to withdraw" icon={Wallet} />
      <StatCard label="Pending hold" value={formatCurrency(pendingHold)} sub="Clears after 7 days" icon={Clock} />
      <StatCard label="Lifetime paid" value={formatCurrency(lifetimePaid)} sub="Since joining" icon={TrendingUp} />
    </div>
    <div className="bg-white rounded-2xl border border-gpsc-cream-dark overflow-hidden">
      <div className="p-6 flex items-center justify-between border-b border-gpsc-cream-dark flex-wrap gap-4">
        <div><h2 className="font-display text-lg text-gpsc-navy">Commission ledger</h2><p className="text-xs text-gpsc-stone">Every commission earned, by source</p></div>
        <div className="flex gap-2">
          <button className="px-3 py-2 text-xs border border-gpsc-cream-dark rounded-lg flex items-center gap-1"><Download size={12}/> CSV</button>
          <button onClick={onRequestPayout} className="bg-gpsc-green text-white px-4 py-2 text-xs rounded-lg font-medium">Request payout</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gpsc-cream/50 text-xs uppercase tracking-wider text-gpsc-stone"><tr><th className="text-left p-4">Date</th><th className="text-left p-4">From member</th><th className="text-left p-4">Level</th><th className="text-right p-4">Amount</th><th className="text-right p-4">Status</th></tr></thead>
          <tbody>
            {commissions.map(c => <tr key={c.id} className="border-t border-gpsc-cream-dark"><td className="p-4 text-gpsc-stone">{formatDate(c.date)}</td><td className="p-4"><div className="text-gpsc-navy">{c.fromMemberName}</div><div className="text-xs text-gpsc-stone">{c.fromMemberCity}</div></td><td className="p-4 text-gpsc-stone">L{c.level}</td><td className="p-4 text-right font-medium text-gpsc-navy">+{formatCurrency(c.amount)}</td><td className="p-4 text-right"><span className={`text-xs px-2 py-1 rounded-full ${c.status === 'paid' ? 'bg-gpsc-green/10 text-gpsc-green' : c.status === 'payable' ? 'bg-gpsc-navy/10 text-gpsc-navy' : 'bg-amber-100 text-amber-700'}`}>{c.status}</span></td></tr>)}
            {commissions.length === 0 && <tr><td colSpan={5} className="text-center p-8 text-gpsc-stone">No commissions yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
    <div className="bg-white rounded-2xl border border-gpsc-cream-dark overflow-hidden">
      <div className="p-6 border-b border-gpsc-cream-dark"><h2 className="font-display text-lg text-gpsc-navy">Payout history</h2></div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gpsc-cream/50 text-xs uppercase tracking-wider text-gpsc-stone"><tr><th className="text-left p-4">Requested</th><th className="text-left p-4">Method</th><th className="text-left p-4">Reference</th><th className="text-right p-4">Amount</th><th className="text-right p-4">Status</th></tr></thead>
          <tbody>
            {payouts.map(p => <tr key={p.id} className="border-t border-gpsc-cream-dark"><td className="p-4 text-gpsc-stone">{formatDate(p.requestedAt)}</td><td className="p-4 text-gpsc-navy">{p.method}</td><td className="p-4 text-gpsc-stone font-mono text-xs">{p.reference || '—'}</td><td className="p-4 text-right font-medium text-gpsc-navy">{formatCurrency(p.amount)}</td><td className="p-4 text-right"><span className={`text-xs px-2 py-1 rounded-full ${p.status === 'sent' ? 'bg-gpsc-green/10 text-gpsc-green' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span></td></tr>)}
            {payouts.length === 0 && <tr><td colSpan={5} className="text-center p-8 text-gpsc-stone">No payouts yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);