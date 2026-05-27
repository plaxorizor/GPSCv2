import React from 'react';
import { Copy, Share2, MessageCircle } from 'lucide-react';
import type { User, ReferralNode } from './types';
import { formatDate } from './utils';

interface Props {
  user: User;
  referralLink: string;
  onCopyReferralLink: () => void;
  onShareReferralLink: (method: 'copy' | 'messenger' | 'whatsapp') => void;
  referralTree: ReferralNode[];
}

const ReferralNodeView: React.FC<{ node: ReferralNode; depth?: number }> = ({ node, depth = 0 }) => (
  <div style={{ marginLeft: depth === 0 ? 0 : 12 }} className="mt-2">
    <div className="flex items-center gap-3 p-3 border border-gpsc-cream-dark rounded-xl bg-white">
      <div className="w-10 h-10 rounded-full bg-gpsc-green text-white flex items-center justify-center font-display text-sm">{node.initials}</div>
      <div className="flex-1">
        <div className="font-medium text-gpsc-navy">{node.firstName} {node.lastName}</div>
        <div className="text-xs text-gpsc-stone">{node.packageName} · {node.city} · {formatDate(node.memberSince)}</div>
      </div>
      <div className="text-right">
        <div className={`text-xs px-2 py-1 rounded-full inline-block ${node.status === 'active' ? 'bg-gpsc-green/10 text-gpsc-green' : 'bg-amber-100 text-amber-700'}`}>{node.status}</div>
        <div className="text-xs text-gpsc-stone mt-1">Level {node.level} · {node.commissionRate}%</div>
      </div>
    </div>
    {node.downline.map(child => <ReferralNodeView key={child.id} node={child} depth={depth + 1} />)}
  </div>
);

export const MemberReferrals: React.FC<Props> = ({ user, referralLink, onCopyReferralLink, onShareReferralLink, referralTree }) => (
  <div className="space-y-6">
    <div><div className="text-xs uppercase tracking-wider text-gpsc-stone">Your network</div><h1 className="font-display text-3xl text-gpsc-navy">My referrals</h1></div>
    <div className="bg-gpsc-navy rounded-2xl p-6 text-white">
      <div className="grid sm:grid-cols-2 gap-6 items-center">
        <div><div className="text-xs uppercase tracking-wider text-white/60 mb-2">Your unique referral link</div><div className="bg-white/10 rounded-xl px-4 py-3 text-sm font-mono break-all">{referralLink}</div></div>
        <div className="flex flex-wrap gap-2">
          <button onClick={onCopyReferralLink} className="bg-white text-gpsc-navy px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Copy size={14}/> Copy</button>
          <button onClick={() => onShareReferralLink('messenger')} className="bg-gpsc-green text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><MessageCircle size={14}/> Messenger</button>
          <button onClick={() => onShareReferralLink('whatsapp')} className="bg-gpsc-green text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Share2 size={14}/> WhatsApp</button>
        </div>
      </div>
    </div>
    <div className="bg-white rounded-2xl p-6 border border-gpsc-cream-dark">
      <h2 className="font-display text-lg text-gpsc-navy mb-4">Network tree</h2>
      <div className="space-y-2">
        <div className="flex items-center gap-3 p-3 bg-gpsc-cream rounded-xl">
          <div className="w-10 h-10 rounded-full bg-gpsc-navy text-white flex items-center justify-center font-display">{user.initials}</div>
          <div className="flex-1"><div className="font-medium text-gpsc-navy">You ({user.firstName})</div><div className="text-xs text-gpsc-stone">Member</div></div>
          <div className="text-sm text-gpsc-stone">Level 0</div>
        </div>
        {referralTree.map(node => <ReferralNodeView key={node.id} node={node} />)}
        {referralTree.length === 0 && <div className="text-center text-gpsc-stone py-8">No referrals yet. Share your link to start building your network.</div>}
      </div>
    </div>
  </div>
);