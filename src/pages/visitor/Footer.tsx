import React from "react";
import logoSrc from "../../components/ui/Logo.png";

export const Footer: React.FC = () => (
  <footer className="bg-gpsc-navy text-white">
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
            <button
                        className="flex items-center cursor-pointer">
                        <img src={logoSrc} width={40} height={40} alt="Logo" />
                    </button>
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