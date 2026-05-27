import { Link } from "react-router-dom";
import { Logo } from "../../components/ui/Logo";
import { loginUser } from "../../firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setError("");

        try {
            await loginUser(email, password);
            // Redirect to dashboard or home page after successful login
            navigate("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-linear-to-br from-slate-50 to-indigo-50/30">
            {/* Background pattern - purely visual */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-32 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-rose-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse delay-1000"></div>
            </div>

            <div className="max-w-md w-full mx-auto px-6 py-16 relative z-10">
                <div className="text-center mb-10 transform transition-all duration-500 hover:scale-105">
                    <Logo size={128} />
                </div>

                <div className="relative mb-6" data-twe-input-wrapper-init>
                    <input
                        type="text"
                        className="peer block min-h-auto w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[twe-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-white dark:placeholder:text-neutral-300 dark:autofill:shadow-autofill dark:peer-focus:text-primary [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0 "
                    />
                </div>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border space-y-4">
                    <div>
                        <label className="text-xs uppercase tracking-wider">Email</label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            className="w-full mt-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wider">Password</label>
                        <input
                            type="password"
                            placeholder=""
                            className="w-full mt-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button type="button" className="text-xs mt-2 hover:underline">
                            Forgot password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="bg-green-50 text-green-700 font-medium rounded-xl w-full py-3 hover:bg-green-100 transition-colors"
                    >
                        Sign In
                    </button>

                    <div className="text-center text-xs pt-2">
                        New here?{" "}
                        <Link to="/signup" className="hover:underline">
                            Create an account
                        </Link>
                    </div>
                </form>

                {/* Optional demo hint – purely visual */}
                <div className="mt-6 p-4 rounded-xl text-xs text-center">
                    <span className="font-medium">Demo credentials:</span> any email / any password
                </div>
            </div>
        </div>
    );
}
