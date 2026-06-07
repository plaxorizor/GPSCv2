import { getDoc, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { useState, useEffect } from "react";
import { registerUser } from "../../firebase/auth";
import { db } from "../../firebase/config";

import { Link, useNavigate, useSearchParams } from "react-router-dom";
import logo from "../../components/ui/Logo.png";

import { RadioGroup, Radio } from "@headlessui/react";
import { ChevronLeft, ChevronRight, Plus, Eye, EyeOff } from "lucide-react";

// ── Design tokens (mirrors pro.jsx GlobalStyles) ──────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=DM+Sans:wght@400;500;600;700&display=swap');
  .gpsc-signup-root { font-family: 'DM Sans', system-ui, sans-serif; }
  .gpsc-signup-root .font-display { font-family: 'Fraunces', Georgia, serif; }
`;

const plans = [
    {
        name: "Basic",
        price: 698,
        level: 1,
        rank: "Sales Consultant",
        rate: 0.2,
        coverage: "Individual",
        tagline: "Individual protection, simple start",
    },
    {
        name: "Family",
        price: 1698,
        level: 3,
        rank: "Team Consultant",
        rate: 0.05,
        coverage: "Family of 4",
        tagline: "Coverage for the whole household",
        popular: true,
    },
    {
        name: "Premium",
        price: 4998,
        level: 6,
        rank: "Sales Manager",
        rate: 0.03,
        coverage: "Family of 5",
        tagline: "Full benefits and leadership rewards",
    },
];

const STEPS = ["Package", "Your Info", "Sponsor & Beneficiaries", "Payment", "Review"];

// ── Payment details shown on the signup Payment step ──────────────
// Single source of truth — update account numbers and receipt contacts here.
const PAYMENT_INFO = {
    // `qr` is an optional image path (e.g. "/qr/gcash.png" in /public, or an
    // imported asset URL). Leave empty to show the "QR placeholder" box.
    accounts: [
        { label: "GCash", accountName: "Faith Shield Care Official", number: "09XX-XXX-XXXX", qr: "" },
        { label: "Maya", accountName: "Faith Shield Care Official", number: "09XX-XXX-XXXX", qr: "" },
    ],
    // Where members send their proof of payment for manual verification.
    receiptContacts: [
        { label: "Messenger", value: "Faith Shield Care Official" },
        { label: "Email", value: "payments@faithshieldcare.app" },
    ],
    verificationDays: "1–2 business days",
};

// ── Shared input / label styles ───────────────────────────────────
const inputCls =
    "w-full mt-1 px-4 py-3 rounded-xl border border-[#E5DDC8] bg-white text-[#14365C] placeholder-[#6B6862] focus:outline-none focus:ring-2 focus:ring-[#4A8A2C] transition";
const labelCls = "text-xs uppercase tracking-wider text-[#6B6862]";

export default function SignUpLayout() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const [refCode, setRefCode] = useState<string>(() => searchParams.get("ref") ?? "");
    const [error, setError] = useState("");
    const [step, setStep] = useState(1);
    const totalSteps = 5;

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [consented, setConsented] = useState(false);
    const [policyTab, setPolicyTab] = useState<"privacy" | "terms" | "refund">("privacy");

    const [selectedPlan, setSelectedPlan] = useState(plans[0]);
    const [form, setForm] = useState({
        package: "",
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        email: "",
        confirmEmail: "",
        password: "",
        confirmPassword: "",
        mobile: "",
        telephone: "",
        birthDate: "",
        birthPlace: "",
        gender: "",
        civilStatus: "",
        streetAddress: "",
        barangay: "",
        city: "",
        province: "",
        postalCode: "",
        country: "Philippines",
        referralCode: refCode,
        beneficiaries: [{ name: "", relationship: "" }],
    });

    // Required fields that failed validation on the last "Continue" — highlighted
    // red. Top-level keys match `form`; beneficiary keys are "ben-{index}-name" etc.
    const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
    const isInvalid = (key: string) => invalidFields.has(key);
    const fieldCls = (key: string) => `${inputCls}${isInvalid(key) ? " border-red-500 ring-2 ring-red-500" : ""}`;

    // Clear a field's red highlight as soon as it has a value again.
    useEffect(() => {
        setInvalidFields((prev) => {
            if (prev.size === 0) return prev;
            const next = new Set(prev);
            for (const key of prev) {
                if (key.startsWith("ben-")) {
                    const [, idxStr, sub] = key.split("-");
                    const b = form.beneficiaries[Number(idxStr)];
                    if (b && String((b as Record<string, string>)[sub] ?? "").trim()) next.delete(key);
                } else {
                    const v = (form as Record<string, unknown>)[key];
                    if (typeof v === "string" ? v.trim() !== "" : Boolean(v)) next.delete(key);
                }
            }
            return next.size === prev.size ? prev : next;
        });
    }, [form]);

    // Password strength
    const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
        if (!pwd) return { score: 0, label: "", color: "#E5DDC8" };
        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        if (score <= 1) return { score, label: "Weak", color: "#DC2626" };
        if (score <= 2) return { score, label: "Fair", color: "#F59E0B" };
        if (score <= 3) return { score, label: "Good", color: "#3B82F6" };
        return { score, label: "Strong", color: "#4A8A2C" };
    };
    const pwStrength = getPasswordStrength(form.password);

    const validateStep = async (): Promise<boolean> => {
        setError("");
        setInvalidFields(new Set());

        if (step === 2) {
            // First, flag every empty required field so they all light up red at once.
            const missing = new Set<string>();
            if (!form.firstName.trim()) missing.add("firstName");
            if (!form.lastName.trim()) missing.add("lastName");
            if (!form.email.trim()) missing.add("email");
            if (!form.password) missing.add("password");
            if (!form.confirmPassword) missing.add("confirmPassword");
            if (!form.mobile.trim()) missing.add("mobile");
            if (!form.birthDate) missing.add("birthDate");
            if (!form.gender) missing.add("gender");
            if (!form.civilStatus) missing.add("civilStatus");
            if (!form.city.trim()) missing.add("city");
            if (!form.province.trim()) missing.add("province");
            if (missing.size > 0) {
                setInvalidFields(missing);
                setError("Please fill in the required fields highlighted.");
                return false;
            }

            // Then the logical checks (fields are present but inconsistent).
            if (form.email !== form.confirmEmail) {
                setInvalidFields(new Set(["confirmEmail"]));
                setError("Emails do not match.");
                return false;
            }
            if (form.password !== form.confirmPassword) {
                setInvalidFields(new Set(["confirmPassword"]));
                setError("Passwords do not match.");
                return false;
            }
            // Check age (must be 18+)
            const birthDate = new Date(form.birthDate);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            if (age < 18) {
                setInvalidFields(new Set(["birthDate"]));
                setError("You must be at least 18 years old to register.");
                return false;
            }
        }
        if (step === 3) {
            if (!form.referralCode.trim()) {
                setInvalidFields(new Set(["referralCode"]));
                setError("Referral code is required.");
                return false;
            }

            const snap = await getDoc(doc(db, "referralCodes", form.referralCode));

            if (!snap.exists()) {
                setInvalidFields(new Set(["referralCode"]));
                setError("Invalid referral code.");
                return false;
            }

            if (selectedPlan.name !== "Basic") {
                const missing = new Set<string>();
                for (let i = 0; i < form.beneficiaries.length; i++) {
                    if (!form.beneficiaries[i].name.trim()) missing.add(`ben-${i}-name`);
                    if (!form.beneficiaries[i].relationship) missing.add(`ben-${i}-relationship`);
                }
                if (missing.size > 0) {
                    setInvalidFields(missing);
                    setError("Please complete the beneficiary details highlighted.");
                    return false;
                }
            }
        }
        return true;
    };

    const handleContinue = async () => {
        if (await validateStep()) setStep(step + 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }
        if (form.email !== form.confirmEmail) {
            setError("Emails do not match.");
            setLoading(false);
            return;
        }
        try {
            const snap = await getDoc(doc(db, "referralCodes", form.referralCode));
            if (!snap.exists()) {
                setError("Invalid referral code.");
                setLoading(false);
                return;
            }
            const referredBy = snap.data().uid;

            const { user } = await registerUser(form.email, form.password);

            await setDoc(doc(db, "members", user.uid), {
                referralCode: null,
                referredBy: referredBy,
                firstName: form.firstName,
                middleName: form.middleName || null,
                lastName: form.lastName,
                suffix: form.suffix || null,
                email: form.email,
                mobile: form.mobile,
                telephone: form.telephone || null,
                birthDate: form.birthDate,
                birthPlace: form.birthPlace || null,
                gender: form.gender,
                civilStatus: form.civilStatus,
                streetAddress: form.streetAddress || null,
                barangay: form.barangay || null,
                city: form.city,
                province: form.province,
                postalCode: form.postalCode || null,
                country: form.country,
                package: selectedPlan.name.toLowerCase(),
                beneficiaries: form.beneficiaries,
                status: "pending",
                isAdmin: false,
                dateCreated: serverTimestamp(),
            });

            navigate("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setLoading(false);
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
                            <img src={logo} alt="Faith Shield Care Logo" className="h-20 w-20 rounded-full object-contain" />
                        </button>
                        <h1 className="font-display mt-4 text-4xl" style={{ color: "#14365C" }}>
                            Join in a few minutes
                        </h1>
                        <p className="mt-2 text-sm" style={{ color: "#6B6862" }}>
                            Become part of the Faith Shield Care community today
                        </p>
                    </div>

                    {/* ════ CONSENT GATE ════ */}
                    {!consented ? (
                        <div className="rounded-3xl p-8" style={{ backgroundColor: "#fff", border: "1px solid #E5DDC8" }}>
                            <h2 className="font-display mb-2 text-2xl" style={{ color: "#14365C" }}>
                                Before you continue
                            </h2>
                            <p className="mb-6 text-sm" style={{ color: "#6B6862" }}>
                                Please read and agree to our policies before creating your account.
                            </p>

                            {/* Tab bar */}
                            <div className="mb-5 flex rounded-xl overflow-hidden" style={{ border: "1px solid #E5DDC8" }}>
                                {(["privacy", "terms", "refund"] as const).map((tab) => {
                                    const labels = { privacy: "Privacy Policy", terms: "Terms & Conditions", refund: "Refund Policy" };
                                    const active = policyTab === tab;
                                    return (
                                        <button
                                            key={tab}
                                            type="button"
                                            onClick={() => setPolicyTab(tab)}
                                            className="flex-1 py-2.5 text-xs font-medium transition-colors"
                                            style={{
                                                backgroundColor: active ? "#14365C" : "#FAF6EE",
                                                color: active ? "#fff" : "#6B6862",
                                                borderRight: tab !== "refund" ? "1px solid #E5DDC8" : undefined,
                                            }}
                                        >
                                            {labels[tab]}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Tab content */}
                            <div
                                className="rounded-2xl p-5 mb-6 overflow-y-auto space-y-3 text-sm leading-relaxed"
                                style={{ backgroundColor: "#FAF6EE", border: "1px solid #E5DDC8", maxHeight: "320px", color: "#4B4A47" }}
                            >
                                {policyTab === "privacy" && (
                                    <>
                                        <p><strong style={{ color: "#14365C" }}>Last updated: June 2025</strong></p>
                                        <p>Faith Shield Care ("we", "us", or "our") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard the data you provide when registering as a member.</p>
                                        <p><strong style={{ color: "#14365C" }}>Information We Collect</strong><br />We collect your name, email address, mobile number, birth date, civil status, location, referral code, and beneficiary details. Proof of payment that you send us for verification is handled separately and is not stored in your online account.</p>
                                        <p><strong style={{ color: "#14365C" }}>How We Use Your Information</strong><br />Your data is used to process your membership application, verify identity, manage your account, facilitate referral rewards, and communicate important updates.</p>
                                        <p><strong style={{ color: "#14365C" }}>Data Sharing</strong><br />We do not sell or rent your personal data. Information may be shared only with service providers necessary to operate our platform, or as required by law.</p>
                                        <p><strong style={{ color: "#14365C" }}>Data Security</strong><br />We use industry-standard security measures to protect your information. However, no online transmission is 100% secure and we cannot guarantee absolute security.</p>
                                        <p><strong style={{ color: "#14365C" }}>Your Rights</strong><br />You may request access to, correction of, or deletion of your personal data by contacting us at support@faithshieldcare.com.</p>
                                    </>
                                )}
                                {policyTab === "terms" && (
                                    <>
                                        <p><strong style={{ color: "#14365C" }}>Last updated: June 2025</strong></p>
                                        <p>By registering for a Faith Shield Care membership, you agree to be bound by these Terms &amp; Conditions. Please read them carefully before proceeding.</p>
                                        <p><strong style={{ color: "#14365C" }}>Eligibility</strong><br />Membership is open to individuals 18 years of age or older. By registering, you confirm that all information provided is accurate and truthful.</p>
                                        <p><strong style={{ color: "#14365C" }}>Membership Plans</strong><br />Each plan (Basic, Family, Premium) carries distinct benefits and referral structures. Plan details are subject to change with prior notice to members.</p>
                                        <p><strong style={{ color: "#14365C" }}>Referral Program</strong><br />Referral commissions are credited upon successful activation of referred members. Faith Shield Care reserves the right to adjust commission rates with reasonable notice.</p>
                                        <p><strong style={{ color: "#14365C" }}>Account Responsibility</strong><br />You are responsible for maintaining the confidentiality of your account credentials. Faith Shield Care is not liable for unauthorized access resulting from your failure to secure your account.</p>
                                        <p><strong style={{ color: "#14365C" }}>Termination</strong><br />Faith Shield Care reserves the right to suspend or terminate any account found to be in violation of these Terms or engaged in fraudulent activity.</p>
                                        <p><strong style={{ color: "#14365C" }}>Governing Law</strong><br />These Terms are governed by the laws of the Republic of the Philippines.</p>
                                    </>
                                )}
                                {policyTab === "refund" && (
                                    <>
                                        <p><strong style={{ color: "#14365C" }}>Last updated: June 2025</strong></p>
                                        <p>Faith Shield Care strives to ensure member satisfaction. Please review our refund policy before completing your registration.</p>
                                        <p><strong style={{ color: "#14365C" }}>Cooling-Off Period</strong><br />Members may request a full refund within 7 calendar days of account activation, provided no referral commissions have been disbursed under their account.</p>
                                        <p><strong style={{ color: "#14365C" }}>Non-Refundable Circumstances</strong><br />Refunds will not be granted if the membership has been active for more than 7 days, if commissions have already been paid to the member, or if the account has been found in violation of our Terms &amp; Conditions.</p>
                                        <p><strong style={{ color: "#14365C" }}>How to Request a Refund</strong><br />To initiate a refund, contact our support team at support@faithshieldcare.com with your registered email and reason for the request. Approved refunds will be processed within 7–14 business days.</p>
                                        <p><strong style={{ color: "#14365C" }}>Plan Upgrades</strong><br />Payments made for plan upgrades are non-refundable once the upgraded plan has been activated.</p>
                                    </>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                                <button
                                    type="button"
                                    onClick={() => navigate("/")}
                                    className="flex-1 rounded-xl border py-3 text-sm font-medium transition-colors"
                                    style={{ borderColor: "#E5DDC8", color: "#6B6862", backgroundColor: "#FAF6EE" }}
                                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#E5DDC8")}
                                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#FAF6EE")}
                                >
                                    I Disagree — Go Back
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConsented(true)}
                                    className="flex-1 rounded-xl py-3 text-sm font-medium text-white transition-colors"
                                    style={{ backgroundColor: "#4A8A2C" }}
                                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#5DAB3A")}
                                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#4A8A2C")}
                                >
                                    I Agree — Continue Registration
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* ════ MAIN SIGNUP FLOW (after consent) ════ */}
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

                                    {/* ════ STEP 2 — Personal info (Enhanced) ════ */}
                                    {step === 2 && (
                                        <div>
                                            <h2 className="font-display mb-6 text-2xl" style={{ color: "#14365C" }}>
                                                Step 2 · Your Information
                                            </h2>
                                            <div className="space-y-4">
                                                {/* Full Name Section */}
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <label className={labelCls}>
                                                            First name <span style={{ color: "#B91C1C" }}>*</span>
                                                        </label>
                                                        <input
                                                            required
                                                            value={form.firstName}
                                                            placeholder="Juan"
                                                            className={fieldCls("firstName")}
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
                                                            className={fieldCls("lastName")}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Middle Name & Suffix */}
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <label className={labelCls}>
                                                            Middle name
                                                        </label>
                                                        <input
                                                            value={form.middleName}
                                                            placeholder="Santos"
                                                            className={inputCls}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, middleName: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className={labelCls}>
                                                            Suffix
                                                        </label>
                                                        <select
                                                            value={form.suffix}
                                                            className={inputCls}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, suffix: e.target.value }))}
                                                        >
                                                            <option value="">None</option>
                                                            <option value="Jr.">Jr.</option>
                                                            <option value="Sr.">Sr.</option>
                                                            <option value="II">II</option>
                                                            <option value="III">III</option>
                                                            <option value="IV">IV</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Contact Information */}
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <label className={labelCls}>
                                                            Email <span style={{ color: "#B91C1C" }}>*</span>
                                                        </label>
                                                        <input
                                                            required
                                                            type="email"
                                                            value={form.email}
                                                            placeholder="juandelacruz@example.com"
                                                            className={fieldCls("email")}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className={labelCls}>
                                                            Confirm Email <span style={{ color: "#B91C1C" }}>*</span>
                                                        </label>
                                                        <input
                                                            required
                                                            type="email"
                                                            value={form.confirmEmail}
                                                            placeholder="juandelacruz@example.com"
                                                            className={fieldCls("confirmEmail")}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, confirmEmail: e.target.value }))}
                                                        />
                                                        {form.confirmEmail && form.email !== form.confirmEmail && (
                                                            <p className="mt-1 text-xs" style={{ color: "#DC2626" }}>
                                                                Emails do not match
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Mobile & Alternate Contact */}
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <label className={labelCls}>
                                                            Mobile number <span style={{ color: "#B91C1C" }}>*</span>
                                                        </label>
                                                        <input
                                                            required
                                                            value={form.mobile}
                                                            placeholder="09XXXXXXXXX"
                                                            className={fieldCls("mobile")}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, mobile: e.target.value }))}
                                                        />
                                                        <p className="mt-1 text-xs" style={{ color: "#6B6862" }}>
                                                            Format: 09XX-XXX-XXXX
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className={labelCls}>
                                                            Telephone number (optional)
                                                        </label>
                                                        <input
                                                            value={form.telephone}
                                                            placeholder="(02) 1234-5678"
                                                            className={inputCls}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, telephone: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Password Section */}
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <label className={labelCls}>
                                                            Password <span style={{ color: "#B91C1C" }}>*</span>
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                required
                                                                type={showPassword ? "text" : "password"}
                                                                value={form.password}
                                                                className={fieldCls("password")}
                                                                style={{ paddingRight: "2.75rem" }}
                                                                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword((v) => !v)}
                                                                className="absolute inset-y-0 right-3 flex items-center text-[#6B6862] hover:text-[#14365C] transition-colors"
                                                                tabIndex={-1}
                                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                                            >
                                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                            </button>
                                                        </div>
                                                        {form.password.length > 0 && (
                                                            <div className="mt-2">
                                                                <div className="flex gap-1 mb-1">
                                                                    {[1, 2, 3, 4].map((seg) => (
                                                                        <div
                                                                            key={seg}
                                                                            className="h-1 flex-1 rounded-full transition-colors duration-300"
                                                                            style={{
                                                                                backgroundColor: pwStrength.score >= seg ? pwStrength.color : "#E5DDC8",
                                                                            }}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <p className="text-xs" style={{ color: pwStrength.color }}>
                                                                    {pwStrength.label}: {pwStrength.label === "Strong" ? "✓ " : ""}
                                                                    {pwStrength.score <= 1 && "Use 8+ characters with letters, numbers & symbols"}
                                                                    {pwStrength.score === 2 && "Add numbers or symbols to strengthen"}
                                                                    {pwStrength.score === 3 && "Good! Add more variety for strong password"}
                                                                    {pwStrength.score >= 4 && "Excellent security"}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className={labelCls}>
                                                            Confirm password <span style={{ color: "#B91C1C" }}>*</span>
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                required
                                                                type={showConfirmPassword ? "text" : "password"}
                                                                value={form.confirmPassword}
                                                                className={fieldCls("confirmPassword")}
                                                                style={{ paddingRight: "2.75rem" }}
                                                                onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowConfirmPassword((v) => !v)}
                                                                className="absolute inset-y-0 right-3 flex items-center text-[#6B6862] hover:text-[#14365C] transition-colors"
                                                                tabIndex={-1}
                                                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                                            >
                                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                            </button>
                                                        </div>
                                                        {form.confirmPassword.length > 0 && (
                                                            <p className="mt-2 text-xs" style={{ color: form.password === form.confirmPassword ? "#4A8A2C" : "#DC2626" }}>
                                                                {form.password === form.confirmPassword ? "Passwords match ✓" : "Passwords do not match"}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Personal Details Section */}
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <label className={labelCls}>
                                                            Birth date <span style={{ color: "#B91C1C" }}>*</span>
                                                        </label>
                                                        <input
                                                            required
                                                            type="date"
                                                            value={form.birthDate}
                                                            className={fieldCls("birthDate")}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, birthDate: e.target.value }))}
                                                        />
                                                        <p className="mt-1 text-xs" style={{ color: "#6B6862" }}>
                                                            Must be 18 years or older
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className={labelCls}>
                                                            Place of birth
                                                        </label>
                                                        <input
                                                            value={form.birthPlace}
                                                            placeholder="City, Province"
                                                            className={inputCls}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, birthPlace: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Gender & Civil Status */}
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <label className={labelCls}>
                                                            Gender <span style={{ color: "#B91C1C" }}>*</span>
                                                        </label>
                                                        <select
                                                            required
                                                            value={form.gender}
                                                            className={fieldCls("gender")}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}
                                                        >
                                                            <option value="">Select Gender</option>
                                                            <option value="male">Male</option>
                                                            <option value="female">Female</option>
                                                            <option value="other">Other</option>
                                                            <option value="prefer-not">Prefer not to say</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className={labelCls}>
                                                            Civil status <span style={{ color: "#B91C1C" }}>*</span>
                                                        </label>
                                                        <select
                                                            required
                                                            value={form.civilStatus}
                                                            className={fieldCls("civilStatus")}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, civilStatus: e.target.value }))}
                                                        >
                                                            <option value="">Select Status</option>
                                                            <option value="single">Single</option>
                                                            <option value="married">Married</option>
                                                            <option value="divorced">Divorced</option>
                                                            <option value="widowed">Widowed</option>
                                                            <option value="separated">Legally Separated</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Address Information */}
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <label className={labelCls}>
                                                            Street address
                                                        </label>
                                                        <input
                                                            value={form.streetAddress}
                                                            placeholder="123 Rizal Street"
                                                            className={inputCls}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, streetAddress: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className={labelCls}>
                                                            Barangay
                                                        </label>
                                                        <input
                                                            value={form.barangay}
                                                            placeholder="Barangay name"
                                                            className={inputCls}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, barangay: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <label className={labelCls}>
                                                            City / Municipality <span style={{ color: "#B91C1C" }}>*</span>
                                                        </label>
                                                        <input
                                                            required
                                                            value={form.city}
                                                            placeholder="Davao City"
                                                            className={fieldCls("city")}
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
                                                            className={fieldCls("province")}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, province: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <label className={labelCls}>
                                                            Postal / ZIP code
                                                        </label>
                                                        <input
                                                            value={form.postalCode}
                                                            placeholder="8000"
                                                            className={inputCls}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, postalCode: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className={labelCls}>
                                                            Country
                                                        </label>
                                                        <input
                                                            value={form.country}
                                                            className={inputCls}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
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
                                                Step 3 · Sponsor &amp; Beneficiaries
                                            </h2>
                                            <div className="space-y-5">
                                                <div>
                                                    <label className={labelCls}>
                                                        Sponsor / Referral Code <span style={{ color: "#B91C1C" }}>*</span>
                                                    </label>
                                                    <input
                                                        required
                                                        value={form.referralCode}
                                                        placeholder="e.g. MARIA-ABCD-1234"
                                                        className={fieldCls("referralCode")}
                                                        onChange={(e) => {
                                                            setRefCode(e.target.value);
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

                                    {/* ════ STEP 4 — Payment ════ */}
                                    {step === 4 && (
                                        <div>
                                            <h2 className="font-display mb-2 text-2xl" style={{ color: "#14365C" }}>
                                                Step 4 · Payment
                                            </h2>
                                            <p className="mb-6 text-sm" style={{ color: "#6B6862" }}>
                                                Send your payment to one of the accounts below. After paying, send your receipt to us so we
                                                can verify it and activate your account.
                                            </p>

                                            <div className="mb-6 flex items-center justify-between rounded-2xl px-5 py-4" style={{ backgroundColor: "#FAF6EE", border: "1px solid #E5DDC8" }}>
                                                <div>
                                                    <p className="text-xs uppercase tracking-wider" style={{ color: "#6B6862" }}>Amount Due</p>
                                                    <p className="font-display text-2xl font-semibold" style={{ color: "#14365C" }}>
                                                        ₱{selectedPlan.price.toLocaleString("en-PH")}
                                                    </p>
                                                </div>
                                                <span className="rounded-full px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: "#4A8A2C" }}>
                                                    {selectedPlan.name} Care
                                                </span>
                                            </div>

                                            <div className="mb-6 grid gap-4 sm:grid-cols-2">
                                                {PAYMENT_INFO.accounts.map((acct) => (
                                                    <div key={acct.label} className="flex flex-col items-center rounded-2xl p-5" style={{ border: "1px solid #E5DDC8", backgroundColor: "#fff" }}>
                                                        <p className="mb-3 text-sm font-semibold" style={{ color: "#14365C" }}>{acct.label}</p>
                                                        {acct.qr ? (
                                                            <img
                                                                src={acct.qr}
                                                                alt={`${acct.label} QR code`}
                                                                className="h-40 w-40 rounded-xl object-contain"
                                                                style={{ border: "1px solid #E5DDC8" }}
                                                            />
                                                        ) : (
                                                            <div className="flex h-40 w-40 items-center justify-center rounded-xl text-xs" style={{ backgroundColor: "#F3F4F6", color: "#9CA3AF", border: "2px dashed #D1D5DB" }}>
                                                                QR placeholder
                                                            </div>
                                                        )}
                                                        <p className="mt-3 text-xs" style={{ color: "#6B6862" }}>Account name: <span className="font-medium" style={{ color: "#14365C" }}>{acct.accountName}</span></p>
                                                        <p className="text-xs" style={{ color: "#6B6862" }}>Number: <span className="font-medium" style={{ color: "#14365C" }}>{acct.number}</span></p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Offline proof-of-payment: members send their receipt to us for
                                                manual verification. (File upload returns after the Blaze upgrade.) */}
                                            <div className="rounded-2xl p-5" style={{ backgroundColor: "#FAF6EE", border: "1px solid #E5DDC8" }}>
                                                <p className="text-sm font-semibold" style={{ color: "#14365C" }}>
                                                    After paying, send your proof of payment
                                                </p>
                                                <p className="mt-1 text-xs" style={{ color: "#6B6862" }}>
                                                    Take a screenshot or photo of your transaction receipt and send it to us, including your full
                                                    name, so we can match your payment and activate your account:
                                                </p>
                                                <ul className="mt-3 space-y-1 text-sm" style={{ color: "#14365C" }}>
                                                    {PAYMENT_INFO.receiptContacts.map((c) => (
                                                        <li key={c.label}>{c.label}: <span className="font-medium">{c.value}</span></li>
                                                    ))}
                                                </ul>
                                                <p className="mt-3 text-xs" style={{ color: "#6B6862" }}>
                                                    Your account stays <span className="font-medium">Pending</span> until our team verifies your
                                                    payment, usually within {PAYMENT_INFO.verificationDays}.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* ════ STEP 5 — Review ════ */}
                                    {step === 5 && (
                                        <div>
                                            <h2 className="font-display mb-6 text-2xl" style={{ color: "#14365C" }}>
                                                Step 5 · Review &amp; register
                                            </h2>

                                            <p className="mb-2 text-xs tracking-wider uppercase" style={{ color: "#6B6862" }}>
                                                Membership Package
                                            </p>
                                            <div className="mb-5 space-y-2">
                                                <div className="flex justify-between rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "#FAF6EE" }}>
                                                    <span style={{ color: "#6B6862" }}>Package</span>
                                                    <span className="font-medium" style={{ color: "#14365C" }}>
                                                        {selectedPlan.name} Care — ₱{selectedPlan.price.toLocaleString("en-PH")}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="mb-2 text-xs tracking-wider uppercase" style={{ color: "#6B6862" }}>
                                                Personal Information
                                            </p>
                                            <div className="mb-5 space-y-2">
                                                {[
                                                    { label: "First name", value: form.firstName || "—" },
                                                    { label: "Middle name", value: form.middleName || "—" },
                                                    { label: "Last name", value: form.lastName || "—" },
                                                    { label: "Suffix", value: form.suffix || "—" },
                                                    { label: "Email", value: form.email || "—" },
                                                    { label: "Mobile", value: form.mobile || "—" },
                                                    { label: "Telephone", value: form.telephone || "—" },
                                                    { label: "Birth date", value: form.birthDate || "—" },
                                                    { label: "Birth place", value: form.birthPlace || "—" },
                                                    { label: "Gender", value: form.gender ? form.gender.charAt(0).toUpperCase() + form.gender.slice(1) : "—" },
                                                    {
                                                        label: "Civil status",
                                                        value: form.civilStatus ? form.civilStatus.charAt(0).toUpperCase() + form.civilStatus.slice(1) : "—",
                                                    },
                                                    { label: "Street address", value: form.streetAddress || "—" },
                                                    { label: "Barangay", value: form.barangay || "—" },
                                                    { label: "City", value: form.city || "—" },
                                                    { label: "Province", value: form.province || "—" },
                                                    { label: "Postal code", value: form.postalCode || "—" },
                                                    { label: "Country", value: form.country || "—" },
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

                                            <p className="mb-2 text-xs tracking-wider uppercase" style={{ color: "#6B6862" }}>
                                                Sponsor
                                            </p>
                                            <div className="mb-5 space-y-2">
                                                <div className="flex justify-between rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "#FAF6EE" }}>
                                                    <span style={{ color: "#6B6862" }}>Referral code</span>
                                                    <span className="font-medium" style={{ color: "#14365C" }}>
                                                        {form.referralCode || "—"}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="mb-2 text-xs tracking-wider uppercase" style={{ color: "#6B6862" }}>
                                                Payment
                                            </p>
                                            <div className="mb-5 space-y-2">
                                                <div className="flex justify-between rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "#FAF6EE" }}>
                                                    <span style={{ color: "#6B6862" }}>Amount due</span>
                                                    <span className="font-medium" style={{ color: "#14365C" }}>
                                                        ₱{selectedPlan.price.toLocaleString("en-PH")} · {selectedPlan.name} Care
                                                    </span>
                                                </div>
                                                <div className="rounded-xl px-4 py-3 text-xs" style={{ backgroundColor: "#FAF6EE", color: "#6B6862" }}>
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
                                                disabled={loading || step !== totalSteps}
                                                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-white hover:bg-[#5DAB3A] disabled:cursor-not-allowed disabled:opacity-60"
                                                style={{ backgroundColor: "#4A8A2C" }}
                                            >
                                                {loading ? (
                                                    <>
                                                        <svg
                                                            className="h-4 w-4 animate-spin text-white"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                        >
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
                                    )}

                                    {/* ── Navigation buttons ── */}
                                    <div className="flex justify-between pt-4" style={{ borderTop: "1px solid #E5DDC8" }}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (step === 1) {
                                                    navigate("/");
                                                } else {
                                                    setError("");
                                                    setStep(step - 1);
                                                }
                                            }}
                                            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm transition"
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
                        </>
                    )}
                </div>
            </div>
        </>
    );
}