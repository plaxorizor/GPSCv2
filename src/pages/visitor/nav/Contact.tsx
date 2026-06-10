import React, { useState } from "react";
import { MapPin, Phone, MessageCircle, CheckCircle } from "lucide-react";
import PublicNav from "../PublicNav";
import { Footer } from "../Footer";

const Contact: React.FC = () => {
    const [sent, setSent] = useState(false);
    return (
        <div className="font-body text-fsc-ink min-h-screen antialiased flex flex-col">
            <PublicNav />
            <main className="mx-auto max-w-4xl w-full px-6 py-20 anim-fade-up flex-1">
                <h1 className="font-display text-fsc-navy mb-8 text-4xl">Get in Touch</h1>
                <div className="grid gap-12 md:grid-cols-2">
                    {/* Contact details */}
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="bg-fsc-navy flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white">
                                <MapPin size={18} />
                            </div>
                            <div>
                                <div className="font-display text-fsc-navy text-base">Main Office</div>
                                <div className="text-fsc-stone text-sm">Davao City, Davao del Sur, Philippines</div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-fsc-navy flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white">
                                <Phone size={18} />
                            </div>
                            <div>
                                <div className="font-display text-fsc-navy text-base">Phone</div>
                                <div className="text-fsc-stone text-sm">+63 976 166 5381</div>
                            </div>
                        </div>
                        {/* Email hidden for now — re-enable when official email is ready.
                        <div className="flex gap-4">
                            <div className="bg-fsc-navy flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white">
                                <Mail size={18} />
                            </div>
                            <div>
                                <div className="font-display text-fsc-navy text-base">Email</div>
                                <div className="text-fsc-stone text-sm">hello@faithshieldcare.ph · claims@faithshieldcare.ph</div>
                            </div>
                        </div>
                        */}
                        <div className="flex gap-4">
                            <div className="bg-fsc-navy flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white">
                                <MessageCircle size={18} />
                            </div>
                            <div>
                                <div className="font-display text-fsc-navy text-base">Facebook</div>
                                <a
                                    href="https://www.facebook.com/faithshieldcare"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-fsc-stone hover:text-fsc-navy text-sm transition-colors"
                                >
                                    facebook.com/faithshieldcare
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Contact form */}
                    <div className="border-fsc-cream-dark rounded-3xl border bg-white p-6">
                        <h2 className="font-display text-fsc-navy mb-4 text-2xl">Send a Message</h2>
                        {sent ? (
                            <div className="flex flex-col items-center py-10 text-center">
                                <div className="bg-fsc-green/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                                    <CheckCircle size={28} className="text-fsc-green" />
                                </div>
                                <div className="font-display text-fsc-navy text-xl">Message sent!</div>
                                <div className="text-fsc-stone mt-2 text-sm leading-relaxed">
                                    We'll get back to you within 1–2 business days.
                                </div>
                                <button
                                    onClick={() => setSent(false)}
                                    className="text-fsc-stone hover:text-fsc-navy mt-6 text-xs underline-offset-2 hover:underline transition-colors"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    setSent(true);
                                }}
                                className="space-y-4"
                            >
                                <input required type="text" placeholder="Full name" className="border-fsc-cream-dark w-full rounded-xl border px-4 py-3" />
                                <input required type="email" placeholder="Email" className="border-fsc-cream-dark w-full rounded-xl border px-4 py-3" />
                                <select className="border-fsc-cream-dark w-full rounded-xl border px-4 py-3">
                                    <option>Membership inquiry</option>
                                    <option>Claims question</option>
                                    <option>Become a consultant</option>
                                    <option>Partner with us</option>
                                    <option>Other</option>
                                </select>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Your message"
                                    className="border-fsc-cream-dark w-full rounded-xl border px-4 py-3"
                                ></textarea>
                                <button
                                    type="submit"
                                    className="bg-fsc-navy hover:bg-fsc-green w-full rounded-xl py-3 font-medium text-white transition-colors"
                                >
                                    Send Message
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Contact;
