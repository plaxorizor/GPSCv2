// admin/Commissions.tsx
import React, { useState } from "react";
import { Send, Clock, CheckCircle, Download } from "lucide-react";
import type { PendingCommission, CommissionRecord } from "../types";
import { formatCurrency, formatDate } from "./utils";

interface Props {
    pendingCommissions: PendingCommission[];
    commissionHistory: CommissionRecord[];
    loading: boolean;
    onRelease: (commissionId: string, earnedBy: string, amount: number, reference: string) => Promise<void>;
    onRefresh: () => void;
}

export const Commissions: React.FC<Props> = ({ pendingCommissions, commissionHistory, loading, onRelease, onRefresh }) => {
    const [selectedCommission, setSelectedCommission] = useState<PendingCommission | null>(null);
    const [reference, setReference] = useState("");

    const handleRelease = async () => {
        if (selectedCommission && reference) {
            await onRelease(selectedCommission.id, selectedCommission.recipientName, selectedCommission.amount, reference);
            setSelectedCommission(null);
            setReference("");
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="bg-gpsc-cream-dark mb-4 h-8 w-32 rounded"></div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="bg-gpsc-cream-dark h-32 rounded-2xl"></div>
                        <div className="bg-gpsc-cream-dark h-32 rounded-2xl"></div>
                    </div>
                    <div className="bg-gpsc-cream-dark mt-6 h-96 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    const totalPending = pendingCommissions.reduce((sum, c) => sum + c.amount, 0);
    const totalHistory = commissionHistory.reduce((sum, c) => sum + c.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between">
                <div>
                    <div className="text-gpsc-stone text-xs tracking-wider uppercase">Commission management</div>
                    <h1 className="font-display text-gpsc-navy text-3xl">Commissions</h1>
                </div>
                <button onClick={onRefresh} className="text-gpsc-green flex items-center gap-1 text-xs transition-colors hover:underline">
                    Refresh
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="border-gpsc-cream-dark rounded-2xl border bg-white p-6 transition-all hover:shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                            <Clock size={20} className="text-amber-600" />
                        </div>
                        <div>
                            <div className="font-display text-gpsc-navy text-2xl">{pendingCommissions.length}</div>
                            <div className="text-gpsc-stone text-xs">Pending Release</div>
                        </div>
                    </div>
                    <div className="text-gpsc-stone text-sm">Total: {formatCurrency(totalPending)}</div>
                </div>
                <div className="border-gpsc-cream-dark rounded-2xl border bg-white p-6 transition-all hover:shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="bg-gpsc-green/20 flex h-10 w-10 items-center justify-center rounded-full">
                            <CheckCircle size={20} className="text-gpsc-green" />
                        </div>
                        <div>
                            <div className="font-display text-gpsc-navy text-2xl">{commissionHistory.length}</div>
                            <div className="text-gpsc-stone text-xs">Released This Month</div>
                        </div>
                    </div>
                    <div className="text-gpsc-stone text-sm">Total: {formatCurrency(totalHistory)}</div>
                </div>
            </div>

            {/* Pending Commissions */}
            <div className="border-gpsc-cream-dark overflow-hidden rounded-2xl border bg-white">
                <div className="border-gpsc-cream-dark flex items-center justify-between border-b p-6">
                    <div>
                        <h2 className="font-display text-gpsc-navy text-lg">Pending Commissions</h2>
                        <p className="text-gpsc-stone text-xs">Commissions awaiting release to consultants</p>
                    </div>
                    <button className="text-gpsc-stone hover:text-gpsc-navy flex items-center gap-1 text-xs">
                        <Download size={12} /> Export
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gpsc-cream/50 text-gpsc-stone text-xs tracking-wider uppercase">
                            <tr>
                                <th className="p-4 text-left">Earned By</th>
                                <th className="p-4 text-left">From Member</th>
                                <th className="p-4 text-left">Level</th>
                                <th className="p-4 text-right">Amount</th>
                                <th className="p-4 text-left">Date</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingCommissions.map((comm) => (
                                <tr key={comm.id} className="border-gpsc-cream-dark hover:bg-gpsc-cream/40 border-t transition-colors">
                                    <td className="p-4">
                                        <div className="text-gpsc-navy font-medium">{comm.recipientName}</div>
                                        <div className="text-gpsc-stone font-mono text-xs">ID: {comm.recipientId.slice(0, 8)}</div>
                                    </td>
                                    <td className="text-gpsc-stone p-4">{comm.fromMemberName}</td>
                                    <td className="text-gpsc-stone p-4">Level {comm.level}</td>
                                    <td className="text-gpsc-navy p-4 text-right font-medium">{formatCurrency(comm.amount)}</td>
                                    <td className="text-gpsc-stone p-4">{formatDate(comm.date)}</td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => setSelectedCommission(comm)}
                                            className="bg-gpsc-green hover:bg-gpsc-green-light ml-auto flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors"
                                        >
                                            <Send size={12} /> Release
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {pendingCommissions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-gpsc-stone p-8 text-center">
                                        No pending commissions
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Commission History */}
            <div className="border-gpsc-cream-dark overflow-hidden rounded-2xl border bg-white">
                <div className="border-gpsc-cream-dark border-b p-6">
                    <h2 className="font-display text-gpsc-navy text-lg">Release History</h2>
                    <p className="text-gpsc-stone text-xs">Recently released commissions</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gpsc-cream/50 text-gpsc-stone text-xs tracking-wider uppercase">
                            <tr>
                                <th className="p-4 text-left">Recipient</th>
                                <th className="p-4 text-left">From</th>
                                <th className="p-4 text-left">Level</th>
                                <th className="p-4 text-right">Amount</th>
                                <th className="p-4 text-left">Date</th>
                                <th className="p-4 text-left">Reference</th>
                            </tr>
                        </thead>
                        <tbody>
                            {commissionHistory.slice(0, 20).map((comm) => (
                                <tr key={comm.id} className="border-gpsc-cream-dark hover:bg-gpsc-cream/40 border-t transition-colors">
                                    <td className="p-4">
                                        <div className="text-gpsc-navy">{comm.recipientName || comm.recipientId.slice(0, 8)}</div>
                                    </td>
                                    <td className="text-gpsc-stone p-4">{comm.fromMemberName}</td>
                                    <td className="text-gpsc-stone p-4">Level {comm.level}</td>
                                    <td className="text-gpsc-navy p-4 text-right font-medium">{formatCurrency(comm.amount)}</td>
                                    <td className="text-gpsc-stone p-4">{formatDate(comm.date)}</td>
                                    <td className="text-gpsc-stone p-4 font-mono text-xs">—</td>
                                </tr>
                            ))}
                            {commissionHistory.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-gpsc-stone p-8 text-center">
                                        No release history
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Release Modal */}
            {selectedCommission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedCommission(null)}>
                    <div className="animate-fade-up mx-4 w-full max-w-md rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
                        <h2 className="font-display text-gpsc-navy mb-4 text-xl">Release Commission</h2>
                        <div className="space-y-4">
                            <div className="bg-gpsc-cream rounded-xl p-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gpsc-stone">Recipient:</span>
                                    <span className="text-gpsc-navy font-medium">{selectedCommission.recipientName}</span>
                                </div>
                                <div className="mt-2 flex justify-between text-sm">
                                    <span className="text-gpsc-stone">Amount:</span>
                                    <span className="text-gpsc-navy font-display text-lg">{formatCurrency(selectedCommission.amount)}</span>
                                </div>
                                <div className="mt-2 flex justify-between text-sm">
                                    <span className="text-gpsc-stone">From:</span>
                                    <span className="text-gpsc-navy font-medium">{selectedCommission.fromMemberName}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-gpsc-stone mb-1 block text-xs">Reference Number</label>
                                <input
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                    placeholder="e.g., TRANSFER-2024-001"
                                    className="border-gpsc-cream-dark focus:ring-gpsc-green w-full rounded-xl border px-4 py-2 focus:ring-2 focus:outline-none"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setSelectedCommission(null)}
                                className="border-gpsc-cream-dark text-gpsc-stone hover:bg-gpsc-cream/60 flex-1 rounded-lg border px-4 py-2 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRelease}
                                disabled={!reference}
                                className="bg-gpsc-green hover:bg-gpsc-green-light flex-1 rounded-lg px-4 py-2 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Confirm Release
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
