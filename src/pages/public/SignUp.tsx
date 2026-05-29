import { useState } from "react";
import { registerUser } from "../../firebase/auth";
import { db } from "../../firebase/config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../../components/ui/Logo";

import { useForm } from "react-hook-form";

import { RadioGroup, Radio, Select, Label, Field } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

const plans = [
    { plan: "basic", name: "Basic Care", price: "₱698", levels: "Level 1 only" },
    { plan: "family", name: "Family Care", price: "₱1,698", levels: "Levels 1-3" },
    { plan: "premium", name: "Premium Care", price: "₱4,998", levels: "Levels 1-6" },
];

export default function SignUpLayout() {
    const navigate = useNavigate();

    const { register } = useForm();

    const [selectedPlan, setSelectedPlan] = useState(plans[0]);

    const [form, setForm] = useState({
        package: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        mobile: "",
        birthDate: "",
        civilStatus: "",
        city: "",
        province: "",
        referralCode: "",
        beneficiaries: [""],
        b_Relationship: [""],
    });
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setError("");
        try {
            const { user } = await registerUser(form.email, form.password);

            // Save member to Firestore (do NOT store raw passwords)
            await setDoc(doc(db, "members", user.uid), {
                package: selectedPlan.plan,
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                mobile: form.mobile,
                birthDate: form.birthDate,
                civilStatus: form.civilStatus,
                city: form.city,
                province: form.province,
                referralCode: form.referralCode,
                beneficiaries: form.beneficiaries,
                dateCreated: serverTimestamp(),
            });

            navigate("/"); // Redirect to home or dashboard
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
                                                key={plan.plan}
                                                value={plan}
                                                className="group relative flex cursor-pointer rounded-lg bg-white/5 px-5 py-4 text-stone-950 shadow-md transition focus:not-data-focus:outline-none data-checked:bg-white/10 data-focus:outline data-focus:outline-white"
                                            >
                                                <div className="flex w-full items-center justify-between">
                                                    <div className="text-sm/6">
                                                        <p className="font-semibold text-stone-950">{plan.name}</p>
                                                        <div className="flex gap-2 text-stone-700">
                                                            <div>{plan.price}</div>
                                                            <div aria-hidden="true">&middot;</div>
                                                            <div>{plan.levels}</div>
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
                                    {...register("firstName")}
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
                                    {...register("lastName")}
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
                                {...register("email")}
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
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="text-xs tracking-wider uppercase">Mobile number</label>
                            <input
                                {...register("mobile")}
                                placeholder="09XXXXXXXXX"
                                className="mt-1 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                            />
                        </div>

                        <div className="mt-4">
                            <label className="text-xs tracking-wider uppercase">Birth Date</label>
                            <input
                                {...register("birthDate")}
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
                            <label>Step 3: Sponsor & Beneficiary</label>
                        </div>

                        <div className="mt-4">
                            <label className="text-xs tracking-wider uppercase">Referral Code</label>
                            <input
                                placeholder="e.g. MARIA-ABCD-1234"
                                className="mt-1 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        referralCode: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="mt-4">
                            <label className="text-xs tracking-wider uppercase">Beneficiary</label>
                            <input
                                placeholder="e.g. Maria Dela Cruz"
                                className="mt-1 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
                            />
                            <div className="relative">
                                <Field>
                                    <Label className="block">Relationship</Label>
                                    <Select name="b_relationship">
                                        <option value="Parent">Parent</option>
                                        <option value="Sibling">Sibling</option>
                                        <option value="Child">Child</option>
                                        <option value="Spouse">Spouse</option>
                                    </Select>
                                    <ChevronDownIcon
                                        className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60"
                                        aria-hidden="true"
                                    />
                                </Field>
                            </div>
                        </div>

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
