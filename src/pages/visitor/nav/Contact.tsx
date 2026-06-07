import React from "react";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { GlobalStyles } from "../GlobalStyles";
import PublicNav from "../PublicNav";
import { Footer } from "../Footer";

const Contact: React.FC = () => {
    return (
        <div className="font-body text-gpsc-ink min-h-screen antialiased">
            <GlobalStyles />
            <PublicNav />
            <main className="mx-auto max-w-4xl px-6 py-20">
                <h1 className="font-display text-gpsc-navy mb-8 text-4xl">Get in Touch</h1>
                <div className="grid gap-12 md:grid-cols-2">
                    {/* Contact details */}
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="bg-gpsc-navy flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white">
                                <MapPin size={18} />
                            </div>
                            <div>
                                <div className="font-display text-gpsc-navy text-base">Main Office</div>
                                <div className="text-gpsc-stone text-sm">Davao City, Davao del Sur, Philippines</div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-gpsc-navy flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white">
                                <Phone size={18} />
                            </div>
                            <div>
                                <div className="font-display text-gpsc-navy text-base">Phone</div>
                                <div className="text-gpsc-stone text-sm">+63 (82) 000 0000 · +63 917 000 0000</div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-gpsc-navy flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white">
                                <Mail size={18} />
                            </div>
                            <div>
                                <div className="font-display text-gpsc-navy text-base">Email</div>
                                <div className="text-gpsc-stone text-sm">hello@gpsc.ph · claims@gpsc.ph</div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-gpsc-navy flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white">
                                <MessageCircle size={18} />
                            </div>
                            <div>
                                <div className="font-display text-gpsc-navy text-base">Facebook</div>
                                <div className="text-gpsc-stone text-sm">facebook.com/faithshieldcare</div>
                            </div>
                        </div>
                    </div>

                    {/* Contact form */}
                    <div className="border-gpsc-cream-dark rounded-3xl border bg-white p-6">
                        <h2 className="font-display text-gpsc-navy mb-4 text-2xl">Send a Message</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                alert("Message sent (demo)");
                            }}
                            className="space-y-4"
                        >
                            <input type="text" placeholder="Full name" className="border-gpsc-cream-dark w-full rounded-xl border px-4 py-3" />
                            <input type="email" placeholder="Email" className="border-gpsc-cream-dark w-full rounded-xl border px-4 py-3" />
                            <select className="border-gpsc-cream-dark w-full rounded-xl border px-4 py-3">
                                <option>Membership inquiry</option>
                                <option>Claims question</option>
                                <option>Become a consultant</option>
                                <option>Partner with us</option>
                                <option>Other</option>
                            </select>
                            <textarea
                                rows={4}
                                placeholder="Your message"
                                className="border-gpsc-cream-dark w-full rounded-xl border px-4 py-3"
                            ></textarea>
                            <button
                                type="submit"
                                className="bg-gpsc-navy hover:bg-gpsc-green w-full rounded-xl py-3 font-medium text-white transition-colors"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Contact;
