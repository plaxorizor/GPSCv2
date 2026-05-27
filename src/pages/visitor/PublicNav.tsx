// components/PublicNav.tsx
import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; // ✅ add useNavigate
import { LogoLockup } from "./Logo";
import { auth } from "../../firebase/config";

interface PublicNavProps {
    loggedUser: string | null;
}

export default function PublicNav({ loggedUser }: PublicNavProps): React.ReactElement {
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const items = [
        { id: "home", label: "Home", path: "/" },
        { id: "about", label: "About", path: "/about" },
        { id: "membership", label: "Membership", path: "/membership" },
        { id: "referral", label: "Referral program", path: "/referral" },
        { id: "faq", label: "FAQ", path: "/faq" },
        { id: "contact", label: "Contact", path: "/contact" },
    ];

    const handleNavClick = (path: string) => {
        navigate(path);
        setMobileOpen(false);
    };

    const handleLogout = async () => {
        await auth.signOut();
        navigate("/");
    };

    return (
        <header className="sticky top-0 z-40 gpsc-cream border-b border-gpsc-cream-dark backdrop-blur-sm bg-opacity-95">
            <div className="max-w-6xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <button onClick={() => handleNavClick("/")} className="flex items-center">
                        <LogoLockup />
                    </button>

                    <nav className="hidden lg:flex items-center gap-8">
                        {items.map((it) => (
                            <button
                                key={it.id}
                                onClick={() => handleNavClick(it.path)}
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
                                    onClick={handleLogout}
                                    className="bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-red-100 transition-colors"
                                >
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/signin" className="text-sm text-gpsc-navy hover:underline">
                                    Sign In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="bg-gpsc-navy text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gpsc-green transition-colors"
                                >
                                    Join now
                                </Link>
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
                                onClick={() => handleNavClick(it.path)}
                                className="block text-sm text-gpsc-navy w-full text-left"
                            >
                                {it.label}
                            </button>
                        ))}
                        {loggedUser ? (
                            <>
                                <div className="text-sm text-gpsc-navy">{loggedUser}</div>
                                <button onClick={handleLogout} className="block text-sm text-red-600 w-full text-left">
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/signin" className="block text-sm text-gpsc-navy">
                                    Sign In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="bg-gpsc-navy text-white px-5 py-2 rounded-full text-sm inline-block"
                                >
                                    Join now
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}