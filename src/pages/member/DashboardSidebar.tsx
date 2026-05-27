import React from 'react';
import { LogOut } from 'lucide-react';
import type { User } from './types';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface Props {
  user: User;
  rankName: string;
  currentSection: string;
  onSectionChange: (section: string) => void;
  items: SidebarItem[];
  onLogout: () => void;
}

export const DashboardSidebar: React.FC<Props> = ({ user, rankName, currentSection, onSectionChange, items, onLogout }) => (
  <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gpsc-cream-dark min-h-screen">
    <div className="p-6 border-b border-gpsc-cream-dark">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 relative">
          <div className="absolute inset-0 rounded-full border border-gpsc-navy/30"></div>
          <div className="absolute inset-1 rounded-full bg-gpsc-green/20"></div>
          <div className="absolute inset-2 rounded-full bg-gpsc-navy flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white"></div>
          </div>
        </div>
        <div className="leading-tight">
          <div className="font-display font-semibold text-base tracking-tight text-gpsc-navy">Green Pasture</div>
          <div className="font-display italic text-xs text-gpsc-green">Shepherd's Care</div>
        </div>
      </div>
    </div>
    <div className="p-4 border-b border-gpsc-cream-dark">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gpsc-navy text-white flex items-center justify-center text-sm font-display">
          {user.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-sm text-gpsc-navy truncate">{user.firstName} {user.lastName}</div>
          <div className="text-xs text-gpsc-stone truncate">{rankName}</div>
        </div>
      </div>
    </div>
    <nav className="flex-1 p-3 space-y-1">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSectionChange(item.id)}
          className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center gap-3 transition-colors ${
            currentSection === item.id ? 'bg-gpsc-cream text-gpsc-navy font-medium' : 'text-gpsc-stone hover:bg-gpsc-cream/60'
          }`}
        >
          <item.icon size={16} />
          {item.label}
          {item.badge !== undefined && item.badge > 0 && (
            <span className="ml-auto bg-gpsc-green text-white text-xs px-2 py-0.5 rounded-full">{item.badge}</span>
          )}
        </button>
      ))}
    </nav>
    <button onClick={onLogout} className="m-3 px-3 py-2.5 rounded-xl text-sm text-gpsc-stone hover:bg-gpsc-cream/60 flex items-center gap-3">
      <LogOut size={16} /> Sign out
    </button>
  </aside>
);