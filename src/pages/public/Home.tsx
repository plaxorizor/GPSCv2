import React, { useState } from "react";
import { auth } from "../../firebase/config";
import {
  ArrowRight,
  Check,
  CheckCircle,
  HandHeart,
  Menu,
  Quote,
  Sparkles,
  Sprout,
  Users,
  X,
} from "lucide-react";

// ================================================================
//  TYPES & MOCK DATA (static for landing page)
// ================================================================

interface Benefit {
  label: string;
  amount: string;
  eligibility: string;
}

interface Package {
  id: string;
  name: string;
  price: number;
  tagline: string;
  coverage: string;
  color: string;
  popular?: boolean;
  benefits: Benefit[];
  commission: number;
}

const packages: Package[] = [
  {
    id: "basic",
    name: "Basic Care",
    price: 698,
    tagline: "Individual protection, simple start",
    coverage: "Individual",
    color: "navy",
    benefits: [
      { label: "Accidental death", amount: "₱10,000 – ₱40,000", eligibility: "1–10 months" },
      { label: "Natural death", amount: "₱20,000 + ₱5,000 groceries", eligibility: "5 months" },
      { label: "Hospital cash", amount: "₱5,000 + ₱1,500/day", eligibility: "6 months" },
      { label: "Senior recognition", amount: "₱5,000 – ₱25,000", eligibility: "6 months" },
    ],
    commission: 224,
  },
  {
    id: "family",
    name: "Family Care",
    price: 1698,
    tagline: "Coverage for the whole household",
    coverage: "Family of 4",
    color: "green",
    popular: true,
    benefits: [
      { label: "Accidental death", amount: "₱10,000 – ₱40,000", eligibility: "1–10 months" },
      { label: "Natural death", amount: "₱20,000 + ₱5,000 groceries", eligibility: "5 months" },
      { label: "Hospital cash", amount: "₱5,000 + ₱1,500/day", eligibility: "6 months" },
      { label: "Senior recognition", amount: "₱5,000 – ₱25,000", eligibility: "6 months" },
      { label: "Calamity assistance", amount: "₱5,000", eligibility: "8 months" },
    ],
    commission: 544,
  },
  {
    id: "premium",
    name: "Premium Care",
    price: 4998,
    tagline: "Full benefits and leadership rewards",
    coverage: "Family of 5",
    color: "navy",
    benefits: [
      { label: "Accidental death", amount: "₱20,000 – ₱80,000", eligibility: "1–10 months" },
      { label: "Natural death", amount: "₱40,000 + ₱10,000 groceries", eligibility: "5 months" },
      { label: "Hospital cash", amount: "₱10,000 + ₱3,000/day", eligibility: "6 months" },
      { label: "Senior recognition", amount: "₱20,000 – ₱50,000", eligibility: "6 months" },
      { label: "Birthday care", amount: "₱5,000 + cake + tarpaulin", eligibility: "8 months" },
      { label: "Maternity assistance", amount: "₱10,000 – ₱20,000", eligibility: "8 months" },
      { label: "Calamity assistance", amount: "₱10,000", eligibility: "8 months" },
      { label: "Leadership bonus", amount: "Up to 6th rank", eligibility: "Active" },
    ],
    commission: 1600,
  },
];

const peso = (n: number): string => "₱" + n.toLocaleString("en-PH");

// ================================================================
//  GLOBAL STYLES (injected via <style>)
// ================================================================

