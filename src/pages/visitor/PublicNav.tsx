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
        <header className="fsc-cream border-fsc-cream-dark bg-opacity-95 sticky top-0 z-40 border-b backdrop-blur-sm">
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <button onClick={() => handleNavClick("/")} className="flex cursor-pointer items-center gap-3">
                        <img src={logoSrc} width={40} height={40} alt="Logo" className="rounded-full object-contain" />
                        <div className="leading-tight">
                            <div className="font-display text-base font-bold tracking-tight">
                                <span className="text-fsc-navy">FaithShield </span>
                                <span className="text-fsc-red">Care</span>
                            </div>
                            <div className="font-body text-fsc-stone text-[10px] tracking-wide italic">Guided by Faith, Driven by Care</div>
                        </div>
                    </button>

                    <nav className="hidden items-center gap-8 lg:flex">
                        {items.map((it) => {
                            const isActive = pathname === it.path;
                            return (
                                <button
                                    key={it.id}
                                    onClick={() => handleNavClick(it.path)}
                                    onMouseEnter={() => setHoveredItem(it.id)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    className="relative cursor-pointer pb-1 text-sm tracking-tight"
                                    style={{ color: isActive || hoveredItem === it.id ? "#1B2D6B" : "#6B6862", fontWeight: isActive ? 600 : 400 }}
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

                    <div className="hidden items-center gap-3 lg:flex">
                        {loggedIn ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <div className="bg-fsc-navy flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white">
                                        {initials}
                                    </div>
                                    <div className="text-left leading-tight">
                                        <div className="text-fsc-navy text-sm font-medium">{firstName}</div>
                                        <div className={`text-[10px] font-medium ${isActive ? "text-fsc-green" : "text-[#A87820]"}`}>
                                            {statusLabel}
                                        </div>
                                    </div>
                                </div>
                                {isActive && (
                                    <button
                                        onClick={() => navigate("/dashboard")}
                                        className="bg-fsc-navy hover:bg-fsc-green flex cursor-pointer items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium text-white transition-colors"
                                    >
                                        <LayoutDashboard size={15} /> Dashboard
                                    </button>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="text-fsc-stone hover:text-fsc-navy flex cursor-pointer items-center gap-1 text-sm"
                                >
                                    <LogOut size={15} /> Log out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/signin" className="text-fsc-navy cursor-pointer text-sm hover:underline">
                                    Log In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="bg-fsc-navy hover:bg-fsc-green cursor-pointer rounded-full px-5 py-2.5 text-sm font-medium text-white transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    <button className="text-fsc-navy cursor-pointer lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {mobileOpen && (
                    <div className="border-fsc-cream-dark space-y-1 border-t pt-4 pb-4 lg:hidden">
                        {items.map((it) => {
                            const isActive = pathname === it.path;
                            return (
                                <button
                                    key={it.id}
                                    onClick={() => handleNavClick(it.path)}
                                    className={`flex w-full cursor-pointer items-center rounded-lg py-2 text-left text-sm transition-colors ${
                                        isActive
                                            ? "bg-fsc-cream text-fsc-navy border-l-2 border-[#C9922A] pl-3 font-semibold"
                                            : "text-fsc-navy hover:bg-fsc-cream/60 pl-4"
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
                                        onClick={() => {
                                            setMobileOpen(false);
                                            navigate("/dashboard");
                                        }}
                                        className="bg-fsc-navy flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium text-white"
                                    >
                                        <LayoutDashboard size={15} /> Dashboard
                                    </button>
                                )}
                                <button onClick={handleLogout} className="text-fsc-stone flex w-full cursor-pointer items-center gap-1 pl-4 text-sm">
                                    <LogOut size={15} /> Log out
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link to="/signin" className="text-fsc-navy mt-2 block cursor-pointer pl-4 text-sm">
                                    Log In
                                </Link>
                                <Link to="/signup" className="bg-fsc-navy inline-block cursor-pointer rounded-full px-5 py-2 text-sm text-white">
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
