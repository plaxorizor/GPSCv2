// pages/admin/AdminCommissions.tsx
import { useEffect, useState } from "react";
import { getPendingCommissions, releaseCommission } from "../../firebase/admin";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  ChevronLeft,
  Send,
  Clock,
  CheckCircle,
  User,
  TrendingUp,
  Wallet,
  RefreshCw,
  Copy,
  AlertCircle,
  Banknote,
  Award
} from "lucide-react";

interface Commission {
  id: string;
  earnedBy: string;
  level: number;
  amount: number;
  status: string;
}

const AdminCommissions = () => {
  const navigate = useNavigate();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [references, setReferences] = useState<Record<string, string>>({});
  const [releasingId, setReleasingId] = useState<string | null>(null);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);

  const loadCommissions = async () => {
    setLoading(true);
    const data = await getPendingCommissions();
    const typedCommissions: Commission[] = (data as Commission[]).map((item) => ({
      id: item.id,
      earnedBy: item.earnedBy,
      level: item.level,
      amount: item.amount,
      status: item.status,
    }));
    setCommissions(typedCommissions);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const data = await getPendingCommissions();
      if (active) {
        const typedCommissions: Commission[] = (data as Commission[]).map((item) => ({
          id: item.id,
          earnedBy: item.earnedBy,
          level: item.level,
          amount: item.amount,
          status: item.status,
        }));
        setCommissions(typedCommissions);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleRelease = async (c: Commission) => {
    const ref = references[c.id];
    if (!ref) {
      alert("Please enter a reference number first.");
      return;
    }
    setReleasingId(c.id);
    await releaseCommission(c.id, c.earnedBy, c.amount, ref);
    setCommissions((prev) => prev.filter((x) => x.id !== c.id));
    setReleasingId(null);
    if (selectedCommission?.id === c.id) {
      setSelectedCommission(null);
    }
  };

  const totalPending = commissions.reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalCommissions = commissions.length;

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
              <h1 className="font-display text-2xl text-gpsc-navy">Commission Payouts</h1>
              <p className="text-sm text-gpsc-stone">Release pending commissions to members</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <StatCard
            title="Pending Commissions"
            value={totalCommissions}
            subtext={`${totalCommissions} pending`}
            icon={Clock}
            color="#f59e0b"
          />
          <StatCard
            title="Total Amount"
            value={`₱${totalPending.toLocaleString()}`}
            subtext="Awaiting disbursement"
            icon={Wallet}
            color="#3b82f6"
          />
          <StatCard
            title="Average Commission"
            value={`₱${(totalPending / (totalCommissions || 1)).toLocaleString()}`}
            subtext="Per payout"
            icon={TrendingUp}
            color="#4A8A2C"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Commissions List */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gpsc-cream-dark overflow-hidden">
            <div className="p-4 border-b border-gpsc-cream-dark bg-gpsc-cream/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign size={18} className="text-gpsc-green" />
                  <span className="font-medium text-gpsc-navy">Pending Commissions</span>
                  <span className="text-xs text-gpsc-stone">({commissions.length})</span>
                </div>
                <button onClick={loadCommissions} className="p-1.5 hover:bg-gpsc-cream rounded-lg transition-colors">
                  <RefreshCw size={14} className="text-gpsc-stone" />
                </button>
              </div>
            </div>

            <div className="divide-y divide-gpsc-cream-dark max-h-150 overflow-y-auto">
              {commissions.length === 0 ? (
                <div className="p-12 text-center">
                  <CheckCircle size={48} className="text-gpsc-green/30 mx-auto mb-3" />
                  <p className="text-gpsc-stone">No pending commissions</p>
                  <p className="text-xs text-gpsc-stone mt-1">All commissions have been released</p>
                </div>
              ) : (
                commissions.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCommission(c)}
                    className={`w-full p-4 text-left hover:bg-gpsc-cream/50 transition-colors ${
                      selectedCommission?.id === c.id ? "bg-gpsc-cream" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-gpsc-stone">#{c.id?.slice(0, 8)}</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            <Clock size={10} />
                            Level {c.level || 1}
                          </span>
                        </div>
                        <p className="font-medium text-gpsc-navy truncate">{c.earnedBy || "Unknown Member"}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm font-semibold text-gpsc-navy">₱{(c.amount || 0).toLocaleString()}</span>
                        </div>
                      </div>
                      <ChevronLeft size={16} className="text-gpsc-stone shrink-0 ml-2 rotate-180" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Release Panel */}
          <div className="bg-white rounded-2xl border border-gpsc-cream-dark">
            {selectedCommission ? (
              <div>
                <div className="p-5 border-b border-gpsc-cream-dark">
                  <h2 className="font-display text-lg text-gpsc-navy">Release Commission</h2>
                  <p className="text-xs text-gpsc-stone mt-1">Enter reference and confirm payout</p>
                </div>

                <div className="p-5 space-y-5">
                  <div className="bg-gpsc-cream rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gpsc-navy/10 flex items-center justify-center">
                        <User size={18} className="text-gpsc-navy" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gpsc-navy">{selectedCommission.earnedBy}</p>
                        <p className="text-xs text-gpsc-stone">Level {selectedCommission.level || 1} Commission</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-xl text-gpsc-navy">₱{(selectedCommission.amount || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gpsc-navy mb-1.5 block">
                      Reference Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="GCash ref # / Bank transaction ID"
                        value={references[selectedCommission.id] ?? ""}
                        onChange={(e) =>
                          setReferences((prev) => ({
                            ...prev,
                            [selectedCommission.id]: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-gpsc-cream-dark focus:outline-none focus:ring-2 ring-gpsc-green text-sm"
                      />
                      {references[selectedCommission.id] && (
                        <button
                          onClick={() => navigator.clipboard.writeText(references[selectedCommission.id])}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gpsc-stone hover:text-gpsc-navy"
                        >
                          <Copy size={16} />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gpsc-stone mt-1.5">
                      Enter the transaction reference from your payment provider
                    </p>
                  </div>

                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">
                        This action will mark the commission as paid and record the reference number. 
                        This cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 border-t border-gpsc-cream-dark bg-gpsc-cream/30">
                  <button
                    onClick={() => handleRelease(selectedCommission)}
                    disabled={releasingId === selectedCommission.id}
                    className="w-full bg-gpsc-green text-white py-3 rounded-xl font-medium hover:bg-gpsc-green-light transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {releasingId === selectedCommission.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Release Payment
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Banknote size={48} className="text-gpsc-stone/30 mx-auto mb-3" />
                <p className="text-gpsc-stone">Select a commission to release</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        {commissions.length > 0 && (
          <div className="mt-6 bg-linear-to-r from-gpsc-navy to-gpsc-navy-light rounded-2xl p-5 text-white">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Award size={20} />
                </div>
                <div>
                  <p className="font-display text-lg">Bulk Release Available</p>
                  <p className="text-white/70 text-sm">Process multiple commissions at once</p>
                </div>
              </div>
              <button className="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download CSV Template
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ElementType;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtext, icon: Icon, color }) => (
  <div className="bg-white rounded-2xl p-5 border border-gpsc-cream-dark">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs uppercase tracking-wider text-gpsc-stone">{title}</p>
        <p className="font-display text-2xl text-gpsc-navy mt-1">{value}</p>
        {subtext && <p className="text-xs text-gpsc-stone mt-1">{subtext}</p>}
      </div>
      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        <Icon size={18} style={{ color }} />
      </div>
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="min-h-screen gpsc-cream flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-gpsc-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gpsc-stone">Loading commissions...</p>
    </div>
  </div>
);

export default AdminCommissions;