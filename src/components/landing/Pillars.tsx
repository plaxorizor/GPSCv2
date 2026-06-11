import React from "react";
import { HandHeart, Sprout, Users } from "lucide-react";
import { useScrollReveal } from "../../hooks/useScrollReveal";

export const Pillars: React.FC = () => {
    const { ref, inView } = useScrollReveal();
    return (
    <section className="border-fsc-cream-dark border-y bg-white">
        <div ref={ref} className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
            <div className="mb-16 text-center">
                <div className="font-display text-fsc-green mb-2 text-xl italic">Guided by Faith, Driven by Care</div>
                <h2 className="font-display text-fsc-navy text-4xl">Three pillars, one community</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
                {[
                    {
                        icon: HandHeart,
                        title: "We Protect",
                        number: "01",
                        desc: "Emergency, hospital, burial, maternity, and calamity cash assistance — paid fast and with compassion.",
                        color: "navy",
                    },
                    {
                        icon: Sprout,
                        title: "We Serve",
                        number: "02",
                        desc: "Livelihood training, financial literacy seminars, medical missions, and community feeding programs.",
                        color: "green",
                    },
                    {
                        icon: Users,
                        title: "We Empower",
                        number: "03",
                        desc: "Earn up to 20% commission on every member you refer, plus leadership bonuses across 6 ranks.",
                        color: "navy",
                    },
                ].map((pillar, i) => (
                    <div
                        key={i}
                        className={`group scroll-reveal ${inView ? "in-view" : ""}`}
                        style={{ transitionDelay: inView ? `${i * 80}ms` : "0ms" }}
                    >
                        <div className="font-display text-fsc-stone mb-6 text-xs tracking-widest">{pillar.number}</div>
                        <div
                            className={`h-14 w-14 rounded-full ${pillar.color === "navy" ? "bg-fsc-navy" : "bg-fsc-green"} mb-6 flex items-center justify-center text-white transition-transform group-hover:scale-105`}
                        >
                            <pillar.icon size={24} />
                        </div>
                        <h3 className="font-display text-fsc-navy mb-3 text-2xl">{pillar.title}</h3>
                        <p className="text-fsc-stone leading-relaxed">{pillar.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
    );
};
