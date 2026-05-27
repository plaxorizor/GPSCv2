import { useState } from "react";
import { registerUser } from "../../firebase/auth";
import { db } from "../../firebase/config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../../components/ui/Logo";

export default function SignUpLayout() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        mobile: "",
        city: "",
        province: "",
        referralCode: "",
    });
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setError("");
        try {
            const { user } = await registerUser(form.email, form.password);

            // Save member to Firestore (do NOT store raw passwords)
            await setDoc(doc(db, "members", user.uid), {
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                mobile: form.mobile,
                city: form.city,
                province: form.province,
                referralCode: form.referralCode,
                createdAt: serverTimestamp(),
            });

            navigate("/"); // Redirect to home or dashboard
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        }
    };

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-2xl mx-auto px-6">
                <div className="text-center mb-8">
                    <Logo size={56} />
                    <h1 className="font-display text-3xl mt-4">Create an account</h1>
                    <p className="text-sm mt-2">Join the GPSC community today</p>
                </div>

                <div className="bg-white rounded-3xl p-8 border space-y-4">
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <form className="space-y-3" onSubmit={handleSubmit}>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs uppercase tracking-wider">First name</label>
                                <input
                                    placeholder="Juan"
                                    className="w-full mt-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            firstName: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wider">Last name</label>
                                <input
                                    placeholder="Dela Cruz"
                                    className="w-full mt-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            lastName: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="text-xs uppercase tracking-wider">Email</label>
                            <input
                                type="email"
                                placeholder="juandelacruz@example.com"
                                className="w-full mt-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                        </div>

                        <div className="mt-4">
                            <label className="text-xs uppercase tracking-wider">Mobile number</label>
                            <input
                                placeholder="+63 XXX XXX XXXX"
                                className="w-full mt-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs uppercase tracking-wider">City</label>
                                <input
                                    placeholder="Davao City"
                                    className="w-full mt-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            city: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wider">Province</label>
                                <input
                                    placeholder="Davao del Sur"
                                    className="w-full mt-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            province: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs uppercase tracking-wider">Password</label>
                                <input
                                    type="password"
                                    placeholder=""
                                    className="w-full mt-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            password: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wider">Confirm password</label>
                                <input
                                    type="password"
                                    placeholder=""
                                    className="w-full mt-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="text-xs uppercase tracking-wider">Referral code (optional)</label>
                            <input
                                placeholder="e.g. MARIA-ABCD-1234"
                                className="w-full mt-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                            />
                        </div>
                        <div className="mt-6">
                            <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600">
                                Register
                            </button>
                        </div>
                    </form>
                    <div className="text-center text-xs pt-2">
                        Already have an account?{" "}
                        <Link to="/signin" className="hover:underline">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
