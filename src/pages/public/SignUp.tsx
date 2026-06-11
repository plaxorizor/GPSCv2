// pages/public/SignUp.tsx — the signup flow orchestrator. Owns the form state,
// per-step validation, and the final registration submit; the consent gate and
// the five step screens live in ./signup/.

import { getDoc, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { registerUser } from "../../firebase/auth";
import { uploadReceipt } from "../../firebase/receipts";
import { writePublicProfile } from "../../firebase/publicProfiles";
import { isMobileTaken, claimMobile } from "../../firebase/phoneRegistry";
import { db } from "../../firebase/config";
import logo from "../../components/ui/Logo.png";

import { css, plans, STEPS, PAYMENT_INFO, inputCls, type SignupForm } from "./signup/constants";
import { validateSignupStep } from "./signup/validation";
import ConsentGate from "./signup/ConsentGate";
import PackageStep from "./signup/PackageStep";
import PersonalInfoStep, { type BirthParts } from "./signup/PersonalInfoStep";
import SponsorBeneficiariesStep from "./signup/SponsorBeneficiariesStep";
import PaymentStep from "./signup/PaymentStep";
import ReviewStep from "./signup/ReviewStep";

// Turn a registration error into a friendly, non-technical message. The most
// common case is a duplicate email (Firebase Auth rejects it at sign-up).
function signupErrorMessage(err: unknown): string {
    const code = err instanceof FirebaseError ? err.code : "";
    switch (code) {
        case "auth/email-already-in-use":
            return "An account with this email already exists. Try signing in instead.";
        case "auth/invalid-email":
            return "That doesn't look like a valid email address.";
        case "auth/weak-password":
            return "Your password is too weak. Use at least 6 characters.";
        case "auth/network-request-failed":
            return "Network error. Check your connection and try again.";
        case "auth/too-many-requests":
            return "Too many attempts. Please wait a moment and try again.";
        default:
            return "Couldn't create your account. Please try again.";
    }
}

export default function SignUpLayout() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const [error, setError] = useState("");
    const [step, setStep] = useState(1);
    const totalSteps = 5;

    // Birth date split into Month / Day / Year dropdowns.
    const [birth, setBirth] = useState<BirthParts>({ y: "", m: "", d: "" });
    const [consented, setConsented] = useState(false);

    const [selectedPlan, setSelectedPlan] = useState(plans[0]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_INFO.accounts[0].label);
    // Optional payment-proof screenshot, uploaded to Storage on submit.
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [form, setForm] = useState<SignupForm>({
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
        referralCode: searchParams.get("ref") ?? "",
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
                if (b && String(b[sub as keyof typeof b] ?? "").trim()) next.delete(key);
            } else {
                const v = form[key as keyof SignupForm];
                if (typeof v === "string" ? v.trim() !== "" : Boolean(v)) next.delete(key);
            }
        }
        return next;
    }, [invalidFields, form]);
    const isInvalid = (key: string) => effectiveInvalidFields.has(key);
    const fieldCls = (key: string) => `${inputCls}${isInvalid(key) ? " !border-[#C41E1E]" : ""}`;

    // Derived from the three dropdowns — no effect needed.
    const birthDate = birth.y && birth.m && birth.d ? `${birth.y}-${birth.m}-${birth.d}` : "";

    const validateStep = async (): Promise<boolean> => {
        setError("");
        setInvalidFields(new Set());
        const result = await validateSignupStep(step, { form, birthDate, selectedPlan });
        if (result) {
            setInvalidFields(result.invalidFields);
            setError(result.error);
            return false;
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
            setError(signupErrorMessage(err));
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
                        <ConsentGate onAgree={() => setConsented(true)} onBack={() => navigate("/")} />
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
                                    {step === 1 && <PackageStep selectedPlan={selectedPlan} onSelect={setSelectedPlan} />}

                                    {step === 2 && (
                                        <PersonalInfoStep
                                            form={form}
                                            setForm={setForm}
                                            birth={birth}
                                            setBirth={setBirth}
                                            isInvalid={isInvalid}
                                            fieldCls={fieldCls}
                                        />
                                    )}

                                    {step === 3 && (
                                        <SponsorBeneficiariesStep
                                            form={form}
                                            setForm={setForm}
                                            selectedPlan={selectedPlan}
                                            fieldCls={fieldCls}
                                            onReferralCodeChange={(value) => setForm((prev) => ({ ...prev, referralCode: value }))}
                                        />
                                    )}

                                    {step === 4 && (
                                        <PaymentStep
                                            form={form}
                                            setForm={setForm}
                                            selectedPlan={selectedPlan}
                                            fieldCls={fieldCls}
                                            selectedPaymentMethod={selectedPaymentMethod}
                                            onSelectPaymentMethod={setSelectedPaymentMethod}
                                            receiptFile={receiptFile}
                                            onReceiptChange={setReceiptFile}
                                        />
                                    )}

                                    {step === 5 && (
                                        <ReviewStep
                                            form={form}
                                            birthDate={birthDate}
                                            selectedPlan={selectedPlan}
                                            loading={loading}
                                            isFinalStep={step === totalSteps}
                                        />
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
