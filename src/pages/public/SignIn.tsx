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
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full mx-auto px-6 py-16">
                <div className="text-center mb-10">
                    <Logo size={128} />
                </div>
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border space-y-4">
                    <div>
                        <label className="text-xs uppercase tracking-wider">Email</label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            className="w-full mt-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wider">Password</label>
                        <input
                            type="password"
                            placeholder=""
                            className="w-full mt-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button type="button" className="text-xs mt-2 hover:underline">
                            Forgot password?
                        </button>
                    </div>

                    <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600">
                        Sign in
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
