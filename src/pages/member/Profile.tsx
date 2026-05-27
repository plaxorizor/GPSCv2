import React from 'react';
import { Edit, Lock, Shield } from 'lucide-react';
import type { User, Beneficiary } from './types';
import { formatDate } from './utils';

interface Props {
  user: User;
  packageName: string;
  rankName: string;
  beneficiaries: Beneficiary[];
  onEditProfile: () => void;
  onChangePassword: () => void;
  onEnable2FA: () => void;
}

export const MemberProfile: React.FC<Props> = ({ user, packageName, rankName, beneficiaries, onEditProfile, onChangePassword, onEnable2FA }) => (
  <div className="space-y-6">
    <div><div className="text-xs uppercase tracking-wider text-gpsc-stone">Account</div><h1 className="font-display text-3xl text-gpsc-navy">Profile</h1></div>
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-gpsc-cream-dark">
          <h2 className="font-display text-lg text-gpsc-navy mb-4">Personal information</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div><div className="text-xs text-gpsc-stone uppercase tracking-wider mb-1">First name</div><div className="text-gpsc-navy">{user.firstName}</div></div>
            <div><div className="text-xs text-gpsc-stone uppercase tracking-wider mb-1">Last name</div><div className="text-gpsc-navy">{user.lastName}</div></div>
            <div><div className="text-xs text-gpsc-stone uppercase tracking-wider mb-1">Email</div><div className="text-gpsc-navy">{user.email}</div></div>
            <div><div className="text-xs text-gpsc-stone uppercase tracking-wider mb-1">Phone</div><div className="text-gpsc-navy">{user.phone}</div></div>
            <div><div className="text-xs text-gpsc-stone uppercase tracking-wider mb-1">City</div><div className="text-gpsc-navy">{user.city}</div></div>
            <div><div className="text-xs text-gpsc-stone uppercase tracking-wider mb-1">Province</div><div className="text-gpsc-navy">{user.province}</div></div>
          </div>
          <button onClick={onEditProfile} className="mt-6 text-sm text-gpsc-green flex items-center gap-1 hover:underline"><Edit size={12}/> Edit details</button>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gpsc-cream-dark">
          <h2 className="font-display text-lg text-gpsc-navy mb-4">Beneficiaries</h2>
          <div className="space-y-3">
            {beneficiaries.map(b => (
              <div key={b.id} className="flex items-center gap-3 p-3 border border-gpsc-cream-dark rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gpsc-cream-dark flex items-center justify-center text-xs text-gpsc-navy font-display">{b.name.split(' ').map(n=>n[0]).join('')}</div>
                <div className="flex-1"><div className="text-sm text-gpsc-navy">{b.name}</div><div className="text-xs text-gpsc-stone">{b.relationship} · {b.coverage}% coverage</div></div>
                <button className="text-gpsc-stone hover:text-gpsc-navy"><Edit size={14}/></button>
              </div>
            ))}
            {beneficiaries.length === 0 && <div className="text-center text-gpsc-stone py-4">No beneficiaries added yet</div>}
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-gpsc-cream-dark">
          <h2 className="font-display text-lg text-gpsc-navy mb-4">Membership</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gpsc-stone">Package</span><span className="text-gpsc-navy font-medium">{packageName}</span></div>
            <div className="flex justify-between"><span className="text-gpsc-stone">Member since</span><span className="text-gpsc-navy">{formatDate(user.memberSince)}</span></div>
            <div className="flex justify-between"><span className="text-gpsc-stone">Status</span><span className="text-gpsc-green font-medium">Active</span></div>
            <div className="flex justify-between"><span className="text-gpsc-stone">Rank</span><span className="text-gpsc-navy">{rankName}</span></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gpsc-cream-dark">
          <h2 className="font-display text-lg text-gpsc-navy mb-4">Security</h2>
          <div className="space-y-3">
            <button onClick={onChangePassword} className="w-full text-left p-3 border border-gpsc-cream-dark rounded-xl hover:bg-gpsc-cream/40 flex items-center gap-3 text-sm"><Lock size={16} className="text-gpsc-stone"/> Change password</button>
            <button onClick={onEnable2FA} className="w-full text-left p-3 border border-gpsc-cream-dark rounded-xl hover:bg-gpsc-cream/40 flex items-center gap-3 text-sm"><Shield size={16} className="text-gpsc-stone"/> Enable 2FA</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);