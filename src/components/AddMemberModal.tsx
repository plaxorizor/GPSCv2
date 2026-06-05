import { useState } from "react";
import { X, UserPlus, CheckCircle, Copy, Check, AlertTriangle } from "lucide-react";
import { adminCreateMember, type EncodeMemberResult } from "../firebase/adminCreateMember";
import { useAdmin } from "../hooks/useAdmin";

interface Props {
    onClose: () => void;
    onSuccess: () => void; // refresh the members list
}

const PACKAGES = [
    { value: "basic", label: "Basic Care" },
    { value: "family", label: "Family Care" },
    { value: "premium", label: "Premium Care" },
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
        mobile: "",
        birthDate: "",
        gender: "",
        civilStatus: "",
        streetAddress: "",
        barangay: "",
        city: "",
        province: "",
        referralCode: "",
    });
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

        setInvalidFields(new Set());
        setError("");
        setLoading(true);
        try {
            const res = await adminCreateMember({ ...form, isRoot });
            setResult(res);
            onSuccess(); // refresh list in the background
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "";
            if (msg === "REFERRAL_REQUIRED") {
                setError("A referral code is required (or tick 'Founder / root member').");
            } else if (msg === "INVALID_REFERRAL") {
                setError("That referral code doesn't exist. Check it and try again.");
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
                        <CheckCircle className="text-gpsc-green mx-auto mb-3" size={44} />
                        <h2 className="font-display text-gpsc-navy text-xl">Member added</h2>
                        <p className="text-gpsc-stone mt-1 text-sm">
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
                    <div className="border-gpsc-cream-dark space-y-3 rounded-xl border p-4">
                        <p className="text-gpsc-navy text-sm font-medium">Give these to the member privately:</p>
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

                    <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                        <span>
                            This password is shown <strong>once</strong>. Don't write it on the form. The member should change it on first login.
                            {result.usedSyntheticEmail &&
                                " They have no email on file, so they log in with the Login shown above and can only reset their password with your help."}
                        </span>
                    </div>

                    <button onClick={onClose} className="bg-gpsc-green mt-5 w-full rounded-xl py-3 text-sm font-medium text-white">
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
                <div className="border-gpsc-cream-dark sticky top-0 flex items-center justify-between border-b bg-white p-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-gpsc-navy/10 flex h-9 w-9 items-center justify-center rounded-xl">
                            <UserPlus className="text-gpsc-navy" size={18} />
                        </div>
                        <div>
                            <h2 className="font-display text-gpsc-navy font-semibold">Add / Encode Member</h2>
                            <p className="text-gpsc-stone text-xs">From a paper application — no password needed.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gpsc-stone hover:text-gpsc-navy rounded-lg p-1">
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
                            <input value={form.mobile} onChange={set("mobile")} className={inputCls("mobile")} placeholder="09XXXXXXXXX" />
                        </Field>
                        <Field label="Email (if any)">
                            <input type="email" value={form.email} onChange={set("email")} className="input" placeholder="optional" />
                        </Field>
                    </div>

                    {/* Personal */}
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Birth date">
                            <input type="date" value={form.birthDate} onChange={set("birthDate")} className="input" />
                        </Field>
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
                    <div className="border-gpsc-cream-dark rounded-xl border p-3">
                        <Field label="Referral code (the referrer's code)" required={!isRoot}>
                            <input
                                value={form.referralCode}
                                onChange={set("referralCode")}
                                className={inputCls("referralCode")}
                                placeholder={isRoot ? "Not needed for a founder" : "e.g. ABCD-EFGH-IJKL"}
                                disabled={isRoot}
                            />
                        </Field>
                        {isSuperAdmin && (
                            <label className="text-gpsc-stone mt-2 flex cursor-pointer items-center gap-2 text-xs">
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
                                    className="accent-gpsc-navy h-4 w-4"
                                />
                                Founder / root member (no referrer) — only for the very top of the tree
                            </label>
                        )}
                    </div>

                    {/* Address */}
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Street">
                            <input value={form.streetAddress} onChange={set("streetAddress")} className="input" />
                        </Field>
                        <Field label="Barangay">
                            <input value={form.barangay} onChange={set("barangay")} className="input" />
                        </Field>
                        <Field label="City">
                            <input value={form.city} onChange={set("city")} className="input" />
                        </Field>
                        <Field label="Province">
                            <input value={form.province} onChange={set("province")} className="input" />
                        </Field>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="border-gpsc-cream-dark flex-1 rounded-xl border py-3 text-sm font-medium transition-colors hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-gpsc-navy flex-1 rounded-xl py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50"
                        >
                            {loading ? "Creating…" : "Create Member"}
                        </button>
                    </div>
                </form>

                {/* Local input styling (matches the rest of the app) */}
                <style>{`
                    .input {
                        width: 100%;
                        border: 1px solid var(--color-gpsc-cream-dark, #e5ddc8);
                        border-radius: 0.75rem;
                        padding: 0.6rem 0.75rem;
                        font-size: 0.875rem;
                        outline: none;
                        background: white;
                    }
                    .input:focus { border-color: var(--color-gpsc-green, #4A8A2C); }
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
            <span className="text-gpsc-navy mb-1.5 block text-sm font-medium">
                {label} {required && <span className="text-red-500">*</span>}
            </span>
            {children}
        </label>
    );
}

function CredRow({ label, value, onCopy, copied, mono }: { label: string; value: string; onCopy: () => void; copied: boolean; mono?: boolean }) {
    return (
        <div>
            <div className="text-gpsc-stone text-xs">{label}</div>
            <div className="flex items-center justify-between gap-2">
                <span className={`text-gpsc-navy text-sm ${mono ? "font-mono" : ""}`}>{value}</span>
                <button onClick={onCopy} className="text-gpsc-stone hover:text-gpsc-navy shrink-0 transition-colors" title="Copy">
                    {copied ? <Check size={15} className="text-gpsc-green" /> : <Copy size={15} />}
                </button>
            </div>
        </div>
    );
}
