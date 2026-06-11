// admin/Settings.tsx
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import useAuth from "../../context/useAuth";
import ChangePasswordModal from "../../components/modals/ChangePasswordModal";
import { backfillPublicProfiles } from "../../firebase/publicProfiles";
import { Shield, KeyRound, Mail, Calendar, Hash, RefreshCw } from "lucide-react";

export function Settings() {
    const { currentUser } = useAuth();
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [profile, setProfile] = useState<{ firstName?: string; lastName?: string } | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [syncMsg, setSyncMsg] = useState("");

    const runBackfill = async () => {
        setSyncing(true);
        setSyncMsg("");
        try {
            const n = await backfillPublicProfiles();
            setSyncMsg(`Synced ${n} member${n === 1 ? "" : "s"} to public profiles.`);
        } catch {
            setSyncMsg("Sync failed — check your connection and try again.");
        } finally {
            setSyncing(false);
        }
    };

    useEffect(() => {
        let cancelled = false;
        if (!currentUser) return;
        getDoc(doc(db, "members", currentUser.uid)).then((snap) => {
            if (!cancelled && snap.exists()) setProfile(snap.data() as { firstName?: string; lastName?: string });
        });
        return () => {
            cancelled = true;
        };
    }, [currentUser]);

    const fullName =
        `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() || "Administrator";
    const initials =
        `${profile?.firstName?.[0] ?? ""}${profile?.lastName?.[0] ?? ""}`.toUpperCase() || "A";
    const email = currentUser?.email ?? "—";
    const joined = currentUser?.metadata?.creationTime
        ? new Date(currentUser.metadata.creationTime).toLocaleDateString("en-PH", {
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : "—";

    return (
        <div className="animate-fade-up w-full">
            {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}

            {/* Header */}
            <div className="mb-8">
                <h1 className="font-display text-fsc-navy text-2xl">Settings</h1>
                <p className="text-fsc-stone mt-1 text-sm">Manage your admin account.</p>
            </div>

            {/* Profile card */}
            <div className="border-fsc-cream-dark mb-6 rounded-2xl border bg-white p-6">
                <div className="flex items-center gap-4">
                    <div className="bg-fsc-navy flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-semibold text-white">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h2 className="font-display text-fsc-navy truncate text-lg">{fullName}</h2>
                            <span className="bg-fsc-green/10 text-fsc-green inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium">
                                <Shield size={12} />
                                Administrator
                            </span>
                        </div>
                        <p className="text-fsc-stone mt-0.5 truncate text-sm">{email}</p>
                    </div>
                </div>

                <div className="border-fsc-cream-dark mt-6 grid gap-4 border-t pt-6 sm:grid-cols-2 lg:grid-cols-3">
                    <InfoRow icon={<Mail size={15} />} label="Email" value={email} />
                    <InfoRow icon={<Calendar size={15} />} label="Admin since" value={joined} />
                    <InfoRow
                        icon={<Hash size={15} />}
                        label="Account ID"
                        value={currentUser?.uid ?? "—"}
                        mono
                    />
                </div>
            </div>

            {/* Security card */}
            <div className="border-fsc-cream-dark rounded-2xl border bg-white p-6">
                <h2 className="font-display text-fsc-navy text-lg">Security</h2>
                <p className="text-fsc-stone mt-1 text-sm">
                    Keep your account safe. Use a strong password you don't reuse elsewhere.
                </p>

                <div className="border-fsc-cream-dark mt-5 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-fsc-cream text-fsc-navy flex h-10 w-10 items-center justify-center rounded-lg">
                            <KeyRound size={18} />
                        </div>
                        <div>
                            <p className="text-fsc-navy text-sm font-medium">Password</p>
                            <p className="text-fsc-stone text-xs">••••••••••</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowChangePassword(true)}
                        className="bg-fsc-green rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                        Change Password
                    </button>
                </div>
            </div>

            {/* Maintenance card */}
            <div className="border-fsc-cream-dark mt-6 rounded-2xl border bg-white p-6">
                <h2 className="font-display text-fsc-navy text-lg">Maintenance</h2>
                <p className="text-fsc-stone mt-1 text-sm">
                    Rebuild the public member directory that powers referral trees and downline views. Safe to run
                    anytime — use it after importing members or if a downline looks out of date.
                </p>

                <div className="border-fsc-cream-dark mt-5 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-fsc-cream text-fsc-navy flex h-10 w-10 items-center justify-center rounded-lg">
                            <RefreshCw size={18} />
                        </div>
                        <div>
                            <p className="text-fsc-navy text-sm font-medium">Sync public profiles</p>
                            <p className="text-fsc-stone text-xs">{syncMsg || "Mirrors non-sensitive fields from members."}</p>
                        </div>
                    </div>
                    <button
                        onClick={runBackfill}
                        disabled={syncing}
                        className="bg-fsc-navy rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {syncing ? "Syncing…" : "Run sync"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function InfoRow({
    icon,
    label,
    value,
    mono,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="flex items-start gap-2.5">
            <span className="text-fsc-stone mt-0.5 shrink-0">{icon}</span>
            <div className="min-w-0">
                <p className="text-fsc-stone text-xs uppercase tracking-wider">{label}</p>
                <p className={`text-fsc-navy truncate text-sm ${mono ? "font-mono text-xs" : ""}`}>
                    {value}
                </p>
            </div>
        </div>
    );
}