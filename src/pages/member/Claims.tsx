import React from 'react';
import { Plus, FileText } from 'lucide-react';
import type { Claim } from './types';
import { formatCurrency, formatDate } from './utils';

interface Props {
  claims: Claim[];
  onFileClaim: () => void;
}

export const MemberClaims: React.FC<Props> = ({ claims, onFileClaim }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-end">
      <div><div className="text-xs uppercase tracking-wider text-gpsc-stone">Your benefits</div><h1 className="font-display text-3xl text-gpsc-navy">Claims</h1></div>
      <button onClick={onFileClaim} className="bg-gpsc-navy text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2"><Plus size={14}/> File a claim</button>
    </div>
    <div className="space-y-3">
      {claims.map(c => (
        <div key={c.id} className="bg-white rounded-2xl p-6 border border-gpsc-cream-dark">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-50">
              <div className="font-display text-lg text-gpsc-navy">{c.benefit}</div>
              <div className="text-xs text-gpsc-stone mt-1">Submitted {formatDate(c.submitted)}{c.decided && ` · Decided ${formatDate(c.decided)}`}</div>
              <div className="flex flex-wrap gap-2 mt-3">{c.documents.map((d, i) => <span key={i} className="text-xs px-2 py-1 bg-gpsc-cream rounded-full text-gpsc-stone flex items-center gap-1"><FileText size={10}/> {d}</span>)}</div>
            </div>
            <div className="text-right">
              <div className="font-display text-2xl text-gpsc-navy">{formatCurrency(c.amount)}</div>
              <span className={`inline-block text-xs px-3 py-1 rounded-full mt-1 ${c.status === 'approved' ? 'bg-gpsc-green/10 text-gpsc-green' : c.status === 'under_review' ? 'bg-gpsc-navy/10 text-gpsc-navy' : 'bg-amber-100 text-amber-700'}`}>{c.status.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      ))}
      {claims.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border border-gpsc-cream-dark text-center">
          <div className="w-16 h-16 bg-gpsc-cream rounded-full mx-auto flex items-center justify-center mb-4"><FileText size={24} className="text-gpsc-stone"/></div>
          <div className="font-display text-lg text-gpsc-navy">No claims yet</div>
          <div className="text-sm text-gpsc-stone mt-1">When you need to file one, we'll guide you through.</div>
        </div>
      )}
    </div>
  </div>
);