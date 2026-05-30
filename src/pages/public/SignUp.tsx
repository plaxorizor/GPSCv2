import { getDoc, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { registerUser } from "../../firebase/auth";
import { db } from "../../firebase/config";

import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Logo } from "../../components/ui/Logo";

import { RadioGroup, Radio } from "@headlessui/react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { type PackageName } from "../types";

// ── Design tokens (mirrors pro.jsx GlobalStyles) ──────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=DM+Sans:wght@400;500;600;700&display=swap');
  .gpsc-signup-root { font-family: 'DM Sans', system-ui, sans-serif; }
  .gpsc-signup-root .font-display { font-family: 'Fraunces', Georgia, serif; }
`;

const plans = [
    { name: "Basic" as PackageName,   price: 698,  level: 1, rank: "Sales Consultant",  rate: 0.20, coverage: "Individual",  tagline: "Individual protection, simple start" },
    { name: "Family" as PackageName,  price: 1698, level: 3, rank: "Team Consultant",    rate: 0.05, coverage: "Family of 4", tagline: "Coverage for the whole household",    popular: true },
    { name: "Premium" as PackageName, price: 4998, level: 6, rank: "Sales Manager",      rate: 0.03, coverage: "Family of 5", tagline: "Full benefits and leadership rewards" },
];

const STEPS = [
    "Package",
    "Your Info",
    "Sponsor & Beneficiaries",
    "Review",
];

const generateReferralCode = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const segment = (len: number) =>
        Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `${segment(4)}-${segment(4)}-${segment(4)}`;
};

// ── Shared input / label styles ───────────────────────────────────
const inputCls =
    "w-full mt-1 px-4 py-3 rounded-xl border border-[#E5DDC8] bg-white text-[#14365C] placeholder-[#6B6862] focus:outline-none focus:ring-2 focus:ring-[#4A8A2C] transition";
const labelCls = "text-xs uppercase tracking-wider text-[#6B6862]";

export default function SignUpLayout() {
    const [searchParams] = useSearchParams();
    const [refValue, setRefValue]     = useState<string>(() => searchParams.get("ref") ?? "");
    const [step, setStep]             = useState(1);
    const totalSteps                  = 4;

    const navigate = useNavigate();

    const [selectedPlan, setSelectedPlan] = useState(plans[0]);
    const [form, setForm] = useState({
        package: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        mobile: "",
        birthDate: "",
        civilStatus: "",
        city: "",
        province: "",
        referralCode: "",
        beneficiaries: [{ name: "", relationship: "" }],
    });
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        try {
            const snap = await getDoc(doc(db, "referralCodes", form.referralCode));
            if (!snap.exists()) { setError("Invalid referral code."); return; }
            const referredBy = snap.data().uid;

            const { user } = await registerUser(form.email, form.password);
            const referralCode = generateReferralCode();

            await setDoc(doc(db, "members", user.uid), {
                referralCode,
                referredBy,
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                mobile: form.mobile,
                birthDate: form.birthDate,
                civilStatus: form.civilStatus,
                city: form.city,
                province: form.province,
                package: selectedPlan.name,
                beneficiaries: form.beneficiaries,
                status: "pending",
                isAdmin: false,
                dateCreated: serverTimestamp(),
            });

            await setDoc(doc(db, "referralCodes", referralCode), { uid: user.uid });
            navigate("/dashboard/member");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        }
    };

    return (
        <>
            {/* Inject design-token CSS */}
            <style>{css}</style>

            <div className="gpsc-signup-root min-h-screen py-12 px-6" style={{ backgroundColor: "#FAF6EE" }}>
                <div className="mx-auto max-w-2xl">

                    {/* ── Header ── */}
                    <div className="mb-10 text-center">
                        <Logo size={56} />
                        <h1 className="font-display mt-4 text-4xl" style={{ color: "#14365C" }}>
                            Join in a few minutes
                        </h1>
                        <p className="mt-2 text-sm" style={{ color: "#6B6862" }}>
                            Become part of the GPSC community today
                        </p>
                    </div>

                    {/* ── Step progress bar ── */}
                    <div className="flex items-center gap-2 mb-8">
                        {STEPS.map((_label, i) => {
                            const s = i + 1;
                            const active  = s === step;
                            const done    = s < step;
                            return (
                                <div key={s} className="flex items-center gap-2 flex-1">
                                    <div
                                        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors"
                                        style={{
                                            backgroundColor: done || active ? "#14365C" : "#E5DDC8",
                                            color:           done || active ? "#fff"     : "#6B6862",
                                        }}
                                    >
                                        {done ? "✓" : s}
                                    </div>
                                    {s < STEPS.length && (
                                        <div
                                            className="h-px flex-1 transition-colors"
                                            style={{ backgroundColor: done ? "#14365C" : "#E5DDC8" }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* ── Card ── */}
                    <div
                        className="rounded-3xl p-8"
                        style={{ backgroundColor: "#fff", border: "1px solid #E5DDC8" }}
                    >
                        {error && (
                            <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "#FEE2E2", color: "#B91C1C" }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* ════ STEP 1 — Package ════ */}
                            {step === 1 && (
                                <div>
                                    <h2 className="font-display text-2xl mb-6" style={{ color: "#14365C" }}>
                                        Step 1 · Choose your package
                                    </h2>
                                    <RadioGroup
                                        by="name"
                                        value={selectedPlan}
                                        onChange={setSelectedPlan}
                                        aria-label="Membership package"
                                        className="space-y-3"
                                    >
                                        {plans.map((plan) => (
                                            <Radio
                                                key={plan.name}
                                                value={plan}
                                                className={({ checked }) =>
                                                    `block p-4 rounded-2xl border cursor-pointer transition-all outline-none ${
                                                        checked
                                                            ? "border-[#4A8A2C] bg-[#FAF6EE]"
                                                            : "border-[#E5DDC8] hover:bg-[#FAF6EE]/60"
                                                    }`
                                                }
                                            >
                                                {({ checked }) => (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div
                                                                className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                                                                style={{
                                                                    borderColor: checked ? "#4A8A2C" : "#D1D5DB",
                                                                    backgroundColor: checked ? "#4A8A2C" : "transparent",
                                                                }}
                                                            >
                                                                {checked && <div className="w-2 h-2 rounded-full bg-white" />}
                                                            </div>
                                                            <div>
                                                                <div className="font-display text-lg" style={{ color: "#14365C" }}>
                                                                    {plan.name} Care
                                                                    {plan.popular && (
                                                                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-sans" style={{ backgroundColor: "#4A8A2C", color: "#fff" }}>
                                                                            Popular
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-xs" style={{ color: "#6B6862" }}>
                                                                    {plan.coverage} · {plan.tagline}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="font-display text-xl" style={{ color: "#14365C" }}>
                                                            ₱{plan.price.toLocaleString("en-PH")}
                                                        </div>
                                                    </div>
                                                )}
                                            </Radio>
                                        ))}
                                    </RadioGroup>
                                </div>
                            )}

                            {/* ════ STEP 2 — Personal info ════ */}
                            {step === 2 && (
                                <div>
                                    <h2 className="font-display text-2xl mb-6" style={{ color: "#14365C" }}>
                                        Step 2 · Your information
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className={labelCls}>First name</label>
                                                <input
                                                    placeholder="Juan"
                                                    className={inputCls}
                                                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelCls}>Last name</label>
                                                <input
                                                    placeholder="Dela Cruz"
                                                    className={inputCls}
                                                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelCls}>Email</label>
                                            <input
                                                type="email"
                                                placeholder="juandelacruz@example.com"
                                                className={inputCls}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className={labelCls}>Password</label>
                                                <input
                                                    type="password"
                                                    className={inputCls}
                                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelCls}>Confirm password</label>
                                                <input
                                                    type="password"
                                                    className={inputCls}
                                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelCls}>Mobile number</label>
                                            <input
                                                placeholder="09XXXXXXXXX"
                                                className={inputCls}
                                                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className={labelCls}>Birth date</label>
                                                <input
                                                    type="date"
                                                    className={inputCls}
                                                    onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelCls}>Civil status</label>
                                                <select
                                                    className={inputCls}
                                                    onChange={(e) => setForm({ ...form, civilStatus: e.target.value })}
                                                >
                                                    <option value="">Select status</option>
                                                    <option value="single">Single</option>
                                                    <option value="married">Married</option>
                                                    <option value="divorced">Divorced</option>
                                                    <option value="widowed">Widowed</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className={labelCls}>City</label>
                                                <input
                                                    placeholder="Davao City"
                                                    className={inputCls}
                                                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelCls}>Province</label>
                                                <input
                                                    placeholder="Davao del Sur"
                                                    className={inputCls}
                                                    onChange={(e) => setForm({ ...form, province: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ════ STEP 3 — Sponsor & Beneficiaries ════ */}
                            {step === 3 && (
                                <div>
                                    <h2 className="font-display text-2xl mb-6" style={{ color: "#14365C" }}>
                                        Step 3 · Sponsor &amp; beneficiaries
                                    </h2>
                                    <div className="space-y-5">
                                        <div>
                                            <label className={labelCls}>Sponsor / referral code</label>
                                            <input
                                                value={refValue}
                                                placeholder="e.g. MARIA-ABCD-1234"
                                                className={inputCls}
                                                onChange={(e) => {
                                                    setRefValue(e.target.value);
                                                    setForm({ ...form, referralCode: e.target.value });
                                                }}
                                            />
                                        </div>

                                        {selectedPlan.name !== "Basic" && (
                                            <div
                                                className="pt-5 mt-1 border-t"
                                                style={{ borderColor: "#E5DDC8" }}
                                            >
                                                <label className={labelCls}>
                                                    Beneficiaries
                                                    <span className="ml-1 normal-case" style={{ color: "#6B6862" }}>
                                                        (up to {selectedPlan.name === "Family" ? 2 : 4})
                                                    </span>
                                                </label>

                                                <div className="mt-3 space-y-3">
                                                    {form.beneficiaries.map((b, index) => (
                                                        <div
                                                            key={index}
                                                            className="space-y-3 rounded-2xl p-4"
                                                            style={{ backgroundColor: "#FAF6EE", border: "1px solid #E5DDC8" }}
                                                        >
                                                            <p className="text-xs font-semibold" style={{ color: "#14365C" }}>
                                                                Beneficiary {index + 1}
                                                            </p>
                                                            <input
                                                                placeholder="Full name (e.g. Maria Dela Cruz)"
                                                                className={inputCls}
                                                                value={b.name}
                                                                onChange={(e) => {
                                                                    const updated = [...form.beneficiaries];
                                                                    updated[index].name = e.target.value;
                                                                    setForm({ ...form, beneficiaries: updated });
                                                                }}
                                                            />
                                                            <select
                                                                className={inputCls}
                                                                value={b.relationship}
                                                                onChange={(e) => {
                                                                    const updated = [...form.beneficiaries];
                                                                    updated[index].relationship = e.target.value;
                                                                    setForm({ ...form, beneficiaries: updated });
                                                                }}
                                                            >
                                                                <option value="">Select relationship</option>
                                                                <option value="Parent">Parent</option>
                                                                <option value="Sibling">Sibling</option>
                                                                <option value="Child">Child</option>
                                                                <option value="Spouse">Spouse</option>
                                                            </select>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex gap-4 mt-3">
                                                    {form.beneficiaries.length < (selectedPlan.name === "Family" ? 2 : 4) && (
                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-1 text-sm font-medium hover:underline"
                                                            style={{ color: "#4A8A2C" }}
                                                            onClick={() =>
                                                                setForm({
                                                                    ...form,
                                                                    beneficiaries: [...form.beneficiaries, { name: "", relationship: "" }],
                                                                })
                                                            }
                                                        >
                                                            <Plus size={14} /> Add another
                                                        </button>
                                                    )}
                                                    {form.beneficiaries.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="text-sm hover:underline"
                                                            style={{ color: "#B91C1C" }}
                                                            onClick={() =>
                                                                setForm({
                                                                    ...form,
                                                                    beneficiaries: form.beneficiaries.slice(0, -1),
                                                                })
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
                            )}

                            {/* ════ STEP 4 — Review ════ */}
                            {step === 4 && (
                                <div>
                                    <h2 className="font-display text-2xl mb-6" style={{ color: "#14365C" }}>
                                        Step 4 · Review &amp; register
                                    </h2>
                                    <div className="space-y-3 mb-6">
                                        {[
                                            { label: "Package",    value: `${selectedPlan.name} Care — ₱${selectedPlan.price.toLocaleString("en-PH")}` },
                                            { label: "Name",       value: `${form.firstName} ${form.lastName}`.trim() || "—" },
                                            { label: "Email",      value: form.email   || "—" },
                                            { label: "Mobile",     value: form.mobile  || "—" },
                                            { label: "Location",   value: [form.city, form.province].filter(Boolean).join(", ") || "—" },
                                            { label: "Referral",   value: refValue     || "—" },
                                        ].map(({ label, value }) => (
                                            <div
                                                key={label}
                                                className="flex justify-between px-4 py-3 rounded-xl text-sm"
                                                style={{ backgroundColor: "#FAF6EE" }}
                                            >
                                                <span style={{ color: "#6B6862" }}>{label}</span>
                                                <span className="font-medium" style={{ color: "#14365C" }}>{value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-3 rounded-xl font-medium text-white transition-colors"
                                        style={{ backgroundColor: "#4A8A2C" }}
                                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#5DAB3A")}
                                        onMouseOut={(e)  => (e.currentTarget.style.backgroundColor = "#4A8A2C")}
                                    >
                                        Create account
                                    </button>
                                </div>
                            )}

                            {/* ── Navigation buttons ── */}
                            <div className="flex justify-between pt-4" style={{ borderTop: "1px solid #E5DDC8" }}>
                                <button
                                    type="button"
                                    disabled={step === 1}
                                    onClick={() => setStep(step - 1)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm disabled:opacity-30 transition"
                                    style={{ color: "#6B6862" }}
                                >
                                    <ChevronLeft size={16} /> Back
                                </button>
                                {step < totalSteps && (
                                    <button
                                        type="button"
                                        onClick={() => setStep(step + 1)}
                                        className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium text-white transition-colors"
                                        style={{ backgroundColor: "#14365C" }}
                                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#4A8A2C")}
                                        onMouseOut={(e)  => (e.currentTarget.style.backgroundColor = "#14365C")}
                                    >
                                        Continue <ChevronRight size={16} />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* ── Footer link ── */}
                    <p className="pt-5 text-center text-xs" style={{ color: "#6B6862" }}>
                        Already have an account?{" "}
                        <Link to="/signin" className="font-medium hover:underline" style={{ color: "#4A8A2C" }}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}