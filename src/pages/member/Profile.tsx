import React from "react";
import { Edit, Lock, Shield, LogOut } from "lucide-react";
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

export const MemberProfile: React.FC<Props> = ({ user, onChangePassword, onEnable2FA, onLogout }) => {
    const pkgInfo = user.package ? PACKAGE_INFO[user.package] : null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display text-gpsc-navy text-3xl">Profile</h1>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6 lg:col-span-2">
                    <div className="border-gpsc-cream-dark rounded-2xl border bg-white p-6">
                        <h2 className="font-display text-gpsc-navy mb-4 text-lg">Personal Information</h2>
                        <div className="grid gap-4 text-sm sm:grid-cols-2">
                            <div>
                                <div className="text-gpsc-stone mb-1 text-xs tracking-wider uppercase">First name:</div>
                                <div className="text-gpsc-navy">{user.firstName}</div>
                            </div>
                            <div>
                                <div className="text-gpsc-stone mb-1 text-xs tracking-wider uppercase">Last name:</div>
                                <div className="text-gpsc-navy">{user.lastName}</div>
                            </div>
                            <div>
                                <div className="text-gpsc-stone mb-1 text-xs tracking-wider uppercase">Email:</div>
                                <div className="text-gpsc-navy">{user.email}</div>
                            </div>
                            <div>
                                <div className="text-gpsc-stone mb-1 text-xs tracking-wider uppercase">Mobile:</div>
                                <div className="text-gpsc-navy">{user.mobile}</div>
                            </div>
                            <div>
                                <div className="text-gpsc-stone mb-1 text-xs tracking-wider uppercase">City:</div>
                                <div className="text-gpsc-navy">{user.city}</div>
                            </div>
                            <div>
                                <div className="text-gpsc-stone mb-1 text-xs tracking-wider uppercase">Province:</div>
                                <div className="text-gpsc-navy">{user.province}</div>
                            </div>
                        </div>
                        <button className="text-gpsc-green mt-6 flex items-center gap-1 text-sm hover:underline">
                            <Edit size={12} /> Edit Details
                        </button>
                    </div>
                    
                </div>

                <div className="space-y-6">
                    <div className="border-gpsc-cream-dark rounded-2xl border bg-white p-6">
                        <h2 className="font-display text-gpsc-navy mb-4 text-lg">Membership</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gpsc-stone">Package</span>
                                <span className="text-gpsc-navy font-medium">{user.package ?? "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gpsc-stone">Member since</span>
                                <span className="text-gpsc-navy">{user.dateCreated?.toDate?.()?.toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gpsc-stone">Status</span>
                                <span className="text-gpsc-stone">{user.status}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gpsc-stone">Rank</span>
                                <span className="text-gpsc-navy">{pkgInfo?.rank ?? "—"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-gpsc-cream-dark rounded-2xl border bg-white p-6">
                        <h2 className="font-display text-gpsc-navy mb-4 text-lg">Security</h2>
                        <div className="space-y-3">
                            <button
                                onClick={onChangePassword}
                                className="border-gpsc-cream-dark hover:bg-gpsc-cream/40 flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm"
                            >
                                <Lock size={16} className="text-gpsc-stone" /> Change password
                            </button>
                            <button
                                onClick={onEnable2FA}
                                className="border-gpsc-cream-dark hover:bg-gpsc-cream/40 flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm "
                            >
                                <Shield size={16} className="text-gpsc-stone" /> Enable 2FA
                            </button>
                        </div>
                    </div>

                    {/* Mobile-only sign out — desktop uses sidebar */}
                    <div className="lg:hidden">
                        <button
                            onClick={onLogout}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                        >
                            <LogOut size={16} /> Sign out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
