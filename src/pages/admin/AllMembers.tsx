import { useAllMembers } from "../../hooks/useAllMembers";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { PACKAGE_INFO } from "../../utils/types";
import type { MemberRow } from "./Members";

interface Props {
    query: string;
    packageFilter: string;
    statusFilter: string;
    onSelectMember: (member: MemberRow) => void;
    onUpdateStatus: (uid: string, status: "active" | "inactive") => Promise<void>;
}

const AllMembers = ({ query, packageFilter, statusFilter, onSelectMember, onUpdateStatus }: Props) => {
    const { members, loading } = useAllMembers();

    if (loading)
        return (
            <tbody>
                <tr>
                    <td colSpan={7} className="text-gpsc-stone p-8 text-center">
                        Loading members...
                    </td>
                </tr>
            </tbody>
        );

    const filtered = (members as MemberRow[]).filter((m) => {
        const q = query.toLowerCase();
        const matchesQuery =
            !q ||
            m.firstName?.toLowerCase().includes(q) ||
            m.lastName?.toLowerCase().includes(q) ||
            m.email?.toLowerCase().includes(q) ||
            m.city?.toLowerCase().includes(q);

        const matchesPackage = packageFilter === "all" || m.package?.toLowerCase() === packageFilter.toLowerCase();

        const matchesStatus = statusFilter === "all" || m.status?.toLowerCase() === statusFilter.toLowerCase();

        return matchesQuery && matchesPackage && matchesStatus;
    });

    if (filtered.length === 0)
        return (
            <tbody>
                <tr>
                    <td colSpan={7} className="text-gpsc-stone p-8 text-center">
                        No members match your filters.
                    </td>
                </tr>
            </tbody>
        );

    return (
        <tbody>
            {filtered.map((m) => (
                <tr key={m.uid} className="border-gpsc-cream-dark hover:bg-gpsc-cream/40 border-t transition-colors">
                    <td className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-gpsc-navy font-display flex h-9 w-9 items-center justify-center rounded-full text-xs text-white">
                                {m.firstName.charAt(0).toUpperCase() + m.lastName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <button className="text-gpsc-navy text-left font-medium hover:underline" onClick={() => onSelectMember(m)}>
                                    {m.firstName} {m.lastName}
                                </button>
                                <div className="text-gpsc-stone text-xs">{m.email}</div>
                            </div>
                        </div>
                    </td>
                    <td className="text-gpsc-stone p-4">{m.package ?? "—"}</td>
                    <td className="text-gpsc-stone p-4">{m.sponsorName ?? "—"}</td>
                    <td className="text-gpsc-stone p-4">{m.package ? (PACKAGE_INFO[m.package as keyof typeof PACKAGE_INFO]?.rank ?? "—") : "—"}</td>
                    <td className="text-gpsc-stone p-4">{m.dateCreated?.toDate?.()?.toLocaleDateString() ?? "—"}</td>
                    <td className="p-4">
                        <span
                            className={`rounded-full px-2 py-1 text-xs ${
                                m.status === "active"
                                    ? "bg-gpsc-green/10 text-gpsc-green"
                                    : m.status === "pending"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-red-100 text-red-700"
                            }`}
                        >
                            {m.status}
                        </span>
                    </td>
                    <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            <button
                                className="text-gpsc-stone hover:bg-gpsc-cream rounded p-1 transition-colors"
                                title="View details"
                                onClick={() => onSelectMember(m)}
                            >
                                <Eye size={16} />
                            </button>
                            <button
                                onClick={() => onUpdateStatus(m.uid, m.status === "active" ? "inactive" : "active")}
                                className={`rounded p-1 transition-colors ${m.status === "active" ? "text-red-500 hover:bg-red-50" : "text-gpsc-green hover:bg-gpsc-green/10"}`}
                                title={m.status === "active" ? "Deactivate" : "Activate"}
                            >
                                {m.status === "active" ? <XCircle size={16} /> : <CheckCircle size={16} />}
                            </button>
                        </div>
                    </td>
                </tr>
            ))}
        </tbody>
    );
};

export default AllMembers;
