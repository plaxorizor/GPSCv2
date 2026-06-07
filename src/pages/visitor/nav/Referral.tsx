import React from "react";
import { GlobalStyles } from "../GlobalStyles";
import PublicNav from "../PublicNav";
import { Footer } from "../Footer";

const Referral: React.FC = () => {
    return (
        <div className="min-h-screen font-body text-gpsc-ink antialiased">
            <GlobalStyles />
            <PublicNav />

            {/* Hero */}
            <section className="gpsc-cream max-w-4xl mx-auto px-6 lg:px-8 py-20">
                <div className="text-xs tracking-[0.2em] uppercase text-gpsc-green mb-4">Referral Program</div>
                <h1 className="font-display text-5xl lg:text-6xl text-gpsc-navy leading-tight mb-6">
                    Earn while you help your community grow.
                </h1>
                <p className="text-gpsc-stone text-lg leading-relaxed max-w-2xl">
                    Every member you refer earns you a commission. Build your team, rise in rank, and unlock leadership bonuses — all while helping Filipino families get the support they deserve.
                </p>
            </section>

            {/* Commission Table */}
            <section className="bg-white border-y border-gpsc-cream-dark">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20">
                    <div className="text-xs tracking-[0.2em] uppercase text-gpsc-green mb-4">Commission structure</div>
                    <h2 className="font-display text-3xl text-gpsc-navy mb-10">6 ranks, 6 levels of earning</h2>
                    <div className="space-y-3">
                        {[
                            { level: "01", position: "Sales Consultant", commission: "20%", desc: "Direct referral commission on every member you personally recruit." },
                            { level: "02", position: "Team Consultant", commission: "5%", desc: "Earn from your 2nd level — members recruited by your direct referrals." },
                            { level: "03", position: "Sales Manager", commission: "3%", desc: "Earn from your 3rd level downline as your team grows." },
                            { level: "04", position: "Provincial Director", commission: "2%", desc: "Earn from your 4th level as your network expands provincially." },
                            { level: "05", position: "Regional Director", commission: "1%", desc: "Earn from your 5th level as you lead a regional team." },
                            { level: "06", position: "National Director", commission: "1%", desc: "Earn from your 6th level — the highest leadership rank in Faith Shield Care." },
                        ].map((rank, i) => (
                            <div key={i} className="border border-gpsc-cream-dark rounded-2xl px-6 py-4 flex items-center gap-6">
                                <div className="font-display text-3xl text-gpsc-green/30 w-12 shrink-0">{rank.level}</div>
                                <div className="flex-1">
                                    <div className="font-display text-gpsc-navy text-base">{rank.position}</div>
                                    <div className="text-sm text-gpsc-stone mt-0.5">{rank.desc}</div>
                                </div>
                                <div className="font-display text-2xl text-gpsc-green shrink-0">{rank.commission}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Additional Rewards */}
            <section className="gpsc-cream max-w-4xl mx-auto px-6 lg:px-8 py-20">
                <div className="text-xs tracking-[0.2em] uppercase text-gpsc-green mb-4">Leadership rewards</div>
                <h2 className="font-display text-3xl text-gpsc-navy mb-10">More than just commissions</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    {[
                        { title: "Car Incentive", desc: "Family Care and Premium Care consultants who reach qualifying ranks have the chance to earn their own car." },
                        { title: "Travel Rewards", desc: "Top performers enjoy local and international travel tours as recognition for their leadership." },
                        { title: "Livelihood Projects", desc: "Members and leaders get priority access to participate in Faith Shield Care livelihood and skills training programs." },
                        { title: "Leadership Development", desc: "Faith Shield Care invests in its leaders through training, seminars, and community service recognition programs." },
                        { title: "Community Service Recognition", desc: "Outstanding contributors to the community are recognized and rewarded by the organization." },
                        { title: "Team Building", desc: "Regular team-building events to strengthen your network and deepen community bonds." },
                    ].map((reward, i) => (
                        <div key={i} className="border border-gpsc-cream-dark rounded-2xl p-6 bg-white">
                            <div className="font-display text-xs text-gpsc-stone mb-1">0{i + 1}</div>
                            <div className="font-display text-xl text-gpsc-navy mb-2">{reward.title}</div>
                            <div className="text-sm text-gpsc-stone leading-relaxed">{reward.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="bg-white border-t border-gpsc-cream-dark">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20">
                    <div className="text-xs tracking-[0.2em] uppercase text-gpsc-green mb-4">How it works</div>
                    <h2 className="font-display text-3xl text-gpsc-navy mb-10">Start earning in 3 steps</h2>
                    <div className="space-y-4">
                        {[
                            { step: "01", title: "Become a member", desc: "Sign up for any Faith Shield Care membership package — Basic, Family, or Premium Care." },
                            { step: "02", title: "Get your referral link", desc: "After registration, your personal referral link and QR code are instantly available in your dashboard." },
                            { step: "03", title: "Share and earn", desc: "Share your link with family, friends, and community. Every membership they purchase earns you a 20% commission — automatically tracked and credited to your account." },
                        ].map((s, i) => (
                            <div key={i} className="border border-gpsc-cream-dark rounded-2xl px-6 py-5 flex items-start gap-6">
                                <div className="font-display text-3xl text-gpsc-green/30 w-12 shrink-0">{s.step}</div>
                                <div>
                                    <div className="font-display text-gpsc-navy text-base mb-1">{s.title}</div>
                                    <div className="text-sm text-gpsc-stone leading-relaxed">{s.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Disclaimer */}
            <section className="gpsc-cream max-w-4xl mx-auto px-6 lg:px-8 py-12">
                <p className="text-xs text-gpsc-stone leading-relaxed text-center italic">
                    Income from referral commissions varies based on individual sales effort. Earnings shown are examples only and are not guaranteed.
                    Faith Shield Care is a community-based membership program, not an investment scheme.
                </p>
            </section>

            <Footer />
        </div>
    );
};

export default Referral;