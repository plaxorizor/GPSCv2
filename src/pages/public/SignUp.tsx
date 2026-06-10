import { getDoc, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { useState, useEffect, useMemo } from "react";
import { registerUser } from "../../firebase/auth";
import { uploadReceipt } from "../../firebase/receipts";
import { writePublicProfile } from "../../firebase/publicProfiles";
import { isMobileTaken, claimMobile } from "../../firebase/phoneRegistry";
import { db } from "../../firebase/config";
import ReceiptUploadField from "../../components/ReceiptUploadField";
import { PAYMENT_ACCOUNTS } from "../../data/paymentAccounts";

import { Link, useNavigate, useSearchParams } from "react-router-dom";
import logo from "../../components/ui/Logo.png";
import { provinces, citiesByProvince, barangaysByCity, type Barangay } from "../../data/ph/phAddress";

import { RadioGroup, Radio } from "@headlessui/react";
import { ChevronLeft, ChevronRight, Plus, Eye, EyeOff } from "lucide-react";

// ── Design tokens (mirrors pro.jsx GlobalStyles) ──────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=DM+Sans:wght@400;500;600;700&display=swap');
  .fsc-signup-root { font-family: 'DM Sans', system-ui, sans-serif; }
  .fsc-signup-root .font-display { font-family: 'Fraunces', Georgia, serif; }
  @keyframes signup-fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .signup-anim { animation: signup-fade-up 0.5s ease-out forwards; }
`;

const plans = [
    {
        name: "Basic",
        price: 698,
        level: 1,
        rate: 0.2,
        coverage: "Individual",
        tagline: "Individual protection, simple start",
    },
    {
        name: "Family",
        price: 1698,
        level: 3,
        rate: 0.05,
        coverage: "Family of 4",
        tagline: "Coverage for the whole household",
        popular: true,
    },
    {
        name: "Premium",
        price: 4998,
        level: 6,
        rate: 0.03,
        coverage: "Family of 5",
        tagline: "Full benefits and leadership rewards",
    },
];

const STEPS = ["Package", "Your Info", "Sponsor & Beneficiaries", "Payment", "Review"];

// ── Payment details shown on the signup Payment step ──────────────
// Single source of truth — update account numbers and receipt contacts here.
const PAYMENT_INFO = {
    // Accounts + QR codes come from the shared single source of truth.
    accounts: PAYMENT_ACCOUNTS,
    // Where members send their proof of payment for manual verification.
    // `href` makes the value a clickable link. (Email hidden for now — pending
    // confirmation from the client.)
    receiptContacts: [
        { label: "Facebook", value: "fb.me/FaithShieldCare", href: "https://fb.me/FaithShieldCare" },
    ],
    verificationDays: "1–2 business days",
};

// ── Shared input / label styles ───────────────────────────────────
const inputCls =
    "w-full mt-1 px-4 py-3 rounded-xl border border-[#D0D2D8] bg-white text-[#1B2D6B] placeholder-[#6B6862] focus:outline-none focus:ring-2 focus:ring-[#C9922A] transition";
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

    // Birth date split into Month / Day / Year dropdowns.
    const [birth, setBirth] = useState({ y: "", m: "", d: "" });
    const [consented, setConsented] = useState(false);
    const [policyTab, setPolicyTab] = useState<"privacy" | "terms">("privacy");

    const [selectedPlan, setSelectedPlan] = useState(plans[0]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_INFO.accounts[0].label);
    // Optional payment-proof screenshot, uploaded to Storage on submit.
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
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
        gender: "",
        civilStatus: "",
        streetAddress: "",
        province: "",
        provinceCode: "",
        city: "",
        cityCode: "",
        barangay: "",
        country: "Philippines",
        referralCode: refCode,
        referenceNumber: "",
        beneficiaries: [{ name: "", relationship: "" }],
    });

    // Required fields that failed validation on the last "Continue" — highlighted
    // red. Top-level keys match `form`; beneficiary keys are "ben-{index}-name" etc.
    const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
    // Derived: remove a field from the highlight as soon as it has a value again.
    const effectiveInvalidFields = useMemo(() => {
        if (invalidFields.size === 0) return invalidFields;
        const next = new Set(invalidFields);
        for (const key of invalidFields) {
            if (key.startsWith("ben-")) {
                const [, idxStr, sub] = key.split("-");
                const b = form.beneficiaries[Number(idxStr)];
                if (b && String((b as Record<string, string>)[sub] ?? "").trim()) next.delete(key);
            } else {
                const v = (form as Record<string, unknown>)[key];
                if (typeof v === "string" ? v.trim() !== "" : Boolean(v)) next.delete(key);
            }
        }
        return next;
    }, [invalidFields, form]);
    const isInvalid = (key: string) => effectiveInvalidFields.has(key);

    // Fields the user has blurred at least once — used to validate on focus loss
    // (not while still typing).
    const [touched, setTouched] = useState<Set<string>>(new Set());
    const markTouched = (key: string) => setTouched((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));

    // Live, on-blur consistency messages (shown only after the field is touched).
    const emailMismatch = touched.has("confirmEmail") && !!form.confirmEmail && form.email !== form.confirmEmail;
    const passwordMismatch = touched.has("confirmPassword") && !!form.confirmPassword && form.password !== form.confirmPassword;
    const fieldCls = (key: string) => `${inputCls}${isInvalid(key) ? " !border-[#C41E1E]" : ""}`;

    // Derived from the three dropdowns — no effect needed.
    const birthDate = birth.y && birth.m && birth.d ? `${birth.y}-${birth.m}-${birth.d}` : "";

    // Birth-date dropdown option lists.
    const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentYear = new Date().getFullYear();
    const birthYears = Array.from({ length: 100 }, (_, i) => currentYear - 18 - i); // 18..117 yrs old
    const daysInMonth = birth.y && birth.m ? new Date(Number(birth.y), Number(birth.m), 0).getDate() : 31;
    const birthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Barangay options for the selected city (lazy-loaded from the bundled dataset).
    const [barangayOptions, setBarangayOptions] = useState<Barangay[]>([]);
    const [loadingBarangays, setLoadingBarangays] = useState(false);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!form.cityCode) {
                if (!cancelled) setBarangayOptions([]);
                return;
            }
            if (!cancelled) setLoadingBarangays(true);
            try {
                const list = await barangaysByCity(form.cityCode);
                if (!cancelled) setBarangayOptions(list);
            } finally {
                if (!cancelled) setLoadingBarangays(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [form.cityCode]);

    // Cascading address handlers — selecting a parent resets its children.
    const handleProvinceChange = (provinceCode: string) => {
        const p = provinces.find((x) => x.province_code === provinceCode);
        setForm((prev) => ({
            ...prev,
            provinceCode,
            province: p?.province_name ?? "",
            cityCode: "",
            city: "",
            barangay: "",
        }));
    };
    const handleCityChange = (cityCode: string) => {
        const c = citiesByProvince(form.provinceCode).find((x) => x.city_code === cityCode);
        setForm((prev) => ({ ...prev, cityCode, city: c?.city_name ?? "", barangay: "" }));
    };

    // Mobile is stored as the local part only (10 digits starting with "9");
    // the "+63" prefix is fixed in the UI and prepended on save.
    const handleMobileChange = (raw: string) => {
        const digits = raw.replace(/\D/g, "").slice(0, 10);
        setForm((prev) => ({ ...prev, mobile: digits }));
    };
    // Display helper: "9XX XXX XXXX".
    const formatPHMobile = (d: string) => [d.slice(0, 3), d.slice(3, 6), d.slice(6, 10)].filter(Boolean).join(" ");
    // Valid local part = "9" followed by 9 more digits.
    const isValidPHMobile = (m: string) => /^9\d{9}$/.test(m.replace(/\D/g, ""));

    // Password strength
    const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
        if (!pwd) return { score: 0, label: "", color: "#D0D2D8" };
        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        if (score <= 1) return { score, label: "Weak", color: "#C41E1E" };
        if (score <= 2) return { score, label: "Fair", color: "#F59E0B" };
        if (score <= 3) return { score, label: "Good", color: "#3B82F6" };
        return { score, label: "Strong", color: "#C9922A" };
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
            if (!birthDate) missing.add("birthDate");
            if (!form.gender) missing.add("gender");
            if (!form.civilStatus) missing.add("civilStatus");
            if (!form.streetAddress.trim()) missing.add("streetAddress");
            if (!form.province.trim()) missing.add("province");
            if (!form.city.trim()) missing.add("city");
            if (!form.barangay.trim()) missing.add("barangay");
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
            // Mobile must be a valid PH number.
            if (!isValidPHMobile(form.mobile)) {
                setInvalidFields(new Set(["mobile"]));
                setError("Enter a valid PH mobile number (09XX XXX XXXX or +63 9XX XXX XXXX).");
                return false;
            }
            // One-account policy: a mobile number may belong to only one member.
            if (await isMobileTaken(form.mobile)) {
                setInvalidFields(new Set(["mobile"]));
                setError("This mobile number is already registered. Each person may only have one account.");
                return false;
            }
            // Check age (must be 18+)
            const birthDateObj = new Date(birthDate);
            const today = new Date();
            let age = today.getFullYear() - birthDateObj.getFullYear();
            const monthDiff = today.getMonth() - birthDateObj.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
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
        if (step === 4) {
            if (!form.referenceNumber.trim()) {
                setInvalidFields(new Set(["referenceNumber"]));
                setError("Please enter the reference number from your payment receipt.");
                return false;
            }
        }
        return true;
    };

    const [checking, setChecking] = useState(false);
    const handleContinue = async () => {
        if (checking) return; // guard against double-clicks
        setChecking(true);
        try {
            if (await validateStep()) setStep(step + 1);
        } finally {
            setChecking(false);
        }
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

            // One-account policy: re-check at submit time (guards against a number
            // claimed between step 2 and final submit).
            if (await isMobileTaken(form.mobile)) {
                setError("This mobile number is already registered. Each person may only have one account.");
                setLoading(false);
                return;
            }

            const { user } = await registerUser(form.email, form.password);

            // Upload the optional receipt now that the user is authenticated (the
            // Storage rule requires request.auth.uid == the receipts/{uid} folder).
            let paymentReceiptUrl: string | null = null;
            if (receiptFile) {
                paymentReceiptUrl = await uploadReceipt(user.uid, "signup", receiptFile);
            }

            await setDoc(doc(db, "members", user.uid), {
                referralCode: null,
                referredBy: referredBy,
                firstName: form.firstName,
                middleName: form.middleName || null,
                lastName: form.lastName,
                suffix: form.suffix || null,
                email: form.email,
                mobile: form.mobile ? `+63${form.mobile}` : "",
                birthDate: birthDate,
                gender: form.gender,
                civilStatus: form.civilStatus,
                streetAddress: form.streetAddress,
                barangay: form.barangay,
                city: form.city,
                province: form.province,
                country: form.country,
                package: selectedPlan.name.toLowerCase(),
                beneficiaries: form.beneficiaries,
                // Proof of payment the member enters on the Payment step — kept so
                // an admin can match it against the receipt before activating.
                paymentReference: form.referenceNumber.trim(),
                paymentMethod: selectedPaymentMethod,
                paymentReceiptUrl,
                status: "pending",
                isAdmin: false,
                dateCreated: serverTimestamp(),
            });

            // Mirror the non-sensitive fields so this member shows up in their
            // sponsor's downline. Self-create is allowed only as "pending".
            await writePublicProfile(user.uid, {
                firstName: form.firstName,
                lastName: form.lastName,
                city: form.city,
                package: selectedPlan.name.toLowerCase(),
                status: "pending",
                referredBy,
                referralCode: null,
            });

            // Reserve the mobile number so no one else can register it.
            await claimMobile(form.mobile, user.uid);

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

            <div className="fsc-signup-root min-h-screen px-6 py-12" style={{ backgroundColor: "#F2F3F5" }}>
                <div className="signup-anim mx-auto max-w-2xl">
                    {/* ── Header ── */}
                    <div className="mb-10 text-center">
                        <button type="button" onClick={() => navigate("/")} className="inline-flex cursor-pointer flex-col items-center">
                            <img src={logo} alt="FaithShield Care Logo" className="h-20 w-20 rounded-full object-contain" />
                        </button>
                        <h1 className="font-display mt-4 text-4xl" style={{ color: "#1B2D6B" }}>
                            Join in a few minutes
                        </h1>
                        <p className="mt-2 text-sm" style={{ color: "#6B6862" }}>
                            Become part of the FaithShield Care community today
                        </p>
                    </div>

                    {/* ════ CONSENT GATE ════ */}
                    {!consented ? (
                        <div className="rounded-3xl p-8" style={{ backgroundColor: "#fff", border: "1px solid #D0D2D8" }}>
                            <h2 className="font-display mb-2 text-2xl" style={{ color: "#1B2D6B" }}>
                                Before you continue
                            </h2>
                            <p className="mb-6 text-sm" style={{ color: "#6B6862" }}>
                                Please read and agree to our policies before creating your account.
                            </p>

                            {/* Tab bar */}
                            <div className="mb-5 flex overflow-hidden rounded-xl" style={{ border: "1px solid #D0D2D8" }}>
                                {(["privacy", "terms"] as const).map((tab) => {
                                    const labels = { privacy: "Privacy Policy", terms: "Terms & Conditions" };
                                    const active = policyTab === tab;
                                    return (
                                        <button
                                            key={tab}
                                            type="button"
                                            onClick={() => setPolicyTab(tab)}
                                            className="flex-1 py-2.5 text-xs font-medium transition-colors"
                                            style={{
                                                backgroundColor: active ? "#1B2D6B" : "#F2F3F5",
                                                color: active ? "#fff" : "#6B6862",
                                                borderRight: tab !== "terms" ? "1px solid #D0D2D8" : undefined,
                                            }}
                                        >
                                            {labels[tab]}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Tab content */}
                            <div
                                className="mb-6 space-y-3 overflow-y-auto rounded-2xl p-5 text-sm leading-relaxed"
                                style={{ backgroundColor: "#F2F3F5", border: "1px solid #D0D2D8", maxHeight: "320px", color: "#4B4A47" }}
                            >
                                {policyTab === "privacy" && (
                                    <>
                                        <p>
                                            FaithShield Care ("we", "us", or "our") is committed to protecting your personal information. This Privacy
                                            Policy explains how we collect, use, and safeguard the data you provide when registering as a member.
                                        </p>
                                        <p>
                                            <strong style={{ color: "#1B2D6B" }}>Information We Collect</strong>
                                            <br />
                                            We collect your name, email address, mobile number, birth date, civil status, location, referral code, and
                                            beneficiary details. Proof of payment that you send us for verification is handled separately and is not
                                            stored in your online account.
                                        </p>
                                        <p>
                                            <strong style={{ color: "#1B2D6B" }}>How We Use Your Information</strong>
                                            <br />
                                            Your data is used to process your membership application, verify identity, manage your account, facilitate
                                            referral rewards, and communicate important updates.
                                        </p>
                                        <p>
                                            <strong style={{ color: "#1B2D6B" }}>Data Sharing</strong>
                                            <br />
                                            We do not sell or rent your personal data. Information may be shared only with service providers necessary
                                            to operate our platform, or as required by law.
                                        </p>
                                        <p>
                                            <strong style={{ color: "#1B2D6B" }}>Data Security</strong>
                                            <br />
                                            We use industry-standard security measures to protect your information. However, no online transmission is
                                            100% secure and we cannot guarantee absolute security.
                                        </p>
                                        <p>
                                            <strong style={{ color: "#1B2D6B" }}>Your Rights</strong>
                                            <br />
                                            You may request access to, correction of, or deletion of your personal data by contacting us at
                                            support@faithshieldcare.com.
                                        </p>
                                    </>
                                )}
                                {policyTab === "terms" && (
                                    <>
                                        <p>
                                            By registering for a FaithShield Care membership, you agree to be bound by these Terms &amp; Conditions.
                                            Please read them carefully before proceeding.
                                        </p>
                                        <p>
                                            <strong style={{ color: "#1B2D6B" }}>Eligibility</strong>
                                            <br />
                                            Membership is open to individuals 18 years of age or older. By registering, you confirm that all
                                            information provided is accurate and truthful.
                                        </p>
                                        <p>
                                            <strong style={{ color: "#1B2D6B" }}>Membership Plans</strong>
                                            <br />
                                            Each plan (Basic, Family, Premium) carries distinct benefits and referral structures. Plan details are
                                            subject to change with prior notice to members.
                                        </p>
                                        <p>
                                            <strong style={{ color: "#1B2D6B" }}>Referral Program</strong>
                                            <br />
                                            Referral commissions are credited upon successful activation of referred members. FaithShield Care
                                            reserves the right to adjust commission rates with reasonable notice.
                                        </p>
                                        <p>
                                            <strong style={{ color: "#1B2D6B" }}>Account Responsibility</strong>
                                            <br />
                                            You are responsible for maintaining the confidentiality of your account credentials. FaithShield Care is
                                            not liable for unauthorized access resulting from your failure to secure your account.
                                        </p>
                                        <p>
                                            <strong style={{ color: "#1B2D6B" }}>Termination</strong>
                                            <br />
                                            FaithShield Care reserves the right to suspend or terminate any account found to be in violation of these
                                            Terms or engaged in fraudulent activity.
                                        </p>
                                        <p>
                                            <strong style={{ color: "#1B2D6B" }}>Governing Law</strong>
                                            <br />
                                            These Terms are governed by the laws of the Republic of the Philippines.
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                                <button
                                    type="button"
                                    onClick={() => navigate("/")}
                                    className="flex-1 rounded-xl border py-3 text-sm font-medium transition-colors"
                                    style={{ borderColor: "#D0D2D8", color: "#6B6862", backgroundColor: "#F2F3F5" }}
                                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#D0D2D8")}
                                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#F2F3F5")}
                                >
                                    I Disagree — Go Back
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConsented(true)}
                                    className="flex-1 rounded-xl py-3 text-sm font-medium text-white transition-colors"
                                    style={{ backgroundColor: "#C9922A" }}
                                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#A87820")}
                                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#C9922A")}
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
                                <div className="absolute right-0 left-0 h-px" style={{ backgroundColor: "#D0D2D8", top: "50%" }} />
                                {STEPS.map((_label, i) => {
                                    const s = i + 1;
                                    const active = s === step;
                                    const done = s < step;
                                    return (
                                        <div
                                            key={s}
                                            className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors"
                                            style={{
                                                backgroundColor: done || active ? "#1B2D6B" : "#D0D2D8",
                                                color: done || active ? "#fff" : "#6B6862",
                                            }}
                                        >
                                            {done ? "✓" : s}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ── Card ── */}
                            <div className="rounded-3xl p-8" style={{ backgroundColor: "#fff", border: "1px solid #D0D2D8" }}>
                                {error && (
                                    <div className="mb-4 rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "#FEE2E2", color: "#C41E1E" }}>
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* ════ STEP 1 — Package ════ */}
                                    {step === 1 && (
                                        <div>
                                            <h2 className="font-display mb-6 text-2xl" style={{ color: "#1B2D6B" }}>
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
                                    )}

                                    {/* ════ STEP 2 — Personal info (Enhanced) ════ */}
                                    {step === 2 && (
                                        <div>
                                            <h2 className="font-display mb-6 text-2xl" style={{ color: "#1B2D6B" }}>
                                                Step 2 · Your Information
                                            </h2>
                                            <div className="space-y-4">
                                                {/* Full Name Section */}
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <label className={labelCls}>
                                                            First name <span style={{ color: "#C41E1E" }}>*</span>
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
                                                            Last name <span style={{ color: "#C41E1E" }}>*</span>
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
                                                        <label className={labelCls}>Middle name</label>
                                                        <input
                                                            value={form.middleName}
                                                            placeholder="Santos"
                                                            className={inputCls}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, middleName: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className={labelCls}>Suffix</label>
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
                                                <div>
                                                    <div className="grid gap-4 sm:grid-cols-2">
                                                        <div>
                                                            <label className={labelCls}>
                                                                Email <span style={{ color: "#C41E1E" }}>*</span>
                                                            </label>
                                                            <input
                                                                required
                                                                type="email"
                                                                value={form.email}
                                                                placeholder="juandelacruz@example.com"
                                                                className={`${fieldCls("email")}${emailMismatch ? "!border-[#C41E1E]" : ""}`}
                                                                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className={labelCls}>
                                                                Confirm Email <span style={{ color: "#C41E1E" }}>*</span>
                                                            </label>
                                                            <input
                                                                required
                                                                type="email"
                                                                value={form.confirmEmail}
                                                                placeholder="juandelacruz@example.com"
                                                                className={`${fieldCls("confirmEmail")}${emailMismatch ? "!border-[#C41E1E]" : ""}`}
                                                                onChange={(e) => setForm((prev) => ({ ...prev, confirmEmail: e.target.value }))}
                                                                onBlur={() => markTouched("confirmEmail")}
                                                            />
                                                        </div>
                                                    </div>
                                                    {/* Reserved-height slot keeps the layout from shifting */}
                                                    <p className="mt-1 min-h-[1rem] text-xs" style={{ color: "#C41E1E" }}>
                                                        {emailMismatch ? "Emails do not match" : ""}
                                                    </p>
                                                </div>

                                                {/* Mobile & Birth date */}
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <label className={labelCls}>
                                                            Mobile number <span style={{ color: "#C41E1E" }}>*</span>
                                                        </label>
                                                        <div
                                                            className={`mt-1 flex items-stretch overflow-hidden rounded-xl border bg-white transition focus-within:ring-2 focus-within:ring-[#C9922A] ${
                                                                isInvalid("mobile") ? "border-[#C41E1E]" : "border-[#D0D2D8]"
                                                            }`}
                                                        >
                                                            <span className="flex items-center gap-1 border-r border-[#D0D2D8] bg-[#F2F3F5] px-3 text-sm font-medium text-[#1B2D6B] select-none">
                                                                +63
                                                            </span>
                                                            <input
                                                                required
                                                                type="tel"
                                                                inputMode="numeric"
                                                                value={formatPHMobile(form.mobile)}
                                                                placeholder="9XX XXX XXXX"
                                                                className="w-full bg-transparent px-4 py-3 text-[#1B2D6B] placeholder-[#6B6862] focus:outline-none"
                                                                onChange={(e) => handleMobileChange(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className={labelCls}>
                                                            Birth Date <span style={{ color: "#C41E1E" }}>*</span>
                                                        </label>
                                                        {(() => {
                                                            const selCls = `w-full px-2 py-3 rounded-xl border bg-white text-[#1B2D6B] focus:outline-none focus:ring-2 focus:ring-[#C9922A] transition ${
                                                                isInvalid("birthDate") ? "border-[#C41E1E]" : "border-[#D0D2D8]"
                                                            }`;
                                                            return (
                                                                <div className="mt-1 grid grid-cols-12 gap-2">
                                                                    <select
                                                                        required
                                                                        value={birth.m}
                                                                        className={`${selCls} col-span-5`}
                                                                        onChange={(e) => setBirth((p) => ({ ...p, m: e.target.value }))}
                                                                    >
                                                                        <option value="">Month</option>
                                                                        {MONTHS.map((name, i) => (
                                                                            <option key={name} value={String(i + 1).padStart(2, "0")}>
                                                                                {name}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    <select
                                                                        required
                                                                        value={birth.d}
                                                                        className={`${selCls} col-span-3`}
                                                                        onChange={(e) => setBirth((p) => ({ ...p, d: e.target.value }))}
                                                                    >
                                                                        <option value="">Day</option>
                                                                        {birthDays.map((d) => (
                                                                            <option key={d} value={String(d).padStart(2, "0")}>
                                                                                {d}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    <select
                                                                        required
                                                                        value={birth.y}
                                                                        className={`${selCls} col-span-4`}
                                                                        onChange={(e) => setBirth((p) => ({ ...p, y: e.target.value }))}
                                                                    >
                                                                        <option value="">Year</option>
                                                                        {birthYears.map((y) => (
                                                                            <option key={y} value={String(y)}>
                                                                                {y}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            );
                                                        })()}
                                                        <p className="mt-1 text-xs" style={{ color: "#6B6862" }}>
                                                            Must be 18 years or older
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Password Section */}
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <div className="flex items-center justify-between gap-3">
                                                            <label className={labelCls}>
                                                                Password <span style={{ color: "#C41E1E" }}>*</span>
                                                            </label>
                                                            {/* Strength bar inline with the label */}
                                                            <div className="flex h-1 w-6/10 shrink-0 gap-1">
                                                                {[1, 2, 3, 4].map((seg) => (
                                                                    <div
                                                                        key={seg}
                                                                        className="h-1 flex-1 rounded-full transition-colors duration-300"
                                                                        style={{
                                                                            backgroundColor:
                                                                                form.password.length > 0 && pwStrength.score >= seg
                                                                                    ? pwStrength.color
                                                                                    : "#D0D2D8",
                                                                        }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
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
                                                                className="absolute inset-y-0 right-3 flex items-center text-[#6B6862] transition-colors hover:text-[#1B2D6B]"
                                                                tabIndex={-1}
                                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                                            >
                                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center justify-between gap-3">
                                                            <label className={labelCls}>
                                                                Confirm password <span style={{ color: "#C41E1E" }}>*</span>
                                                            </label>
                                                            {/* Mismatch message inline with the label */}
                                                            <span className="text-xs" style={{ color: "#C41E1E" }}>
                                                                {passwordMismatch ? "Passwords do not match" : ""}
                                                            </span>
                                                        </div>
                                                        <div className="relative">
                                                            <input
                                                                required
                                                                type={showConfirmPassword ? "text" : "password"}
                                                                value={form.confirmPassword}
                                                                className={`${fieldCls("confirmPassword")}${passwordMismatch ? "!border-[#C41E1E]" : ""}`}
                                                                style={{ paddingRight: "2.75rem" }}
                                                                onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                                                onBlur={() => markTouched("confirmPassword")}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowConfirmPassword((v) => !v)}
                                                                className="absolute inset-y-0 right-3 flex items-center text-[#6B6862] transition-colors hover:text-[#1B2D6B]"
                                                                tabIndex={-1}
                                                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                                            >
                                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Gender & Civil Status */}
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <label className={labelCls}>
                                                            Gender <span style={{ color: "#C41E1E" }}>*</span>
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
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className={labelCls}>
                                                            Civil status <span style={{ color: "#C41E1E" }}>*</span>
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

                                                {/* Address Information — cascading PH dropdowns */}
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <label className={labelCls}>Country</label>
                                                        <input
                                                            value={form.country}
                                                            readOnly
                                                            disabled
                                                            className={`${inputCls} cursor-not-allowed opacity-70`}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className={labelCls}>
                                                            Province <span style={{ color: "#C41E1E" }}>*</span>
                                                        </label>
                                                        <select
                                                            required
                                                            value={form.provinceCode}
                                                            className={fieldCls("province")}
                                                            onChange={(e) => handleProvinceChange(e.target.value)}
                                                        >
                                                            <option value="">Select province…</option>
                                                            {provinces.map((p) => (
                                                                <option key={p.province_code} value={p.province_code}>
                                                                    {p.province_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <label className={labelCls}>
                                                            City / Municipality <span style={{ color: "#B91C1C" }}>*</span>
                                                        </label>
                                                        <select
                                                            required
                                                            disabled={!form.provinceCode}
                                                            value={form.cityCode}
                                                            className={fieldCls("city")}
                                                            onChange={(e) => handleCityChange(e.target.value)}
                                                        >
                                                            <option value="">
                                                                {form.provinceCode ? "Select city / municipality…" : "Select a province first"}
                                                            </option>
                                                            {citiesByProvince(form.provinceCode).map((c) => (
                                                                <option key={c.city_code} value={c.city_code}>
                                                                    {c.city_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className={labelCls}>
                                                            Barangay <span style={{ color: "#B91C1C" }}>*</span>
                                                        </label>
                                                        <select
                                                            required
                                                            disabled={!form.cityCode || loadingBarangays}
                                                            value={form.barangay}
                                                            className={fieldCls("barangay")}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, barangay: e.target.value }))}
                                                        >
                                                            <option value="">
                                                                {!form.cityCode
                                                                    ? "Select a city first"
                                                                    : loadingBarangays
                                                                      ? "Loading…"
                                                                      : "Select barangay…"}
                                                            </option>
                                                            {barangayOptions.map((b) => (
                                                                <option key={b.brgy_code} value={b.brgy_name}>
                                                                    {b.brgy_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className={labelCls}>
                                                        Street address <span style={{ color: "#B91C1C" }}>*</span>
                                                    </label>
                                                    <input
                                                        required
                                                        maxLength={100}
                                                        value={form.streetAddress}
                                                        placeholder="House no., street, subdivision"
                                                        className={fieldCls("streetAddress")}
                                                        onChange={(e) => setForm((prev) => ({ ...prev, streetAddress: e.target.value }))}
                                                    />
                                                    <p className="mt-1 text-xs" style={{ color: "#6B6862" }}>
                                                        {form.streetAddress.length}/100 characters
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ════ STEP 3 — Sponsor & Beneficiaries ════ */}
                                    {step === 3 && (
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
                                                        onChange={(e) => {
                                                            setRefCode(e.target.value);
                                                            setForm((prev) => ({ ...prev, referralCode: e.target.value }));
                                                        }}
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
                                    )}

                                    {/* ════ STEP 4 — Payment ════ */}
                                    {step === 4 && (
                                        <div>
                                            <h2 className="font-display mb-2 text-2xl" style={{ color: "#1B2D6B" }}>
                                                Step 4 · Payment
                                            </h2>
                                            <p className="mb-6 text-sm" style={{ color: "#6B6862" }}>
                                                Send your payment to one of the accounts below. After paying, send your receipt to us so we can verify
                                                it and activate your account.
                                            </p>

                                            <div
                                                className="mb-6 flex items-center justify-between rounded-2xl px-5 py-4"
                                                style={{ backgroundColor: "#F2F3F5", border: "1px solid #D0D2D8" }}
                                            >
                                                <div>
                                                    <p className="text-xs tracking-wider uppercase" style={{ color: "#6B6862" }}>
                                                        Amount Due
                                                    </p>
                                                    <p className="font-display text-2xl font-semibold" style={{ color: "#1B2D6B" }}>
                                                        ₱{selectedPlan.price.toLocaleString("en-PH")}
                                                    </p>
                                                </div>
                                                <span
                                                    className="rounded-full px-3 py-1 text-xs font-medium text-white"
                                                    style={{ backgroundColor: "#C9922A" }}
                                                >
                                                    {selectedPlan.name} Care
                                                </span>
                                            </div>

                                            {/* Payment method selector */}
                                            <div className="mb-4 flex gap-2">
                                                {PAYMENT_INFO.accounts.map((acct) => {
                                                    const active = selectedPaymentMethod === acct.label;
                                                    return (
                                                        <button
                                                            key={acct.label}
                                                            type="button"
                                                            onClick={() => setSelectedPaymentMethod(acct.label)}
                                                            className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors"
                                                            style={{
                                                                backgroundColor: active ? "#1B2D6B" : "#F2F3F5",
                                                                color: active ? "#fff" : "#6B6862",
                                                                border: `1px solid ${active ? "#1B2D6B" : "#D0D2D8"}`,
                                                            }}
                                                        >
                                                            {acct.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Selected payment method card */}
                                            {PAYMENT_INFO.accounts
                                                .filter((a) => a.label === selectedPaymentMethod)
                                                .map((acct) => (
                                                    <div
                                                        key={acct.label}
                                                        className="mb-6 flex flex-col items-center rounded-2xl p-6"
                                                        style={{ border: "1px solid #D0D2D8", backgroundColor: "#fff" }}
                                                    >
                                                        {acct.qr ? (
                                                            <img
                                                                src={acct.qr}
                                                                alt={`${acct.label} QR code`}
                                                                className="aspect-square w-full max-w-[16rem] rounded-xl object-contain"
                                                                style={{ border: "1px solid #D0D2D8" }}
                                                            />
                                                        ) : (
                                                            <div
                                                                className="flex aspect-square w-full max-w-[16rem] items-center justify-center rounded-xl text-xs"
                                                                style={{ backgroundColor: "#F3F4F6", color: "#9CA3AF", border: "2px dashed #D1D5DB" }}
                                                            >
                                                                QR placeholder
                                                            </div>
                                                        )}
                                                        <p className="mt-3 text-xs" style={{ color: "#6B6862" }}>
                                                            Account name:{" "}
                                                            <span className="font-medium" style={{ color: "#1B2D6B" }}>
                                                                {acct.accountName}
                                                            </span>
                                                        </p>
                                                        <p className="text-xs" style={{ color: "#6B6862" }}>
                                                            Number:{" "}
                                                            <span className="font-medium" style={{ color: "#1B2D6B" }}>
                                                                {acct.number}
                                                            </span>
                                                        </p>
                                                    </div>
                                                ))}

                                            {/* Offline proof-of-payment: members send their receipt to us for
                                                manual verification. (File upload returns after the Blaze upgrade.) */}
                                            <div className="rounded-2xl p-5" style={{ backgroundColor: "#F2F3F5", border: "1px solid #D0D2D8" }}>
                                                <p className="text-sm font-semibold" style={{ color: "#1B2D6B" }}>
                                                    After paying, send your proof of payment
                                                </p>
                                                <p className="mt-1 text-xs" style={{ color: "#6B6862" }}>
                                                    Take a screenshot or photo of your transaction receipt and send it to us, including your full
                                                    name, so we can match your payment and activate your account:
                                                </p>
                                                <ul className="mt-3 space-y-1 text-sm" style={{ color: "#1B2D6B" }}>
                                                    {PAYMENT_INFO.receiptContacts.map((c) => (
                                                        <li key={c.label}>
                                                            {c.label}:{" "}
                                                            {c.href ? (
                                                                <a
                                                                    href={c.href}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="font-medium underline"
                                                                    style={{ color: "#C9922A" }}
                                                                >
                                                                    {c.value}
                                                                </a>
                                                            ) : (
                                                                <span className="font-medium">{c.value}</span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                                {/* TODO(backend */}
                                                <div className="mt-4">
                                                    <label className={labelCls}>
                                                        Reference number <span style={{ color: "#C41E1E" }}>*</span>
                                                    </label>
                                                    <input
                                                        required
                                                        type="text"
                                                        inputMode="numeric"
                                                        placeholder="e.g. 1234 5678 9012"
                                                        className={fieldCls("referenceNumber")}
                                                        value={form.referenceNumber}
                                                        onChange={(e) => setForm((prev) => ({ ...prev, referenceNumber: e.target.value }))}
                                                    />
                                                    <p className="mt-1 text-xs" style={{ color: "#6B6862" }}>
                                                        Enter the reference number shown on your transaction receipt.
                                                    </p>
                                                </div>

                                                <div className="mt-4">
                                                    <label className={labelCls}>
                                                        Receipt screenshot{" "}
                                                        <span className="normal-case" style={{ color: "#6B6862" }}>
                                                            (optional, speeds up verification)
                                                        </span>
                                                    </label>
                                                    <div className="mt-1">
                                                        <ReceiptUploadField file={receiptFile} onChange={setReceiptFile} />
                                                    </div>
                                                </div>

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
                                            <h2 className="font-display mb-6 text-2xl" style={{ color: "#1B2D6B" }}>
                                                Step 5 · Review &amp; register
                                            </h2>

                                            <p className="mb-2 text-xs tracking-wider uppercase" style={{ color: "#6B6862" }}>
                                                Membership Package
                                            </p>
                                            <div className="mb-5 space-y-2">
                                                <div
                                                    className="flex justify-between rounded-xl px-4 py-3 text-sm"
                                                    style={{ backgroundColor: "#F2F3F5" }}
                                                >
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
                                                        value: form.civilStatus
                                                            ? form.civilStatus.charAt(0).toUpperCase() + form.civilStatus.slice(1)
                                                            : "—",
                                                    },
                                                    { label: "Street Address", value: form.streetAddress || "—" },
                                                    { label: "Barangay", value: form.barangay || "—" },
                                                    { label: "City", value: form.city || "—" },
                                                    { label: "Province", value: form.province || "—" },
                                                    { label: "Country", value: form.country || "—" },
                                                ].map(({ label, value }) => (
                                                    <div
                                                        key={label}
                                                        className="flex justify-between rounded-xl px-4 py-3 text-sm"
                                                        style={{ backgroundColor: "#F2F3F5" }}
                                                    >
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
                                                <div
                                                    className="flex justify-between rounded-xl px-4 py-3 text-sm"
                                                    style={{ backgroundColor: "#F2F3F5" }}
                                                >
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
                                                <div
                                                    className="flex justify-between rounded-xl px-4 py-3 text-sm"
                                                    style={{ backgroundColor: "#F2F3F5" }}
                                                >
                                                    <span style={{ color: "#6B6862" }}>Amount due</span>
                                                    <span className="font-medium" style={{ color: "#1B2D6B" }}>
                                                        ₱{selectedPlan.price.toLocaleString("en-PH")} · {selectedPlan.name} Care
                                                    </span>
                                                </div>
                                                <div
                                                    className="rounded-xl px-4 py-3 text-xs"
                                                    style={{ backgroundColor: "#F2F3F5", color: "#6B6862" }}
                                                >
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
                                                            <div
                                                                key={i}
                                                                className="rounded-xl px-4 py-3 text-sm"
                                                                style={{ backgroundColor: "#F2F3F5" }}
                                                            >
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
                                                disabled={loading || step !== totalSteps}
                                                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-white hover:bg-[#A87820] disabled:cursor-not-allowed disabled:opacity-60"
                                                style={{ backgroundColor: "#C9922A" }}
                                            >
                                                {loading ? (
                                                    <>
                                                        <svg
                                                            className="h-4 w-4 animate-spin text-white"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                            />
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
                                    <div className="flex justify-between pt-4" style={{ borderTop: "1px solid #D0D2D8" }}>
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
                                                disabled={checking}
                                                className="flex items-center gap-2 rounded-full px-6 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                                                style={{ backgroundColor: "#1B2D6B" }}
                                                onMouseOver={(e) => !checking && (e.currentTarget.style.backgroundColor = "#C9922A")}
                                                onMouseOut={(e) => !checking && (e.currentTarget.style.backgroundColor = "#1B2D6B")}
                                            >
                                                {checking ? (
                                                    <>
                                                        <svg
                                                            className="h-4 w-4 animate-spin text-white"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                            />
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                                                            />
                                                        </svg>
                                                        Checking…
                                                    </>
                                                ) : (
                                                    <>
                                                        Continue <ChevronRight size={16} />
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>

                            {/* ── Footer link ── */}
                            <p className="pt-5 text-center text-xs" style={{ color: "#6B6862" }}>
                                Already have an account?{" "}
                                <Link to="/signin" className="font-medium hover:underline" style={{ color: "#C9922A" }}>
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
