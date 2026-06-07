import React from "react";
import { Plus, FileText } from "lucide-react";
import type { Claim } from "../../utils/types";
import { formatCurrency, formatDate } from "../../utils/formatter";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";

interface Props {
    claims: Claim[];
    onFileClaim: () => void;
}

export const MemberClaims: React.FC<Props> = ({ claims, onFileClaim }) => (
    <div className="space-y-6">
        <div className="flex items-end justify-between">
            <div>
                <h1 className="font-display text-fsc-navy text-3xl">Claims</h1>
            </div>
            <button onClick={onFileClaim} className="bg-fsc-navy flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white">
                <Plus size={14} /> File a claim
            </button>
        </div>
        <div className="space-y-3">
            {claims.map((c) => (
                <div key={c.id} className="border-fsc-cream-dark rounded-2xl border bg-white p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-50 flex-1">
                            <div className="font-display text-fsc-navy text-lg">{c.benefit}</div>
                            <div className="text-fsc-stone mt-1 text-xs">
                                Submitted {formatDate(c.submitted)}
                                {c.decided && ` · Decided ${formatDate(c.decided)}`}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {c.documents.map((d, i) => (
                                    <span key={i} className="bg-fsc-cream text-fsc-stone flex items-center gap-1 rounded-full px-2 py-1 text-xs">
                                        <FileText size={10} /> {d}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-display text-fsc-navy text-2xl">{formatCurrency(c.amount)}</div>
                            <StatusBadge status={c.status} className="mt-1" />
                        </div>
                    </div>
                </div>
            ))}
            {claims.length === 0 && (
                <div className="border-fsc-cream-dark rounded-2xl border bg-white">
                    <EmptyState
                        icon={FileText}
                        title="No claims yet"
                        description="When you need to file one, we'll guide you through it."
                        action={{ label: "File a claim", onClick: onFileClaim, icon: Plus }}
                    />
                </div>
            )}
        </div>
    </div>
);
