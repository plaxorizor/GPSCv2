import React, { useState } from "react";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import logo from "../../components/ui/Logo.png";
import { useNavigate } from "react-router-dom";
import { useCountUp } from "../../hooks/useCountUp";

export const Hero: React.FC = () => {
    const navigate = useNavigate();
    const [consultHovered, setConsultHovered] = useState(false);

    const members   = useCountUp(2400, 1800, 400);
    const benefits  = useCountUp(1.2,  1800, 550);
    const provinces = useCountUp(14,   1400, 700);

    return (
        <section className="grain-overlay relative overflow-hidden">
            <div className="mx-auto max-w-6xl px-6 pt-16 pb-24 lg:px-8 lg:pt-24 lg:pb-32">
                <div className="grid items-center gap-12 lg:grid-cols-12">
                    <div className="anim-fade-up lg:col-span-7">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="bg-fsc-green h-px w-12"></div>
                            <span className="text-fsc-green text-xs font-medium tracking-[0.2em] uppercase">Guided by Faith, Driven by Care</span>
                        </div>
                        <h1 className="font-display text-fsc-navy text-5xl leading-[1.02] tracking-tight lg:text-7xl">
                            Protecting families,
                            <br />
                            <em className="text-fsc-green font-medium not-italic">rooted</em> in faith.
                        </h1>
                        <p className="text-fsc-stone mt-8 max-w-xl text-lg leading-relaxed">
                            Faith Shield Care is a community-based membership organization designed to provide affordable financial assistance,
                            emergency support, livelihood opportunities, and community care services for low-income and middle-income families.
                        </p>
                        <div className="mt-10 flex flex-wrap items-center gap-4">
                            <button
                                onClick={() => navigate("/signup")}
                                className="bg-fsc-navy hover:bg-fsc-green group inline-flex cursor-pointer items-center gap-2 rounded-full px-8 py-4 font-medium text-white transition-colors"
                            >
                                Become a member
                                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                            </button>
                            <button
                                onClick={() => navigate("/referral")}
                                onMouseEnter={() => setConsultHovered(true)}
                                onMouseLeave={() => setConsultHovered(false)}
                                style={{
                                    backgroundColor: consultHovered ? "#1B2D6B" : "transparent",
                                    color: consultHovered ? "#ffffff" : "#1B2D6B",
                                }}
                                className="border-fsc-navy cursor-pointer rounded-full border px-8 py-4 font-medium transition-colors"
                            >
                                Know more...
                            </button>
                        </div>
                        <div className="mt-12 flex flex-wrap items-center gap-8 text-sm">
                            <div>
                                <div className="font-display text-fsc-navy text-3xl">
                                    {Math.floor(members).toLocaleString()}+
                                </div>
                                <div className="text-fsc-stone text-xs tracking-wider uppercase">Active members</div>
                            </div>
                            <div className="bg-fsc-cream-dark h-10 w-px"></div>
                            <div>
                                <div className="font-display text-fsc-navy text-3xl">
                                    ₱{benefits.toFixed(1)}M
                                </div>
                                <div className="text-fsc-stone text-xs tracking-wider uppercase">Paid in benefits</div>
                            </div>
                            <div className="bg-fsc-cream-dark h-10 w-px"></div>
                            <div>
                                <div className="font-display text-fsc-navy text-3xl">
                                    {Math.floor(provinces)}
                                </div>
                                <div className="text-fsc-stone text-xs tracking-wider uppercase">Provinces served</div>
                            </div>
                        </div>
                    </div>
                    <div className="anim-fade-up anim-delay-200 relative lg:col-span-5">
                        <div className="relative aspect-square">
                            <div className="border-fsc-navy/20 absolute inset-0 rounded-full border"></div>
                            <div className="border-fsc-green/20 absolute inset-8 rounded-full border"></div>
                            <div className="from-fsc-cream-dark absolute inset-16 flex items-center justify-center rounded-full bg-gradient-to-br to-transparent">
                                <img src={logo} alt="Faith Shield Care Logo" className="h-44 w-44 rounded-full object-contain mix-blend-multiply" />
                            </div>
                            <div
                                className="border-fsc-cream-dark absolute top-12 -left-4 max-w-[200px] rounded-2xl border bg-white p-4 shadow-lg"
                                style={{ animation: "hero-card-in 0.55s ease 0.5s both, float-bob 5s ease-in-out 1.1s infinite" }}
                            >
                                <div className="text-fsc-green mb-1 flex items-center gap-2 text-xs font-semibold">
                                    <CheckCircle size={14} /> Claim approved
                                </div>
                                <div className="text-fsc-navy text-sm">₱11,500 hospital cash sent to Maria within 4 days.</div>
                            </div>
                            <div
                                className="border-fsc-cream-dark absolute -right-4 bottom-16 max-w-[200px] rounded-2xl border bg-white p-4 shadow-lg"
                                style={{ animation: "hero-card-in 0.55s ease 0.8s both, float-bob 6.4s ease-in-out 1.4s infinite" }}
                            >
                                <div className="text-fsc-navy-light mb-1 flex items-center gap-2 text-xs font-semibold">
                                    <Sparkles size={14} /> Just joined
                                </div>
                                <div className="text-fsc-navy text-sm">Pedro from Cavite signed up via Aling Nena.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
