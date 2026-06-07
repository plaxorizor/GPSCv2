import React from "react";
import { Edit, Users } from "lucide-react";
import type { Member } from "../../utils/types";
import EmptyState from "../../components/ui/EmptyState";

export const MemberBeneficiaries: React.FC<{ member: Member }> = ({ member }) => {
    return (
        <div className="border-fsc-cream-dark rounded-2xl border bg-white p-6">
            <h2 className="font-display text-fsc-navy mb-4 text-lg">Beneficiaries</h2>
            <div className="space-y-3">
                {member.beneficiaries.map((b, index) => (
                    <div key={index} className="border-fsc-cream-dark flex items-center gap-3 rounded-xl border p-3">
                        <div className="bg-fsc-cream-dark text-fsc-navy font-display flex h-10 w-10 items-center justify-center rounded-full text-xs">
                            {b.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                        </div>
                        <div className="flex-1">
                            <div className="text-fsc-navy text-sm">{b.name}</div>
                            <div className="text-fsc-stone text-xs">{b.relationship}</div>
                        </div>
                        <button className="text-fsc-stone hover:text-fsc-navy">
                            <Edit size={14} />
                        </button>
                    </div>
                ))}
                {member.beneficiaries.length === 0 && (
                    <EmptyState
                        icon={Users}
                        title="No beneficiaries yet"
                        description="Add the people who should receive your benefits when a claim is paid out."
                        compact
                    />
                )}
            </div>
        </div>
    );
};
