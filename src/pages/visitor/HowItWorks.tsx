import React from "react";

export const HowItWorks: React.FC = () => (
  <section className="gpsc-cream">
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-24">
      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <div className="text-xs tracking-[0.2em] uppercase text-gpsc-green mb-4">How it works</div>
          <h2 className="font-display text-4xl text-gpsc-navy leading-tight">A simple path from joining to thriving.</h2>
        </div>
        <div className="lg:col-span-8 space-y-8">
          {[
            { n: "01", title: "Choose your package", desc: "Basic Care at ₱698, Family Care at ₱1,698, or Premium Care at ₱4,998 — a one-time contribution." },
            { n: "02", title: "Activate benefits over time", desc: "Each benefit becomes available after its eligibility window (1, 5, 6, 8, or 10 months of active membership)." },
            { n: "03", title: "Share with your community", desc: "Use your personal referral link. Earn 20% on direct sales, plus 5%, 3%, 2%, 1%, 1% across five upline levels." },
            { n: "04", title: "Claim when needed", desc: "Submit your documents online or in person. Approved claims pay out via GCash, bank transfer, or in-person within 7 days." },
          ].map((step, i) => (
            <div key={i} className="flex gap-6 group">
              <div className="font-display text-4xl text-gpsc-green/40 group-hover:text-gpsc-green transition-colors w-16 shrink-0">{step.n}</div>
              <div className="flex-1 pt-1 pb-8 border-b border-gpsc-cream-dark">
                <h3 className="font-display text-2xl text-gpsc-navy mb-2">{step.title}</h3>
                <p className="text-gpsc-stone leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);