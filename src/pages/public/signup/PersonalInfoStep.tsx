// signup/PersonalInfoStep.tsx — Step 2: name, contact, password, and the
// cascading PH address. Owns its purely-local UI state (password visibility,
// on-blur mismatch flags, barangay loading); the parent owns the form data and
// required-field validation.

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { provinces, citiesByProvince, barangaysByCity, type Barangay } from "../../../data/ph/phAddress";
import { inputCls, labelCls, formatPHMobile, type SignupForm, type SetSignupForm } from "./constants";

export interface BirthParts {
    y: string;
    m: string;
    d: string;
}

interface Props {
    form: SignupForm;
    setForm: SetSignupForm;
    birth: BirthParts;
    setBirth: React.Dispatch<React.SetStateAction<BirthParts>>;
    isInvalid: (key: string) => boolean;
    fieldCls: (key: string) => string;
}

// Birth-date dropdown option lists.
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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

export default function PersonalInfoStep({ form, setForm, birth, setBirth, isInvalid, fieldCls }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Fields the user has blurred at least once — used to validate on focus loss
    // (not while still typing).
    const [touched, setTouched] = useState<Set<string>>(new Set());
    const markTouched = (key: string) => setTouched((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));

    // Live, on-blur consistency messages (shown only after the field is touched).
    const emailMismatch = touched.has("confirmEmail") && !!form.confirmEmail && form.email !== form.confirmEmail;
    const passwordMismatch = touched.has("confirmPassword") && !!form.confirmPassword && form.password !== form.confirmPassword;

    const pwStrength = getPasswordStrength(form.password);

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

    return (
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
                                                form.password.length > 0 && pwStrength.score >= seg ? pwStrength.color : "#D0D2D8",
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
                        <input value={form.country} readOnly disabled className={`${inputCls} cursor-not-allowed opacity-70`} />
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
                            <option value="">{form.provinceCode ? "Select city / municipality…" : "Select a province first"}</option>
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
                                {!form.cityCode ? "Select a city first" : loadingBarangays ? "Loading…" : "Select barangay…"}
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
    );
}
