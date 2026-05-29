// admin/Claims.tsx
import React, { useState } from 'react';
import { Download, Eye, CheckCircle, XCircle, Clock, FileText, } from 'lucide-react';
import type { Claim } from '../member/types';
import { formatCurrency, formatDate } from './utils';


interface Props {
  claims: Claim[];
  loading: boolean;
  onUpdateStatus: (claimId: string, status: 'approved' | 'rejected' | 'released') => Promise<void>;
  onReviewClaim?: (claimId: string) => Promise<void>;
  onRefresh: () => void;
  onExport: () => void;
}

const statusColors: Record<string, string> = {
  submitted: 'bg-gpsc-navy/10 text-gpsc-navy',
  under_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-gpsc-green/10 text-gpsc-green',
  rejected: 'bg-red-100 text-red-700',
  released: 'bg-gpsc-green/20 text-gpsc-green',
};

const statusLabels: Record<string, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  released: 'Released',
};

export const Claims: React.FC<Props> = ({ 
  claims, 
  loading, 
  onUpdateStatus, 
  onReviewClaim,
  onRefresh, 
  onExport 
}) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  const filtered = claims.filter(c => statusFilter === 'all' || c.status === statusFilter);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gpsc-cream-dark rounded w-32 mb-4"></div>
          <div className="h-96 bg-gpsc-cream-dark rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const handleStartReview = (claimId: string) => {
    if (onReviewClaim) {
      onReviewClaim(claimId);
    } else {
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-gpsc-stone">Claims operations</div>
          <h1 className="font-display text-3xl text-gpsc-navy">Claims queue</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onExport} 
            className="border border-gpsc-navy text-gpsc-navy px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors hover:bg-gpsc-navy hover:text-white"
          >
            <Download size={14}/> Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gpsc-cream-dark overflow-hidden">
        <div className="p-4 border-b border-gpsc-cream-dark flex gap-3 flex-wrap justify-between items-center">
          <div className="flex gap-2">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gpsc-cream-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gpsc-green"
            >
              <option value="all">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="released">Released</option>
            </select>
            <button 
              onClick={onRefresh} 
              className="px-3 py-2 border border-gpsc-cream-dark rounded-lg text-sm hover:bg-gpsc-cream/60 transition-colors"
            >
              Refresh
            </button>
          </div>
          <div className="text-xs text-gpsc-stone bg-gpsc-cream px-3 py-1 rounded-full">
            {claims.filter(c => c.status === 'submitted' || c.status === 'under_review').length} pending
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gpsc-cream/50 text-xs uppercase tracking-wider text-gpsc-stone">
              <tr>
                <th className="text-left p-4">Claimant</th>
                <th className="text-left p-4">Benefit</th>
                <th className="text-left p-4">Submitted</th>
                <th className="text-right p-4">Amount</th>
                <th className="text-left p-4">Status</th>
                <th className="text-right p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((claim) => (
                <tr key={claim.id} className="border-t border-gpsc-cream-dark hover:bg-gpsc-cream/40 transition-colors">
                  <td className="p-4">
                    <div className="text-gpsc-navy">ID: {claim.userId.slice(0, 8)}...</div>
                    <div className="text-xs text-gpsc-stone font-mono">Claim #{claim.id.slice(0, 8)}</div>
                   </td>
                  <td className="p-4 text-gpsc-stone">{claim.benefit}</td>
                  <td className="p-4 text-gpsc-stone">{formatDate(claim.submitted)}</td>
                  <td className="p-4 text-right font-medium text-gpsc-navy">{formatCurrency(claim.amount)}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[claim.status] || 'bg-gpsc-stone/10'}`}>
                      {statusLabels[claim.status] || claim.status}
                    </span>
                    </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedClaim(claim)}
                        className="p-1 rounded text-gpsc-stone hover:bg-gpsc-cream transition-colors"
                        title="View details"
                      >
                        <Eye size={16}/>
                      </button>
                      {claim.status === 'submitted' && (
                        <button 
                          onClick={() => handleStartReview(claim.id)}
                          className="p-1 rounded text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Start review"
                        >
                          <Clock size={16}/>
                        </button>
                      )}
                      {claim.status === 'under_review' && (
                        <>
                          <button 
                            onClick={() => onUpdateStatus(claim.id, 'approved')}
                            className="p-1 rounded text-gpsc-green hover:bg-gpsc-green/10 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={16}/>
                          </button>
                          <button 
                            onClick={() => onUpdateStatus(claim.id, 'rejected')}
                            className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors"
                            title="Reject"
                          >
                            <XCircle size={16}/>
                          </button>
                        </>
                      )}
                      {claim.status === 'approved' && (
                        <button 
                          onClick={() => onUpdateStatus(claim.id, 'released')}
                          className="text-xs bg-gpsc-green text-white px-2 py-1 rounded hover:bg-gpsc-green-light transition-colors"
                        >
                          Release
                        </button>
                      )}
                    </div>
                    </td>
                 </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gpsc-stone">
                    No claims found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claim Detail Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedClaim(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full mx-4 p-6 animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-xl text-gpsc-navy">Claim Details</h2>
              <button onClick={() => setSelectedClaim(null)} className="text-gpsc-stone hover:text-gpsc-navy transition-colors">✕</button>
            </div>
            <div className="space-y-3">
              <div className="bg-gpsc-cream p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gpsc-stone">Amount</span>
                  <span className="font-display text-2xl text-gpsc-navy">{formatCurrency(selectedClaim.amount)}</span>
                </div>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[selectedClaim.status]}`}>
                    {statusLabels[selectedClaim.status]}
                  </span>
                </div>
              </div>
              <div><div className="text-xs text-gpsc-stone">Claim ID</div><div className="text-gpsc-navy font-mono text-sm">{selectedClaim.id}</div></div>
              <div><div className="text-xs text-gpsc-stone">Benefit</div><div className="text-gpsc-navy">{selectedClaim.benefit}</div></div>
              <div><div className="text-xs text-gpsc-stone">Submitted</div><div className="text-gpsc-navy">{formatDate(selectedClaim.submitted)}</div></div>
              {selectedClaim.decided && <div><div className="text-xs text-gpsc-stone">Decided</div><div className="text-gpsc-navy">{formatDate(selectedClaim.decided)}</div></div>}
              <div>
                <div className="text-xs text-gpsc-stone mb-2">Documents</div>
                <div className="flex flex-wrap gap-2">
                  {selectedClaim.documents.map((d, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 bg-gpsc-cream rounded-full text-gpsc-stone flex items-center gap-1">
                      <FileText size={10}/> {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setSelectedClaim(null)} className="flex-1 px-4 py-2 border border-gpsc-cream-dark rounded-lg text-gpsc-stone hover:bg-gpsc-cream/60 transition-colors">Close</button>
              {selectedClaim.status === 'submitted' && (
                <button onClick={() => {
                  handleStartReview(selectedClaim.id);
                  setSelectedClaim(null);
                }} className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors">
                  Start Review
                </button>
              )}
              {selectedClaim.status === 'under_review' && (
                <div className="flex gap-2 flex-1">
                  <button onClick={() => {
                    onUpdateStatus(selectedClaim.id, 'rejected');
                    setSelectedClaim(null);
                  }} className="flex-1 px-4 py-2 border border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition-colors">
                    Reject
                  </button>
                  <button onClick={() => {
                    onUpdateStatus(selectedClaim.id, 'approved');
                    setSelectedClaim(null);
                  }} className="flex-1 px-4 py-2 bg-gpsc-green text-white rounded-lg font-medium hover:bg-gpsc-green-light transition-colors">
                    Approve
                  </button>
                </div>
              )}
              {selectedClaim.status === 'approved' && (
                <button onClick={() => {
                  onUpdateStatus(selectedClaim.id, 'released');
                  setSelectedClaim(null);
                }} className="flex-1 px-4 py-2 bg-gpsc-navy text-white rounded-lg font-medium hover:bg-gpsc-green transition-colors">
                  Release Funds
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};