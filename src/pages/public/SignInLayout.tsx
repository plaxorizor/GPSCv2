import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Logo } from "../../components/ui/Logo";

export function SignInLayout() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full mx-auto px-6 py-16">
                <div className="text-center mb-10">
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
                </div>

                {/* Optional demo hint – purely visual */}
                <div className="mt-6 p-4 rounded-xl text-xs text-center">
                    <span className="font-medium">Demo credentials:</span> any
                    email / any password
                </div>
            </div>
        </div>
    );
}
