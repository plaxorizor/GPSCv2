// pages/admin/AdminDashboard.tsx
import { useEffect, useState } from "react";
import type { DocumentData } from "firebase/firestore";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../firebase/auth";
import useMember from "../../hooks/useMember";
import {
  Users,
  FileText,
  DollarSign,
  LogOut,
  UserCheck,
  AlertCircle,
  Clock,
  Menu,
  X,
  Bell,
  ChevronRight,
  Activity,
  Shield
} from "lucide-react";

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  pendingClaims: number;
  pendingCommissions: number;
}

interface MemberData extends DocumentData {
  status: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    pendingClaims: 0,
    pendingCommissions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchStats = async () => {
    const [membersSnap, claimsSnap, commissionsSnap] = await Promise.all([
      getDocs(collection(db, "members")),
      getDocs(query(collection(db, "claims"), where("status", "==", "pending"))),
      getDocs(query(collection(db, "commissions"), where("status", "==", "pending"))),
    ]);
    const allMembers = membersSnap.docs.map((d) => d.data() as MemberData);
    return {
      totalMembers: allMembers.length,
      activeMembers: allMembers.filter((m) => m.status === "active").length,
      pendingClaims: claimsSnap.size,
      pendingCommissions: commissionsSnap.size,
    };
  };

