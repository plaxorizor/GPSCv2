// signup/SponsorBeneficiariesStep.tsx — Step 3: referral code + beneficiaries
// (beneficiaries only for Family/Premium; capped at 2/3 respectively).

import { Plus } from "lucide-react";
import { labelCls, type Plan, type SignupForm, type SetSignupForm } from "./constants";

interface Props {
    form: SignupForm;
    setForm: SetSignupForm;
    selectedPlan: Plan;
    fieldCls: (key: string) => string;
    onReferralCodeChange: (value: string) => void;
}

export default function SponsorBeneficiariesStep({ form, setForm, selectedPlan, fieldCls, onReferralCodeChange }: Props) {
    return (
        <div>
            <h2 className="font-display mb-6 text-2xl" style={{ color: "#1B2D6B" }}>
                Step 3 · Sponsor &amp; Beneficiaries
            </h2>
            <div className="space-y-5">
                <div>
                    <label className={labelCls}>
                        Sponsor / Referral Code <span style={{ color: "#C41E1E" }}>*</span>
                    </label>
                    <input
                        required
                        value={form.referralCode}
                        placeholder="e.g. MARIA-ABCD-1234"
                        className={fieldCls("referralCode")}
                        onChange={(e) => onReferralCodeChange(e.target.value)}
                    />
                </div>

                {selectedPlan.name !== "Basic" && (
                    <div className="mt-1 border-t pt-5" style={{ borderColor: "#D0D2D8" }}>
                        <label className={labelCls}>
                            Beneficiaries
                            <span className="ml-1 normal-case" style={{ color: "#6B6862" }}>
                                (up to {selectedPlan.name === "Family" ? 2 : 3})
                            </span>
                        </label>

                        <div className="mt-3 space-y-3">
                            {form.beneficiaries.map((b, index) => (
                                <div
                                    key={index}
                                    className="space-y-3 rounded-2xl p-4"
                                    style={{ backgroundColor: "#F2F3F5", border: "1px solid #D0D2D8" }}
                                >
                                    <p className="text-xs font-semibold" style={{ color: "#1B2D6B" }}>
                                        Beneficiary {index + 1}
                                    </p>
                                    <input
                                        required
                                        placeholder="Full name (e.g. Maria Dela Cruz)"
                                        className={fieldCls(`ben-${index}-name`)}
                                        value={b.name}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setForm((prev) => {
                                                const updated = prev.beneficiaries.map((item, i) =>
                                                    i === index ? { ...item, name: val } : item,
                                                );
                                                return { ...prev, beneficiaries: updated };
                                            });
                                        }}
                                    />
                                    <select
                                        required
                                        className={fieldCls(`ben-${index}-relationship`)}
                                        value={b.relationship}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setForm((prev) => {
                                                const updated = prev.beneficiaries.map((item, i) =>
                                                    i === index ? { ...item, relationship: val } : item,
                                                );
                                                return { ...prev, beneficiaries: updated };
                                            });
                                        }}
                                    >
                                        <option value="">Select relationship</option>
                                        <option value="Parent">Parent</option>
                                        <option value="Child">Child</option>
                                        <option value="Spouse">Spouse</option>
                                    </select>
                                </div>
                            ))}
                        </div>

                        <div className="mt-3 flex gap-4">
                            {form.beneficiaries.length < (selectedPlan.name === "Family" ? 2 : 3) && (
                                <button
                                    type="button"
                                    className="flex items-center gap-1 text-sm font-medium hover:underline"
                                    style={{ color: "#C9922A" }}
                                    onClick={() =>
                                        setForm((prev) => ({
                                            ...prev,
                                            beneficiaries: [...prev.beneficiaries, { name: "", relationship: "" }],
                                        }))
                                    }
                                >
                                    <Plus size={14} /> Add another
                                </button>
                            )}
                            {form.beneficiaries.length > 1 && (
                                <button
                                    type="button"
                                    className="text-sm hover:underline"
                                    style={{ color: "#C41E1E" }}
                                    onClick={() =>
                                        setForm((prev) => ({
                                            ...prev,
                                            beneficiaries: prev.beneficiaries.slice(0, -1),
                                        }))
                                    }
                                >
                                    − Remove last
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
