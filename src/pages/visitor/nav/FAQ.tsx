import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { auth } from "../../../firebase/config";
import type { User } from "firebase/auth";
import { GlobalStyles } from "../GlobalStyles";
import { PublicNav } from "../PublicNav";
import { Footer } from "../Footer";

const FAQ: React.FC = () => {
  const [loggedUser, setLoggedUser] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      setLoggedUser(user?.email ?? null);
    });
    return unsubscribe;
  }, []);

  const faqs = [
    { q: "Is GPSC an insurance company?", a: "No. GPSC is a community-based membership program. We are not regulated by the Insurance Commission." },
    { q: "When can I claim benefits after joining?", a: "Each benefit has its own eligibility window: 1 month for accidental death, 5 months for natural death, 6 months for hospital cash and senior recognition, 8 months for birthday/maternity, and 10 months for the highest tiers." },
    { q: "How do I receive my commissions?", a: "Commissions are paid via GCash, bank transfer, or in person. Minimum payout is ₱500. Request from your dashboard once per week." },
    { q: "What happens if my sponsor leaves?", a: "Your membership and benefits are unaffected. Your position in the referral tree remains the same." },
    { q: "Can I cancel my membership?", a: "Yes. Unused contributions are subject to our refund policy based on tenure and claims history." },
    { q: "Is the program Christian-only?", a: "No. While GPSC is rooted in Christian values, membership is open to people of all faiths." },
  ];

  return (
    <div className="min-h-screen font-body text-gpsc-ink antialiased">
      <GlobalStyles />
      <PublicNav loggedUser={loggedUser} />
      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="font-display text-4xl text-gpsc-navy mb-8">Frequently Asked Questions</h1>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gpsc-cream-dark rounded-2xl bg-white overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-5 text-left flex items-center justify-between hover:bg-gpsc-cream/40 transition-colors"
              >
                <span className="font-display text-lg text-gpsc-navy">{faq.q}</span>
                <ChevronRight size={20} className={`text-gpsc-stone transition-transform ${openIndex === i ? "rotate-90" : ""}`} />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 text-gpsc-stone leading-relaxed border-t border-gpsc-cream-dark pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;