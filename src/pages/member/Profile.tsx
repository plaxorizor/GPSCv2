import React, { useRef, useState } from "react";
import { Edit, Lock, Shield, LogOut, Mail, Phone, MapPin, Package, Calendar, Hash, Activity, Camera } from "lucide-react";
import { PACKAGE_INFO } from "../../utils/types";
import type { Member } from "../../utils/types";

interface Props {
    user: Member;
    packageName?: string;
    rankName?: string;
    onEditProfile?: () => void;
    onChangePassword?: () => void;
    onEnable2FA?: () => void;
    onLogout: () => void;
}

export const MemberProfile: React.FC<Props> = ({
    user,
    onEditProfile,
    onChangePassword,
    onEnable2FA,
    onLogout,
}) => {
    const pkgInfo = user.package ? PACKAGE_INFO[user.package] : null;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setAvatarUrl(url);
    };

    const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Member";
    const initials =
        `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "M";
    const joined = user.dateCreated?.toDate?.()?.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }) ?? "—";

    return (
        <div className="animate-fade-up w-full">
            {/* Header */}
            <div className="mb-8">
                <h1 className="font-display text-gpsc-navy text-2xl">Profile</h1>
                <p className="text-gpsc-stone mt-1 text-sm">Manage your personal information and account settings.</p>
            </div>

            {/* Profile card */}
            <div className="border-gpsc-cream-dark mb-6 rounded-2xl border bg-white p-6">
                <div className="flex items-center gap-4">
                    {/* Avatar with upload overlay */}
                    <div className="relative shrink-0">
                        <div className="bg-gpsc-navy flex h-16 w-16 items-center justify-center overflow-hidden rounded-full text-xl font-semibold text-white">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                initials
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-gpsc-cream-dark shadow-sm text-gpsc-stone hover:text-gpsc-navy transition-colors"
                            title="Change profile photo"
                        >
                            <Camera size={12} />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h2 className="font-display text-gpsc-navy truncate text-lg">{fullName}</h2>
                            {user.status && (
                                <span className="bg-gpsc-green/10 text-gpsc-green inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize">
                                    <Activity size={12} />
                                    {user.status}
                                </span>
                            )}
                        </div>
                        <p className="text-gpsc-stone mt-0.5 truncate text-sm">{user.email}</p>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-gpsc-stone mt-1 flex items-center gap-1 text-xs hover:text-gpsc-navy transition-colors"
                        >
                            <Camera size={11} /> Change photo
                        </button>
                    </div>
                </div>

                <div className="border-gpsc-cream-dark mt-6 grid gap-4 border-t pt-6 sm:grid-cols-2 lg:grid-cols-3">
                    <InfoRow icon={<Mail size={15} />} label="Email" value={user.email ?? "—"} />
                    <InfoRow icon={<Phone size={15} />} label="Mobile" value={user.mobile ?? "—"} />
                    <InfoRow
                        icon={<MapPin size={15} />}
                        label="Location"
                        value={[user.city, user.province].filter(Boolean).join(", ") || "—"}
                    />
                    <InfoRow icon={<Calendar size={15} />} label="Member since" value={joined} />
                    <InfoRow icon={<Package size={15} />} label="Package" value={user.package ?? "—"} />
                    <InfoRow icon={<Hash size={15} />} label="Rank" value={pkgInfo?.rank ?? "—"} />
                </div>

                <div className="border-gpsc-cream-dark mt-5 border-t pt-5">
                    <button
                        onClick={onEditProfile}
                        className="text-gpsc-green flex items-center gap-1.5 text-sm hover:underline"
                    >
                        <Edit size={13} /> Edit Details
                    </button>
                </div>
            </div>

            {/* Security card */}
            <div className="border-gpsc-cream-dark mb-6 rounded-2xl border bg-white p-6">
                <h2 className="font-display text-gpsc-navy text-lg">Security</h2>
                <p className="text-gpsc-stone mt-1 text-sm">
                    Keep your account safe. Use a strong password you don't reuse elsewhere.
                </p>

                <div className="mt-5 flex flex-col gap-3">
                    <div className="border-gpsc-cream-dark flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-gpsc-cream text-gpsc-navy flex h-10 w-10 items-center justify-center rounded-lg">
                                <Lock size={18} />
                            </div>
                            <div>
                                <p className="text-gpsc-navy text-sm font-medium">Password</p>
                                <p className="text-gpsc-stone text-xs">••••••••••</p>
                            </div>
                        </div>
                        <button
                            onClick={onChangePassword}
                            className="bg-gpsc-green rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                        >
                            Change Password
                        </button>
                    </div>

                    <div className="border-gpsc-cream-dark flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-gpsc-cream text-gpsc-navy flex h-10 w-10 items-center justify-center rounded-lg">
                                <Shield size={18} />
                            </div>
                            <div>
                                <p className="text-gpsc-navy text-sm font-medium">Two-Factor Authentication</p>
                                <p className="text-gpsc-stone text-xs">Add an extra layer of security to your account.</p>
                            </div>
                        </div>
                        <button
                            onClick={onEnable2FA}
                            className="border-gpsc-cream-dark rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
                        >
                            Enable 2FA
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile-only sign out — desktop uses sidebar */}
            <div className="lg:hidden">
                <button
                    onClick={onLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                >
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </div>
    );
};

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
            <span className="text-gpsc-stone mt-0.5 shrink-0">{icon}</span>
            <div className="min-w-0">
                <p className="text-gpsc-stone text-xs uppercase tracking-wider">{label}</p>
                <p className={`text-gpsc-navy truncate text-sm ${mono ? "font-mono text-xs" : ""}`}>
                    {value}
                </p>
            </div>
        </div>
    );
}