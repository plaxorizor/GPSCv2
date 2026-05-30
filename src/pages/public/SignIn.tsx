import { Link } from "react-router-dom";
import { Logo } from "../../components/ui/Logo";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// ── Design tokens (mirrors pro.jsx GlobalStyles) ──────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=DM+Sans:wght@400;500;600;700&display=swap');
  .gpsc-signin-root { font-family: 'DM Sans', system-ui, sans-serif; }
  .gpsc-signin-root .font-display { font-family: 'Fraunces', Georgia, serif; }
`;

const inputCls =
    "w-full mt-1 px-4 py-3 rounded-xl border border-[#E5DDC8] bg-white text-[#14365C] placeholder-[#6B6862] focus:outline-none focus:ring-2 focus:ring-[#4A8A2C] transition";
const labelCls = "text-xs uppercase tracking-wider text-[#6B6862]";

export default function SignIn() {
    const navigate = useNavigate();
    const auth = getAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log(userCredential);
                navigate("/");
            })
            .catch((err) => {
                console.log(err);
                setError(err.message);
            });
    }

    return (
        <>
            <style>{css}</style>

            <div className="gpsc-signin-root flex min-h-screen items-center justify-center px-6 py-12" style={{ backgroundColor: "#FAF6EE" }}>
                <div className="mx-auto w-full max-w-md">
                    {/* ── Header ── */}
                    <div className="mb-10 text-center">
                        <Logo size={56} />
                        <h1 className="font-display mt-4 text-4xl" style={{ color: "#14365C" }}>
                            Welcome back
                        </h1>
                        <p className="mt-2 text-sm" style={{ color: "#6B6862" }}>
                            Sign in to your member dashboard
                        </p>
                    </div>

                    {/* ── Card ── */}
                    <div className="space-y-4 rounded-3xl p-8" style={{ backgroundColor: "#fff", border: "1px solid #E5DDC8" }}>
                        {error && (
                            <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "#FEE2E2", color: "#B91C1C" }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className={labelCls}>
                                    Email <span style={{ color: "#B91C1C" }}>*</span>
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
                                    Password <span style={{ color: "#B91C1C" }}>*</span>
                                </label>
                                <input required type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
                                <button type="button" className="mt-2 text-xs hover:underline" style={{ color: "#4A8A2C" }}>
                                    Forgot password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-xl py-3 font-medium text-white transition-colors"
                                style={{ backgroundColor: "#14365C" }}
                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#4A8A2C")}
                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#14365C")}
                            >
                                Sign in
                            </button>
                        </form>

                        <div className="pt-2 text-center text-xs" style={{ color: "#6B6862" }}>
                            New here?{" "}
                            <Link to="/signup" className="font-medium hover:underline" style={{ color: "#4A8A2C" }}>
                                Become a member
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
