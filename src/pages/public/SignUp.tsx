import { getDoc, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { registerUser } from "../../firebase/auth";
import { db } from "../../firebase/config";

import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Logo } from "../../components/ui/Logo";

import { RadioGroup, Radio } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

import { type PackageName } from "../../pages/member/types";

const plans = [
    { name: "Basic" as PackageName, price: 698, level: 1, rank: "Sales Consultant", rate: 0.2 },
    { name: "Family" as PackageName, price: 1698, level: 3, rank: "Team Consultant", rate: 0.05 },
    { name: "Premium" as PackageName, price: 4998, level: 6, rank: "Sales Manager", rate: 0.03 },
];

const generateReferralCode = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const segment = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `${segment(4)}-${segment(4)}-${segment(4)}`;
};

export default function SignUpLayout() {
    const [searchParams] = useSearchParams();
    const [refValue, setRefValue] = useState<string>("");

    useEffect(() => {
        const ref = searchParams.get("ref");
        if (ref) {
            setRefValue(ref);
        }
    }, [searchParams]);

    const navigate = useNavigate();

    const [selectedPlan, setSelectedPlan] = useState(plans[0]);

    const [form, setForm] = useState({
        package: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        mobile: "",
        birthDate: "",
        civilStatus: "",
        city: "",
        province: "",
        referralCode: "",
        beneficiaries: [{ name: "", relationship: "" }],
    });
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setError("");
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        try {
            // 1. Resolve referral code to upline UID
            const snap = await getDoc(doc(db, "referralCodes", form.referralCode));
            if (!snap.exists()) {
                setError("Invalid referral code.");
                return;
            }
            const referredBy = snap.data().uid;

            // 2. Register user in Firebase Auth
            const { user } = await registerUser(form.email, form.password);

            const referralCode = generateReferralCode();
            // 3. Save member to Firestore

            await setDoc(doc(db, "members", user.uid), {
                referralCode: referralCode, // their OWN code to share
                referredBy: referredBy, // their upline's UID
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                mobile: form.mobile,
                birthDate: form.birthDate,
                civilStatus: form.civilStatus,
                city: form.city,
                province: form.province,
                package: selectedPlan.name,
                beneficiaries: form.beneficiaries,
                status: "pending",
                isAdmin: false,
                dateCreated: serverTimestamp(),
            });

            await setDoc(doc(db, "referralCodes", referralCode), {
                uid: user.uid,
            });

            navigate("/dashboard/member");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        }
    };

    return (
        <div className="min-h-screen py-12">
            <div className="mx-auto max-w-2xl px-6">
                <div className="mb-8 text-center">
                    <Logo size={56} />
                    <h1 className="font-display mt-4 text-3xl">Create an account</h1>
                    <p className="mt-2 text-sm">Join the GPSC community today</p>
                </div>

                <div className="space-y-4 rounded-3xl border bg-white p-8">
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <form className="space-y-3" onSubmit={handleSubmit}>
                        <div className="mt-4">
                            <label>Step 1: Membership Plan</label>
                        </div>
                        <div>
                            <div className="w-full px-4">
                                <div className="mx-auto w-full max-w-md">
                                    <RadioGroup
                                        by="name"
                                        value={selectedPlan}
                                        onChange={setSelectedPlan}
                                        aria-label="Server size"
                                        className="space-y-2"
                                    >
                                        {plans.map((plan) => (
                                            <Radio
                                                key={plan.name}
                                                value={plan}
                                                className="group relative flex cursor-pointer rounded-lg bg-white/5 px-5 py-4 text-stone-950 shadow-md transition focus:not-data-focus:outline-none data-checked:bg-white/10 data-focus:outline data-focus:outline-white"
                                            >
                                                <div className="flex w-full items-center justify-between">
                                                    <div className="text-sm/6">
                                                        <p className="font-semibold text-stone-950">
                                                            {plan.name} {" Care"}
                                                        </p>
                                                        <div className="flex gap-2 text-stone-700">
                                                            <div>
                                                                {"₱"}
                                                                {plan.price}
                                                            </div>
                                                            <div aria-hidden="true">&middot;</div>
                                                            <div>
                                                                {"Level "}
                                                                {plan.level}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <CheckCircleIcon className="size-6 fill-stone-950 opacity-0 transition group-data-checked:opacity-100" />
                                                </div>
                                            </Radio>
                                        ))}
                                    </RadioGroup>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label>Step 2: Your Information</label>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-xs tracking-wider uppercase">First name</label>
                                <input
                                    placeholder="Juan"
                                    className="mt-1 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            firstName: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-xs tracking-wider uppercase">Last name</label>
                                <input
                                    placeholder="Dela Cruz"
                                    className="mt-1 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
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
                            <label className="text-xs tracking-wider uppercase">Email</label>
                            <input
                                type="email"
                                placeholder="juandelacruz@example.com"
                                className="mt-1 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-xs tracking-wider uppercase">Password</label>
                                <input
                                    type="password"
                                    placeholder=""
                                    className="mt-1 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            password: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-xs tracking-wider uppercase">Confirm password</label>
                                <input
                                    type="password"
                                    placeholder=""
                                    className="mt-1 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            confirmPassword: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="text-xs tracking-wider uppercase">Mobile number</label>
                            <input
                                placeholder="09XXXXXXXXX"
                                className="mt-1 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                            />
                        </div>

                        <div className="mt-4">
                            <label className="text-xs tracking-wider uppercase">Birth Date</label>
                            <input
                                type="date"
                                className="mt-1 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-xs tracking-wider uppercase">City</label>
                                <input
                                    placeholder="Davao City"
                                    className="mt-1 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            city: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-xs tracking-wider uppercase">Province</label>
                                <input
                                    placeholder="Davao del Sur"
                                    className="mt-1 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            province: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label>Civil Status</label>
                            <select
                                className="mt-1 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        civilStatus: e.target.value,
                                    })
                                }
                            >
                                <option value="single">Single</option>
                                <option value="married">Married</option>
                                <option value="divorced">Divorced</option>
                                <option value="widowed">Widowed</option>
                            </select>
                        </div>

                        <div className="mt-4">
                            <label>Step 3: Sponsor & Beneficiary</label>
                        </div>

                        <div className="mt-4">
                            <label className="text-xs tracking-wider uppercase">Referral Code</label>
                            <input
                                value={refValue}
                                placeholder="e.g. MARIA-ABCD-1234"
                                className="mt-1 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                                onChange={(e) => {
                                    setRefValue(e.target.value);
                                    setForm({
                                        ...form,
                                        referralCode: e.target.value,
                                    });
                                }}
                            />
                        </div>

                        {selectedPlan.name !== "Basic" && (
                            <div className="mt-4 space-y-3">
                                <label className="text-xs tracking-wider uppercase">Beneficiaries</label>

                                {form.beneficiaries.map((b, index) => (
                                    <div key={index} className="space-y-2 rounded-xl border p-4">
                                        <p className="text-xs text-stone-500">Beneficiary {index + 1}</p>

                                        <input
                                            placeholder="Full name (e.g. Maria Dela Cruz)"
                                            className="mt-1 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                                            value={b.name}
                                            onChange={(e) => {
                                                const updated = [...form.beneficiaries];
                                                updated[index].name = e.target.value;
                                                setForm({ ...form, beneficiaries: updated });
                                            }}
                                        />

                                        <select
                                            className="mt-1 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                                            value={b.relationship}
                                            onChange={(e) => {
                                                const updated = [...form.beneficiaries];
                                                updated[index].relationship = e.target.value;
                                                setForm({ ...form, beneficiaries: updated });
                                            }}
                                        >
                                            <option value="">Select relationship</option>
                                            <option value="Parent">Parent</option>
                                            <option value="Sibling">Sibling</option>
                                            <option value="Child">Child</option>
                                            <option value="Spouse">Spouse</option>
                                        </select>
                                    </div>
                                ))}

                                {/* Add beneficiary button — limit based on plan */}
                                {form.beneficiaries.length < (selectedPlan.name === "Family" ? 2 : 4) && (
                                    <button
                                        type="button"
                                        className="text-sm text-blue-500 hover:underline"
                                        onClick={() =>
                                            setForm({
                                                ...form,
                                                beneficiaries: [...form.beneficiaries, { name: "", relationship: "" }],
                                            })
                                        }
                                    >
                                        + Add another beneficiary
                                    </button>
                                )}

                                {/* Remove button — only show if more than 1 */}
                                {form.beneficiaries.length > 1 && (
                                    <button
                                        type="button"
                                        className="text-sm text-red-400 hover:underline"
                                        onClick={() =>
                                            setForm({
                                                ...form,
                                                beneficiaries: form.beneficiaries.slice(0, -1),
                                            })
                                        }
                                    >
                                        - Remove last beneficiary
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="mt-6">
                            <button type="submit" className="w-full rounded-xl bg-blue-500 py-3 text-white hover:bg-blue-600">
                                Register
                            </button>
                        </div>
                    </form>
                    <div className="pt-2 text-center text-xs">
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
