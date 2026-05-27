import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Logo } from "../../components/ui/Logo";

export function SignInLayout() {
    return (
        <div className="gpsc-cream min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full mx-auto px-6 py-16">
                <div className="text-center mb-10">
                    <Logo size={56} />

                    <p className="text-sm text-gpsc-stone mt-2">
                        Sign in to your member dashboard
                    </p>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-gpsc-cream-dark space-y-4">
                    <div>
                        <label className="text-xs uppercase tracking-wider text-gpsc-stone">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            className="w-full mt-1 px-4 py-3 rounded-xl border border-gpsc-cream-dark focus:outline-none focus:ring-2 focus:ring-gpsc-green"
                        />
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wider text-gpsc-stone">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full mt-1 px-4 py-3 rounded-xl border border-gpsc-cream-dark focus:outline-none focus:ring-2 focus:ring-gpsc-green"
                        />
                        <button
                            type="button"
                            className="text-xs text-gpsc-green mt-2 hover:underline"
                        >
                            Forgot password?
                        </button>
                    </div>
                    <Button className="w-full">Sign in</Button>
                    <div className="text-center text-xs text-gpsc-stone pt-2">
                        New here?{" "}
                        <Link
                            to="/signup"
                            className="text-gpsc-green hover:underline"
                        >
                            Create an account
                        </Link>
                    </div>
                </div>

                {/* Optional demo hint – purely visual */}
                <div className="mt-6 p-4 bg-gpsc-cream-dark/40 rounded-xl text-xs text-gpsc-stone text-center">
                    <span className="font-medium text-gpsc-navy">
                        Demo credentials:
                    </span>{" "}
                    any email / any password
                </div>
            </div>
        </div>
    );
}
