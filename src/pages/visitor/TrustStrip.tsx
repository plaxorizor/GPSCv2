import React from "react";

export const TrustStrip: React.FC = () => (
  <section className="bg-gpsc-navy text-white">
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="font-display text-3xl lg:text-4xl leading-tight mb-4">A community you can verify.</h2>
          <p className="text-white/70 leading-relaxed">
            Every officer, registration, and benefit payout is on the record. We publish audited financials annually
            and welcome members to attend board meetings.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Board of Directors", value: "7 named officers" },
            { label: "Audited financials", value: "Published yearly" },
            { label: "Average claim time", value: "4.2 days" },
            { label: "Member satisfaction", value: "94%" },
          ].map((s, i) => (
            <div key={i} className="border border-white/20 rounded-2xl p-5">
              <div className="text-xs uppercase tracking-wider text-white/50 mb-1">{s.label}</div>
              <div className="font-display text-xl">{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);