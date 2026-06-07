import React from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Standard "nothing here yet" panel: icon in a soft circle, a headline, a short
 * explanation, and an optional call-to-action. Replaces the bare gray text that
 * used to leave list/table sections looking broken.
 *
 * Use `inTable` when rendering inside a <td> so it doesn't add a second border,
 * and `compact` to tighten the vertical padding for smaller cards.
 */

interface Action {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
}

interface Props {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: Action;
    secondaryAction?: React.ReactNode;
    compact?: boolean;
    className?: string;
}

export const EmptyState: React.FC<Props> = ({ icon: Icon, title, description, action, secondaryAction, compact = false, className = "" }) => {
    const ActionIcon = action?.icon;
    return (
        <div className={`text-center ${compact ? "px-6 py-8" : "px-6 py-14"} ${className}`}>
            <div className="bg-fsc-cream mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                <Icon size={22} className="text-fsc-stone" />
            </div>
            <div className="font-display text-fsc-navy text-lg">{title}</div>
            {description && <div className="text-fsc-stone mx-auto mt-1 max-w-sm text-sm">{description}</div>}
            {action && (
                <button
                    onClick={action.onClick}
                    className="bg-fsc-navy hover:bg-fsc-green mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white transition-colors"
                >
                    {ActionIcon && <ActionIcon size={14} />}
                    {action.label}
                </button>
            )}
            {secondaryAction && <div className="mt-4">{secondaryAction}</div>}
        </div>
    );
};

export default EmptyState;
