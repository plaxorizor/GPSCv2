// signup/PackageStep.tsx — Step 1: choose a membership package.

import { RadioGroup, Radio } from "@headlessui/react";
import { plans, type Plan } from "./constants";

interface Props {
    selectedPlan: Plan;
    onSelect: (plan: Plan) => void;
}

export default function PackageStep({ selectedPlan, onSelect }: Props) {
    return (
        <div>
            <h2 className="font-display mb-6 text-2xl" style={{ color: "#1B2D6B" }}>
                Step 1 · Choose your package
            </h2>
            <RadioGroup by="name" value={selectedPlan} onChange={onSelect} aria-label="Membership package" className="space-y-3">
                {plans.map((plan) => (
                    <Radio
                        key={plan.name}
                        value={plan}
                        className={({ checked }) =>
                            `block cursor-pointer rounded-2xl border p-4 transition-all outline-none ${
                                checked ? "border-[#C9922A] bg-[#F2F3F5]" : "border-[#D0D2D8] hover:bg-[#F2F3F5]/60"
                            }`
                        }
                    >
                        {({ checked }) => (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                                        style={{
                                            borderColor: checked ? "#C9922A" : "#D1D5DB",
                                            backgroundColor: checked ? "#C9922A" : "transparent",
                                        }}
                                    >
                                        {checked && <div className="h-2 w-2 rounded-full bg-white" />}
                                    </div>
                                    <div>
                                        <div className="font-display text-lg" style={{ color: "#1B2D6B" }}>
                                            {plan.name} Care
                                            {plan.popular && (
                                                <span
                                                    className="ml-2 rounded-full px-2 py-0.5 font-sans text-xs"
                                                    style={{ backgroundColor: "#C9922A", color: "#fff" }}
                                                >
                                                    Popular
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs" style={{ color: "#6B6862" }}>
                                            {plan.coverage} · {plan.tagline}
                                        </div>
                                    </div>
                                </div>
                                <div className="font-display text-xl" style={{ color: "#1B2D6B" }}>
                                    ₱{plan.price.toLocaleString("en-PH")}
                                </div>
                            </div>
                        )}
                    </Radio>
                ))}
            </RadioGroup>
        </div>
    );
}
