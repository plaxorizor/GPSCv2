import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Logo } from "../../components/ui/Logo";

export default function SignInLayout() {
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

                {/* Preserved original input exactly as provided */}
                <div className="relative mb-6" data-twe-input-wrapper-init>
                    <input
                        type="text"
                        className="peer block min-h-auto w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-twe-input-state-active:placeholder:opacity-100 motion-reduce:transition-none dark:text-white dark:placeholder:text-neutral-300 dark:autofill:shadow-autofill dark:peer-focus:text-primary [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0 "
                    />
                </div>

                {/* Enhanced card with extra styling */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/40 shadow-2xl shadow-indigo-100/40 transition-all duration-300 hover:shadow-indigo-200/40">
                    <div className="space-y-5">
                        {/* Email field with icon wrapper */}
                        <div className="relative group">
                            <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                                Email
                            </label>
                            <div className="relative mt-1">
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-transparent transition-all duration-200 pl-10"
                                />
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </div>
                        </div>

                        {/* Password field with icon and forgot link */}
                        <div className="relative group">
                            <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                Password
                            </label>
                            <div className="relative mt-1">
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-transparent transition-all duration-200 pl-10"
                                />
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </div>
                            <div className="flex justify-end mt-1">
                                <button
                                    type="button"
                                    className="text-xs text-indigo-500 hover:text-indigo-700 hover:underline transition-all duration-200 font-medium"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            {/* Outline button preserved exactly */}
                            <Button variant="outline" className="w-full mt-4">
                                Login
                            </Button>
                        </div>

                        {/* Divider with "or" text */}
                        <div className="relative flex items-center py-1">
                            <div className="grow border-t border-slate-200"></div>
                            <span className="shrink mx-3 text-xs text-slate-400 font-medium">or</span>
                            <div className="grow border-t border-slate-200"></div>
                        </div>

                        {/* Solid Sign in button preserved exactly */}
                        <Button className="w-full">Sign in</Button>

                        {/* Remember me checkbox - new addition */}
                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-400 focus:ring-offset-0" />
                                <span className="text-xs font-medium">Keep me signed in</span>
                            </label>
                        </div>

                        {/* Sign up link */}
                        <div className="text-center text-xs pt-2 text-slate-500">
                            New here?{" "}
                            <Link to="/signup" className="font-semibold text-indigo-500 hover:text-indigo-700 hover:underline transition-all">
                                Create an account
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Enhanced demo credentials box */}
                <div className="mt-8 p-4 rounded-xl bg-white/40 backdrop-blur-sm border border-indigo-100/50 shadow-sm text-xs text-center group transition-all duration-300 hover:bg-white/60">
                    <span className="font-semibold text-indigo-600">✨ Demo credentials:</span>{" "}
                    <span className="text-slate-600">any email / any password</span>
                    <div className="text-[11px] text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        No validation required for demo
                    </div>
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