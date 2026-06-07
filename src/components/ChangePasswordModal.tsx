import { useState } from "react";
import { createPortal } from "react-dom";
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { X, Eye, EyeOff, CheckCircle, KeyRound, Check, AlertCircle } from "lucide-react";

// Client-side strength heuristic — purely for the meter/UI. The actual policy
// enforced on submit is unchanged (min 6 chars, must differ, must match).
const getStrength = (pw: string): number => {
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4);
};

const STRENGTH = [
    { label: "Too short", color: "#C41E1E", bar: "w-1/4" },
    { label: "Weak",      color: "#C41E1E", bar: "w-1/4" },
    { label: "Fair",      color: "#C9922A", bar: "w-2/4" },
    { label: "Good",      color: "#C9922A", bar: "w-3/4" },
    { label: "Strong",    color: "#5DAB3A", bar: "w-full" },
];

const Requirement: React.FC<{ met: boolean; children: React.ReactNode }> = ({ met, children }) => (
    <li className={`flex items-center gap-2 text-xs transition-colors ${met ? "text-fsc-green" : "text-fsc-stone"}`}>
        <span
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                met ? "border-fsc-green bg-fsc-green text-white" : "border-fsc-cream-dark text-transparent"
            }`}
        >
            <Check size={10} strokeWidth={3} />
        </span>
        {children}
    </li>
);

interface Props {
    onClose: () => void;
    // When true, the modal can't be dismissed until the password is changed
    // (used to force encoded members to set their own password on first login).
    forced?: boolean;
    // Called after the password is successfully changed (e.g. to clear the
    // mustChangePassword flag on the member doc).
    onChanged?: () => Promise<void> | void;
}

export default function ChangePasswordModal({ onClose, forced = false, onChanged }: Props) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters.");
            return;
        }
        if (newPassword === currentPassword) {
            setError("New password must be different from your current password.");
            return;
        }

        setLoading(true);
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user || !user.email) throw new Error("Not authenticated.");

            // Always re-authenticate before changing password
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            if (onChanged) await onChanged();
            setSuccess(true);
        } catch (err: unknown) {
            const code = (err as { code?: string })?.code;
            const message = (err as { message?: string })?.message;
            if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
                setError("Current password is incorrect.");
            } else if (code === "auth/weak-password") {
                setError("New password is too weak. Use at least 6 characters.");
            } else if (code === "auth/too-many-requests") {
                setError("Too many attempts. Please wait a moment and try again.");
            } else {
                setError(message ?? "Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const strength = getStrength(newPassword);
    const meetsLength = newPassword.length >= 6;
    const isDifferent = newPassword.length > 0 && newPassword !== currentPassword;
    const matches = confirmPassword.length > 0 && newPassword === confirmPassword;
    const canSubmit = meetsLength && isDifferent && matches && !loading;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="anim-fade-up w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* Header band */}
                <div className="relative flex items-center gap-4 border-b border-[#F0E8D8] bg-linear-to-b from-[#FBF3E4] to-white px-6 py-5">
                    <div className="bg-fsc-green flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm">
                        <KeyRound size={20} />
                    </div>
                    <div className="flex-1 pr-8">
                        <h2 className="font-display text-fsc-navy text-xl leading-tight">
                            {forced ? "Set Your Password" : "Change Password"}
                        </h2>
                        <p className="text-fsc-stone mt-0.5 text-sm leading-snug">
                            {forced
                                ? "For your security, replace the temporary password before continuing."
                                : "Use a strong password you don't reuse elsewhere."}
                        </p>
                    </div>
                    {!forced && (
                        <button
                            onClick={onClose}
                            className="text-fsc-stone hover:text-fsc-navy absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg border border-[#E6E1D4] bg-white/80 shadow-sm transition-colors hover:bg-white"
                            aria-label="Close"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="p-6">
                {success ? (
                    /* Success state */
                    <div className="py-6 text-center">
                        <div className="bg-fsc-green/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                            <CheckCircle size={32} className="text-fsc-green" />
                        </div>
                        <p className="font-display text-fsc-navy text-lg">Password changed</p>
                        <p className="text-fsc-stone mt-1 text-sm">Use your new password next time you log in.</p>
                        <button
                            onClick={onClose}
                            className="bg-fsc-green hover:bg-fsc-green-light mt-6 rounded-xl px-8 py-2.5 text-sm font-medium text-white transition-colors"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 rounded-xl border border-[#C41E1E]/15 bg-[#C41E1E]/5 px-4 py-3 text-sm text-[#C41E1E]">
                                <AlertCircle size={16} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Current password */}
                        <div>
                            <label className="text-fsc-stone text-xs uppercase tracking-wider">
                                Current Password
                            </label>
                            <div className="relative mt-1">
                                <input
                                    type={showCurrent ? "text" : "password"}
                                    required
                                    placeholder="Enter current password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="border-fsc-cream-dark text-fsc-navy focus:ring-fsc-green placeholder:text-fsc-stone/50 w-full rounded-xl border bg-[#F4F5F7] px-4 py-3 pr-10 transition-colors focus:bg-white focus:outline-none focus:ring-2"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent((v) => !v)}
                                    className="text-fsc-stone absolute inset-y-0 right-3 flex items-center"
                                    tabIndex={-1}
                                >
                                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* New password */}
                        <div>
                            <label className="text-fsc-stone text-xs uppercase tracking-wider">
                                New Password
                            </label>
                            <div className="relative mt-1">
                                <input
                                    type={showNew ? "text" : "password"}
                                    required
                                    placeholder="Create a new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="border-fsc-cream-dark text-fsc-navy focus:ring-fsc-green placeholder:text-fsc-stone/50 w-full rounded-xl border bg-[#F4F5F7] px-4 py-3 pr-10 transition-colors focus:bg-white focus:outline-none focus:ring-2"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew((v) => !v)}
                                    className="text-fsc-stone absolute inset-y-0 right-3 flex items-center"
                                    tabIndex={-1}
                                >
                                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {/* Strength meter */}
                            {newPassword && (
                                <div className="mt-2">
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                                        <div
                                            className={`h-full rounded-full transition-all duration-300 ${STRENGTH[strength].bar}`}
                                            style={{ backgroundColor: STRENGTH[strength].color }}
                                        />
                                    </div>
                                    <p className="mt-1 text-xs font-medium" style={{ color: STRENGTH[strength].color }}>
                                        {STRENGTH[strength].label}
                                    </p>
                                </div>
                            )}

                            {/* Requirements checklist */}
                            <ul className="mt-3 space-y-1.5">
                                <Requirement met={meetsLength}>At least 6 characters</Requirement>
                                <Requirement met={isDifferent}>Different from your current password</Requirement>
                            </ul>
                        </div>

                        {/* Confirm new password */}
                        <div>
                            <label className="text-fsc-stone text-xs uppercase tracking-wider">
                                Confirm New Password
                            </label>
                            <div className="relative mt-1">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    required
                                    placeholder="Re-enter new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="border-fsc-cream-dark text-fsc-navy focus:ring-fsc-green placeholder:text-fsc-stone/50 w-full rounded-xl border bg-[#F4F5F7] px-4 py-3 pr-10 transition-colors focus:bg-white focus:outline-none focus:ring-2"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm((v) => !v)}
                                    className="text-fsc-stone absolute inset-y-0 right-3 flex items-center"
                                    tabIndex={-1}
                                >
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {confirmPassword && newPassword !== confirmPassword && (
                                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#C41E1E]">
                                    <AlertCircle size={12} /> Passwords do not match
                                </p>
                            )}
                            {matches && (
                                <p className="text-fsc-green mt-1.5 flex items-center gap-1.5 text-xs">
                                    <CheckCircle size={12} /> Passwords match
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            {!forced && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="border-fsc-cream-dark text-fsc-stone flex-1 rounded-xl border py-3 text-sm transition-colors hover:bg-[#F4F5F7]"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="bg-fsc-green hover:bg-fsc-green-light flex-1 rounded-xl py-3 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF]"
                            >
                                {loading ? "Updating…" : "Update Password"}
                            </button>
                        </div>
                    </form>
                )}
                </div>
            </div>
        </div>,
        document.body
    );
}
