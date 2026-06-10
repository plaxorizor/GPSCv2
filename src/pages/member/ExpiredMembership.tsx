import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarX, RefreshCw, LogOut } from "lucide-react";
import logo from "../../components/ui/Logo.png";
import { graceEndDate } from "../../utils/membership";
import type { Member } from "../../utils/types";

// Holding screen for members whose membership has fully EXPIRED (past the 365-day
// term + 30-day renewal grace). They keep access during grace; once expired they
// must renew — only an admin can re-activate them.
export default function ExpiredMembership({ member, onRecheck }: { member: Member; onRecheck: () => Promise<void> | void }) {
    const navigate = useNavigate();
    const [loggingOut, setLoggingOut] = useState(false);
    const [checking, setChecking] = useState(false);

    const expiredOn = graceEndDate(member);

    const logout = async () => {
        setLoggingOut(true);
        const { getAuth, signOut } = await import("firebase/auth");
        await signOut(getAuth());
        navigate("/");
    };

    // Re-read the member doc in place (no full-page reload). If they've been renewed,
    // MemberArea re-renders into the dashboard automatically.
    const checkAgain = async () => {
        if (checking) return;
        setChecking(true);
        try {
            await onRecheck();
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className="fsc-cream flex min-h-screen items-center justify-center p-4">
            <div className="border-fsc-cream-dark w-full max-w-md rounded-3xl border bg-white p-8 text-center shadow-sm">
                <img src={logo} alt="FaithShield Care" className="mx-auto mb-6 h-14 w-14 rounded-full object-contain" />

                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#C41E1E]/10">
                    <CalendarX className="text-[#C41E1E]" size={28} />
                </div>

                <h1 className="font-display text-fsc-navy text-2xl">Membership expired</h1>
                <p className="text-fsc-stone mt-3 text-sm leading-relaxed">
                    Hi <span className="text-fsc-navy font-medium">{member.firstName}</span>, your membership term and its 30-day renewal grace period
                    have ended. Renew to restore your dashboard, benefits, and referral earnings.
                </p>

                <div className="bg-fsc-cream/60 mt-5 rounded-2xl px-4 py-3 text-left text-xs">
                    <div className="text-fsc-stone flex items-center justify-between py-0.5">
                        <span>Package</span>
                        <span className="text-fsc-navy font-medium capitalize">{member.package ?? "—"} Care</span>
                    </div>
                    {expiredOn && (
                        <div className="text-fsc-stone flex items-center justify-between py-0.5">
                            <span>Grace ended</span>
                            <span className="text-fsc-navy font-medium">{expiredOn.toLocaleDateString()}</span>
                        </div>
                    )}
                    <div className="text-fsc-stone flex items-center justify-between py-0.5">
                        <span>Status</span>
                        <span className="rounded-full bg-[#C41E1E]/12 px-2 py-0.5 font-medium text-[#C41E1E]">Expired</span>
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                    <button
                        onClick={checkAgain}
                        disabled={checking}
                        className="bg-fsc-green flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-white transition-opacity disabled:opacity-60"
                    >
                        <RefreshCw size={15} className={checking ? "animate-spin" : ""} /> I've renewed — check again
                    </button>
                    <button
                        onClick={logout}
                        disabled={loggingOut}
                        className="border-fsc-cream-dark text-fsc-stone hover:bg-fsc-cream flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors disabled:opacity-60"
                    >
                        <LogOut size={15} /> {loggingOut ? "Logging out…" : "Log out"}
                    </button>
                </div>

                <p className="text-fsc-stone/70 mt-5 text-xs">To renew, contact an administrator to confirm your payment.</p>
            </div>
        </div>
    );
}
