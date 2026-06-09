import React, { useState } from "react";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logoSrc from "../../components/ui/Logo.png";
import useAuth from "../../context/useAuth";
import useMember from "../../hooks/useMember";

export default function PublicNav(): React.ReactElement {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    // Auth-aware header: a signed-in member sees their profile instead of the
    // Log In / Sign Up buttons. Pending members get no Dashboard link (they
    // can't access it yet); active members do.
    const { currentUser } = useAuth();
    const { member } = useMember();
    const loggedIn = !!currentUser;
    const status = member?.status;
    const isActive = status === "active";
    const firstName = member?.firstName || "Account";
    const initials = `${member?.firstName?.[0] ?? ""}${member?.lastName?.[0] ?? ""}`.toUpperCase() || "M";
    const statusLabel = isActive ? "Active member" : status === "pending" ? "Pending verification" : (status ?? "");

    const handleLogout = async () => {
        const { getAuth, signOut } = await import("firebase/auth");
        await signOut(getAuth());
        setMobileOpen(false);
        navigate("/");
    };

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
        <header className="sticky top-0 z-40 fsc-cream border-b border-fsc-cream-dark backdrop-blur-sm bg-opacity-95">
            <div className="max-w-6xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <button
                        onClick={() => handleNavClick("/")}
                        className="flex items-center gap-3 cursor-pointer">
                        <img src={logoSrc} width={40} height={40} alt="Logo" className="rounded-full object-contain" />
                        <div className="leading-tight">
                            <div className="font-display text-base font-bold tracking-tight">
                                <span className="text-fsc-navy">Faith Shield </span>
                                <span className="text-fsc-red">Care</span>
                            </div>
                            <div className="font-body text-[10px] tracking-wide text-fsc-stone italic">Guided by Faith, Driven by Care</div>
                        </div>
                    </button>

                    <nav className="hidden lg:flex items-center gap-8">
                        {items.map((it) => {
                            const isActive = pathname === it.path;
                            return (
                            <button
                                key={it.id}
                                onClick={() => handleNavClick(it.path)}
                                onMouseEnter={() => setHoveredItem(it.id)}
                                onMouseLeave={() => setHoveredItem(null)}
                                className="text-sm tracking-tight cursor-pointer relative pb-1"
                                style={{ color: isActive || hoveredItem === it.id ? "#1B2D6B" : "#6B6862",
                                         fontWeight: isActive ? 600 : 400 }}
                            >
                                {it.label}
                                <span
                                    style={{
                                        display: "block",
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        height: "2px",
                                        backgroundColor: "#C9922A",
                                        width: isActive || hoveredItem === it.id ? "100%" : "0%",
                                        transition: "width 0.3s ease",
                                    }}
                                />
                            </button>
                            );
                        })}
                    </nav>

                    <div className="hidden lg:flex items-center gap-3">
                        {loggedIn ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <div className="bg-fsc-navy flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white">
                                        {initials}
                                    </div>
                                    <div className="leading-tight text-left">
                                        <div className="text-fsc-navy text-sm font-medium">{firstName}</div>
                                        <div className={`text-[10px] font-medium ${isActive ? "text-fsc-green" : "text-[#A87820]"}`}>
                                            {statusLabel}
                                        </div>
                                    </div>
                                </div>
                                {isActive && (
                                    <button
                                        onClick={() => navigate("/dashboard")}
                                        className="bg-fsc-navy text-white flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fsc-green cursor-pointer"
                                    >
                                        <LayoutDashboard size={15} /> Dashboard
                                    </button>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="text-fsc-stone hover:text-fsc-navy flex items-center gap-1 text-sm cursor-pointer"
                                >
                                    <LogOut size={15} /> Log out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/signin" className="text-sm text-fsc-navy hover:underline cursor-pointer">
                                    Log In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="bg-fsc-navy text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-fsc-green transition-colors cursor-pointer"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    <button
                        className="lg:hidden text-fsc-navy cursor-pointer"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {mobileOpen && (
                    <div className="lg:hidden pb-4 space-y-1 border-t border-fsc-cream-dark pt-4">
                        {items.map((it) => {
                            const isActive = pathname === it.path;
                            return (
                                <button
                                    key={it.id}
                                    onClick={() => handleNavClick(it.path)}
                                    className={`flex w-full cursor-pointer items-center rounded-lg py-2 text-left text-sm transition-colors ${
                                        isActive
                                            ? "border-l-2 border-[#C9922A] bg-fsc-cream pl-3 font-semibold text-fsc-navy"
                                            : "pl-4 text-fsc-navy hover:bg-fsc-cream/60"
                                    }`}
                                >
                                    {it.label}
                                </button>
                            );
                        })}
                        {loggedIn ? (
                            <div className="border-fsc-cream-dark mt-2 space-y-2 border-t pt-3">
                                <div className="flex items-center gap-2 pl-4">
                                    <div className="bg-fsc-navy flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white">
                                        {initials}
                                    </div>
                                    <div className="leading-tight">
                                        <div className="text-fsc-navy text-sm font-medium">{firstName}</div>
                                        <div className={`text-[10px] font-medium ${isActive ? "text-fsc-green" : "text-[#A87820]"}`}>
                                            {statusLabel}
                                        </div>
                                    </div>
                                </div>
                                {isActive && (
                                    <button
                                        onClick={() => { setMobileOpen(false); navigate("/dashboard"); }}
                                        className="bg-fsc-navy text-white flex w-full items-center justify-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium cursor-pointer"
                                    >
                                        <LayoutDashboard size={15} /> Dashboard
                                    </button>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="text-fsc-stone flex w-full items-center gap-1 pl-4 text-sm cursor-pointer"
                                >
                                    <LogOut size={15} /> Log out
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link to="/signin" className="mt-2 block pl-4 text-sm text-fsc-navy cursor-pointer">
                                    Log In
                                </Link>
                                <Link to="/signup" className="bg-fsc-navy text-white px-5 py-2 rounded-full text-sm inline-block cursor-pointer">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}