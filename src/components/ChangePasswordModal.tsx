import { useState } from "react";
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { X, Eye, EyeOff, CheckCircle } from "lucide-react";

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
        } catch (err: any) {
            if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
                setError("Current password is incorrect.");
            } else if (err.code === "auth/weak-password") {
                setError("New password is too weak. Use at least 6 characters.");
            } else if (err.code === "auth/too-many-requests") {
                setError("Too many attempts. Please wait a moment and try again.");
            } else {
                setError(err.message ?? "Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="font-display text-fsc-navy text-xl">
                            {forced ? "Set Your Password" : "Change Password"}
                        </h2>
                        {forced && (
                            <p className="text-fsc-stone mt-1 text-sm">
                                For your security, please replace the temporary password before continuing.
                            </p>
                        )}
                    </div>
                    {!forced && (
                        <button
                            onClick={onClose}
                            className="text-fsc-stone hover:text-fsc-navy transition-colors"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {success ? (
                    /* Success state */
                    <div className="py-6 text-center">
                        <CheckCircle size={48} className="text-fsc-green mx-auto mb-3" />
                        <p className="text-fsc-navy font-medium">Password changed successfully!</p>
                        <p className="text-fsc-stone mt-1 text-sm">Use your new password next time you log in.</p>
                        <button
                            onClick={onClose}
                            className="bg-fsc-green mt-6 rounded-xl px-8 py-2.5 text-sm font-medium text-white"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="rounded-xl bg-[#C41E1E]/5 px-4 py-3 text-sm text-[#C41E1E]">
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
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="border-fsc-cream-dark text-fsc-navy focus:ring-fsc-green w-full rounded-xl border bg-white px-4 py-3 pr-10 focus:outline-none focus:ring-2"
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
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="border-fsc-cream-dark text-fsc-navy focus:ring-fsc-green w-full rounded-xl border bg-white px-4 py-3 pr-10 focus:outline-none focus:ring-2"
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
                        </div>

                        {/* Confirm new password */}
                        <div>
                            <label className="text-fsc-stone text-xs uppercase tracking-wider">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="border-fsc-cream-dark text-fsc-navy focus:ring-fsc-green mt-1 w-full rounded-xl border bg-white px-4 py-3 focus:outline-none focus:ring-2"
                            />
                            {confirmPassword && newPassword !== confirmPassword && (
                                <p className="mt-1 text-xs text-[#C41E1E]">Passwords do not match</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            {!forced && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="border-fsc-cream-dark text-fsc-stone hover:bg-fsc-cream/40 flex-1 rounded-xl border py-3 text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading || (!!confirmPassword && newPassword !== confirmPassword)}
                                className="bg-fsc-green flex-1 rounded-xl py-3 text-sm font-medium text-white disabled:opacity-50"
                            >
                                {loading ? "Updating…" : "Update Password"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
