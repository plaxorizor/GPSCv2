// admin/Commissions.tsx
import React, { useState } from 'react';
import { Send, Clock, CheckCircle, Download } from 'lucide-react';
import type { PendingCommission, CommissionRecord } from './types';
import { formatCurrency, formatDate } from './utils';

interface Props {
  pendingCommissions: PendingCommission[];
  commissionHistory: CommissionRecord[];
  loading: boolean;
  onRelease: (commissionId: string, earnedBy: string, amount: number, reference: string) => Promise<void>;
  onRefresh: () => void;
}

export const Commissions: React.FC<Props> = ({ 
  pendingCommissions, commissionHistory, loading, onRelease, onRefresh 
}) => {
  const [selectedCommission, setSelectedCommission] = useState<PendingCommission | null>(null);
  const [reference, setReference] = useState('');

  const handleRelease = async () => {
    if (selectedCommission && reference) {
      await onRelease(selectedCommission.id, selectedCommission.recipientName, selectedCommission.amount, reference);
      setSelectedCommission(null);
      setReference('');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gpsc-cream-dark rounded w-32 mb-4"></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="h-32 bg-gpsc-cream-dark rounded-2xl"></div>
            <div className="h-32 bg-gpsc-cream-dark rounded-2xl"></div>
          </div>
          <div className="h-96 bg-gpsc-cream-dark rounded-2xl mt-6"></div>
        </div>
      </div>
    );
  }

  const totalPending = pendingCommissions.reduce((sum, c) => sum + c.amount, 0);
  const totalHistory = commissionHistory.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <div className="text-xs uppercase tracking-wider text-gpsc-stone">Commission management</div>
          <h1 className="font-display text-3xl text-gpsc-navy">Commissions</h1>
        </div>
        <button 
          onClick={onRefresh} 
          className="text-xs text-gpsc-green hover:underline flex items-center gap-1 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gpsc-cream-dark transition-all hover:shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock size={20} className="text-amber-600"/>
            </div>
            <div>
              <div className="font-display text-2xl text-gpsc-navy">{pendingCommissions.length}</div>
              <div className="text-xs text-gpsc-stone">Pending Release</div>
            </div>
          </div>
          <div className="text-sm text-gpsc-stone">
            Total: {formatCurrency(totalPending)}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gpsc-cream-dark transition-all hover:shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gpsc-green/20 flex items-center justify-center">
              <CheckCircle size={20} className="text-gpsc-green"/>
            </div>
            <div>
              <div className="font-display text-2xl text-gpsc-navy">{commissionHistory.length}</div>
              <div className="text-xs text-gpsc-stone">Released This Month</div>
            </div>
          </div>
          <div className="text-sm text-gpsc-stone">
            Total: {formatCurrency(totalHistory)}
          </div>
        </div>
      </div>

      {/* Pending Commissions */}
      <div className="bg-white rounded-2xl border border-gpsc-cream-dark overflow-hidden">
        <div className="p-6 border-b border-gpsc-cream-dark flex justify-between items-center">
          <div>
            <h2 className="font-display text-lg text-gpsc-navy">Pending Commissions</h2>
            <p className="text-xs text-gpsc-stone">Commissions awaiting release to consultants</p>
          </div>
          <button className="text-xs text-gpsc-stone hover:text-gpsc-navy flex items-center gap-1">
            <Download size={12}/> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gpsc-cream/50 text-xs uppercase tracking-wider text-gpsc-stone">
              <tr>
                <th className="text-left p-4">Earned By</th>
                <th className="text-left p-4">From Member</th>
                <th className="text-left p-4">Level</th>
                <th className="text-right p-4">Amount</th>
                <th className="text-left p-4">Date</th>
                <th className="text-right p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingCommissions.map((comm) => (
                <tr key={comm.id} className="border-t border-gpsc-cream-dark hover:bg-gpsc-cream/40 transition-colors">
                  <td className="p-4">
                    <div className="text-gpsc-navy font-medium">{comm.recipientName}</div>
                    <div className="text-xs text-gpsc-stone font-mono">ID: {comm.recipientId.slice(0, 8)}</div>
                   </td>
                  <td className="p-4 text-gpsc-stone">{comm.fromMemberName}</td>
                  <td className="p-4 text-gpsc-stone">Level {comm.level}</td>
                  <td className="p-4 text-right font-medium text-gpsc-navy">{formatCurrency(comm.amount)}</td>
                  <td className="p-4 text-gpsc-stone">{formatDate(comm.date)}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setSelectedCommission(comm)}
                      className="bg-gpsc-green text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ml-auto transition-colors hover:bg-gpsc-green-light"
                    >
                      <Send size={12}/> Release
                    </button>
                   </td>
                 </tr>
              ))}
              {pendingCommissions.length === 0 && (
                <tr><td colSpan={6} className="text-center p-8 text-gpsc-stone">No pending commissions</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission History */}
      <div className="bg-white rounded-2xl border border-gpsc-cream-dark overflow-hidden">
        <div className="p-6 border-b border-gpsc-cream-dark">
          <h2 className="font-display text-lg text-gpsc-navy">Release History</h2>
          <p className="text-xs text-gpsc-stone">Recently released commissions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gpsc-cream/50 text-xs uppercase tracking-wider text-gpsc-stone">
              <tr>
                <th className="text-left p-4">Recipient</th>
                <th className="text-left p-4">From</th>
                <th className="text-left p-4">Level</th>
                <th className="text-right p-4">Amount</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Reference</th>
              </tr>
            </thead>
            <tbody>
              {commissionHistory.slice(0, 20).map((comm) => (
                <tr key={comm.id} className="border-t border-gpsc-cream-dark hover:bg-gpsc-cream/40 transition-colors">
                  <td className="p-4">
                    <div className="text-gpsc-navy">{comm.recipientName || comm.recipientId.slice(0, 8)}</div>
                  </td>
                  <td className="p-4 text-gpsc-stone">{comm.fromMemberName}</td>
                  <td className="p-4 text-gpsc-stone">Level {comm.level}</td>
                  <td className="p-4 text-right font-medium text-gpsc-navy">{formatCurrency(comm.amount)}</td>
                  <td className="p-4 text-gpsc-stone">{formatDate(comm.date)}</td>
                  <td className="p-4 text-gpsc-stone font-mono text-xs">—</td>
                </tr>
              ))}
              {commissionHistory.length === 0 && (
                <tr><td colSpan={6} className="text-center p-8 text-gpsc-stone">No release history</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Release Modal */}
      {selectedCommission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedCommission(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6 animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl text-gpsc-navy mb-4">Release Commission</h2>
            <div className="space-y-4">
              <div className="bg-gpsc-cream p-4 rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="text-gpsc-stone">Recipient:</span>
                  <span className="text-gpsc-navy font-medium">{selectedCommission.recipientName}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gpsc-stone">Amount:</span>
                  <span className="text-gpsc-navy font-display text-lg">{formatCurrency(selectedCommission.amount)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gpsc-stone">From:</span>
                  <span className="text-gpsc-navy font-medium">{selectedCommission.fromMemberName}</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gpsc-stone block mb-1">Reference Number</label>
                <input 
                  value={reference} 
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g., TRANSFER-2024-001"
                  className="w-full px-4 py-2 rounded-xl border border-gpsc-cream-dark focus:outline-none focus:ring-2 focus:ring-gpsc-green"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setSelectedCommission(null)} 
                className="flex-1 px-4 py-2 border border-gpsc-cream-dark rounded-lg text-gpsc-stone hover:bg-gpsc-cream/60 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleRelease} 
                disabled={!reference}
                className="flex-1 bg-gpsc-green text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gpsc-green-light transition-colors"
              >
                Confirm Release
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};