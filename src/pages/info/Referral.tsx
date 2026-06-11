import React from "react";
import PublicNav from "../../components/layout/PublicNav";
import { Footer } from "../../components/layout/Footer";

const Referral: React.FC = () => {
    return (
        <div className="font-body text-fsc-ink flex min-h-screen flex-col antialiased">
            <PublicNav />
            <div className="anim-fade-up flex-1">
                {/* Hero */}
                <section className="fsc-cream">
                    <div className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
                        <div className="text-fsc-green mb-4 text-xs tracking-[0.2em] uppercase">Referral Program</div>
                        <h1 className="font-display text-fsc-navy mb-6 text-5xl leading-tight lg:text-6xl">
                            Earn while you help your community grow.
                        </h1>
                        <p className="text-fsc-stone max-w-2xl text-lg leading-relaxed">
                            Every member you refer earns you a commission. Build your team, rise in rank, and unlock leadership bonuses — all while
                            helping Filipino families get the support they deserve.
                        </p>
                    </div>
                </section>

                {/* Commission Table */}
                <section className="border-fsc-cream-dark border-y bg-white">
                    <div className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
                        <div className="text-fsc-green mb-4 text-xs tracking-[0.2em] uppercase">Commission structure</div>
                        <h2 className="font-display text-fsc-navy mb-10 text-3xl">6 ranks, 6 levels of earning</h2>
                        <div className="space-y-3">
                            {[
                                {
                                    level: "01",
                                    position: "Consultant",
                                    desc: "Direct referral commission on every member you personally recruit.",
                                },
                                {
                                    level: "02",
                                    position: "District Consultant",
                                    desc: "Earn from your 2nd level — members recruited by your direct referrals.",
                                },
                                {
                                    level: "03",
                                    position: "Municipal/City Consultant",
                                    desc: "Earn from your 3rd level downline as your team grows.",
                                },
                                {
                                    level: "04",
                                    position: "Provincial Consultant",
                                    desc: "Earn from your 4th level as your network expands provincially.",
                                },
                                {
                                    level: "05",
                                    position: "Regional Consultant",
                                    desc: "Earn from your 5th level as you lead a regional team.",
                                },
                                {
                                    level: "06",
                                    position: "National Consultant",
                                    desc: "Earn from your 6th level — the highest leadership rank in FaithShield Care.",
                                },
                            ].map((rank, i) => (
                                <div key={i} className="border-fsc-cream-dark flex items-center gap-6 rounded-2xl border px-6 py-4">
                                    <div className="font-display text-fsc-green/30 w-12 shrink-0 text-3xl">{rank.level}</div>
                                    <div className="flex-1">
                                        <div className="font-display text-fsc-navy text-base">{rank.position}</div>
                                        <div className="text-fsc-stone mt-0.5 text-sm">{rank.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Additional Rewards */}
                <section className="fsc-cream">
                    <div className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
                        <div className="text-fsc-green mb-4 text-xs tracking-[0.2em] uppercase">Leadership rewards</div>
                        <h2 className="font-display text-fsc-navy mb-10 text-3xl">More than just commissions</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {[
                                {
                                    title: "Car Incentive",
                                    desc: "Family Care and Premium Care consultants who reach qualifying ranks have the chance to earn their own car.",
                                },
                                {
                                    title: "Travel Rewards",
                                    desc: "Top performers enjoy local and international travel tours as recognition for their leadership.",
                                },
                                {
                                    title: "Livelihood Projects",
                                    desc: "Members and leaders get priority access to participate in FaithShield Care livelihood and skills training programs.",
                                },
                                {
                                    title: "Leadership Development",
                                    desc: "FaithShield Care invests in its leaders through training, seminars, and community service recognition programs.",
                                },
                                {
                                    title: "Community Service Recognition",
                                    desc: "Outstanding contributors to the community are recognized and rewarded by the organization.",
                                },
                                {
                                    title: "Team Building",
                                    desc: "Regular team-building events to strengthen your network and deepen community bonds.",
                                },
                            ].map((reward, i) => (
                                <div key={i} className="border-fsc-cream-dark rounded-2xl border bg-white p-6">
                                    <div className="font-display text-fsc-stone mb-1 text-xs">0{i + 1}</div>
                                    <div className="font-display text-fsc-navy mb-2 text-xl">{reward.title}</div>
                                    <div className="text-fsc-stone text-sm leading-relaxed">{reward.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="border-fsc-cream-dark border-t bg-white">
                    <div className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
                        <div className="text-fsc-green mb-4 text-xs tracking-[0.2em] uppercase">How it works</div>
                        <h2 className="font-display text-fsc-navy mb-10 text-3xl">Start earning in 3 steps</h2>
                        <div className="space-y-4">
                            {[
                                {
                                    step: "01",
                                    title: "Become a member",
                                    desc: "Sign up for any FaithShield Care membership package — Basic, Family, or Premium Care.",
                                },
                                {
                                    step: "02",
                                    title: "Get your referral link",
                                    desc: "After registration, your personal referral link and QR code are instantly available in your dashboard.",
                                },
                                {
                                    step: "03",
                                    title: "Share and earn",
                                    desc: "Share your link with family, friends, and community. Every membership they purchase earns you a 20% commission — automatically tracked and credited to your account.",
                                },
                            ].map((s, i) => (
                                <div key={i} className="border-fsc-cream-dark flex items-start gap-6 rounded-2xl border px-6 py-5">
                                    <div className="font-display text-fsc-green/30 w-12 shrink-0 text-3xl">{s.step}</div>
                                    <div>
                                        <div className="font-display text-fsc-navy mb-1 text-base">{s.title}</div>
                                        <div className="text-fsc-stone text-sm leading-relaxed">{s.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Disclaimer */}
                <section className="fsc-cream">
                    <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
                        <p className="text-fsc-stone text-center text-xs leading-relaxed italic">
                            Income from referral commissions varies based on individual sales effort. Earnings shown are examples only and are not
                            guaranteed.
                        </p>
                        <p className="text-fsc-stone text-center text-xs leading-relaxed italic">
                            FaithShield Care is a community-based membership program, not an investment scheme.
                        </p>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default Referral;
