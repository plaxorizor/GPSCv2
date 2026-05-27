import React from "react";
import { HandHeart, Sprout, Users } from "lucide-react";

export const Pillars: React.FC = () => (
  <section className="border-y border-gpsc-cream-dark bg-white">
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
      <div className="text-center mb-16">
        <div className="font-display italic text-xl text-gpsc-green mb-2">We Care · We Serve · We Share</div>
        <h2 className="font-display text-4xl text-gpsc-navy">Three pillars, one community</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { icon: HandHeart, title: "We Care", number: "01", desc: "Emergency, hospital, burial, maternity, and calamity assistance — paid in cash, fast.", color: "navy" },
          { icon: Sprout, title: "We Serve", number: "02", desc: "Livelihood training, financial literacy seminars, medical missions, and community feeding.", color: "green" },
          { icon: Users, title: "We Share", number: "03", desc: "Earn up to 20% commission on every member you bring, plus leadership bonuses across 6 ranks.", color: "navy" },
        ].map((pillar, i) => (
          <div key={i} className="group">
            <div className="font-display text-xs tracking-widest text-gpsc-stone mb-6">{pillar.number}</div>
            <div className={`w-14 h-14 rounded-full ${pillar.color === "navy" ? "bg-gpsc-navy" : "bg-gpsc-green"} text-white flex items-center justify-center mb-6 group-hover:scale-105 transition-transform`}>
              <pillar.icon size={24} />
            </div>
            <h3 className="font-display text-2xl text-gpsc-navy mb-3">{pillar.title}</h3>
            <p className="text-gpsc-stone leading-relaxed">{pillar.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);