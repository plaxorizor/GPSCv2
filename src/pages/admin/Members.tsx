// admin/Members.tsx
import React, { useState } from 'react';
import { Plus, Search, Download, MoreVertical, CheckCircle, XCircle, Eye } from 'lucide-react';
import type { User } from '../member/types';
import { formatDate } from './utils';

interface Props {
  members: User[];
  loading: boolean;
  onUpdateStatus: (memberId: string, status: 'active' | 'inactive') => Promise<void>;
  onRefresh: () => void;
  onExport: () => void;
  onAddMember?: () => void;
}

const packageNames: Record<string, string> = { basic: 'Basic Care', family: 'Family Care', premium: 'Premium Care' };
const rankNames: Record<string, string> = { 
  sales_consultant: 'Sales Consultant', 
  team_consultant: 'Team Consultant',
  sales_manager: 'Sales Manager',
  provincial_director: 'Provincial Director',
  regional_director: 'Regional Director',
  national_director: 'National Director'
};

export const Members: React.FC<Props> = ({ 
  members, loading, onUpdateStatus, onRefresh, onExport, onAddMember 
}) => {
  const [query, setQuery] = useState('');
  const [packageFilter, setPackageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState<User | null>(null);

  const filtered = members.filter(m => {
    const matchesSearch = !query || 
      `${m.firstName} ${m.lastName} ${m.email} ${m.city}`.toLowerCase().includes(query.toLowerCase());
    const matchesPackage = packageFilter === 'all' || m.packageId === packageFilter;
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesPackage && matchesStatus;
  });

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-gpsc-stone">Member management</div>
          <h1 className="font-display text-3xl text-gpsc-navy">Users</h1>
        </div>
        <div className="flex gap-2">
          {onAddMember && (
            <button 
              onClick={onAddMember} 
              className="bg-gpsc-navy text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors hover:bg-gpsc-green"
            >
              <Plus size={14}/> Add user
            </button>
          )}
          <button 
            onClick={onExport} 
            className="border border-gpsc-navy text-gpsc-navy px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors hover:bg-gpsc-navy hover:text-white"
          >
            <Download size={14}/> Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gpsc-cream-dark overflow-hidden">
        <div className="p-4 border-b border-gpsc-cream-dark flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gpsc-stone"/>
            <input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="Search by name, email, city..." 
              className="w-full pl-9 pr-4 py-2 border border-gpsc-cream-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gpsc-green"
            />
          </div>
          <select 
            value={packageFilter} 
            onChange={(e) => setPackageFilter(e.target.value)}
            className="px-3 py-2 border border-gpsc-cream-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gpsc-green"
          >
            <option value="all">All packages</option>
            <option value="basic">Basic Care</option>
            <option value="family">Family Care</option>
            <option value="premium">Premium Care</option>
          </select>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gpsc-cream-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gpsc-green"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending_kyc">Pending KYC</option>
          </select>
          <button 
            onClick={onRefresh} 
            className="px-3 py-2 border border-gpsc-cream-dark rounded-lg text-sm hover:bg-gpsc-cream/60 transition-colors"
          >
            Refresh
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gpsc-cream/50 text-xs uppercase tracking-wider text-gpsc-stone">
              <tr>
                <th className="text-left p-4">Member</th>
                <th className="text-left p-4">Package</th>
                <th className="text-left p-4">Sponsor</th>
                <th className="text-left p-4">Rank</th>
                <th className="text-left p-4">Joined</th>
                <th className="text-left p-4">Status</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => (
                <tr key={member.id} className="border-t border-gpsc-cream-dark hover:bg-gpsc-cream/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gpsc-navy text-white flex items-center justify-center text-xs font-display">
                        {member.initials}
                      </div>
                      <div>
                        <div className="text-gpsc-navy font-medium">{member.firstName} {member.lastName}</div>
                        <div className="text-xs text-gpsc-stone">{member.email}</div>
                      </div>
                    </div>
                   </td>
                  <td className="p-4 text-gpsc-stone">
                    {member.packageId ? packageNames[member.packageId] || member.packageId : '—'}
                   </td>
                  <td className="p-4 text-gpsc-stone text-xs">—</td>
                  <td className="p-4 text-gpsc-stone text-xs">{rankNames[member.rankId] || member.rankId || 'Member'}</td>
                  <td className="p-4 text-gpsc-stone">{formatDate(member.memberSince)}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      member.status === 'active' 
                        ? 'bg-gpsc-green/10 text-gpsc-green' 
                        : member.status === 'pending_kyc' 
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                    }`}>
                      {member.status.replace('_', ' ')}
                    </span>
                   </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedMember(member)}
                        className="p-1 rounded text-gpsc-stone hover:bg-gpsc-cream transition-colors"
                        title="View details"
                      >
                        <Eye size={16}/>
                      </button>
                      <button 
                        onClick={() => onUpdateStatus(member.id, member.status === 'active' ? 'inactive' : 'active')}
                        className={`p-1 rounded transition-colors ${member.status === 'active' ? 'text-red-500 hover:bg-red-50' : 'text-gpsc-green hover:bg-gpsc-green/10'}`}
                        title={member.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {member.status === 'active' ? <XCircle size={16}/> : <CheckCircle size={16}/>}
                      </button>
                      <button className="p-1 rounded text-gpsc-stone hover:bg-gpsc-cream transition-colors">
                        <MoreVertical size={16}/>
                      </button>
                    </div>
                   </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gpsc-stone">
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedMember(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full mx-4 p-6 animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-xl text-gpsc-navy">Member Details</h2>
              <button onClick={() => setSelectedMember(null)} className="text-gpsc-stone hover:text-gpsc-navy transition-colors">✕</button>
            </div>
            <div className="flex items-center gap-4 mb-6 p-4 bg-gpsc-cream rounded-xl">
              <div className="w-16 h-16 rounded-full bg-gpsc-navy text-white flex items-center justify-center text-2xl font-display">
                {selectedMember.initials}
              </div>
              <div>
                <div className="font-display text-xl text-gpsc-navy">{selectedMember.firstName} {selectedMember.lastName}</div>
                <div className="text-sm text-gpsc-stone">{selectedMember.email}</div>
                <div className="text-sm text-gpsc-stone">{selectedMember.phone}</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><div className="text-xs text-gpsc-stone">Package</div><div className="text-gpsc-navy">{selectedMember.packageId ? packageNames[selectedMember.packageId] : '—'}</div></div>
                <div><div className="text-xs text-gpsc-stone">Rank</div><div className="text-gpsc-navy">{rankNames[selectedMember.rankId] || 'Member'}</div></div>
                <div><div className="text-xs text-gpsc-stone">City</div><div className="text-gpsc-navy">{selectedMember.city || '—'}</div></div>
                <div><div className="text-xs text-gpsc-stone">Province</div><div className="text-gpsc-navy">{selectedMember.province || '—'}</div></div>
                <div><div className="text-xs text-gpsc-stone">Member since</div><div className="text-gpsc-navy">{formatDate(selectedMember.memberSince)}</div></div>
                <div><div className="text-xs text-gpsc-stone">Status</div><div className={`${selectedMember.status === 'active' ? 'text-gpsc-green' : 'text-red-500'}`}>{selectedMember.status}</div></div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setSelectedMember(null)} className="flex-1 px-4 py-2 border border-gpsc-cream-dark rounded-lg text-gpsc-stone hover:bg-gpsc-cream/60 transition-colors">Close</button>
              <button onClick={() => {
                onUpdateStatus(selectedMember.id, selectedMember.status === 'active' ? 'inactive' : 'active');
                setSelectedMember(null);
              }} className="flex-1 px-4 py-2 bg-gpsc-navy text-white rounded-lg font-medium hover:bg-gpsc-green transition-colors">
                {selectedMember.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};