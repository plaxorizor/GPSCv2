import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import PublicNav from "../../components/layout/PublicNav";
import { Footer } from "../../components/layout/Footer";

const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            q: "Is FaithShield Care an insurance company?",
            a: "No. FaithShield Care is a community-based membership program. We are not regulated by the Insurance Commission.",
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
    ];

    return (
        <div className="font-body text-fsc-ink flex min-h-screen flex-col antialiased">
            <PublicNav />
            <main className="anim-fade-up mx-auto w-full max-w-3xl flex-1 px-6 py-20">
                <h1 className="font-display text-fsc-navy mb-8 text-4xl">Frequently Asked Questions</h1>
                <div className="space-y-3">
                    {faqs.map((faq, i) => {
                        const isOpen = openIndex === i;
                        return (
                            <div key={i} className="border-fsc-cream-dark overflow-hidden rounded-2xl border bg-white">
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : i)}
                                    className="hover:bg-fsc-cream/40 flex w-full items-center justify-between p-5 text-left transition-colors"
                                >
                                    <span
                                        className="font-display text-fsc-navy text-lg transition-colors"
                                        style={{ color: isOpen ? "#1B2D6B" : undefined, fontWeight: isOpen ? 600 : undefined }}
                                    >
                                        {faq.q}
                                    </span>
                                    <ChevronRight
                                        size={20}
                                        className="text-fsc-stone ml-4 shrink-0"
                                        style={{
                                            transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                                            transition: "transform 300ms ease",
                                            color: isOpen ? "#C9922A" : undefined,
                                        }}
                                    />
                                </button>

                                {/* Grid trick: animates from 0fr → 1fr with no JS height measurement */}
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateRows: isOpen ? "1fr" : "0fr",
                                        transition: "grid-template-rows 300ms ease",
                                    }}
                                >
                                    <div className="overflow-hidden">
                                        <div className="text-fsc-stone border-fsc-cream-dark border-t px-5 pt-4 pb-5 leading-relaxed">{faq.a}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default FAQ;
