import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { GlobalStyles } from "../GlobalStyles";
import { Footer } from "../Footer";

const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            q: "Is GPSC an insurance company?",
            a: "No. GPSC is a community-based membership program. We are not regulated by the Insurance Commission.",
        },
        {
            q: "When can I claim benefits after joining?",
            a: "Each benefit has its own eligibility window: 1 month for accidental death, 5 months for natural death, 6 months for hospital cash and senior recognition, 8 months for birthday/maternity, and 10 months for the highest tiers.",
        },
        {
            q: "How do I receive my commissions?",
            a: "Commissions are paid via GCash, bank transfer, or in person. Minimum payout is ₱500. Request from your dashboard once per week.",
        },
        {
            q: "What happens if my sponsor leaves?",
            a: "Your membership and benefits are unaffected. Your position in the referral tree remains the same.",
        },
        { q: "Can I cancel my membership?", a: "Yes. Unused contributions are subject to our refund policy based on tenure and claims history." },
        { q: "Is the program Christian-only?", a: "No. While GPSC is rooted in Christian values, membership is open to people of all faiths." },
    ];

    return (
        <div className="font-body text-gpsc-ink min-h-screen antialiased">
            <GlobalStyles />
            <main className="mx-auto max-w-3xl px-6 py-20">
                <h1 className="font-display text-gpsc-navy mb-8 text-4xl">Frequently Asked Questions</h1>
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div key={i} className="border-gpsc-cream-dark overflow-hidden rounded-2xl border bg-white">
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="hover:bg-gpsc-cream/40 flex w-full items-center justify-between p-5 text-left transition-colors"
                            >
                                <span className="font-display text-gpsc-navy text-lg">{faq.q}</span>
                                <ChevronRight size={20} className={`text-gpsc-stone transition-transform ${openIndex === i ? "rotate-90" : ""}`} />
                            </button>
                            {openIndex === i && (
                                <div className="text-gpsc-stone border-gpsc-cream-dark border-t px-5 pt-4 pb-5 leading-relaxed">{faq.a}</div>
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
