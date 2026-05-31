import React from "react";
import { Plus, FileText } from "lucide-react";
import type { Claim } from "../../utils/types";
import { formatCurrency, formatDate } from "../../utils/formatter";

interface Props {
    claims: Claim[];
    onFileClaim: () => void;
}

export const MemberClaims: React.FC<Props> = ({ claims, onFileClaim }) => (
    <div className="space-y-6">
        <div className="flex items-end justify-between">
            <div>
                <h1 className="font-display text-gpsc-navy text-3xl">Claims</h1>
            </div>
            <button onClick={onFileClaim} className="bg-gpsc-navy flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white">
                <Plus size={14} /> File a claim
            </button>
        </div>
        <div className="space-y-3">
            {claims.map((c) => (
                <div key={c.id} className="border-gpsc-cream-dark rounded-2xl border bg-white p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-50 flex-1">
                            <div className="font-display text-gpsc-navy text-lg">{c.benefit}</div>
                            <div className="text-gpsc-stone mt-1 text-xs">
                                Submitted {formatDate(c.submitted)}
                                {c.decided && ` · Decided ${formatDate(c.decided)}`}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {c.documents.map((d, i) => (
                                    <span key={i} className="bg-gpsc-cream text-gpsc-stone flex items-center gap-1 rounded-full px-2 py-1 text-xs">
                                        <FileText size={10} /> {d}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-display text-gpsc-navy text-2xl">{formatCurrency(c.amount)}</div>
                            <span
                                className={`mt-1 inline-block rounded-full px-3 py-1 text-xs ${c.status === "approved" ? "bg-gpsc-green/10 text-gpsc-green" : c.status === "under_review" ? "bg-gpsc-navy/10 text-gpsc-navy" : "bg-amber-100 text-amber-700"}`}
                            >
                                {c.status.replace("_", " ")}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
            {claims.length === 0 && (
                <div className="border-gpsc-cream-dark rounded-2xl border bg-white p-12 text-center">
                    <div className="bg-gpsc-cream mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                        <FileText size={24} className="text-gpsc-stone" />
                    </div>
                    <div className="font-display text-gpsc-navy text-lg">No claims yet</div>
                    <div className="text-gpsc-stone mt-1 text-sm">When you need to file one, we'll guide you through.</div>
                </div>
            )}
        </div>
    </div>
);
