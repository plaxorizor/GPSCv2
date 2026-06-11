import { Link } from "react-router-dom";
import { useState } from "react";
import { FirebaseError } from "firebase/app";
import { resetPassword } from "../../firebase/auth";
import AuthShell, { authInputCls as inputCls, authLabelCls as labelCls } from "../../components/layout/AuthShell";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (sending) return;
        setError("");
        setSending(true);
        try {
            await resetPassword(email.trim());
            setSent(true);
        } catch (err) {
            // Don't reveal whether an account exists (avoid account enumeration):
            // treat "user not found" as success. Surface only actionable errors.
            const code = err instanceof FirebaseError ? err.code : "";
            if (code === "auth/user-not-found") {
                setSent(true);
            } else if (code === "auth/invalid-email") {
                setError("That doesn't look like a valid email address.");
            } else if (code === "auth/too-many-requests") {
                setError("Too many attempts. Please wait a moment and try again.");
            } else {
                setError("Couldn't send the reset link. Please try again.");
            }
        } finally {
            setSending(false);
        }
    }

    return (
        <AuthShell>
            {sent ? (
                <div className="space-y-4 text-center">
                    <div
                        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
                        style={{ backgroundColor: "rgba(201,146,42,0.12)" }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#C9922A"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                        </svg>
                    </div>
                    <h1 className="font-display text-xl" style={{ color: "#1B2D6B" }}>
                        Check your email
                    </h1>
                    <p className="text-sm" style={{ color: "#6B6862" }}>
                        If an account exists for{" "}
                        <span className="font-medium" style={{ color: "#1B2D6B" }}>
                            {email.trim()}
                        </span>
                        , we've sent a link to reset your password. It may take a few minutes to arrive — remember to check your spam folder.
                    </p>
                    <Link
                        to="/signin"
                        className="inline-block w-full rounded-xl py-3 text-center font-medium text-white transition-colors"
                        style={{ backgroundColor: "#1B2D6B" }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#C9922A")}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1B2D6B")}
                    >
                        Back to sign in
                    </Link>
                </div>
            ) : (
                <>
                    <div className="text-center">
                        <h1 className="font-display text-xl" style={{ color: "#1B2D6B" }}>
                            Forgot your password?
                        </h1>
                        <p className="mt-1 text-sm" style={{ color: "#6B6862" }}>
                            Enter your email and we'll send you a link to reset it.
                        </p>
                    </div>

                    {error && (
                        <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "#FEE2E2", color: "#C41E1E" }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className={labelCls}>
                                Email <span style={{ color: "#C41E1E" }}>*</span>
                            </label>
                            <input
                                required
                                type="email"
                                placeholder="your@email.com"
                                className={inputCls}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full rounded-xl py-3 font-medium text-white transition-colors disabled:opacity-60"
                            style={{ backgroundColor: "#1B2D6B" }}
                            onMouseOver={(e) => !sending && (e.currentTarget.style.backgroundColor = "#C9922A")}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1B2D6B")}
                        >
                            {sending ? "Sending…" : "Send reset link"}
                        </button>
                    </form>

                    <div className="pt-2 text-center text-xs" style={{ color: "#6B6862" }}>
                        Remembered it?{" "}
                        <Link to="/signin" className="font-medium hover:underline" style={{ color: "#C9922A" }}>
                            Back to sign in
                        </Link>
                    </div>
                </>
            )}
        </AuthShell>
    );
}
