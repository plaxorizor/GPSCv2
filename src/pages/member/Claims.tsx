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
                            <span
                                className={`mt-1 inline-block rounded-full px-3 py-1 text-xs ${c.status === "approved" ? "bg-fsc-green/10 text-fsc-green" : c.status === "under_review" ? "bg-fsc-navy/10 text-fsc-navy" : "bg-[#C9922A]/10 text-[#A87820]"}`}
                            >
                                {c.status.replace("_", " ")}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
            {claims.length === 0 && (
                <div className="border-fsc-cream-dark rounded-2xl border bg-white p-12 text-center">
                    <div className="bg-fsc-cream mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                        <FileText size={24} className="text-fsc-stone" />
                    </div>
                    <div className="font-display text-fsc-navy text-lg">No claims yet</div>
                    <div className="text-fsc-stone mt-1 text-sm">When you need to file one, we'll guide you through.</div>
                </div>
            )}
        </div>
    </div>
);
