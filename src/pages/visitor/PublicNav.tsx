import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { LogoLockup } from "./Logo";
import { auth } from "../../firebase/config"; // ✅ correct path

interface PublicNavProps {
    loggedUser: string | null;
}

export default function PublicNav({ loggedUser }: PublicNavProps): React.ReactElement {
    const [mobileOpen, setMobileOpen] = useState(false);
    const items = [
        { id: "home", label: "Home" },
        { id: "about", label: "About" },
        { id: "membership", label: "Membership" },
        { id: "referral", label: "Referral program" },
        { id: "faq", label: "FAQ" },
        { id: "contact", label: "Contact" },
    ];

    const handleNavClick = (id: string) => {
        alert(`Navigate to ${id} page (demo mode)`);
        setMobileOpen(false);
    };

    return (
        <header className="sticky top-0 z-40 gpsc-cream border-b border-gpsc-cream-dark backdrop-blur-sm bg-opacity-95">
            <div className="max-w-6xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <button onClick={() => handleNavClick("home")} className="flex items-center">
                        <LogoLockup />
                    </button>
                    <nav className="hidden lg:flex items-center gap-8">
                        {items.map((it) => (
                            <button
                                key={it.id}
                                onClick={() => handleNavClick(it.id)}
                                className="text-sm tracking-tight transition-colors text-gpsc-stone hover:text-gpsc-navy"
                            >
                                {it.label}
                            </button>
                        ))}
                    </nav>
                    <div className="hidden lg:flex items-center gap-3">
                        {loggedUser ? (
                            <>
                                <span className="text-sm text-gpsc-navy">{loggedUser}</span>
                                <button
                                    onClick={() => auth.signOut()}
                                    className="bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-red-100 transition-colors"
                                >
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <>
                                <a href="/SignIn" className="text-sm text-gpsc-navy hover:underline">
                                    Sign In
                                </a>
                                <a
                                    href="/SignUp"
                                    className="bg-gpsc-navy text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gpsc-green transition-colors"
                                >
                                    Join now
                                </a>
                            </>
                        )}
                    </div>
                    <button className="lg:hidden text-gpsc-navy" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
                {mobileOpen && (
                    <div className="lg:hidden pb-4 space-y-3 border-t border-gpsc-cream-dark pt-4">
                        {items.map((it) => (
                            <button
                                key={it.id}
                                onClick={() => {
                                    handleNavClick(it.id);
                                    setMobileOpen(false);
                                }}
                                className="block text-sm text-gpsc-navy"
                            >
                                {it.label}
                            </button>
                        ))}
                        {loggedUser ? (
                            <>
                                <div className="text-sm text-gpsc-navy">{loggedUser}</div>
                                <button onClick={() => auth.signOut()} className="block text-sm text-red-600">
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <>
                                <a href="/SignIn" className="block text-sm text-gpsc-navy">
                                    Sign In
                                </a>
                                <a href="/SignUp" className="bg-gpsc-navy text-white px-5 py-2 rounded-full text-sm inline-block">
                                    Join now
                                </a>
                            </>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
