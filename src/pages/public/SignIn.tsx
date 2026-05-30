import { Link } from "react-router-dom";
import logoSrc from "../../components/ui/Logo.png";
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

    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [error, setError]       = useState("");

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

            <div
                className="gpsc-signin-root min-h-screen flex items-center justify-center py-12 px-6"
                style={{ backgroundColor: "#FAF6EE" }}
            >
                <div className="mx-auto w-full max-w-md">

                    {/* ── Back Button ── */}
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1 text-sm mb-6 hover:underline"
                        style={{ color: "#6B6862" }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M19 12H5" />
                            <path d="M12 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>

                    {/* ── Header ── */}
                    <div className="mb-10 text-center">
                        <div className="flex justify-center">
                            <Link to="/">
                             <img src={logoSrc} width={125} height={125} alt="Logo" />
                            </Link>
                        </div>
                        <h1 className="font-display mt-4 text-4xl" style={{ color: "#14365C" }}>
                            Welcome back
                        </h1>
                        <p className="mt-2 text-sm" style={{ color: "#6B6862" }}>
                            Sign in to your member dashboard
                        </p>
                    </div>

                    {/* ── Card ── */}
                    <div
                        className="rounded-3xl p-8 space-y-4"
                        style={{ backgroundColor: "#fff", border: "1px solid #E5DDC8" }}
                    >
                        {error && (
                            <div
                                className="px-4 py-3 rounded-xl text-sm"
                                style={{ backgroundColor: "#FEE2E2", color: "#B91C1C" }}
                            >
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
                                <input
                                    required
                                    type="password"
                                    className={inputCls}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="text-xs mt-2 hover:underline"
                                    style={{ color: "#4A8A2C" }}
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl font-medium text-white transition-colors"
                                style={{ backgroundColor: "#14365C" }}
                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#4A8A2C")}
                                onMouseOut={(e)  => (e.currentTarget.style.backgroundColor = "#14365C")}
                            >
                                Sign in
                            </button>
                        </form>

                        <div className="text-center text-xs pt-2" style={{ color: "#6B6862" }}>
                            New here?{" "}
                            <Link
                                to="/signup"
                                className="font-medium hover:underline"
                                style={{ color: "#4A8A2C" }}
                            >
                                Become a member
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}