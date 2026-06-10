import { useEffect, useState } from "react";
import { X, UserPlus, CheckCircle, Copy, Check, AlertTriangle } from "lucide-react";
import { adminCreateMember, type EncodeMemberResult } from "../firebase/adminCreateMember";
import { useAdmin } from "../hooks/useAdmin";
import { provinces, citiesByProvince, barangaysByCity, type Barangay } from "../data/ph/phAddress";

interface Props {
    onClose: () => void;
    onSuccess: () => void; // refresh the members list
}

const PACKAGES = [
    { value: "basic", label: "Basic Care" },
    { value: "family", label: "Family Care" },
    { value: "premium", label: "Premium Care" },
];

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export default function AddMemberModal({ onClose, onSuccess }: Props) {
    const { isSuperAdmin } = useAdmin();
    const [form, setForm] = useState({
        package: "",
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        email: "",
        mobile: "", // local 10-digit part (the "+63" prefix is fixed in the UI)
        gender: "",
        civilStatus: "",
        streetAddress: "",
        barangay: "",
        city: "",
        cityCode: "",
        province: "",
        provinceCode: "",
        referralCode: "",
    });
    const [birth, setBirth] = useState({ y: "", m: "", d: "" });
    const [isRoot, setIsRoot] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<EncodeMemberResult | null>(null);
    const [copied, setCopied] = useState<"login" | "password" | null>(null);

    // Fields that failed validation on the last submit attempt — highlighted red,
    // cleared individually as the admin edits them.
    const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());

    const clearFieldError = (key: string) =>
        setInvalidFields((prev) => {
            if (!prev.has(key)) return prev;
            const next = new Set(prev);
            next.delete(key);
            return next;
        });

    const inputCls = (key: string) => `input ${invalidFields.has(key) ? "input-error" : ""}`;

    const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm((f) => ({ ...f, [key]: e.target.value }));
        clearFieldError(key);
    };

    // ── PH mobile: digits only, formatted "9XX XXX XXXX", capped at 10 ──
    const handleMobileChange = (raw: string) => {
        const digits = raw.replace(/\D/g, "").slice(0, 10);
        setForm((f) => ({ ...f, mobile: digits }));
        clearFieldError("mobile");
    };
    const formatPHMobile = (d: string) => [d.slice(0, 3), d.slice(3, 6), d.slice(6, 10)].filter(Boolean).join(" ");
    const isValidPHMobile = (m: string) => /^9\d{9}$/.test(m.replace(/\D/g, ""));

    // ── Birth date: Month / Day / Year dropdowns combined into YYYY-MM-DD ──
    const handleBirthChange = (part: "y" | "m" | "d", value: string) => {
        setBirth((p) => ({ ...p, [part]: value }));
        clearFieldError("birthDate");
    };
    const currentYear = new Date().getFullYear();
    const birthYears = Array.from({ length: 100 }, (_, i) => currentYear - 18 - i); // 18..117 yrs old
    const daysInMonth = birth.y && birth.m ? new Date(Number(birth.y), Number(birth.m), 0).getDate() : 31;
    const birthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const birthDate = birth.y && birth.m && birth.d ? `${birth.y}-${birth.m}-${birth.d}` : "";

    // ── Cascading address: Province → City → Barangay ──
    const handleProvinceChange = (provinceCode: string) => {
        const p = provinces.find((x) => x.province_code === provinceCode);
        setForm((f) => ({ ...f, provinceCode, province: p?.province_name ?? "", cityCode: "", city: "", barangay: "" }));
    };
    const handleCityChange = (cityCode: string) => {
        const c = citiesByProvince(form.provinceCode).find((x) => x.city_code === cityCode);
        setForm((f) => ({ ...f, cityCode, city: c?.city_name ?? "", barangay: "" }));
    };
    // Barangays lazy-loaded + tagged with their city (derived options, no sync setState).
    const [barangayData, setBarangayData] = useState<{ cityCode: string; list: Barangay[] }>({ cityCode: "", list: [] });
    useEffect(() => {
        if (!form.cityCode) return;
        let cancelled = false;
        barangaysByCity(form.cityCode).then((list) => {
            if (!cancelled) setBarangayData({ cityCode: form.cityCode, list });
        });
        return () => {
            cancelled = true;
        };
    }, [form.cityCode]);
    const barangayOptions = barangayData.cityCode === form.cityCode ? barangayData.list : [];
    const loadingBarangays = !!form.cityCode && barangayData.cityCode !== form.cityCode;

    const copy = (text: string, which: "login" | "password") => {
        navigator.clipboard.writeText(text);
        setCopied(which);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields; highlight any that are missing.
        const required = ["package", "firstName", "lastName", "mobile"];
        if (!isRoot) required.push("referralCode");
        const missing = required.filter((k) => !String(form[k as keyof typeof form] ?? "").trim());
        if (missing.length > 0) {
            setInvalidFields(new Set(missing));
            setError("Please fill in the required fields highlighted.");
            return;
        }
        if (!isValidPHMobile(form.mobile)) {
            setInvalidFields(new Set(["mobile"]));
            setError("Enter a valid PH mobile number (9XX XXX XXXX).");
            return;
        }

        setInvalidFields(new Set());
        setError("");
        setLoading(true);
        try {
            const res = await adminCreateMember({
                package: form.package,
                firstName: form.firstName,
                middleName: form.middleName,
                lastName: form.lastName,
                suffix: form.suffix,
                email: form.email,
                mobile: `+63${form.mobile}`,
                birthDate,
                gender: form.gender,
                civilStatus: form.civilStatus,
                streetAddress: form.streetAddress,
                barangay: form.barangay,
                city: form.city,
                province: form.province,
                country: "Philippines",
                referralCode: form.referralCode,
                isRoot,
            });
            setResult(res);
            onSuccess(); // refresh list in the background
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "";
            if (msg === "REFERRAL_REQUIRED") {
                setError("A referral code is required (or tick 'Founder / root member').");
            } else if (msg === "INVALID_REFERRAL") {
                setError("That referral code doesn't exist. Check it and try again.");
            } else if (msg === "MOBILE_TAKEN") {
                setError("This mobile number is already registered. Each person may only have one account.");
            } else if (msg.includes("email-already-in-use")) {
                setError("An account with this email / mobile already exists.");
            } else if (msg.includes("invalid-email")) {
                setError("The email address looks invalid.");
            } else {
                setError("Could not create the member. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Success / credential hand-off screen ──
    if (result) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                    <div className="mb-4 text-center">
                        <CheckCircle className="text-fsc-green mx-auto mb-3" size={44} />
                        <h2 className="font-display text-fsc-navy text-xl">Member added</h2>
                        <p className="text-fsc-stone mt-1 text-sm">
                            {form.firstName} {form.lastName}{" "}
                            {result.activated ? (
                                <>
                                    is now <strong>Active</strong> — their referral code is generated and any upline commissions have been paid.
                                </>
                            ) : (
                                <>
                                    was created but is still <strong>Pending</strong> (auto-activation failed). Activate them manually from the
                                    members list.
                                </>
                            )}
                        </p>
                    </div>

                    {/* Credentials */}
                    <div className="border-fsc-cream-dark space-y-3 rounded-xl border p-4">
                        <p className="text-fsc-navy text-sm font-medium">Give these to the member privately:</p>
                        <CredRow
                            label="Login"
                            value={result.loginEmail}
                            onCopy={() => copy(result.loginEmail, "login")}
                            copied={copied === "login"}
                        />
                        <CredRow
                            label="Temporary password"
                            value={result.tempPassword}
                            onCopy={() => copy(result.tempPassword, "password")}
                            copied={copied === "password"}
                            mono
                        />
                    </div>

                    <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#C9922A]/10 p-3 text-xs text-[#A87820]">
                        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                        <span>
                            This password is shown <strong>once</strong>. Don't write it on the form. The member should change it on first login.
                            {result.usedSyntheticEmail &&
                                " They have no email on file, so they log in with the Login shown above and can only reset their password with your help."}
                        </span>
                    </div>

                    <button onClick={onClose} className="bg-fsc-green mt-5 w-full rounded-xl py-3 text-sm font-medium text-white">
                        Done
                    </button>
                </div>
            </div>
        );
    }

    // ── Encode form ──
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
                {/* Header */}
                <div className="border-fsc-cream-dark sticky top-0 z-10 flex items-center justify-between border-b bg-white p-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-fsc-navy/10 flex h-9 w-9 items-center justify-center rounded-xl">
                            <UserPlus className="text-fsc-navy" size={18} />
                        </div>
                        <div>
                            <h2 className="font-display text-fsc-navy font-semibold">Add / Encode Member</h2>
                            <p className="text-fsc-stone text-xs">From a paper application — no password needed.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-fsc-stone hover:text-fsc-navy rounded-lg p-1">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    {/* Package */}
                    <Field label="Package" required>
                        <select value={form.package} onChange={set("package")} className={inputCls("package")}>
                            <option value="">Select package…</option>
                            {PACKAGES.map((p) => (
                                <option key={p.value} value={p.value}>
                                    {p.label}
                                </option>
                            ))}
                        </select>
                    </Field>

                    {/* Name */}
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="First name" required>
                            <input value={form.firstName} onChange={set("firstName")} className={inputCls("firstName")} />
                        </Field>
                        <Field label="Last name" required>
                            <input value={form.lastName} onChange={set("lastName")} className={inputCls("lastName")} />
                        </Field>
                        <Field label="Middle name">
                            <input value={form.middleName} onChange={set("middleName")} className="input" />
                        </Field>
                        <Field label="Suffix">
                            <input value={form.suffix} onChange={set("suffix")} className="input" placeholder="Jr., Sr." />
                        </Field>
                    </div>

                    {/* Contact */}
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Mobile" required>
                            <div
                                className={`flex items-stretch overflow-hidden rounded-xl border bg-white focus-within:border-fsc-green ${
                                    invalidFields.has("mobile") ? "border-[#ef4444] bg-[#fef2f2]" : "border-fsc-cream-dark"
                                }`}
                            >
                                <span className="bg-fsc-cream/50 text-fsc-navy flex select-none items-center gap-1 border-r border-[#e5ddc8] px-2.5 text-sm">
                                    +63
                                </span>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    value={formatPHMobile(form.mobile)}
                                    onChange={(e) => handleMobileChange(e.target.value)}
                                    placeholder="9XX XXX XXXX"
                                    className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
                                />
                            </div>
                        </Field>
                        <Field label="Email (if any)">
                            <input type="email" value={form.email} onChange={set("email")} className="input" placeholder="optional" />
                        </Field>
                    </div>

                    {/* Personal */}
                    <Field label="Birth date">
                        <div className="grid grid-cols-12 gap-2">
                            <select value={birth.m} onChange={(e) => handleBirthChange("m", e.target.value)} className="input col-span-5">
                                <option value="">Month</option>
                                {MONTHS.map((name, i) => (
                                    <option key={name} value={String(i + 1).padStart(2, "0")}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                            <select value={birth.d} onChange={(e) => handleBirthChange("d", e.target.value)} className="input col-span-3">
                                <option value="">Day</option>
                                {birthDays.map((d) => (
                                    <option key={d} value={String(d).padStart(2, "0")}>
                                        {d}
                                    </option>
                                ))}
                            </select>
                            <select value={birth.y} onChange={(e) => handleBirthChange("y", e.target.value)} className="input col-span-4">
                                <option value="">Year</option>
                                {birthYears.map((y) => (
                                    <option key={y} value={String(y)}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Gender">
                            <select value={form.gender} onChange={set("gender")} className="input">
                                <option value="">—</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </Field>
                        <Field label="Civil status">
                            <select value={form.civilStatus} onChange={set("civilStatus")} className="input">
                                <option value="">—</option>
                                <option value="single">Single</option>
                                <option value="married">Married</option>
                                <option value="widowed">Widowed</option>
                                <option value="separated">Separated</option>
                            </select>
                        </Field>
                    </div>

                    {/* Referral — required (golden rule), unless founder */}
                    <div className="border-fsc-cream-dark rounded-xl border p-3">
                        <Field label="Referral Code" required={!isRoot}>
                            <input
                                value={form.referralCode}
                                onChange={set("referralCode")}
                                className={inputCls("referralCode")}
                                placeholder={isRoot ? "Not needed for a founder" : "e.g. ABCD-EFGH-IJKL"}
                                disabled={isRoot}
                            />
                        </Field>
                        {isSuperAdmin && (
                            <label className="text-fsc-stone mt-2 flex cursor-pointer items-center gap-2 text-xs">
                                <input
                                    type="checkbox"
                                    checked={isRoot}
                                    onChange={(e) => {
                                        setIsRoot(e.target.checked);
                                        if (e.target.checked) {
                                            setForm((f) => ({ ...f, referralCode: "" }));
                                            clearFieldError("referralCode");
                                        }
                                    }}
                                    className="accent-fsc-navy h-4 w-4"
                                />
                                Founder / root member (no referrer) — only for the very top of the tree
                            </label>
                        )}
                    </div>

                    {/* Address — cascading PH dropdowns (Philippines only) */}
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Country">
                            <input value="Philippines" readOnly disabled className="input" />
                        </Field>
                        <Field label="Province">
                            <select value={form.provinceCode} onChange={(e) => handleProvinceChange(e.target.value)} className="input">
                                <option value="">Select province…</option>
                                {provinces.map((p) => (
                                    <option key={p.province_code} value={p.province_code}>
                                        {p.province_name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="City / Municipality">
                            <select
                                value={form.cityCode}
                                onChange={(e) => handleCityChange(e.target.value)}
                                disabled={!form.provinceCode}
                                className="input"
                            >
                                <option value="">{form.provinceCode ? "Select city…" : "Select a province first"}</option>
                                {citiesByProvince(form.provinceCode).map((c) => (
                                    <option key={c.city_code} value={c.city_code}>
                                        {c.city_name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Barangay">
                            <select
                                value={form.barangay}
                                onChange={set("barangay")}
                                disabled={!form.cityCode || loadingBarangays}
                                className="input"
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
                        </Field>
                        <Field label="Street address">
                            <input
                                value={form.streetAddress}
                                onChange={set("streetAddress")}
                                maxLength={100}
                                className="input"
                                placeholder="House no., street"
                            />
                        </Field>
                    </div>

                    {error && <p className="text-sm text-[#C41E1E]">{error}</p>}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="border-fsc-cream-dark flex-1 rounded-xl border py-3 text-sm font-medium transition-colors hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-fsc-navy flex-1 rounded-xl py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50"
                        >
                            {loading ? "Creating…" : "Create Member"}
                        </button>
                    </div>
                </form>

                {/* Local input styling (matches the rest of the app) */}
                <style>{`
                    .input {
                        width: 100%;
                        border: 1px solid var(--color-fsc-cream-dark, #e5ddc8);
                        border-radius: 0.75rem;
                        padding: 0.6rem 0.75rem;
                        font-size: 0.875rem;
                        outline: none;
                        background: white;
                    }
                    .input:focus { border-color: var(--color-fsc-green, #4A8A2C); }
                    .input:disabled { background: #f6f5f0; color: #9b968c; cursor: not-allowed; }
                    .input-error { border-color: #ef4444; background: #fef2f2; }
                    .input-error:focus { border-color: #ef4444; }
                `}</style>
            </div>
        </div>
    );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="text-fsc-navy mb-1.5 block text-sm font-medium">
                {label} {required && <span className="text-[#C41E1E]">*</span>}
            </span>
            {children}
        </label>
    );
}

function CredRow({ label, value, onCopy, copied, mono }: { label: string; value: string; onCopy: () => void; copied: boolean; mono?: boolean }) {
    return (
        <div>
            <div className="text-fsc-stone text-xs">{label}</div>
            <div className="flex items-center justify-between gap-2">
                <span className={`text-fsc-navy text-sm ${mono ? "font-mono" : ""}`}>{value}</span>
                <button onClick={onCopy} className="text-fsc-stone hover:text-fsc-navy shrink-0 transition-colors" title="Copy">
                    {copied ? <Check size={15} className="text-fsc-green" /> : <Copy size={15} />}
                </button>
            </div>
        </div>
    );
}
