import React from "react";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { Logo } from "./Logo";

interface HeroProps {
  onCta: (action: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onCta }) => (
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
              onClick={() => onCta("Become a member")}
              className="bg-gpsc-navy text-white px-8 py-4 rounded-full font-medium hover:bg-gpsc-green transition-colors inline-flex items-center gap-2 group"
            >
              Become a member
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onCta("Earn as a consultant")}
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
);