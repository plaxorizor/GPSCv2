import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logoSrc from "../../components/ui/Logo.png";

export default function PublicNav(): React.ReactElement {
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    const items = [
        { id: "home", label: "Home", path: "/" },
        { id: "about", label: "About", path: "/about" },
        { id: "membership", label: "Membership", path: "/membership" },
        { id: "referral", label: "Referral Program", path: "/referral" },
        { id: "faq", label: "FAQ", path: "/faq" },
        { id: "contact", label: "Contact", path: "/contact" },
    ];

    const handleNavClick = (path: string) => {
        navigate(path);
        setMobileOpen(false);
    };

    return (
        <header className="sticky top-0 z-40 gpsc-cream border-b border-gpsc-cream-dark backdrop-blur-sm bg-opacity-95">
            <div className="max-w-6xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <button
                        onClick={() => handleNavClick("/")}
                        className="flex items-center gap-3 cursor-pointer">
                        <img src={logoSrc} width={40} height={40} alt="Logo" className="rounded-full object-contain" />
                        <div className="leading-tight">
                            <div className="font-display text-base font-semibold tracking-tight text-gpsc-navy">Faith Shield</div>
                            <div className="font-display text-xs italic text-gpsc-green">Care</div>
                        </div>
                    </button>

                    <nav className="hidden lg:flex items-center gap-8">
                        {items.map((it) => (
                            <button
                                key={it.id}
                                onClick={() => handleNavClick(it.path)}
                                onMouseEnter={() => setHoveredItem(it.id)}
                                onMouseLeave={() => setHoveredItem(null)}
                                className="text-sm tracking-tight cursor-pointer relative pb-1"
                                style={{ color: hoveredItem === it.id ? "#14365C" : "#6B6862" }}
                            >
                                {it.label}
                                <span
                                    style={{
                                        display: "block",
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        height: "2px",
                                        backgroundColor: "#5DAB3A",
                                        width: hoveredItem === it.id ? "100%" : "0%",
                                        transition: "width 0.3s ease",
                                    }}
                                />
                            </button>
                        ))}
                    </nav>

                    <div className="hidden lg:flex items-center gap-3">
                        <Link to="/signin" className="text-sm text-gpsc-navy hover:underline cursor-pointer">
                            Log In
                        </Link>
                        <Link
                            to="/signup"
                            className="bg-gpsc-navy text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gpsc-green transition-colors cursor-pointer"
                        >
                            Sign Up
                        </Link>
                    </div>

                    <button
                        className="lg:hidden text-gpsc-navy cursor-pointer"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {mobileOpen && (
                    <div className="lg:hidden pb-4 space-y-3 border-t border-gpsc-cream-dark pt-4">
                        {items.map((it) => (
                            <button
                                key={it.id}
                                onClick={() => handleNavClick(it.path)}
                                className="block text-sm text-gpsc-navy w-full text-left cursor-pointer"
                            >
                                {it.label}
                            </button>
                        ))}
                        <Link to="/signin" className="block text-sm text-gpsc-navy cursor-pointer">
                            Log In
                        </Link>
                        <Link to="/signup" className="bg-gpsc-navy text-white px-5 py-2 rounded-full text-sm inline-block cursor-pointer">
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
}