// pages/admin/AdminMembers.tsx
import { useEffect, useState } from "react";
import { getAllMembers, updateMemberStatus } from "../../firebase/admin";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ChevronLeft,
  Search,
  Download,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Package,
  Award,
  MapPin,
  RefreshCw,
  CheckCircle,
  XCircle
} from "lucide-react";

interface Member {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  province?: string;
  package?: string;
  rank?: string;
  status: "active" | "inactive" | "pending";
  joinedAt?: string;
}

const AdminMembers = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadMembers = async () => {
    setLoading(true);
    const data = await getAllMembers();
    const typedMembers: Member[] = (data as Member[]).map((item) => ({
      id: item.id,
      fullName: item.fullName,
      email: item.email,
      phone: item.phone,
      city: item.city,
      province: item.province,
      package: item.package,
      rank: item.rank,
      status: item.status,
      joinedAt: item.joinedAt,
    }));
    setMembers(typedMembers);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const data = await getAllMembers();
      if (active) {
        const typedMembers: Member[] = (data as Member[]).map((item) => ({
          id: item.id,
          fullName: item.fullName,
          email: item.email,
          phone: item.phone,
          city: item.city,
          province: item.province,
          package: item.package,
          rank: item.rank,
          status: item.status,
          joinedAt: item.joinedAt,
        }));
        setMembers(typedMembers);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleStatus = async (uid: string, status: "active" | "inactive") => {
    setActionLoading(uid);
    await updateMemberStatus(uid, status);
    setMembers((prev) => prev.map((m) => (m.id === uid ? { ...m, status } : m)));
    setActionLoading(null);
    if (selectedMember?.id === uid) {
      setSelectedMember({ ...selectedMember, status });
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch = !searchQuery || 
      `${m.fullName} ${m.email} ${m.city}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = members.filter(m => m.status === "active").length;
  const inactiveCount = members.filter(m => m.status === "inactive").length;
  const pendingCount = members.filter(m => m.status === "pending").length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen gpsc-cream">
      {/* Header */}
      <div className="bg-white border-b border-gpsc-cream-dark sticky top-0 z-20">
        <div className="px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin")}
              className="p-2 hover:bg-gpsc-cream rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="text-gpsc-stone" />
            </button>
            <div>
              <h1 className="font-display text-2xl text-gpsc-navy">Member Management</h1>
              <p className="text-sm text-gpsc-stone">View and manage all registered members</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <SummaryCard label="Active Members" value={activeCount} color="#22c55e" icon={UserCheck} />
          <SummaryCard label="Inactive Members" value={inactiveCount} color="#ef4444" icon={UserX} />
          <SummaryCard label="Pending Approval" value={pendingCount} color="#f59e0b" icon={ClockIcon} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Members List */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gpsc-cream-dark overflow-hidden">
            {/* Search and Filter Bar */}
            <div className="p-4 border-b border-gpsc-cream-dark bg-gpsc-cream/30">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gpsc-stone" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gpsc-cream-dark focus:outline-none focus:ring-2 ring-gpsc-green text-sm"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-gpsc-cream-dark focus:outline-none focus:ring-2 ring-gpsc-green text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
                <button
                  onClick={loadMembers}
                  className="px-4 py-2 rounded-xl border border-gpsc-cream-dark hover:bg-gpsc-cream transition-colors flex items-center gap-2 text-sm"
                >
                  <RefreshCw size={14} />
                  Refresh
                </button>
                <button className="px-4 py-2 rounded-xl bg-gpsc-navy text-white hover:bg-gpsc-navy/90 transition-colors flex items-center gap-2 text-sm">
                  <Download size={14} />
                  Export
                </button>
              </div>
            </div>

            {/* Members Table */}
            <div className="overflow-x-auto max-h-150 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gpsc-cream/50 sticky top-0">
                  <tr>
                    <th className="text-left p-4 text-xs font-medium text-gpsc-stone uppercase tracking-wider">Member</th>
                    <th className="text-left p-4 text-xs font-medium text-gpsc-stone uppercase tracking-wider">Package</th>
                    <th className="text-left p-4 text-xs font-medium text-gpsc-stone uppercase tracking-wider">Status</th>
                    <th className="text-right p-4 text-xs font-medium text-gpsc-stone uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gpsc-cream-dark">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center">
                        <Users size={48} className="text-gpsc-stone/30 mx-auto mb-3" />
                        <p className="text-gpsc-stone">No members found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => (
                      <tr
                        key={member.id}
                        className={`hover:bg-gpsc-cream/50 transition-colors cursor-pointer ${
                          selectedMember?.id === member.id ? "bg-gpsc-cream" : ""
                        }`}
                        onClick={() => setSelectedMember(member)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gpsc-navy text-white flex items-center justify-center font-display text-sm">
                              {member.fullName?.split(" ").map((n: string) => n[0]).join("") || "U"}
                            </div>
                            <div>
                              <p className="font-medium text-gpsc-navy">{member.fullName || "N/A"}</p>
                              <p className="text-xs text-gpsc-stone">{member.email || "No email"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gpsc-cream-dark text-gpsc-navy">
                            <Package size={10} />
                            {member.package || "Basic"}
                          </span>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={member.status} />
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatus(member.id, "active");
                              }}
                              disabled={member.status === "active" || actionLoading === member.id}
                              className="p-1.5 rounded-lg hover:bg-gpsc-green/10 transition-colors disabled:opacity-30"
                              title="Activate"
                            >
                              {actionLoading === member.id ? (
                                <div className="w-4 h-4 border-2 border-gpsc-green border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <CheckCircle size={16} className="text-gpsc-green" />
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatus(member.id, "inactive");
                              }}
                              disabled={member.status === "inactive" || actionLoading === member.id}
                              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-30"
                              title="Deactivate"
                            >
                              <XCircle size={16} className="text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Member Details Panel */}
          <div className="bg-white rounded-2xl border border-gpsc-cream-dark">
            {selectedMember ? (
              <div>
                <div className="p-5 border-b border-gpsc-cream-dark bg-linear-to-r from-gpsc-cream to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gpsc-navy text-white flex items-center justify-center font-display text-xl">
                      {selectedMember.fullName?.split(" ").map((n: string) => n[0]).join("") || "U"}
                    </div>
                    <div>
                      <h2 className="font-display text-xl text-gpsc-navy">{selectedMember.fullName || "Unknown Member"}</h2>
                      <StatusBadge status={selectedMember.status} />
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  {/* Contact Info */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gpsc-navy flex items-center gap-2">
                      <Mail size={14} /> Contact Information
                    </h3>
                    <InfoRow icon={Mail} label="Email" value={selectedMember.email || "—"} />
                    <InfoRow icon={Phone} label="Phone" value={selectedMember.phone || "—"} />
                    <InfoRow icon={MapPin} label="Location" value={selectedMember.city ? `${selectedMember.city}, ${selectedMember.province || ""}` : "—"} />
                  </div>

                  {/* Membership Info */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gpsc-navy flex items-center gap-2">
                      <Package size={14} /> Membership Details
                    </h3>
                    <InfoRow icon={Package} label="Package" value={selectedMember.package || "Basic"} />
                    <InfoRow icon={Calendar} label="Joined" value={selectedMember.joinedAt ? new Date(selectedMember.joinedAt).toLocaleDateString() : "—"} />
                    <InfoRow icon={Award} label="Rank" value={selectedMember.rank || "Member"} />
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gpsc-cream-dark">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleStatus(selectedMember.id, "active")}
                        disabled={selectedMember.status === "active"}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-gpsc-green/10 text-gpsc-green hover:bg-gpsc-green/20 transition-colors disabled:opacity-40"
                      >
                        <CheckCircle size={14} />
                        Activate
                      </button>
                      <button
                        onClick={() => handleStatus(selectedMember.id, "inactive")}
                        disabled={selectedMember.status === "inactive"}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-40"
                      >
                        <XCircle size={14} />
                        Deactivate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Users size={48} className="text-gpsc-stone/30 mx-auto mb-3" />
                <p className="text-gpsc-stone">Select a member to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface SummaryCardProps {
  label: string;
  value: number;
  color: string;
  icon: React.ElementType;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, color, icon: Icon }) => (
  <div className="bg-white rounded-2xl p-5 border border-gpsc-cream-dark">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wider text-gpsc-stone">{label}</p>
        <p className="font-display text-3xl text-gpsc-navy mt-1">{value}</p>
      </div>
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        <Icon size={22} style={{ color }} />
      </div>
    </div>
  </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: "#dcfce7", text: "#22c55e", label: "Active" },
    inactive: { bg: "#fee2e2", text: "#ef4444", label: "Inactive" },
    pending: { bg: "#fef3c7", text: "#f59e0b", label: "Pending" },
  };
  const { bg, text, label } = config[status] || config.inactive;
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: bg, color: text }}>
      {label}
    </span>
  );
};

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 text-sm">
    <Icon size={14} className="text-gpsc-stone shrink-0" />
    <span className="text-gpsc-stone w-20">{label}</span>
    <span className="text-gpsc-navy flex-1 truncate">{value}</span>
  </div>
);

const ClockIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const LoadingSpinner = () => (
  <div className="min-h-screen gpsc-cream flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-gpsc-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gpsc-stone">Loading members...</p>
    </div>
  </div>
);

export default AdminMembers;