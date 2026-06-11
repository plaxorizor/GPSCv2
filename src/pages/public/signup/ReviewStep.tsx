// signup/ReviewStep.tsx — Step 5: read-only summary of everything entered,
// plus the Register submit button (submits the parent <form>).

import { formatPHMobile, type Plan, type SignupForm } from "./constants";

interface Props {
    form: SignupForm;
    birthDate: string;
    selectedPlan: Plan;
    loading: boolean;
    isFinalStep: boolean;
}

export default function ReviewStep({ form, birthDate, selectedPlan, loading, isFinalStep }: Props) {
    return (
        <div>
            <h2 className="font-display mb-6 text-2xl" style={{ color: "#1B2D6B" }}>
                Step 5 · Review &amp; register
            </h2>

            <p className="mb-2 text-xs tracking-wider uppercase" style={{ color: "#6B6862" }}>
                Membership Package
            </p>
            <div className="mb-5 space-y-2">
                <div className="flex justify-between rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "#F2F3F5" }}>
                    <span style={{ color: "#6B6862" }}>Package</span>
                    <span className="font-medium" style={{ color: "#1B2D6B" }}>
                        {selectedPlan.name} Care — ₱{selectedPlan.price.toLocaleString("en-PH")}
                    </span>
                </div>
            </div>

            <p className="mb-2 text-xs tracking-wider uppercase" style={{ color: "#6B6862" }}>
                Personal Information
            </p>
            <div className="mb-5 space-y-2">
                {[
                    { label: "First Name", value: form.firstName || "—" },
                    { label: "Middle Name", value: form.middleName || "—" },
                    { label: "Last Name", value: form.lastName || "—" },
                    { label: "Suffix", value: form.suffix || "—" },
                    { label: "Email", value: form.email || "—" },
                    { label: "Mobile", value: form.mobile ? `+63 ${formatPHMobile(form.mobile)}` : "—" },
                    { label: "Birth Date", value: birthDate || "—" },
                    {
                        label: "Gender",
                        value: form.gender ? form.gender.charAt(0).toUpperCase() + form.gender.slice(1) : "—",
                    },
                    {
                        label: "Civil Status",
                        value: form.civilStatus ? form.civilStatus.charAt(0).toUpperCase() + form.civilStatus.slice(1) : "—",
                    },
                    { label: "Street Address", value: form.streetAddress || "—" },
                    { label: "Barangay", value: form.barangay || "—" },
                    { label: "City", value: form.city || "—" },
                    { label: "Province", value: form.province || "—" },
                    { label: "Country", value: form.country || "—" },
                ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "#F2F3F5" }}>
                        <span style={{ color: "#6B6862" }}>{label}</span>
                        <span className="text-right font-medium" style={{ color: "#1B2D6B" }}>
                            {value}
                        </span>
                    </div>
                ))}
            </div>

            <p className="mb-2 text-xs tracking-wider uppercase" style={{ color: "#6B6862" }}>
                Sponsor
            </p>
            <div className="mb-5 space-y-2">
                <div className="flex justify-between rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "#F2F3F5" }}>
                    <span style={{ color: "#6B6862" }}>Referral code</span>
                    <span className="font-medium" style={{ color: "#1B2D6B" }}>
                        {form.referralCode || "—"}
                    </span>
                </div>
            </div>

            <p className="mb-2 text-xs tracking-wider uppercase" style={{ color: "#6B6862" }}>
                Payment
            </p>
            <div className="mb-5 space-y-2">
                <div className="flex justify-between rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "#F2F3F5" }}>
                    <span style={{ color: "#6B6862" }}>Amount due</span>
                    <span className="font-medium" style={{ color: "#1B2D6B" }}>
                        ₱{selectedPlan.price.toLocaleString("en-PH")} · {selectedPlan.name} Care
                    </span>
                </div>
                <div className="rounded-xl px-4 py-3 text-xs" style={{ backgroundColor: "#F2F3F5", color: "#6B6862" }}>
                    Send your receipt after signing up so we can verify your payment and activate your account.
                </div>
            </div>

            {selectedPlan.name !== "Basic" && (
                <>
                    <p className="mb-2 text-xs tracking-wider uppercase" style={{ color: "#6B6862" }}>
                        Beneficiaries
                    </p>
                    <div className="mb-5 space-y-2">
                        {form.beneficiaries.map((b, i) => (
                            <div key={i} className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "#F2F3F5" }}>
                                <div className="flex justify-between">
                                    <span style={{ color: "#6B6862" }}>Beneficiary {i + 1}</span>
                                    <span className="font-medium" style={{ color: "#1B2D6B" }}>
                                        {b.name || "—"}
                                    </span>
                                </div>
                                <div className="mt-1 flex justify-between">
                                    <span style={{ color: "#6B6862" }}>Relationship</span>
                                    <span className="font-medium" style={{ color: "#1B2D6B" }}>
                                        {b.relationship || "—"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <button
                type="submit"
                disabled={loading || !isFinalStep}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-white hover:bg-[#A87820] disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: "#C9922A" }}
            >
                {loading ? (
                    <>
                        <svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                            />
                        </svg>
                        Creating your account...
                    </>
                ) : (
                    "Register"
                )}
            </button>
        </div>
    );
}
