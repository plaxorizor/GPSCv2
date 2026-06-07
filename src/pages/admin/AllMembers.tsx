import { Users } from "lucide-react";
import type { MemberRow } from "./Members";
import type { MemberWithSponsor } from "../../hooks/useAllMembers";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";

interface Props {
    members: MemberWithSponsor[];
    loading: boolean;
    query: string;
    packageFilter: string;
    statusFilter: string;
    onSelectMember: (member: MemberRow) => void;
    onUpdateStatus: (uid: string, status: "active" | "inactive") => Promise<void>;
    selectedIds: Set<string>;
    onToggleSelect: (uid: string) => void;
    canSelectActive?: boolean;
}

const COL_SPAN = 6;

const AllMembers = ({ members, loading, onSelectMember, selectedIds, onToggleSelect, canSelectActive }: Props) => {
    if (loading)
        return (
            <tbody className="animate-pulse">
                {Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-fsc-cream-dark border-t">
                        <td className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-fsc-cream-dark h-9 w-9 rounded-full" />
                                <div className="space-y-1.5">
                                    <div className="bg-fsc-cream-dark h-3.5 w-32 rounded" />
                                    <div className="bg-fsc-cream-dark h-3 w-40 rounded" />
                                </div>
                            </div>
                        </td>
                        <td className="p-4"><div className="bg-fsc-cream-dark h-5 w-20 rounded-full" /></td>
                        <td className="p-4"><div className="bg-fsc-cream-dark h-3.5 w-24 rounded" /></td>
                        <td className="p-4"><div className="bg-fsc-cream-dark h-3.5 w-20 rounded" /></td>
                        <td className="p-4"><div className="bg-fsc-cream-dark h-5 w-16 rounded-full" /></td>
                        <td className="p-4" />
                    </tr>
                ))}
            </tbody>
        );

    if (members.length === 0)
        return (
            <tbody>
                <tr>
                    <td colSpan={COL_SPAN}>
                        <EmptyState
                            icon={Users}
                            title="No members match"
                            description="Try adjusting your search, package, or status filters."
                        />
                    </td>
                </tr>
            </tbody>
        );

    return (
        <tbody>
            {(members as MemberRow[]).map((m) => (
                <tr
                    key={m.uid}
                    className="border-fsc-cream-dark hover:bg-fsc-cream/40 cursor-pointer border-t transition-colors"
                    onClick={() => onSelectMember(m)}
                >
                    <td className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-fsc-navy font-display flex h-9 w-9 items-center justify-center rounded-full text-xs text-white">
                                {m.firstName.charAt(0).toUpperCase() + m.lastName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="text-fsc-navy font-medium">
                                    {m.firstName} {m.lastName}
                                </div>
                                <div className="text-fsc-stone text-xs">{m.email}</div>
                            </div>
                        </div>
                    </td>
                    <td className="text-fsc-stone p-4">
                        <span
                            className={`inline-block rounded-full px-2 py-1 text-xs font-medium capitalize ${
                                m.package?.toLowerCase() === "premium"
                                    ? "bg-[#C9922A]/10 text-[#C9922A]"
                                    : m.package?.toLowerCase() === "family"
                                    ? "bg-fsc-navy/10 text-fsc-navy"
                                    : "bg-fsc-cream text-fsc-stone"
                            }`}
                        >
                            {m.package ?? "—"} Care
                        </span>
                    </td>
                    <td className="text-fsc-stone p-4">{m.sponsorName || "—"}</td>
                    <td className="text-fsc-stone p-4">{m.dateCreated?.toDate?.()?.toLocaleDateString() ?? "—"}</td>
                    <td className="p-4">
                        <StatusBadge status={m.archived ? "archived" : m.status} />
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {(canSelectActive || (m.status === "pending" && !m.archived)) && (
                            <input
                                type="checkbox"
                                checked={selectedIds.has(m.uid)}
                                onChange={() => onToggleSelect(m.uid)}
                                className="accent-fsc-navy h-4 w-4 cursor-pointer"
                                aria-label={`Select ${m.firstName} ${m.lastName}`}
                            />
                        )}
                    </td>
                </tr>
            ))}
        </tbody>
    );
};

export default AllMembers;
