import React from "react";
import { Quote } from "lucide-react";

export const Testimonial: React.FC = () => (
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
);