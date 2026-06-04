import type { MemberRow } from "./Members";
import type { MemberWithSponsor } from "../../hooks/useAllMembers";

interface Props {
    members: MemberWithSponsor[];
    loading: boolean;
    query: string;
    packageFilter: string;
    statusFilter: string;
    onSelectMember: (member: MemberRow) => void;
    onUpdateStatus: (uid: string, status: "active" | "inactive") => Promise<void>;
}

const AllMembers = ({ members, loading, query, packageFilter, statusFilter, onSelectMember }: Props) => {
    if (loading)
        return (
            <tbody>
                <tr>
                    <td colSpan={5} className="text-gpsc-stone p-8 text-center">
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
                    <td colSpan={5} className="text-gpsc-stone p-8 text-center">
                        No members match your filters.
                    </td>
                </tr>
            </tbody>
        );

    return (
        <tbody>
            {filtered.map((m) => (
                <tr
                    key={m.uid}
                    className="border-gpsc-cream-dark hover:bg-gpsc-cream/40 cursor-pointer border-t transition-colors"
                    onClick={() => onSelectMember(m)}
                >
                    <td className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-gpsc-navy font-display flex h-9 w-9 items-center justify-center rounded-full text-xs text-white">
                                {m.firstName.charAt(0).toUpperCase() + m.lastName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="text-gpsc-navy font-medium">
                                    {m.firstName} {m.lastName}
                                </div>
                                <div className="text-gpsc-stone text-xs">{m.email}</div>
                            </div>
                        </div>
                    </td>
                    <td className="text-gpsc-stone p-4">
                        <span
                            className={`inline-block rounded-full px-2 py-1 text-xs font-medium capitalize ${
                                m.package?.toLowerCase() === "premium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : m.package?.toLowerCase() === "family"
                                    ? "bg-slate-100 text-slate-700"
                                    : "bg-amber-100 text-amber-700"
                            }`}
                        >
                            {m.package ?? "—"} Care
                        </span>
                    </td>
                    <td className="text-gpsc-stone p-4">{m.sponsorName || "—"}</td>
                    <td className="text-gpsc-stone p-4">{m.dateCreated?.toDate?.()?.toLocaleDateString() ?? "—"}</td>
                    <td className="p-4">
                        <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                                m.status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : m.status === "pending"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-red-100 text-red-700"
                            }`}
                        >
                            {m.status}
                        </span>
                    </td>
                </tr>
            ))}
        </tbody>
    );
};

export default AllMembers;