  useEffect(() => {
    let active = true;
    (async () => {
      const data = await fetchStats();
      if (active) {
        setStats(data);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/");
  };

  const { member } = useMember();

  if (loading) return <LoadingSpinner />;

  const navItems = [
    { label: "Members", path: "/admin/members", icon: Users, color: "#14365C", count: stats.totalMembers },
    { label: "Claims", path: "/admin/claims", icon: FileText, color: "#f59e0b", count: stats.pendingClaims },
    { label: "Commissions", path: "/admin/commissions", icon: DollarSign, color: "#4A8A2C", count: stats.pendingCommissions },
  ];

  return (
    <div className="min-h-screen gpsc-cream">
      {/* Modern Header */}
      <header className="bg-white border-b border-gpsc-cream-dark sticky top-0 z-30">
        <div className="px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-gpsc-navy"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center gap-3">
                <Shield size={28} className="text-gpsc-green" />
                <div>
                  <h1 className="font-display text-xl text-gpsc-navy">Admin Portal</h1>
                  <p className="text-xs text-gpsc-stone">Green Pasture Shepherd's Care</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gpsc-cream rounded-full transition-colors">
                <Bell size={20} className="text-gpsc-stone" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-gpsc-green rounded-full"></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gpsc-navy">{member?.firstName} {member?.lastName}</p>
                  <p className="text-xs text-gpsc-stone">Administrator</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gpsc-navy text-white flex items-center justify-center font-display">
                  {member?.firstName?.[0]}{member?.lastName?.[0]}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-gpsc-cream rounded-full transition-colors"
                >
                  <LogOut size={20} className="text-gpsc-stone" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gpsc-cream-dark min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gpsc-cream transition-all group"
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} style={{ color: item.color }} />
                  <span className="text-gpsc-navy font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.count > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                      {item.count}
                    </span>
                  )}
                  <ChevronRight size={14} className="text-gpsc-stone opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </nav>

          <div className="absolute bottom-0 w-64 p-4 border-t border-gpsc-cream-dark">
            <div className="flex items-center gap-3 text-xs text-gpsc-stone">
              <Activity size={14} />
              <span>System Online</span>
            </div>
          </div>
        </aside>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl z-50">
              <div className="p-4 border-b border-gpsc-cream-dark">
                <div className="flex items-center gap-3">
                  <Shield size={24} className="text-gpsc-green" />
                  <div>
                    <p className="font-display text-gpsc-navy">Admin Portal</p>
                    <p className="text-xs text-gpsc-stone">v2.0</p>
                  </div>
                </div>
              </div>
              <nav className="p-4 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gpsc-cream"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} style={{ color: item.color }} />
                      <span className="text-gpsc-navy">{item.label}</span>
                    </div>
                    {item.count > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="font-display text-3xl text-gpsc-navy">Welcome back, {member?.firstName}</h1>
            <p className="text-gpsc-stone mt-1">{currentTime.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard
              label="Total Members"
              value={stats.totalMembers}
              icon={Users}
              color="#14365C"
              trend="+12%"
            />
            <StatCard
              label="Active Members"
              value={stats.activeMembers}
              icon={UserCheck}
              color="#4A8A2C"
              subtext={`${Math.round((stats.activeMembers / stats.totalMembers) * 100)}% of total`}
            />
            <StatCard
              label="Pending Claims"
              value={stats.pendingClaims}
              icon={AlertCircle}
              color="#f59e0b"
              subtext="Awaiting review"
            />
            <StatCard
              label="Pending Commissions"
              value={stats.pendingCommissions}
              icon={Clock}
              color="#3b82f6"
              subtext="Ready for release"
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 border border-gpsc-cream-dark mb-8">
            <h2 className="font-display text-lg text-gpsc-navy mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <QuickActionButton
                onClick={() => navigate("/admin/members")}
                icon={Users}
                title="Manage Members"
                description="View, edit, and manage member accounts"
                color="#14365C"
              />
              <QuickActionButton
                onClick={() => navigate("/admin/claims")}
                icon={FileText}
                title="Review Claims"
                description={`${stats.pendingClaims} claims waiting for review`}
                color="#f59e0b"
              />
              <QuickActionButton
                onClick={() => navigate("/admin/commissions")}
                icon={DollarSign}
                title="Release Commissions"
                description={`${stats.pendingCommissions} pending payouts`}
                color="#4A8A2C"
              />
            </div>
          </div>

          {/* Recent Activity Preview */}
          <div className="bg-white rounded-2xl p-6 border border-gpsc-cream-dark">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg text-gpsc-navy">Recent Activity</h2>
              <button className="text-xs text-gpsc-green hover:underline">View All →</button>
            </div>
            <div className="space-y-4">
              <ActivityItem
                icon={UserCheck}
                title="New member registration"
                time="2 hours ago"
                color="#4A8A2C"
              />
              <ActivityItem
                icon={FileText}
                title="Claim submitted"
                description="Hospital cash assistance"
                time="5 hours ago"
                color="#f59e0b"
              />
              <ActivityItem
                icon={DollarSign}
                title="Commission released"
                description="₱1,200 to Maria Dela Cruz"
                time="1 day ago"
                color="#3b82f6"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  trend?: string;
  subtext?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, trend, subtext }) => (
  <div className="bg-white rounded-2xl p-5 border border-gpsc-cream-dark hover:shadow-lg transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs uppercase tracking-wider text-gpsc-stone">{label}</p>
        <p className="font-display text-3xl text-gpsc-navy mt-1">{value}</p>
        {trend && <p className="text-xs text-gpsc-green mt-1">↑ {trend} from last month</p>}
        {subtext && <p className="text-xs text-gpsc-stone mt-1">{subtext}</p>}
      </div>
      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}10` }}>
        <Icon size={20} style={{ color }} />
      </div>
    </div>
  </div>
);

interface QuickActionButtonProps {
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ onClick, icon: Icon, title, description, color }) => (
  <button
    onClick={onClick}
    className="flex items-start gap-3 p-4 rounded-xl border border-gpsc-cream-dark hover:bg-gpsc-cream transition-all text-left group"
  >
    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}10` }}>
      <Icon size={18} style={{ color }} />
    </div>
    <div>
      <p className="font-medium text-gpsc-navy">{title}</p>
      <p className="text-xs text-gpsc-stone mt-1">{description}</p>
    </div>
  </button>
);

interface ActivityItemProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  time: string;
  color: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ icon: Icon, title, description, time, color }) => (
  <div className="flex items-start gap-3 pb-4 border-b border-gpsc-cream-dark last:border-0 last:pb-0">
    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}10` }}>
      <Icon size={14} style={{ color }} />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gpsc-navy">{title}</p>
      {description && <p className="text-xs text-gpsc-stone">{description}</p>}
    </div>
    <p className="text-xs text-gpsc-stone">{time}</p>
  </div>
);

const LoadingSpinner = () => (
  <div className="min-h-screen gpsc-cream flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-gpsc-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gpsc-stone">Loading dashboard...</p>
    </div>
  </div>
);

export default AdminDashboard;