import React from "react";
import { HandHeart, Sprout, Users } from "lucide-react";

export const Pillars: React.FC = () => (
    <section className="border-gpsc-cream-dark border-y bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
            <div className="mb-16 text-center">
                <div className="font-display text-gpsc-green mb-2 text-xl italic">We Care · We Serve · We Share</div>
                <h2 className="font-display text-gpsc-navy text-4xl">Three pillars, one community</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
                {[
                    {
                        icon: HandHeart,
                        title: "We Care",
                        number: "01",
                        desc: "Emergency, hospital, burial, maternity, and calamity assistance — paid in cash, fast.",
                        color: "navy",
                    },
                    {
                        icon: Sprout,
                        title: "We Serve",
                        number: "02",
                        desc: "Livelihood training, financial literacy seminars, medical missions, and community feeding.",
                        color: "green",
                    },
                    {
                        icon: Users,
                        title: "We Share",
                        number: "03",
                        desc: "Earn up to 20% commission on every member you bring, plus leadership bonuses across 6 ranks.",
                        color: "navy",
                    },
                ].map((pillar, i) => (
                    <div key={i} className="group">
                        <div className="font-display text-gpsc-stone mb-6 text-xs tracking-widest">{pillar.number}</div>
                        <div
                            className={`h-14 w-14 rounded-full ${pillar.color === "navy" ? "bg-gpsc-navy" : "bg-gpsc-green"} mb-6 flex items-center justify-center text-white transition-transform group-hover:scale-105`}
                        >
                            <pillar.icon size={24} />
                        </div>
                        <h3 className="font-display text-gpsc-navy mb-3 text-2xl">{pillar.title}</h3>
                        <p className="text-gpsc-stone leading-relaxed">{pillar.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);
