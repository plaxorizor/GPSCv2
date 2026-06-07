import React from "react";

/**
 * Single source of truth for every status pill across the app (claims,
 * commissions, payouts, members, referrals). Keeps shape, padding, colour and
 * label consistent so the same status never renders two different ways.
 */

type Tone = "success" | "yellow" | "warning" | "danger" | "info" | "slate" | "neutral";

// Explicit hex + opacity so each pill renders reliably (the project's
// `fsc-*` classes are static and drop the /opacity modifier). Note: in this
// codebase "fsc-green" is actually gold, so success uses a real green here.
const TONE_CLASSES: Record<Tone, string> = {
    success: "bg-[#16A34A]/12 text-[#15803D]", // green  — active / approved / released / paid / sent
    yellow: "bg-[#EAB308]/20 text-[#854D0E]", // yellow — pending
    warning: "bg-[#C9922A]/15 text-[#A87820]", // gold   — under review / requested
    danger: "bg-[#C41E1E]/10 text-[#C41E1E]", // red    — rejected
    info: "bg-[#1B2D6B]/10 text-[#1B2D6B]", // navy   — submitted
    slate: "bg-[#64748B]/15 text-[#475569]", // gray   — inactive (switched off)
    neutral: "bg-[#6B6862]/12 text-[#6B6862]", // stone  — archived
};

// Maps a raw status string (any casing) to a tone + display label.
const STATUS_MAP: Record<string, { tone: Tone; label: string }> = {
    // Claims
    submitted: { tone: "info", label: "Submitted" },
    under_review: { tone: "warning", label: "Under review" },
    approved: { tone: "success", label: "Approved" },
    rejected: { tone: "danger", label: "Rejected" },
    released: { tone: "success", label: "Released" },
    // Commissions / payouts
    pending: { tone: "yellow", label: "Pending" },
    paid: { tone: "success", label: "Paid" },
    requested: { tone: "warning", label: "Requested" },
    sent: { tone: "success", label: "Sent" },
    // Members
    active: { tone: "success", label: "Active" },
    inactive: { tone: "slate", label: "Inactive" },
    archived: { tone: "neutral", label: "Archived" },
};

const humanize = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

interface Props {
    status: string;
    className?: string;
}

export const StatusBadge: React.FC<Props> = ({ status, className = "" }) => {
    const key = status?.toLowerCase?.() ?? "";
    const entry = STATUS_MAP[key] ?? { tone: "neutral" as Tone, label: humanize(status ?? "—") };
    return (
        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASSES[entry.tone]} ${className}`}>{entry.label}</span>
    );
};

export default StatusBadge;
