// pages/admin/AdminClaims.tsx
import { useEffect, useState } from "react";
import { getAllClaims, updateClaimStatus } from "../../firebase/admin";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  ChevronLeft,
  CheckCircle,
  XCircle,
  Send,
  Eye,
  Download,
  Clock,
  User,
  Calendar,
  DollarSign,
  FileCheck,
  RefreshCw,
  ChevronRight
} from "lucide-react";

interface Claim {
  id: string;
  memberId: string;
  type: string;
  status: "pending" | "approved" | "rejected" | "released";
  amount?: number;
  documents?: string[];
  submittedAt?: string;
}

interface StatusConfig {
  bg: string;
  text: string;
  icon: React.ElementType;
}

const STATUS_COLORS: Record<string, StatusConfig> = {
  pending: { bg: "#fef3c7", text: "#f59e0b", icon: Clock },
  approved: { bg: "#dcfce7", text: "#22c55e", icon: CheckCircle },
  rejected: { bg: "#fee2e2", text: "#ef4444", icon: XCircle },
  released: { bg: "#dbeafe", text: "#3b82f6", icon: Send },
};

const AdminClaims = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadClaims = async () => {
    setLoading(true);
    const data = await getAllClaims();
    setClaims(data as Claim[]);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const data = await getAllClaims();
      if (active) {
        setClaims(data as Claim[]);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleStatus = async (id: string, status: "approved" | "rejected" | "released") => {
    setActionLoading(id);
    await updateClaimStatus(id, status);
    setClaims((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    setActionLoading(null);
    if (selectedClaim?.id === id) {
      setSelectedClaim({ ...selectedClaim, status });
    }
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_COLORS[status] || STATUS_COLORS.pending;
    const Icon = config.icon;
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: config.bg, color: config.text }}>
        <Icon size={12} />
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) return <LoadingSpinner />;

  const pendingCount = claims.filter(c => c.status === "pending").length;
  const approvedCount = claims.filter(c => c.status === "approved").length;
  const rejectedCount = claims.filter(c => c.status === "rejected").length;
  const releasedCount = claims.filter(c => c.status === "released").length;

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
              <h1 className="font-display text-2xl text-gpsc-navy">Claims Management</h1>
              <p className="text-sm text-gpsc-stone">Review and process member benefit claims</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard label="Pending" value={pendingCount} color="#f59e0b" icon={Clock} />
          <SummaryCard label="Approved" value={approvedCount} color="#22c55e" icon={CheckCircle} />
          <SummaryCard label="Rejected" value={rejectedCount} color="#ef4444" icon={XCircle} />
          <SummaryCard label="Released" value={releasedCount} color="#3b82f6" icon={Send} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Claims List */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gpsc-cream-dark overflow-hidden">
            <div className="p-4 border-b border-gpsc-cream-dark bg-gpsc-cream/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-gpsc-green" />
                  <span className="font-medium text-gpsc-navy">All Claims</span>
                  <span className="text-xs text-gpsc-stone">({claims.length})</span>
                </div>
                <button onClick={loadClaims} className="p-1.5 hover:bg-gpsc-cream rounded-lg transition-colors">
                  <RefreshCw size={14} className="text-gpsc-stone" />
                </button>
              </div>
            </div>
            <div className="divide-y divide-gpsc-cream-dark max-h-[600px] overflow-y-auto">
              {claims.length === 0 ? (
                <div className="p-12 text-center">
                  <FileCheck size={48} className="text-gpsc-stone/30 mx-auto mb-3" />
                  <p className="text-gpsc-stone">No claims found</p>
                </div>
              ) : (
                claims.map((claim) => (
                  <button
                    key={claim.id}
                    onClick={() => setSelectedClaim(claim)}
                    className={`w-full p-4 text-left hover:bg-gpsc-cream/50 transition-colors ${
                      selectedClaim?.id === claim.id ? "bg-gpsc-cream" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-gpsc-stone">#{claim.id?.slice(0, 8)}</span>
                          {getStatusBadge(claim.status)}
                        </div>
                        <p className="font-medium text-gpsc-navy truncate">{claim.type || "Claim"}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gpsc-stone">
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {claim.memberId?.slice(0, 8) || "N/A"}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign size={12} />
                            ₱{(claim.amount || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gpsc-stone shrink-0 ml-2" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Claim Details */}
          <div className="bg-white rounded-2xl border border-gpsc-cream-dark">
            {selectedClaim ? (
              <div>
                <div className="p-5 border-b border-gpsc-cream-dark">
                  <h2 className="font-display text-lg text-gpsc-navy">Claim Details</h2>
                  <p className="text-xs text-gpsc-stone mt-1">Review and take action</p>
                </div>

                <div className="p-5 space-y-5">
                  {/* Claim Info */}
                  <div className="space-y-3">
                    <InfoRow label="Claim ID" value={selectedClaim.id} monospace />
                    <InfoRow label="Member ID" value={selectedClaim.memberId} monospace />
                    <InfoRow label="Claim Type" value={selectedClaim.type || "—"} />
                    <InfoRow label="Amount" value={`₱${(selectedClaim.amount || 0).toLocaleString()}`} highlight />
                    <InfoRow label="Status" value={selectedClaim.status} isBadge />
                    <InfoRow
                      label="Submitted"
                      value={selectedClaim.submittedAt ? new Date(selectedClaim.submittedAt).toLocaleDateString() : "—"}
                      icon={<Calendar size={14} />}
                    />
                  </div>

                  {/* Documents */}
                  {selectedClaim.documents && selectedClaim.documents.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gpsc-navy mb-2">Documents</p>
                      <div className="space-y-2">
                        {selectedClaim.documents.map((url: string, i: number) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 p-2 rounded-lg border border-gpsc-cream-dark hover:bg-gpsc-cream transition-colors text-sm"
                          >
                            <Eye size={14} className="text-gpsc-green" />
                            <span className="text-gpsc-navy flex-1 truncate">Document {i + 1}</span>
                            <Download size={14} className="text-gpsc-stone" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin Notes */}
                  <div>
                    <p className="text-sm font-medium text-gpsc-navy mb-2">Admin Notes</p>
                    <textarea
                      placeholder="Add internal notes about this claim..."
                      className="w-full p-3 rounded-xl border border-gpsc-cream-dark focus:outline-none focus:ring-2 ring-gpsc-green resize-none text-sm"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-5 border-t border-gpsc-cream-dark bg-gpsc-cream/30">
                  <div className="grid grid-cols-3 gap-2">
                    <ActionButton
                      onClick={() => handleStatus(selectedClaim.id, "approved")}
                      label="Approve"
                      icon={CheckCircle}
                      color="#22c55e"
                      loading={actionLoading === selectedClaim.id}
                      disabled={selectedClaim.status !== "pending"}
                    />
                    <ActionButton
                      onClick={() => handleStatus(selectedClaim.id, "rejected")}
                      label="Reject"
                      icon={XCircle}
                      color="#ef4444"
                      loading={actionLoading === selectedClaim.id}
                      disabled={selectedClaim.status !== "pending"}
                    />
                    <ActionButton
                      onClick={() => handleStatus(selectedClaim.id, "released")}
                      label="Release"
                      icon={Send}
                      color="#3b82f6"
                      loading={actionLoading === selectedClaim.id}
                      disabled={selectedClaim.status !== "approved"}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <FileCheck size={48} className="text-gpsc-stone/30 mx-auto mb-3" />
                <p className="text-gpsc-stone">Select a claim to review</p>
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
  <div className="bg-white rounded-xl p-4 border border-gpsc-cream-dark">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gpsc-stone">{label}</p>
        <p className="font-display text-2xl text-gpsc-navy mt-1">{value}</p>
      </div>
      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        <Icon size={18} style={{ color }} />
      </div>
    </div>
  </div>
);

interface InfoRowProps {
  label: string;
  value: string;
  monospace?: boolean;
  highlight?: boolean;
  isBadge?: boolean;
  icon?: React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, monospace, highlight, isBadge, icon }) => {
  if (isBadge) {
    const config = STATUS_COLORS[value?.toLowerCase()] || STATUS_COLORS.pending;
    const BadgeIcon = config.icon;
    return (
      <div className="flex justify-between items-center">
        <span className="text-sm text-gpsc-stone">{label}</span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: config.bg, color: config.text }}>
          <BadgeIcon size={12} />
          {value?.toUpperCase()}
        </span>
      </div>
    );
  }
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gpsc-stone flex items-center gap-1">
        {icon}
        {label}
      </span>
      <span className={`text-sm ${monospace ? "font-mono" : ""} ${highlight ? "font-bold text-gpsc-navy text-base" : "text-gpsc-navy"}`}>
        {value}
      </span>
    </div>
  );
};

interface ActionButtonProps {
  onClick: () => void;
  label: string;
  icon: React.ElementType;
  color: string;
  loading: boolean;
  disabled: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, label, icon: Icon, color, loading, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    style={{ backgroundColor: `${color}15`, color }}
  >
    {loading ? (
      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    ) : (
      <Icon size={14} />
    )}
    {label}
  </button>
);

const LoadingSpinner = () => (
  <div className="min-h-screen gpsc-cream flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-gpsc-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gpsc-stone">Loading claims...</p>
    </div>
  </div>
);

export default AdminClaims;