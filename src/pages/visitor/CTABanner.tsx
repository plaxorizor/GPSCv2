import React from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useScrollReveal } from "../../hooks/useScrollReveal";

export const CTABanner: React.FC = () => {
    const navigate = useNavigate();
    const { ref, inView } = useScrollReveal();

    return (
        <section className="bg-fsc-navy">
            <div
                ref={ref}
                className={`mx-auto max-w-4xl px-6 py-24 text-center lg:px-8 scroll-reveal ${inView ? "in-view" : ""}`}
            >
                <div className="text-fsc-green mb-4 text-xs tracking-[0.2em] uppercase">Join FaithShield Care</div>
                <h2 className="font-display mb-6 text-4xl leading-tight text-white lg:text-5xl">
                    Ready to protect your family?
                </h2>
                <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-white/70">
                    One-time membership. Lifetime peace of mind. Join thousands of Filipino families already covered.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <button
                        onClick={() => navigate("/signup")}
                        className="group inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#C9922A] px-8 py-4 font-medium text-white transition-colors hover:bg-[#A87820]"
                    >
                        Become a member
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </button>
                    <button
                        onClick={() => navigate("/membership")}
                        className="cursor-pointer rounded-full border border-white/30 px-8 py-4 font-medium text-white/80 transition-colors hover:border-white hover:text-white"
                    >
                        View packages
                    </button>
                </div>
            </div>
        </section>
    );
};
