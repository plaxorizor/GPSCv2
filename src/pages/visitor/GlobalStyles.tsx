import React from "react";

export const GlobalStyles: React.FC = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,800&family=DM+Sans:wght@400;500;600;700&display=swap');
    .font-display { font-family: 'Fraunces', Georgia, serif; font-optical-sizing: auto; }
    .font-body { font-family: 'DM Sans', system-ui, sans-serif; }
    body, html, #root { font-family: 'DM Sans', system-ui, sans-serif; }
    .fsc-cream { background-color: #FAF6EE; }
    .fsc-cream-dark { background-color: #F0E9D9; }
    .text-fsc-navy { color: #14365C; }
    .text-fsc-navy-light { color: #2D5A85; }
    .text-fsc-green { color: #4A8A2C; }
    .text-fsc-green-light { color: #5DAB3A; }
    .text-fsc-stone { color: #6B6862; }
    .text-fsc-ink { color: #1A1E22; }
    .bg-fsc-navy { background-color: #14365C; }
    .bg-fsc-navy-light { background-color: #2D5A85; }
    .bg-fsc-green { background-color: #4A8A2C; }
    .bg-fsc-green-light { background-color: #5DAB3A; }
    .border-fsc-navy { border-color: #14365C; }
    .border-fsc-green { border-color: #4A8A2C; }
    .border-fsc-cream-dark { border-color: #E5DDC8; }
    .ring-fsc-green { --tw-ring-color: #4A8A2C; }
    .hover\\:bg-fsc-navy:hover { background-color: #14365C; }
    .hover\\:bg-fsc-green:hover { background-color: #4A8A2C; }
    .hover\\:bg-fsc-cream-dark:hover { background-color: #F0E9D9; }
    .grain-overlay {
      background-image: radial-gradient(circle at 1px 1px, rgba(20,54,92,0.04) 1px, transparent 0);
      background-size: 24px 24px;
    }
    @keyframes fade-up { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }
    .anim-fade-up { animation: fade-up 0.6s ease-out forwards; }
    .anim-delay-100 { animation-delay: 0.1s; opacity: 0; }
    .anim-delay-200 { animation-delay: 0.2s; opacity: 0; }
    .anim-delay-300 { animation-delay: 0.3s; opacity: 0; }
    .anim-delay-400 { animation-delay: 0.4s; opacity: 0; }

    /* ── Tier: Bronze ─────────────────────────────────────── */
    .tier-bronze {
      background-color: #FDF5EC;
      border: 1.5px solid #C8864A;
    }
    .tier-bronze .tier-label        { color: #A0622A; }
    .tier-bronze .tier-coverage     { color: #B8784A; }
    .tier-bronze .tier-name         { color: #6B3D18; }
    .tier-bronze .tier-tagline      { color: #B8784A; }
    .tier-bronze .tier-price        { color: #A0622A; }
    .tier-bronze .tier-price-note   { color: #B8784A; }
    .tier-bronze .tier-divider      { background-color: #E8CFA8; }
    .tier-bronze .tier-check        { color: #C8864A; }
    .tier-bronze .tier-benefit-name { color: #6B3D18; }
    .tier-bronze .tier-benefit-amt  { color: #B8784A; }
    .tier-bronze .tier-more         { color: #B8784A; }
    .tier-bronze .tier-pill         { background-color: #F5E5D0; color: #6B3D18; border: 1px solid #C8864A; }
    .tier-bronze .tier-btn          { background-color: #A0622A; color: #fff; border: none; }
    .tier-bronze .tier-btn:hover    { background-color: #8A5020; }

    /* ── Tier: Silver (dark card) ─────────────────────────── */
    .tier-silver {
      background-color: #1C2A3A;
      border: 1.5px solid #8FA8BF;
    }
    .tier-silver .tier-label        { color: #8FA8BF; }
    .tier-silver .tier-coverage     { color: #8FA8BF; }
    .tier-silver .tier-name         { color: #E8F0F7; }
    .tier-silver .tier-tagline      { color: #5C84A0; }
    .tier-silver .tier-price        { color: #B8CFE2; }
    .tier-silver .tier-price-note   { color: #8FA8BF; }
    .tier-silver .tier-divider      { background-color: #2D4A62; }
    .tier-silver .tier-check        { color: #9DC4D8; }
    .tier-silver .tier-benefit-name { color: #E8F0F7; }
    .tier-silver .tier-benefit-amt  { color: #5C84A0; }
    .tier-silver .tier-more         { color: #5C84A0; }
    .tier-silver .tier-pill         { background-color: #2D4A62; color: #B8CFE2; border: 1px solid #8FA8BF; }
    .tier-silver .tier-btn          { background-color: #6BA0C0; color: #fff; border: none; }
    .tier-silver .tier-btn:hover    { background-color: #5088A8; }

    /* ── Tier: Gold ───────────────────────────────────────── */
    .tier-gold {
      background-color: #FFFBF0;
      border: 1.5px solid #C8A84A;
    }
    .tier-gold .tier-label        { color: #A07830; }
    .tier-gold .tier-coverage     { color: #C8A84A; }
    .tier-gold .tier-name         { color: #5A3A08; }
    .tier-gold .tier-tagline      { color: #C8A84A; }
    .tier-gold .tier-price        { color: #A07830; }
    .tier-gold .tier-price-note   { color: #C8A84A; }
    .tier-gold .tier-divider      { background-color: #F0D888; }
    .tier-gold .tier-check        { color: #C8A84A; }
    .tier-gold .tier-benefit-name { color: #5A3A08; }
    .tier-gold .tier-benefit-amt  { color: #C8A84A; }
    .tier-gold .tier-more         { color: #C8A84A; }
    .tier-gold .tier-pill         { background-color: #FFF3D0; color: #5A3A08; border: 1px solid #C8A84A; }
    .tier-gold .tier-btn          { background-color: #A07830; color: #fff; border: none; }
    .tier-gold .tier-btn:hover    { background-color: #886020; }
  `}</style>
);
