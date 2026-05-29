// admin/DatabaseViewer.tsx
import React, { useState } from 'react';
import { Database as DatabaseIcon, Users, FileText, Wallet, HandHeart,  } from 'lucide-react';
import type { User, Claim } from '../member/types';
import type { CommissionRecord } from './types';



interface TableConfig {
  data: Array<Record<string, unknown>>;
  label: string;
  icon: React.ElementType;
  desc: string;
}

interface Props {
  members: User[];
  claims: Claim[];
  commissions: CommissionRecord[];
  payouts: unknown[];
  loading: { stats?: boolean; members?: boolean; claims?: boolean; commissions?: boolean };
}

// Helper to convert any object to Record<string, unknown>
const toRecord = <T extends object>(obj: T): Record<string, unknown> => {
  return obj as unknown as Record<string, unknown>;
};

export const DatabaseViewer: React.FC<Props> = ({ members, claims, commissions, payouts, loading }) => {
  const [table, setTable] = useState('users');

  const tables: Record<string, TableConfig> = {
    users: { 
      data: members.map(m => toRecord({ ...m, rank: m.rankId, package: m.packageId })), 
      label: 'users', 
      icon: Users, 
      desc: 'Member and admin accounts with referral relationships' 
    },
    claims: { 
      data: claims.map(c => toRecord({ ...c, documents: `${c.documents?.length || 0} docs` })), 
      label: 'claims', 
      icon: FileText, 
      desc: 'Benefit claims with status and amounts' 
    },
    commissions: { 
      data: commissions.map(c => toRecord(c)), 
      label: 'commissions', 
      icon: Wallet, 
      desc: 'Multi-level commission ledger (append-only)' 
    },
    payouts: { 
      data: (payouts as object[]).map(p => toRecord(p)), 
      label: 'payouts', 
      icon: HandHeart, 
      desc: 'Commission payout requests and disbursements' 
    },
  };

  const current = tables[table];
  const columns = current.data.length > 0 ? Object.keys(current.data[0]) : [];

  if (loading.stats) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gpsc-cream-dark rounded w-48 mb-4"></div>
          <div className="h-96 bg-gpsc-cream-dark rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const renderCellValue = (value: unknown): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-gpsc-stone italic">null</span>;
    }
    if (typeof value === 'boolean') {
      return <span className="text-gpsc-navy">{String(value)}</span>;
    }
    if (typeof value === 'number') {
      return <span className="text-gpsc-green">{value}</span>;
    }
    if (typeof value === 'string') {
      // Truncate long strings
      const display = value.length > 50 ? value.slice(0, 47) + '...' : value;
      return <span className="text-gpsc-navy">{display}</span>;
    }
    if (typeof value === 'object') {
      return <span className="text-gpsc-stone italic">[object]</span>;
    }
    return <span className="text-gpsc-navy">{String(value)}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-wider text-gpsc-stone">Behind the scenes</div>
        <h1 className="font-display text-3xl text-gpsc-navy">Database viewer</h1>
        <p className="text-sm text-gpsc-stone mt-2 max-w-2xl">
          A read-only window into the data layer. In production this lives in PostgreSQL.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {Object.entries(tables).map(([key, t]) => (
          <button
            key={key}
            onClick={() => setTable(key)}
            className={`p-4 rounded-2xl border text-left transition-all ${
              table === key 
                ? 'bg-gpsc-navy text-white border-gpsc-navy' 
                : 'bg-white border-gpsc-cream-dark hover:border-gpsc-navy hover:shadow-sm'
            }`}
          >
            <t.icon size={16} className="mb-2"/>
            <div className={`text-xs font-mono ${table === key ? 'text-white' : 'text-gpsc-navy'}`}>{t.label}</div>
            <div className={`text-xs mt-1 ${table === key ? 'text-white/60' : 'text-gpsc-stone'}`}>{current.data.length} rows</div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gpsc-cream-dark overflow-hidden">
        <div className="p-5 border-b border-gpsc-cream-dark flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <DatabaseIcon size={16} className="text-gpsc-green"/>
              <span className="font-mono text-sm text-gpsc-navy">SELECT * FROM <strong>{current.label}</strong>;</span>
            </div>
            <p className="text-xs text-gpsc-stone mt-1">{current.desc}</p>
          </div>
          <div className="text-xs text-gpsc-stone">
            <span className="font-medium text-gpsc-navy">{current.data.length}</span> rows · 
            <span className="font-medium text-gpsc-navy ml-1">{columns.length}</span> columns
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead className="bg-gpsc-cream/50 text-gpsc-stone">
              <tr>
                {columns.map((c) => (
                  <th key={c} className="text-left p-3 uppercase tracking-wider font-medium whitespace-nowrap">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {current.data.map((row, i) => (
                <tr key={i} className="border-t border-gpsc-cream-dark hover:bg-gpsc-cream/40 transition-colors">
                  {columns.map((c) => (
                    <td key={c} className="p-3 whitespace-nowrap">
                      {renderCellValue(row[c])}
                    </td>
                  ))}
                </tr>
              ))}
              {current.data.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="text-center p-8 text-gpsc-stone">No data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gpsc-navy text-white rounded-2xl p-6">
        <h2 className="font-display text-lg mb-3">Schema notes</h2>
        <ul className="space-y-2 text-sm text-white/80">
          <li>· <strong className="text-white">Append-only ledger.</strong> Commissions are never edited — reversals are new rows.</li>
          <li>· <strong className="text-white">UUIDs as primary keys.</strong> Avoids leaking row counts in URLs.</li>
          <li>· <strong className="text-white">Money in centavos.</strong> No floating-point rounding errors on commissions.</li>
          <li>· <strong className="text-white">Adjacency-list tree.</strong> Every user has a sponsor_id pointing to their upline.</li>
          <li>· <strong className="text-white">Soft deletes.</strong> Users and records carry a deleted_at field.</li>
        </ul>
      </div>
    </div>
  );
};