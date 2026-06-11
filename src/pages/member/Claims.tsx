import React, { useState } from "react";
import { Plus, FileText } from "lucide-react";
import type { Claim, Member } from "../../utils/types";
import type { ClaimBenefit } from "../../utils/eligibility";
import { formatCurrency, formatDate } from "../../utils/formatter";
import StatusBadge from "../../components/ui/StatusBadge";
import EligibilityTimeline, { type EligibilityBucket } from "../../components/member/EligibilityTimeline";
import FileClaimModal from "../../components/modals/FileClaimModal";

interface Props {
    member: Member;
    claims: Claim[];
    eligibilityTimeline: EligibilityBucket[];
    onFileClaim: () => void;
    onClaimSuccess: () => void;
}

export const MemberClaims: React.FC<Props> = ({ member, claims, eligibilityTimeline, onFileClaim, onClaimSuccess }) => {
    // Countdowns run from the eligibility base (resets on upgrade/renewal).
    const eligBase: Date | null =
        member.dateEligibility?.toDate?.() ?? member.dateActivated?.toDate?.() ?? member.dateCreated?.toDate?.() ?? null;

    // Benefit being claimed — opens FileClaimModal pre-selected, same as Overview.
    const [claimBenefit, setClaimBenefit] = useState<ClaimBenefit | null>(null);

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between">
                <h1 className="font-display text-fsc-navy text-3xl">Claims</h1>
                <button
                    onClick={onFileClaim}
                    className="bg-fsc-navy flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white"
                >
                    <Plus size={14} /> File a claim
                </button>
            </div>

            {/* Eligibility timeline — shows which benefits are unlocked and lets the
                member claim them directly. Replaces the old redundant empty state. */}
            <EligibilityTimeline timeline={eligibilityTimeline} eligBase={eligBase} onClaim={setClaimBenefit} />

            {/* Claim history */}
            <div>
                <h2 className="font-display text-fsc-navy mb-3 text-lg">Your claims</h2>
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
                                            <span
                                                key={i}
                                                className="bg-fsc-cream text-fsc-stone flex items-center gap-1 rounded-full px-2 py-1 text-xs"
                                            >
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
                        <div className="border-fsc-cream-dark text-fsc-stone rounded-2xl border bg-white p-6 text-center text-sm">
                            No claims yet. When a benefit unlocks above, tap <span className="font-medium">Claim</span> to file one.
                        </div>
                    )}
                </div>
            </div>

            {claimBenefit && (
                <FileClaimModal
                    memberName={`${member.firstName} ${member.lastName}`.trim()}
                    benefits={[claimBenefit]}
                    initialBenefit={claimBenefit.label}
                    onClose={() => setClaimBenefit(null)}
                    onSuccess={() => {
                        setClaimBenefit(null);
                        onClaimSuccess();
                    }}
                />
            )}
        </div>
    );
};
