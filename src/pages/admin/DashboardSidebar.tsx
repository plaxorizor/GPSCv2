// admin/DashboardSidebar.tsx
import React from 'react';
import { LogOut } from 'lucide-react';
import type { User } from '../member/types';


interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number | null;
}

interface Props {
  user: User;
  rankName: string;
  currentSection: string;
  onSectionChange: (section: string) => void;
  items: SidebarItem[];
  onLogout: () => void;
}

const LogoLockup = () => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 relative">
      <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="48" stroke="#14365C" strokeWidth="1.5" fill="none" opacity="0.4"/>
        <path d="M 20 70 Q 30 55, 45 60 T 80 55" stroke="#4A8A2C" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M 25 75 Q 40 65, 55 70 T 82 65" stroke="#14365C" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
        <path d="M 50 25 L 50 38 M 44 31 L 56 31" stroke="#14365C" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="68" cy="42" r="6" fill="#4A8A2C" opacity="0.85"/>
        <circle cx="72" cy="38" r="3" fill="#4A8A2C"/>
        <path d="M 30 55 Q 35 48, 32 42 Q 30 38, 33 35" stroke="#14365C" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
    <div className="leading-tight">
      <div className="font-display font-semibold text-base tracking-tight text-gpsc-navy">Green Pasture</div>
      <div className="font-display italic text-xs text-gpsc-green">Shepherd's Care</div>
    </div>
  </div>
);

export const DashboardSidebar: React.FC<Props> = ({ 
  user, rankName, currentSection, onSectionChange, items, onLogout 
}) => (
  <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gpsc-cream-dark min-h-screen">
    <div className="p-6 border-b border-gpsc-cream-dark">
      <LogoLockup />
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
            currentSection === item.id 
              ? 'bg-gpsc-cream text-gpsc-navy font-medium' 
              : 'text-gpsc-stone hover:bg-gpsc-cream/60'
          }`}
        >
          <item.icon size={16} />
          <span>{item.label}</span>
          {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
            <span className="ml-auto bg-gpsc-green text-white text-xs px-2 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
    <button 
      onClick={onLogout} 
      className="m-3 px-3 py-2.5 rounded-xl text-sm text-gpsc-stone hover:bg-gpsc-cream/60 flex items-center gap-3 transition-colors"
    >
      <LogOut size={16} /> Sign out
    </button>
  </aside>
);