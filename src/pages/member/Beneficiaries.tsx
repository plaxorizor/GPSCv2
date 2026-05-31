import React from "react";
import { Edit } from "lucide-react";
import type { Member } from "../../utils/types";

export const MemberBeneficiaries: React.FC<{ member: Member }> = ({ member }) => {
    return (
        <div className="border-gpsc-cream-dark rounded-2xl border bg-white p-6">
            <h2 className="font-display text-gpsc-navy mb-4 text-lg">Beneficiaries</h2>
            <div className="space-y-3">
                {member.beneficiaries.map((b, index) => (
                    <div key={index} className="border-gpsc-cream-dark flex items-center gap-3 rounded-xl border p-3">
                        <div className="bg-gpsc-cream-dark text-gpsc-navy font-display flex h-10 w-10 items-center justify-center rounded-full text-xs">
                            {b.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                        </div>
                        <div className="flex-1">
                            <div className="text-gpsc-navy text-sm">{b.name}</div>
                            <div className="text-gpsc-stone text-xs">{b.relationship}</div>
                        </div>
                        <button className="text-gpsc-stone hover:text-gpsc-navy">
                            <Edit size={14} />
                        </button>
                    </div>
                ))}
                {member.beneficiaries.length === 0 && <div className="text-gpsc-stone py-4 text-center">No beneficiaries added yet</div>}
            </div>
        </div>
    );
};
