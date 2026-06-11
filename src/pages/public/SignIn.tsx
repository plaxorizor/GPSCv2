import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import AuthShell, { authInputCls as inputCls, authLabelCls as labelCls } from "../../components/layout/AuthShell";

export default function SignIn() {
    const navigate = useNavigate();
    const auth = getAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                navigate("/");
            })
            .catch((err) => {
                setError(err.message);
            });
    }

    return (
        <AuthShell>
            {error && (
                <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "#FEE2E2", color: "#C41E1E" }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
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

                <div>
                    <label className={labelCls}>
                        Password <span style={{ color: "#C41E1E" }}>*</span>
                    </label>
                    <div className="relative">
                        <input
                            required
                            type={showPassword ? "text" : "password"}
                            className={`${inputCls} pr-12`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute top-1/2 right-4 -translate-y-1/2 text-[#6B6862] transition-colors hover:text-[#C9922A]"
                            style={{ marginTop: "2px" }}
                        >
                            {showPassword ? (
                                // Eye closed icon
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                            ) : (
                                // Eye open icon
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <Link to="/forgot-password" className="mt-2 inline-block text-xs hover:underline" style={{ color: "#C9922A" }}>
                        Forgot password?
                    </Link>
                </div>

                <button
                    type="submit"
                    className="w-full rounded-xl py-3 font-medium text-white transition-colors"
                    style={{ backgroundColor: "#1B2D6B" }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#C9922A")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1B2D6B")}
                >
                    Sign in
                </button>
            </form>

            <div className="pt-2 text-center text-xs" style={{ color: "#6B6862" }}>
                New here?{" "}
                <Link to="/signup" className="font-medium hover:underline" style={{ color: "#C9922A" }}>
                    Become a member
                </Link>
            </div>
        </AuthShell>
    );
}
