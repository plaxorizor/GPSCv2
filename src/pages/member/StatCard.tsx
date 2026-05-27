import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon: Icon, actionLabel, onAction }) => (
  <div className="bg-white rounded-2xl p-5 border border-gpsc-cream-dark">
    <div className="flex items-start justify-between mb-3">
      <div className="text-xs uppercase tracking-wider text-gpsc-stone">{label}</div>
      <div className="w-9 h-9 rounded-full bg-gpsc-cream flex items-center justify-center text-gpsc-navy">
        <Icon size={16} />
      </div>
    </div>
    <div className="font-display text-3xl text-gpsc-navy">{value}</div>
    {sub && <div className="text-xs text-gpsc-stone mt-1">{sub}</div>}
    {actionLabel && onAction && (
      <button onClick={onAction} className="text-xs text-gpsc-green mt-3 hover:underline">
        {actionLabel} →
      </button>
    )}
  </div>
);