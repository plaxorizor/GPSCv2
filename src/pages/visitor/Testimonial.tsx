import React from "react";
import { Quote } from "lucide-react";
import { useScrollReveal } from "../../hooks/useScrollReveal";

export const Testimonial: React.FC = () => {
    const { ref, inView } = useScrollReveal();
    return (
        <section className="fsc-cream">
            <div ref={ref} className={`mx-auto max-w-4xl px-6 py-24 text-center lg:px-8 scroll-reveal ${inView ? "in-view" : ""}`}>
                <Quote size={48} className="text-fsc-green mx-auto mb-8" />
                <p className="font-display text-fsc-navy text-3xl italic leading-snug lg:text-4xl">
                    "When my husband was admitted last February, FaithShield Care released ₱11,500 in four days. No paperwork chaos, no
                    waiting weeks. Now I refer everyone in our barangay — it's how we take care of each other."
                </p>
                <div className="mt-8 text-sm text-fsc-stone">— Maria S., Davao City</div>
            </div>
        </section>
    );
};
