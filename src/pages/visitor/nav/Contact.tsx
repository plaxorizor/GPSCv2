import React, { useState, useEffect } from "react";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { auth } from "../../../firebase/config";
import type { User } from "firebase/auth";
import { GlobalStyles } from "../GlobalStyles";
import PublicNav from "../PublicNav";
import { Footer } from "../Footer";

const Contact: React.FC = () => {
    const [loggedUser, setLoggedUser] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
            setLoggedUser(user?.email ?? null);
        });
        return unsubscribe;
    }, []);

    return (
        <div className="min-h-screen font-body text-gpsc-ink antialiased">
            <GlobalStyles />
            <PublicNav loggedUser={loggedUser} />
            <main className="max-w-4xl mx-auto px-6 py-20">
                <h1 className="font-display text-4xl text-gpsc-navy mb-8">Get in Touch</h1>
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact details */}
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gpsc-navy text-white flex items-center justify-center shrink-0">
                                <MapPin size={18} />
                            </div>
                            <div>
                                <div className="font-display text-base text-gpsc-navy">Main Office</div>
                                <div className="text-sm text-gpsc-stone">Davao City, Davao del Sur, Philippines</div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gpsc-navy text-white flex items-center justify-center shrink-0">
                                <Phone size={18} />
                            </div>
                            <div>
                                <div className="font-display text-base text-gpsc-navy">Phone</div>
                                <div className="text-sm text-gpsc-stone">+63 (82) 000 0000 · +63 917 000 0000</div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gpsc-navy text-white flex items-center justify-center shrink-0">
                                <Mail size={18} />
                            </div>
                            <div>
                                <div className="font-display text-base text-gpsc-navy">Email</div>
                                <div className="text-sm text-gpsc-stone">hello@gpsc.ph · claims@gpsc.ph</div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gpsc-navy text-white flex items-center justify-center shrink-0">
                                <MessageCircle size={18} />
                            </div>
                            <div>
                                <div className="font-display text-base text-gpsc-navy">Facebook</div>
                                <div className="text-sm text-gpsc-stone">facebook.com/greenpasture.shepherds.care</div>
                            </div>
                        </div>
                    </div>

                    {/* Contact form */}
                    <div className="bg-white rounded-3xl p-6 border border-gpsc-cream-dark">
                        <h2 className="font-display text-2xl text-gpsc-navy mb-4">Send a Message</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                alert("Message sent (demo)");
                            }}
                            className="space-y-4"
                        >
                            <input type="text" placeholder="Full name" className="w-full px-4 py-3 rounded-xl border border-gpsc-cream-dark" />
                            <input type="email" placeholder="Email" className="w-full px-4 py-3 rounded-xl border border-gpsc-cream-dark" />
                            <select className="w-full px-4 py-3 rounded-xl border border-gpsc-cream-dark">
                                <option>Membership inquiry</option>
                                <option>Claims question</option>
                                <option>Become a consultant</option>
                                <option>Partner with us</option>
                                <option>Other</option>
                            </select>
                            <textarea
                                rows={4}
                                placeholder="Your message"
                                className="w-full px-4 py-3 rounded-xl border border-gpsc-cream-dark"
                            ></textarea>
                            <button
                                type="submit"
                                className="w-full bg-gpsc-navy text-white py-3 rounded-xl font-medium hover:bg-gpsc-green transition-colors"
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
