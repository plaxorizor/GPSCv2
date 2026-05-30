import React from "react";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import logoSrc from "../../components/ui/Logo.png";

interface HeroProps {
    onCta: (action: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onCta }) => (
    <section className="grain-overlay relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-24 lg:px-8 lg:pt-24 lg:pb-32">
            <div className="grid items-center gap-12 lg:grid-cols-12">
                <div className="anim-fade-up lg:col-span-7">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="bg-gpsc-green h-px w-12"></div>
                        <span className="text-gpsc-green text-xs font-medium tracking-[0.2em] uppercase">A community-owned safety net</span>
                    </div>
                    <h1 className="font-display text-gpsc-navy text-5xl leading-[1.02] tracking-tight lg:text-7xl">
                        Together in Christ,
                        <br />
                        <em className="text-gpsc-green font-medium not-italic">stronger</em> in life.
                    </h1>
                    <p className="text-gpsc-stone mt-8 max-w-xl text-lg leading-relaxed">
                        Green Pasture Shepherd's Care is a community membership program that gives Filipino families affordable financial assistance,
                        livelihood opportunities, and a network that grows with them — rooted in the Bayanihan spirit.
                    </p>
                    <div className="mt-10 flex flex-wrap items-center gap-4">
                        <button
                            onClick={() => onCta("Become a member")}
                            className="bg-gpsc-navy hover:bg-gpsc-green group inline-flex items-center gap-2 rounded-full px-8 py-4 font-medium text-white transition-colors"
                        >
                            Become a member
                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                        </button>
                        <button
                            onClick={() => onCta("Earn as a consultant")}
                            className="border-gpsc-navy text-gpsc-navy hover:bg-gpsc-navy rounded-full border px-8 py-4 font-medium transition-colors hover:text-white"
                        >
                            Earn as a consultant
                        </button>
                    </div>
                    <div className="mt-12 flex flex-wrap items-center gap-8 text-sm">
                        <div>
                            <div className="font-display text-gpsc-navy text-3xl">2,400+</div>
                            <div className="text-gpsc-stone text-xs tracking-wider uppercase">Active members</div>
                        </div>
                        <div className="bg-gpsc-cream-dark h-10 w-px"></div>
                        <div>
                            <div className="font-display text-gpsc-navy text-3xl">₱1.2M</div>
                            <div className="text-gpsc-stone text-xs tracking-wider uppercase">Paid in benefits</div>
                        </div>
                        <div className="bg-gpsc-cream-dark h-10 w-px"></div>
                        <div>
                            <div className="font-display text-gpsc-navy text-3xl">14</div>
                            <div className="text-gpsc-stone text-xs tracking-wider uppercase">Provinces served</div>
                        </div>
                    </div>
                </div>
                <div className="anim-fade-up anim-delay-200 relative lg:col-span-5">
                    <div className="relative aspect-square">
                        <div className="border-gpsc-navy/20 absolute inset-0 rounded-full border"></div>
                        <div className="border-gpsc-green/20 absolute inset-8 rounded-full border"></div>
                        <div className="from-gpsc-cream-dark absolute inset-16 flex items-center justify-center rounded-full bg-linear-to-br to-transparent">
                            <img src={logoSrc} width={125} height={125} alt="Logo" />
                        </div>
                        <div className="border-gpsc-cream-dark absolute top-12 -left-4 max-w-50 rounded-2xl border bg-white p-4 shadow-lg">
                            <div className="text-gpsc-green mb-1 flex items-center gap-2 text-xs font-semibold">
                                <CheckCircle size={14} /> Claim approved
                            </div>
                            <div className="text-gpsc-navy text-sm">₱11,500 hospital cash sent to Maria within 4 days.</div>
                        </div>
                        <div className="border-gpsc-cream-dark absolute -right-4 bottom-16 max-w-50 rounded-2xl border bg-white p-4 shadow-lg">
                            <div className="text-gpsc-navy-light mb-1 flex items-center gap-2 text-xs font-semibold">
                                <Sparkles size={14} /> Just joined
                            </div>
                            <div className="text-gpsc-navy text-sm">Pedro from Iligan signed up via Aling Nena.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);
