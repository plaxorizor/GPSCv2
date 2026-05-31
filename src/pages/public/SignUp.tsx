import { getDoc, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { registerUser } from "../../firebase/auth";
import { db } from "../../firebase/config";

import { Link, useNavigate, useSearchParams } from "react-router-dom";
import logo from "../../components/ui/Logo.png";

import { RadioGroup, Radio } from "@headlessui/react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { type PackageName } from "../../utils/types";

// ── Design tokens (mirrors pro.jsx GlobalStyles) ──────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=DM+Sans:wght@400;500;600;700&display=swap');
  .gpsc-signup-root { font-family: 'DM Sans', system-ui, sans-serif; }
  .gpsc-signup-root .font-display { font-family: 'Fraunces', Georgia, serif; }
`;

const plans = [
    {
        name: "Basic" as PackageName,
        price: 698,
        level: 1,
        rank: "Sales Consultant",
        rate: 0.2,
        coverage: "Individual",
        tagline: "Individual protection, simple start",
    },
    {
        name: "Family" as PackageName,
        price: 1698,
        level: 3,
        rank: "Team Consultant",
        rate: 0.05,
        coverage: "Family of 4",
        tagline: "Coverage for the whole household",
        popular: true,
    },
    {
        name: "Premium" as PackageName,
        price: 4998,
        level: 6,
        rank: "Sales Manager",
        rate: 0.03,
        coverage: "Family of 5",
        tagline: "Full benefits and leadership rewards",
    },
];

const STEPS = ["Package", "Your Info", "Sponsor & Beneficiaries", "Review"];

const generateReferralCode = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const segment = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `${segment(4)}-${segment(4)}-${segment(4)}`;
};

// ── Shared input / label styles ───────────────────────────────────
const inputCls =
    "w-full mt-1 px-4 py-3 rounded-xl border border-[#E5DDC8] bg-white text-[#14365C] placeholder-[#6B6862] focus:outline-none focus:ring-2 focus:ring-[#4A8A2C] transition";
const labelCls = "text-xs uppercase tracking-wider text-[#6B6862]";

export default function SignUpLayout() {
    const [searchParams] = useSearchParams();
    const [refValue, setRefValue] = useState<string>(() => searchParams.get("ref") ?? "");
    const [step, setStep] = useState(1);
    const totalSteps = 4;

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

    const validateStep = (): boolean => {
        setError("");
        if (step === 2) {
            if (!form.firstName.trim()) {
                setError("First name is required.");
                return false;
            }
            if (!form.lastName.trim()) {
                setError("Last name is required.");
                return false;
            }
            if (!form.email.trim()) {
                setError("Email is required.");
                return false;
            }
            if (!form.password) {
                setError("Password is required.");
                return false;
            }
            if (!form.confirmPassword) {
                setError("Please confirm your password.");
                return false;
            }
            if (form.password !== form.confirmPassword) {
                setError("Passwords do not match.");
                return false;
            }
            if (!form.mobile.trim()) {
                setError("Mobile number is required.");
                return false;
            }
            if (!form.birthDate) {
                setError("Birth date is required.");
                return false;
            }
            if (!form.civilStatus) {
                setError("Civil status is required.");
                return false;
            }
            if (!form.city.trim()) {
                setError("City is required.");
                return false;
            }
            if (!form.province.trim()) {
                setError("Province is required.");
                return false;
            }
        }
        if (step === 3) {
            if (!refValue.trim()) {
                setError("Referral code is required.");
                return false;
            }
            if (selectedPlan.name !== "Basic") {
                for (let i = 0; i < form.beneficiaries.length; i++) {
                    if (!form.beneficiaries[i].name.trim()) {
                        setError(`Beneficiary ${i + 1} name is required.`);
                        return false;
                    }
                    if (!form.beneficiaries[i].relationship) {
                        setError(`Beneficiary ${i + 1} relationship is required.`);
                        return false;
                    }
                }
            }
        }
        return true;
    };

    const handleContinue = () => {
        if (validateStep()) setStep(step + 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        try {
            const snap = await getDoc(doc(db, "referralCodes", form.referralCode));
            if (!snap.exists()) {
                setError("Invalid referral code.");
                return;
            }
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

            <div className="gpsc-signup-root min-h-screen px-6 py-12" style={{ backgroundColor: "#FAF6EE" }}>
                <div className="mx-auto max-w-2xl">
                    {/* ── Header ── */}
                    <div className="mb-10 text-center">
                        <button type="button" onClick={() => navigate("/")} className="inline-flex cursor-pointer flex-col items-center">
                            <img src={logo} alt="GPSC Logo" className="h-20 w-20 rounded-full object-contain" />
                        </button>
                        <h1 className="font-display mt-4 text-4xl" style={{ color: "#14365C" }}>
                            Join in a few minutes
                        </h1>
                        <p className="mt-2 text-sm" style={{ color: "#6B6862" }}>
                            Become part of the GPSC community today
                        </p>
                    </div>

                    {/* ── Step progress bar ── */}
                    <div className="relative mb-8 flex items-center justify-between">
                        {/* Background line */}
                        <div className="absolute right-0 left-0 h-px" style={{ backgroundColor: "#E5DDC8", top: "50%" }} />
                        {STEPS.map((_label, i) => {
                            const s = i + 1;
                            const active = s === step;
                            const done = s < step;
                            return (
                                <div
                                    key={s}
                                    className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors"
                                    style={{
                                        backgroundColor: done || active ? "#14365C" : "#E5DDC8",
                                        color: done || active ? "#fff" : "#6B6862",
                                    }}
                                >
                                    {done ? "✓" : s}
                                </div>
                            );
                        })}
                    </div>

                    {/* ── Card ── */}
                    <div className="rounded-3xl p-8" style={{ backgroundColor: "#fff", border: "1px solid #E5DDC8" }}>
                        {error && (
                            <div className="mb-4 rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "#FEE2E2", color: "#B91C1C" }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* ════ STEP 1 — Package ════ */}
                            {step === 1 && (
                                <div>
                                    <h2 className="font-display mb-6 text-2xl" style={{ color: "#14365C" }}>
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
                                                    `block cursor-pointer rounded-2xl border p-4 transition-all outline-none ${
                                                        checked ? "border-[#4A8A2C] bg-[#FAF6EE]" : "border-[#E5DDC8] hover:bg-[#FAF6EE]/60"
                                                    }`
                                                }
                                            >
                                                {({ checked }) => (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div
                                                                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                                                                style={{
                                                                    borderColor: checked ? "#4A8A2C" : "#D1D5DB",
                                                                    backgroundColor: checked ? "#4A8A2C" : "transparent",
                                                                }}
                                                            >
                                                                {checked && <div className="h-2 w-2 rounded-full bg-white" />}
                                                            </div>
                                                            <div>
                                                                <div className="font-display text-lg" style={{ color: "#14365C" }}>
                                                                    {plan.name} Care
                                                                    {plan.popular && (
                                                                        <span
                                                                            className="ml-2 rounded-full px-2 py-0.5 font-sans text-xs"
                                                                            style={{ backgroundColor: "#4A8A2C", color: "#fff" }}
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
                                    <h2 className="font-display mb-6 text-2xl" style={{ color: "#14365C" }}>
                                        Step 2 · Your information
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className={labelCls}>
                                                    First name <span style={{ color: "#B91C1C" }}>*</span>
                                                </label>
                                                <input
                                                    required
                                                    value={form.firstName}
                                                    placeholder="Juan"
                                                    className={inputCls}
                                                    onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelCls}>
                                                    Last name <span style={{ color: "#B91C1C" }}>*</span>
                                                </label>
                                                <input
                                                    required
                                                    value={form.lastName}
                                                    placeholder="Dela Cruz"
                                                    className={inputCls}
                                                    onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelCls}>
                                                Email <span style={{ color: "#B91C1C" }}>*</span>
                                            </label>
                                            <input
                                                required
                                                type="email"
                                                value={form.email}
                                                placeholder="juandelacruz@example.com"
                                                className={inputCls}
                                                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                                            />
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className={labelCls}>
                                                    Password <span style={{ color: "#B91C1C" }}>*</span>
                                                </label>
                                                <input
                                                    required
                                                    type="password"
                                                    value={form.password}
                                                    className={inputCls}
                                                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelCls}>
                                                    Confirm password <span style={{ color: "#B91C1C" }}>*</span>
                                                </label>
                                                <input
                                                    required
                                                    type="password"
                                                    value={form.confirmPassword}
                                                    className={inputCls}
                                                    onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelCls}>
                                                Mobile number <span style={{ color: "#B91C1C" }}>*</span>
                                            </label>
                                            <input
                                                required
                                                value={form.mobile}
                                                placeholder="09XXXXXXXXX"
                                                className={inputCls}
                                                onChange={(e) => setForm((prev) => ({ ...prev, mobile: e.target.value }))}
                                            />
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className={labelCls}>
                                                    Birth date <span style={{ color: "#B91C1C" }}>*</span>
                                                </label>
                                                <input
                                                    required
                                                    type="date"
                                                    value={form.birthDate}
                                                    className={inputCls}
                                                    onChange={(e) => setForm((prev) => ({ ...prev, birthDate: e.target.value }))}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelCls}>
                                                    Civil status <span style={{ color: "#B91C1C" }}>*</span>
                                                </label>
                                                <select
                                                    required
                                                    value={form.civilStatus}
                                                    className={inputCls}
                                                    onChange={(e) => setForm((prev) => ({ ...prev, civilStatus: e.target.value }))}
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
                                                <label className={labelCls}>
                                                    City <span style={{ color: "#B91C1C" }}>*</span>
                                                </label>
                                                <input
                                                    required
                                                    value={form.city}
                                                    placeholder="Davao City"
                                                    className={inputCls}
                                                    onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelCls}>
                                                    Province <span style={{ color: "#B91C1C" }}>*</span>
                                                </label>
                                                <input
                                                    required
                                                    value={form.province}
                                                    placeholder="Davao del Sur"
                                                    className={inputCls}
                                                    onChange={(e) => setForm((prev) => ({ ...prev, province: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ════ STEP 3 — Sponsor & Beneficiaries ════ */}
                            {step === 3 && (
                                <div>
                                    <h2 className="font-display mb-6 text-2xl" style={{ color: "#14365C" }}>
                                        Step 3 · Sponsor &amp; beneficiaries
                                    </h2>
                                    <div className="space-y-5">
                                        <div>
                                            <label className={labelCls}>
                                                Sponsor / referral code <span style={{ color: "#B91C1C" }}>*</span>
                                            </label>
                                            <input
                                                required
                                                value={refValue}
                                                placeholder="e.g. MARIA-ABCD-1234"
                                                className={inputCls}
                                                onChange={(e) => {
                                                    setRefValue(e.target.value);
                                                    setForm((prev) => ({ ...prev, referralCode: e.target.value }));
                                                }}
                                            />
                                        </div>

                                        {selectedPlan.name !== "Basic" && (
                                            <div className="mt-1 border-t pt-5" style={{ borderColor: "#E5DDC8" }}>
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
                                                                required
                                                                placeholder="Full name (e.g. Maria Dela Cruz)"
                                                                className={inputCls}
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
                                                                className={inputCls}
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
                                                                <option value="Sibling">Sibling</option>
                                                                <option value="Child">Child</option>
                                                                <option value="Spouse">Spouse</option>
                                                            </select>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-3 flex gap-4">
                                                    {form.beneficiaries.length < (selectedPlan.name === "Family" ? 2 : 4) && (
                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-1 text-sm font-medium hover:underline"
                                                            style={{ color: "#4A8A2C" }}
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
                                                            style={{ color: "#B91C1C" }}
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
                            )}

                            {/* ════ STEP 4 — Review ════ */}
                            {step === 4 && (
                                <div>
                                    <h2 className="font-display mb-6 text-2xl" style={{ color: "#14365C" }}>
                                        Step 4 · Review &amp; register
                                    </h2>

                                    {/* Package */}
                                    <p className="mb-2 text-xs tracking-wider uppercase" style={{ color: "#6B6862" }}>
                                        Membership Package
                                    </p>
                                    <div className="mb-5 space-y-2">
                                        {[
                                            { label: "Package", value: `${selectedPlan.name} Care — ₱${selectedPlan.price.toLocaleString("en-PH")}` },
                                        ].map(({ label, value }) => (
                                            <div
                                                key={label}
                                                className="flex justify-between rounded-xl px-4 py-3 text-sm"
                                                style={{ backgroundColor: "#FAF6EE" }}
                                            >
                                                <span style={{ color: "#6B6862" }}>{label}</span>
                                                <span className="font-medium" style={{ color: "#14365C" }}>
                                                    {value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Personal Info */}
                                    <p className="mb-2 text-xs tracking-wider uppercase" style={{ color: "#6B6862" }}>
                                        Personal Information
                                    </p>
                                    <div className="mb-5 space-y-2">
                                        {[
                                            { label: "First name", value: form.firstName || "—" },
                                            { label: "Last name", value: form.lastName || "—" },
                                            { label: "Email", value: form.email || "—" },
                                            { label: "Mobile", value: form.mobile || "—" },
                                            { label: "Birth date", value: form.birthDate || "—" },
                                            {
                                                label: "Civil status",
                                                value: form.civilStatus ? form.civilStatus.charAt(0).toUpperCase() + form.civilStatus.slice(1) : "—",
                                            },
                                            { label: "City", value: form.city || "—" },
                                            { label: "Province", value: form.province || "—" },
                                        ].map(({ label, value }) => (
                                            <div
                                                key={label}
                                                className="flex justify-between rounded-xl px-4 py-3 text-sm"
                                                style={{ backgroundColor: "#FAF6EE" }}
                                            >
                                                <span style={{ color: "#6B6862" }}>{label}</span>
                                                <span className="text-right font-medium" style={{ color: "#14365C" }}>
                                                    {value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Sponsor */}
                                    <p className="mb-2 text-xs tracking-wider uppercase" style={{ color: "#6B6862" }}>
                                        Sponsor
                                    </p>
                                    <div className="mb-5 space-y-2">
                                        <div className="flex justify-between rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "#FAF6EE" }}>
                                            <span style={{ color: "#6B6862" }}>Referral code</span>
                                            <span className="font-medium" style={{ color: "#14365C" }}>
                                                {refValue || "—"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Beneficiaries */}
                                    {selectedPlan.name !== "Basic" && (
                                        <>
                                            <p className="mb-2 text-xs tracking-wider uppercase" style={{ color: "#6B6862" }}>
                                                Beneficiaries
                                            </p>
                                            <div className="mb-5 space-y-2">
                                                {form.beneficiaries.map((b, i) => (
                                                    <div key={i} className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "#FAF6EE" }}>
                                                        <div className="flex justify-between">
                                                            <span style={{ color: "#6B6862" }}>Beneficiary {i + 1}</span>
                                                            <span className="font-medium" style={{ color: "#14365C" }}>
                                                                {b.name || "—"}
                                                            </span>
                                                        </div>
                                                        <div className="mt-1 flex justify-between">
                                                            <span style={{ color: "#6B6862" }}>Relationship</span>
                                                            <span className="font-medium" style={{ color: "#14365C" }}>
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
                                        className="w-full rounded-xl py-3 font-medium text-white transition-colors"
                                        style={{ backgroundColor: "#4A8A2C" }}
                                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#5DAB3A")}
                                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#4A8A2C")}
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
                                    onClick={() => {
                                        setError("");
                                        setStep(step - 1);
                                    }}
                                    className="flex items-center gap-2 rounded-full px-4 py-2 text-sm transition disabled:opacity-30"
                                    style={{ color: "#6B6862" }}
                                >
                                    <ChevronLeft size={16} /> Back
                                </button>
                                {step < totalSteps && (
                                    <button
                                        type="button"
                                        onClick={handleContinue}
                                        className="flex items-center gap-2 rounded-full px-6 py-2 text-sm font-medium text-white transition-colors"
                                        style={{ backgroundColor: "#14365C" }}
                                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#4A8A2C")}
                                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#14365C")}
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
