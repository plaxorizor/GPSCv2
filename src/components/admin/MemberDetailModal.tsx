// components/admin/MemberDetailModal.tsx
//
// Member-detail modal for the admin Members directory: profile grid, latest
// payment proof, beneficiaries, password reset, the benefit-eligibility
// timeline, and the super-admin delete gate. Self-contained — it resolves the
// member's rank and delete-eligibility itself; the parent only supplies the
// member and the delete action.

import { useEffect, useState } from "react";
import { Check, Copy, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { getEligibilityTimeline } from "../../utils/eligibility";
import { computeRankFromTree, rankName } from "../../utils/rank";
import { buildReferralTree } from "../../firebase/referral";
import { sendMemberPasswordReset, getMemberDependencies } from "../../firebase/admin";
import type { MemberRow } from "../../pages/admin/Members";

interface Props {
    member: MemberRow;
    isSuperAdmin: boolean;
    onClose: () => void;
    /** Super-admin only: parent runs the confirm dialog + delete + refetch. */
    onRequestHardDelete: () => void;
}

type Deps = { hasDownlines: boolean; hasCommissions: boolean } | null;

export default function MemberDetailModal({ member, isSuperAdmin, onClose, onRequestHardDelete }: Props) {
    const [rank, setRank] = useState("—");
    const [deps, setDeps] = useState<Deps>(null);
    const [copied, setCopied] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [resetMsg, setResetMsg] = useState("");

    // Compute the member's recognition rank from their downline.
    // (Rank is derived, never stored — see utils/rank.ts.)
    useEffect(() => {
        let cancelled = false;
        buildReferralTree(member.uid)
            .then((tree) => rankName(computeRankFromTree(tree)))
            .catch(() => "—")
            .then((r) => {
                if (!cancelled) setRank(r);
            });
        return () => {
            cancelled = true;
        };
    }, [member.uid]);

    // For super admins, check whether this member is safe to hard-delete.
    useEffect(() => {
        if (!isSuperAdmin) return;
        let cancelled = false;
        getMemberDependencies(member.uid)
            .then((d) => {
                if (!cancelled) setDeps(d);
            })
            .catch(() => {
                if (!cancelled) setDeps(null);
            });
        return () => {
            cancelled = true;
        };
    }, [member.uid, isSuperAdmin]);

    const handleCopyReferralCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSendReset = async () => {
        if (!member.email) return;
        setResetting(true);
        setResetMsg("");
        try {
            await sendMemberPasswordReset(member.email);
            setResetMsg(`Reset link sent to ${member.email}`);
        } catch {
            setResetMsg("Could not send the reset link. Please try again.");
        } finally {
            setResetting(false);
        }
    };

    const m = member as MemberRow & {
        dateEligibility?: { toDate: () => Date };
        dateActivated?: { toDate: () => Date };
    };
    const timeline = getEligibilityTimeline(
        m.dateEligibility ?? m.dateActivated ?? (m.dateCreated as { toDate: () => Date } | undefined),
        member.package,
    );
    const unlockedCount = timeline.filter((t) => t.unlocked).length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div
                className="mx-4 flex w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── LEFT PANEL: Member Details ── */}
                <div className="max-h-[90vh] flex-1 overflow-y-auto p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-display text-fsc-navy text-xl">Member Details</h2>
                        <button onClick={onClose} className="text-fsc-stone hover:text-fsc-navy text-lg transition-colors">
                            ✕
                        </button>
                    </div>

                    {/* Avatar + basic info */}
                    <div className="bg-fsc-cream mb-6 flex items-center gap-4 rounded-xl p-4">
                        <div className="bg-fsc-navy font-display flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white">
                            {member.firstName.charAt(0).toUpperCase()}
                            {member.lastName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="font-display text-fsc-navy text-xl">
                                {member.firstName} {member.lastName}
                            </div>
                            <div className="text-fsc-stone text-sm">{member.email}</div>
                            <div className="text-fsc-stone text-sm">{member.mobile ?? member.phone ?? "—"}</div>
                        </div>
                    </div>

                    {/* Detail grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: "Package", value: member.package ? `${member.package} Care` : "—" },
                            { label: "Rank", value: rank },
                            { label: "Sponsor", value: member.sponsorName ?? "—" },
                            { label: "Referral Code", value: member.referralCode ?? "—" },
                            { label: "City", value: member.city ?? "—" },
                            { label: "Province", value: member.province ?? "—" },
                            { label: "Civil Status", value: member.civilStatus ?? "—" },
                            { label: "Birth Date", value: member.birthDate ?? "—" },
                            { label: "Joined", value: member.dateCreated?.toDate?.()?.toLocaleDateString() ?? "—" },
                            { label: "Status", value: member.status ?? "—" },
                            {
                                label: "Payment Ref",
                                value: member.paymentReference
                                    ? `${member.paymentReference}${member.paymentMethod ? ` (${member.paymentMethod})` : ""}`
                                    : "—",
                            },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <div className="text-fsc-stone mb-0.5 text-xs">{label}</div>
                                {label === "Referral Code" ? (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-fsc-navy text-sm font-medium">{value}</span>
                                        {member.referralCode && (
                                            <button
                                                onClick={() => handleCopyReferralCode(member.referralCode!)}
                                                className="text-fsc-stone hover:text-fsc-navy transition-colors"
                                                title="Copy referral code"
                                            >
                                                {copied ? <Check size={14} className="text-fsc-green" /> : <Copy size={14} />}
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div
                                        className={`text-sm font-medium ${
                                            label === "Status"
                                                ? value === "active"
                                                    ? "text-fsc-green"
                                                    : "text-[#C41E1E]"
                                                : "text-fsc-navy"
                                        }`}
                                    >
                                        {value}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Payment proof — the latest verified receipt (replaced on
                        renewal / upgrade). Older proofs live on their request docs. */}
                    {member.paymentReceiptUrl && (
                        <div className="mt-5">
                            <div className="text-fsc-stone mb-2 text-xs tracking-wider uppercase">Payment proof</div>
                            <a
                                href={member.paymentReceiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="border-fsc-cream-dark hover:border-fsc-green block overflow-hidden rounded-lg border transition-colors"
                            >
                                <img
                                    src={member.paymentReceiptUrl}
                                    alt="Payment receipt"
                                    className="max-h-72 w-full bg-white object-contain"
                                />
                            </a>
                        </div>
                    )}

                    {/* Beneficiaries */}
                    {(member.beneficiaries?.length ?? 0) > 0 && (
                        <div className="mt-5">
                            <div className="text-fsc-stone mb-2 text-xs tracking-wider uppercase">Beneficiaries</div>
                            <div className="space-y-2">
                                {member.beneficiaries!.map((b, i) => (
                                    <div key={i} className="bg-fsc-cream flex justify-between rounded-lg px-3 py-2 text-sm">
                                        <span className="text-fsc-navy font-medium">{b.name}</span>
                                        <span className="text-fsc-stone">{b.relationship}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={onClose}
                            className="border-fsc-cream-dark text-fsc-stone hover:bg-fsc-cream/60 flex-1 rounded-lg border px-4 py-2 transition-colors"
                        >
                            Close
                        </button>
                    </div>

                    {/* Password reset */}
                    <div className="border-fsc-cream-dark mt-4 border-t pt-4">
                        {member.email ? (
                            <button
                                onClick={handleSendReset}
                                disabled={resetting}
                                className="border-fsc-cream-dark text-fsc-navy hover:bg-fsc-cream/60 w-full rounded-lg border px-4 py-2 text-sm transition-colors disabled:opacity-60"
                            >
                                {resetting ? "Sending…" : "Send password reset link"}
                            </button>
                        ) : (
                            <p className="text-fsc-stone text-xs">
                                No email on file — this member logs in with their mobile-based ID. Resetting their password needs the
                                Blaze upgrade; for now, re-encode or have them change it themselves.
                            </p>
                        )}
                        {resetMsg && <p className="text-fsc-green mt-2 text-xs">{resetMsg}</p>}
                    </div>

                    {/* Super-admin: permanently delete (cleanup tool — members are never
                        deactivated or archived; inactive status is derived from expiry). */}
                    {isSuperAdmin && (
                        <div className="mt-4 space-y-2 rounded-xl border border-[#C41E1E]/20 bg-[#C41E1E]/5 p-3">
                            <div className="text-xs font-medium tracking-wider text-[#C41E1E]/80 uppercase">Super admin</div>
                            {deps && !deps.hasDownlines && !deps.hasCommissions && (
                                <button
                                    onClick={onRequestHardDelete}
                                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#C41E1E] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#A31818]"
                                >
                                    <Trash2 size={14} /> Permanently delete
                                </button>
                            )}
                            {deps && (deps.hasDownlines || deps.hasCommissions) && (
                                <p className="text-xs text-[#C41E1E]/80">
                                    Can't permanently delete — this member has {deps.hasDownlines ? "downlines" : ""}
                                    {deps.hasDownlines && deps.hasCommissions ? " and " : ""}
                                    {deps.hasCommissions ? "commission history" : ""}.
                                </p>
                            )}
                            {!deps && <p className="text-fsc-stone text-xs">Checking delete eligibility…</p>}
                        </div>
                    )}
                </div>

                {/* ── RIGHT PANEL: Eligibility Timeline ── */}
                <div className="bg-fsc-cream/40 border-fsc-cream-dark max-h-[90vh] w-72 shrink-0 overflow-y-auto border-l p-6">
                    <div className="mb-1 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-fsc-navy" />
                        <h3 className="font-display text-fsc-navy text-base">Benefit Eligibility</h3>
                    </div>
                    <p className="text-fsc-stone mb-5 text-xs">
                        {unlockedCount} of {timeline.length} benefits unlocked
                    </p>

                    {/* Progress bar */}
                    <div className="bg-fsc-cream-dark mb-6 h-1.5 w-full overflow-hidden rounded-full">
                        <div
                            className="bg-fsc-green h-full rounded-full transition-all duration-500"
                            style={{ width: `${(unlockedCount / timeline.length) * 100}%` }}
                        />
                    </div>

                    {/* Timeline items */}
                    <div className="relative">
                        {/* Vertical line */}
                        <div className="bg-fsc-cream-dark absolute top-0 bottom-0 left-2.75 w-0.5" />

                        <div className="space-y-5">
                            {timeline.map((item, i) => (
                                <div key={i} className="relative flex gap-3 pl-7">
                                    {/* Dot */}
                                    <div
                                        className={`absolute top-0.5 left-0 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                                            item.unlocked ? "border-fsc-green bg-fsc-green" : "border-fsc-cream-dark bg-white"
                                        }`}
                                    >
                                        {item.unlocked ? (
                                            <ShieldCheck size={12} className="text-white" />
                                        ) : (
                                            <ShieldOff size={12} className="text-fsc-stone/50" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div>
                                        <div
                                            className={`text-sm leading-tight font-medium ${
                                                item.unlocked ? "text-fsc-navy" : "text-fsc-stone"
                                            }`}
                                        >
                                            {item.label}
                                        </div>
                                        <div className="text-fsc-stone mt-0.5 text-xs">
                                            {item.months} month{item.months !== 1 ? "s" : ""} membership
                                        </div>
                                        {item.unlocked && (
                                            <span className="bg-fsc-green/10 text-fsc-green mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium">
                                                Unlocked
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
