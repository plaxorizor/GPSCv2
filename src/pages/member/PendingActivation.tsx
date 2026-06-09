import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Hourglass, RefreshCw, LogOut } from "lucide-react";
import logo from "../../components/ui/Logo.png";
import type { Member } from "../../utils/types";

// Holding screen for members whose account is still PENDING. They can sign in
// (so they know registration worked) but can't reach the dashboard until an
// admin activates them — per the golden rule, only an admin can do that.
export default function PendingActivation({ member }: { member: Member }) {
    const navigate = useNavigate();
    const [loggingOut, setLoggingOut] = useState(false);
    const [checking, setChecking] = useState(false);

    const logout = async () => {
        setLoggingOut(true);
        const { getAuth, signOut } = await import("firebase/auth");
        await signOut(getAuth());
        navigate("/");
    };

    const checkAgain = () => {
        setChecking(true);
        window.location.reload(); // re-reads status; activated members fall through to the dashboard
    };

    return (
        <div className="fsc-cream flex min-h-screen items-center justify-center p-4">
            <div className="border-fsc-cream-dark w-full max-w-md rounded-3xl border bg-white p-8 text-center shadow-sm">
                <img src={logo} alt="Faith Shield Care" className="mx-auto mb-6 h-14 w-14 rounded-full object-contain" />

                <div className="bg-[#C9922A]/10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full">
                    <Hourglass className="text-[#C9922A]" size={28} />
                </div>

                <h1 className="font-display text-fsc-navy text-2xl">Account pending activation</h1>
                <p className="text-fsc-stone mt-3 text-sm leading-relaxed">
                    Hi <span className="text-fsc-navy font-medium">{member.firstName}</span>, your account has been created and is
                    now waiting for an administrator to activate it. You'll get full access to your dashboard once it's approved.
                </p>

                <div className="bg-fsc-cream/60 mt-5 rounded-2xl px-4 py-3 text-left text-xs">
                    <div className="text-fsc-stone flex items-center justify-between py-0.5">
                        <span>Email</span>
                        <span className="text-fsc-navy font-medium">{member.email}</span>
                    </div>
                    <div className="text-fsc-stone flex items-center justify-between py-0.5">
                        <span>Package</span>
                        <span className="text-fsc-navy font-medium capitalize">{member.package ?? "—"} Care</span>
                    </div>
                    <div className="text-fsc-stone flex items-center justify-between py-0.5">
                        <span>Status</span>
                        <span className="rounded-full bg-[#C9922A]/15 px-2 py-0.5 font-medium text-[#A87820]">Pending</span>
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                    <button
                        onClick={checkAgain}
                        disabled={checking}
                        className="bg-fsc-green flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-white transition-opacity disabled:opacity-60"
                    >
                        <RefreshCw size={15} className={checking ? "animate-spin" : ""} /> Check again
                    </button>
                    <button
                        onClick={logout}
                        disabled={loggingOut}
                        className="border-fsc-cream-dark text-fsc-stone hover:bg-fsc-cream flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors disabled:opacity-60"
                    >
                        <LogOut size={15} /> {loggingOut ? "Logging out…" : "Log out"}
                    </button>
                </div>

                <p className="text-fsc-stone/70 mt-5 text-xs">Need help? Contact your referrer or an administrator.</p>
            </div>
        </div>
    );
}
