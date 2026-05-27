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
            navigate("/");
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

                <div className="bg-white rounded-3xl p-8 border space-y-4">
                    <div>
                        <label className="text-xs uppercase tracking-wider">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            className="w-full mt-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                        />
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wider">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder=""
                            className="w-full mt-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                        />
                        <button
                            type="button"
                            className="text-xs mt-2 hover:underline"
                        >
                            Forgot password?
                        </button>

                        <Button variant="outline" className="w-full mt-4">
                            Login
                        </Button>
                    </div>
                    <Button className="w-full">Sign in</Button>
                    <div className="text-center text-xs pt-2">
                        New here?{" "}
                        <Link to="/signup" className="hover:underline">
                            Create an account
                        </Link>
                    </div>
                </form>

                {/* Optional demo hint – purely visual */}
                <div className="mt-6 p-4 rounded-xl text-xs text-center">
                    <span className="font-medium">Demo credentials:</span> any
                    email / any password
                </div>
            </div>

            {/* Custom global styles to enhance existing elements without changing any variables */}
            <style>{`
                /* Enhance existing input styles without changing class names */
                .peer:focus {
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
                    border-radius: 0.375rem;
                }
                
                /* Smooth transitions for buttons */
                button {
                    transition: all 0.2s ease;
                }
                
                button:active {
                    transform: scale(0.98);
                }
                
                /* Card inner elements spacing improvement */
                .bg-white\\/80 .space-y-5 > :not([hidden]) ~ :not([hidden]) {
                    margin-top: 1.25rem;
                }
                
                /* Make demo credentials box more readable */
                .mt-8 p-4 {
                    backdrop-filter: blur(8px);
                }
                
                /* Improve button hover effects (globally, not changing variables) */
                .rounded-xl.border {
                    transition: all 0.2s;
                }
                
                .rounded-xl.border:hover {
                    border-color: #c7d2fe;
                }
                
                /* Subtle animation for logo hover */
                .transform.transition-all.duration-500:hover {
                    filter: drop-shadow(0 10px 8px rgb(0 0 0 / 0.04));
                }
            `}</style>
        </div>
    );
}