const GlobalStyles: React.FC = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,800&family=DM+Sans:wght@400;500;600;700&display=swap');
    .font-display { font-family: 'Fraunces', Georgia, serif; font-optical-sizing: auto; }
    .font-body { font-family: 'DM Sans', system-ui, sans-serif; }
    body, html, #root { font-family: 'DM Sans', system-ui, sans-serif; }
    .gpsc-cream { background-color: #FAF6EE; }
    .gpsc-cream-dark { background-color: #F0E9D9; }
    .text-gpsc-navy { color: #14365C; }
    .text-gpsc-navy-light { color: #2D5A85; }
    .text-gpsc-green { color: #4A8A2C; }
    .text-gpsc-green-light { color: #5DAB3A; }
    .text-gpsc-stone { color: #6B6862; }
    .text-gpsc-ink { color: #1A1E22; }
    .bg-gpsc-navy { background-color: #14365C; }
    .bg-gpsc-navy-light { background-color: #2D5A85; }
    .bg-gpsc-green { background-color: #4A8A2C; }
    .bg-gpsc-green-light { background-color: #5DAB3A; }
    .border-gpsc-navy { border-color: #14365C; }
    .border-gpsc-green { border-color: #4A8A2C; }
    .border-gpsc-cream-dark { border-color: #E5DDC8; }
    .ring-gpsc-green { --tw-ring-color: #4A8A2C; }
    .hover\\:bg-gpsc-navy:hover { background-color: #14365C; }
    .hover\\:bg-gpsc-green:hover { background-color: #4A8A2C; }
    .hover\\:bg-gpsc-cream-dark:hover { background-color: #F0E9D9; }
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
  `}</style>
);

// ================================================================
//  LOGO COMPONENTS
// ================================================================

interface LogoProps {
  size?: number;
  mono?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 40, mono = false }) => {
  const navy = mono ? "currentColor" : "#14365C";
  const green = mono ? "currentColor" : "#5DAB3A";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="48" stroke={navy} strokeWidth="1.5" fill="none" opacity="0.4" />
      <path d="M 20 70 Q 30 55, 45 60 T 80 55" stroke={green} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 25 75 Q 40 65, 55 70 T 82 65" stroke={navy} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M 50 25 L 50 38 M 44 31 L 56 31" stroke={navy} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="68" cy="42" r="6" fill={green} opacity="0.85" />
      <circle cx="72" cy="38" r="3" fill={green} />
      <path d="M 30 55 Q 35 48, 32 42 Q 30 38, 33 35" stroke={navy} strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
};

interface LogoLockupProps {
  size?: number;
  dark?: boolean;
}

const LogoLockup: React.FC<LogoLockupProps> = ({ size = 40, dark = false }) => (
  <div className="flex items-center gap-3">
    <Logo size={size} />
    <div className="leading-tight">
      <div className={`font-display font-semibold text-base tracking-tight ${dark ? "text-white" : "text-gpsc-navy"}`}>
        Green Pasture
      </div>
      <div className={`font-display italic text-sm ${dark ? "text-white/70" : "text-gpsc-green"}`}>
        Shepherd's Care
      </div>
    </div>
  </div>
);

// ================================================================
//  NAVIGATION (with your Firebase auth integration)
// ================================================================

interface PublicNavProps {
  loggedUser: string | null;
}

const PublicNav: React.FC<PublicNavProps> = ({ loggedUser }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "membership", label: "Membership" },
    { id: "referral", label: "Referral program" },
    { id: "faq", label: "FAQ" },
    { id: "contact", label: "Contact" },
  ];

  const handleNavClick = (id: string) => {
    alert(`Navigate to ${id} page (demo mode)`);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 gpsc-cream border-b border-gpsc-cream-dark backdrop-blur-sm bg-opacity-95">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => handleNavClick("home")} className="flex items-center">
            <LogoLockup />
          </button>
          <nav className="hidden lg:flex items-center gap-8">
            {items.map((it) => (
              <button
                key={it.id}
                onClick={() => handleNavClick(it.id)}
                className="text-sm tracking-tight transition-colors text-gpsc-stone hover:text-gpsc-navy"
              >
                {it.label}
              </button>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-3">
            {loggedUser ? (
              <>
                <span className="text-sm text-gpsc-navy">{loggedUser}</span>
                <button
                  onClick={() => auth.signOut()}
                  className="bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <a href="/signin" className="text-sm text-gpsc-navy hover:underline">
                  Sign In
                </a>
                <a
                  href="/signup"
                  className="bg-gpsc-navy text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gpsc-green transition-colors"
                >
                  Join now
                </a>
              </>
            )}
          </div>
          <button className="lg:hidden text-gpsc-navy" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="lg:hidden pb-4 space-y-3 border-t border-gpsc-cream-dark pt-4">
            {items.map((it) => (
              <button
                key={it.id}
                onClick={() => {
                  handleNavClick(it.id);
                  setMobileOpen(false);
                }}
                className="block text-sm text-gpsc-navy"
              >
                {it.label}
              </button>
            ))}
            {loggedUser ? (
              <>
                <div className="text-sm text-gpsc-navy">{loggedUser}</div>
                <button onClick={() => auth.signOut()} className="block text-sm text-red-600">
                  Log Out
                </button>
              </>
            ) : (
              <>
                <a href="/signin" className="block text-sm text-gpsc-navy">
                  Sign In
                </a>
                <a href="/signup" className="bg-gpsc-navy text-white px-5 py-2 rounded-full text-sm inline-block">
                  Join now
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

// ================================================================
//  FOOTER
// ================================================================

const Footer: React.FC = () => (
  <footer className="bg-gpsc-navy text-white">
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <LogoLockup dark />
          <p className="text-sm text-white/60 mt-4 leading-relaxed">
            A community-owned safety net for Filipino families, rooted in faith and Bayanihan spirit.
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-white/40 mb-4">Program</div>
          <ul className="space-y-2 text-sm text-white/70">
            <li><button onClick={() => alert("Membership packages")}>Membership packages</button></li>
            <li><button onClick={() => alert("Referral program")}>Referral program</button></li>
            <li><button onClick={() => alert("Benefits & claims")}>Benefits & claims</button></li>
            <li><button onClick={() => alert("Livelihood programs")}>Livelihood programs</button></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-white/40 mb-4">Company</div>
          <ul className="space-y-2 text-sm text-white/70">
            <li><button onClick={() => alert("About")}>About</button></li>
            <li><button onClick={() => alert("Officers & board")}>Officers & board</button></li>
            <li><button onClick={() => alert("Press")}>Press</button></li>
            <li><button onClick={() => alert("Contact")}>Contact</button></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-white/40 mb-4">Legal</div>
          <ul className="space-y-2 text-sm text-white/70">
            <li><button onClick={() => alert("Privacy policy")}>Privacy policy</button></li>
            <li><button onClick={() => alert("Terms of service")}>Terms of service</button></li>
            <li><button onClick={() => alert("Data privacy")}>Data privacy</button></li>
            <li><button onClick={() => alert("Refund policy")}>Refund policy</button></li>
          </ul>
        </div>
      </div>
      <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap justify-between gap-4 text-xs text-white/40">
        <div>© 2026 Green Pasture Shepherd's Care · Davao City, Philippines</div>
        <div className="italic font-display">We Care · We Serve · We Share</div>
      </div>
    </div>
  </footer>
);

// ================================================================
//  MAIN HOME COMPONENT (your original auth logic untouched)
// ================================================================

const Home: React.FC = () => {
  const [loggedUser, setLoggedUser] = useState<string | null>(null);

  // Your original Firebase auth listener – unchanged
  auth.onAuthStateChanged((user) => {
    if (user) {
      setLoggedUser(user.email);
    } else {
      setLoggedUser(null);
    }
  });

  const handleCta = (action: string) => {
    alert(`${action} (demo mode)`);
  };

  return (
    <div className="min-h-screen font-body text-gpsc-ink antialiased">
      <GlobalStyles />
      <PublicNav loggedUser={loggedUser} />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden grain-overlay">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 anim-fade-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-12 bg-gpsc-green"></div>
                <span className="text-xs tracking-[0.2em] uppercase text-gpsc-green font-medium">
                  A community-owned safety net
                </span>
              </div>
              <h1 className="font-display text-5xl lg:text-7xl text-gpsc-navy leading-[1.02] tracking-tight">
                Together in Christ,<br />
                <em className="text-gpsc-green not-italic font-medium">stronger</em> in life.
              </h1>
              <p className="mt-8 text-lg text-gpsc-stone leading-relaxed max-w-xl">
                Green Pasture Shepherd's Care is a community membership program that gives Filipino families
                affordable financial assistance, livelihood opportunities, and a network that grows with them —
                rooted in the Bayanihan spirit.
              </p>
              <div className="mt-10 flex flex-wrap gap-4 items-center">
                <button
                  onClick={() => handleCta("Become a member")}
                  className="bg-gpsc-navy text-white px-8 py-4 rounded-full font-medium hover:bg-gpsc-green transition-colors inline-flex items-center gap-2 group"
                >
                  Become a member
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => handleCta("Earn as a consultant")}
                  className="border border-gpsc-navy text-gpsc-navy px-8 py-4 rounded-full font-medium hover:bg-gpsc-navy hover:text-white transition-colors"
                >
                  Earn as a consultant
                </button>
              </div>
              <div className="mt-12 flex flex-wrap items-center gap-8 text-sm">
                <div>
                  <div className="font-display text-3xl text-gpsc-navy">2,400+</div>
                  <div className="text-gpsc-stone text-xs uppercase tracking-wider">Active members</div>
                </div>
                <div className="h-10 w-px bg-gpsc-cream-dark"></div>
                <div>
                  <div className="font-display text-3xl text-gpsc-navy">₱1.2M</div>
                  <div className="text-gpsc-stone text-xs uppercase tracking-wider">Paid in benefits</div>
                </div>
                <div className="h-10 w-px bg-gpsc-cream-dark"></div>
                <div>
                  <div className="font-display text-3xl text-gpsc-navy">14</div>
                  <div className="text-gpsc-stone text-xs uppercase tracking-wider">Provinces served</div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 relative anim-fade-up anim-delay-200">
              <div className="aspect-square relative">
                <div className="absolute inset-0 rounded-full border border-gpsc-navy/20"></div>
                <div className="absolute inset-8 rounded-full border border-gpsc-green/20"></div>
                <div className="absolute inset-16 rounded-full bg-gradient-to-br from-gpsc-cream-dark to-transparent flex items-center justify-center">
                  <Logo size={180} />
                </div>
                <div className="absolute -left-4 top-12 bg-white rounded-2xl p-4 shadow-lg max-w-[200px] border border-gpsc-cream-dark">
                  <div className="flex items-center gap-2 text-xs text-gpsc-green font-semibold mb-1">
                    <CheckCircle size={14} /> Claim approved
                  </div>
                  <div className="text-sm text-gpsc-navy">₱11,500 hospital cash sent to Maria within 4 days.</div>
                </div>
                <div className="absolute -right-4 bottom-16 bg-white rounded-2xl p-4 shadow-lg max-w-[200px] border border-gpsc-cream-dark">
                  <div className="flex items-center gap-2 text-xs text-gpsc-navy-light font-semibold mb-1">
                    <Sparkles size={14} /> Just joined
                  </div>
                  <div className="text-sm text-gpsc-navy">Pedro from Iligan signed up via Aling Nena.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THREE PILLARS */}
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

      {/* HOW IT WORKS */}
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
                  <div className="font-display text-4xl text-gpsc-green/40 group-hover:text-gpsc-green transition-colors w-16 flex-shrink-0">{step.n}</div>
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

      {/* PACKAGES */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <div className="text-xs tracking-[0.2em] uppercase text-gpsc-green mb-4">Membership packages</div>
            <h2 className="font-display text-4xl lg:text-5xl text-gpsc-navy">Pick the cover that fits your family.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative rounded-3xl p-8 transition-all ${
                  pkg.popular ? "bg-gpsc-navy text-white scale-105 shadow-2xl" : "border border-gpsc-cream-dark bg-white"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-8 bg-gpsc-green text-white text-xs px-3 py-1 rounded-full font-medium">
                    Most popular
                  </div>
                )}
                <div className={`text-xs tracking-widest uppercase mb-2 ${pkg.popular ? "text-gpsc-green-light" : "text-gpsc-green"}`}>
                  {pkg.coverage}
                </div>
                <h3 className={`font-display text-3xl mb-2 ${pkg.popular ? "text-white" : "text-gpsc-navy"}`}>
                  {pkg.name}
                </h3>
                <p className={`text-sm mb-6 italic ${pkg.popular ? "text-white/70" : "text-gpsc-stone"}`}>
                  {pkg.tagline}
                </p>
                <div className="mb-8">
                  <span className={`font-display text-5xl ${pkg.popular ? "text-white" : "text-gpsc-navy"}`}>
                    {peso(pkg.price)}
                  </span>
                  <span className={`text-sm ml-2 ${pkg.popular ? "text-white/60" : "text-gpsc-stone"}`}>one-time</span>
                </div>
                <div className={`h-px mb-6 ${pkg.popular ? "bg-white/20" : "bg-gpsc-cream-dark"}`}></div>
                <ul className="space-y-3 mb-8">
                  {pkg.benefits.slice(0, 5).map((b, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Check size={16} className={`mt-0.5 flex-shrink-0 ${pkg.popular ? "text-gpsc-green-light" : "text-gpsc-green"}`} />
                      <div>
                        <div className={pkg.popular ? "text-white" : "text-gpsc-navy"}>{b.label}</div>
                        <div className={`text-xs ${pkg.popular ? "text-white/60" : "text-gpsc-stone"}`}>{b.amount}</div>
                      </div>
                    </li>
                  ))}
                  {pkg.benefits.length > 5 && (
                    <li className={`text-xs italic ${pkg.popular ? "text-white/50" : "text-gpsc-stone"}`}>
                      + {pkg.benefits.length - 5} more benefits
                    </li>
                  )}
                </ul>
                <button
                  onClick={() => handleCta(`Choose ${pkg.name}`)}
                  className={`w-full py-3 rounded-full font-medium transition-colors ${
                    pkg.popular
                      ? "bg-gpsc-green text-white hover:bg-gpsc-green-light"
                      : "border border-gpsc-navy text-gpsc-navy hover:bg-gpsc-navy hover:text-white"
                  }`}
                >
                  Choose {pkg.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="gpsc-cream">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-24 text-center">
          <Quote size={48} className="text-gpsc-green mx-auto mb-8" />
          <p className="font-display text-3xl lg:text-4xl text-gpsc-navy leading-snug italic">
            "When my husband was admitted last February, GPSC released ₱11,500 in four days. No paperwork chaos, no
            waiting weeks. Now I refer everyone in our barangay — it's how we take care of each other."
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gpsc-navy text-white flex items-center justify-center font-display text-sm">
              MD
            </div>
            <div className="text-left">
              <div className="font-display text-lg text-gpsc-navy">Maria Dela Cruz</div>
              <div className="text-sm text-gpsc-stone">Family Care member · Davao City · Since 2024</div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
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

      <Footer />
    </div>
  );
};

export default Home;