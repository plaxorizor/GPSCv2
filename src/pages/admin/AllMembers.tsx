import { useAllMembers } from "../../hooks/useAllMembers";
import { Eye, MoreVertical, CheckCircle, XCircle } from "lucide-react";
import { PACKAGE_INFO } from "../../pages/types";

const AllMembers = () => {
    const { members, loading } = useAllMembers();

    const onUpdateStatus = (uid: string, status: string) => {
        console.log(uid, status);
    };
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="bg-gpsc-cream-dark mb-4 h-8 w-32 rounded"></div>
                    <div className="bg-gpsc-cream-dark h-96 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    return (
        <tbody>
            {members.map((m) => (
                <tr key={m.uid} className="border-gpsc-cream-dark hover:bg-gpsc-cream/40 border-t transition-colors">
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
                    <td className="text-gpsc-stone p-4">{m.package}</td>
                    <td className="text-gpsc-stone p-4">{m.sponsorName}</td>
                    <td className="text-gpsc-stone p-4">{m.package ? (PACKAGE_INFO[m.package]?.rank ?? "—") : "—"}</td>
                    <td className="text-gpsc-stone p-4">{m.dateCreated?.toDate?.()?.toLocaleDateString() ?? "—"}</td>
                    <td className="p-4">
                        <span
                            className={`rounded-full px-2 py-1 text-xs ${m.status === "active" ? "bg-gpsc-green/10 text-gpsc-green" : m.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}
                        >
                            {m.status}
                        </span>
                    </td>
                    <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            <button
                                className="text-gpsc-stone hover:bg-gpsc-cream rounded p-1 transition-colors"
                                title="View details"
                                onClick={() => {}}
                            >
                                <Eye size={16} />
                            </button>
                            {/* TODO: add view member modal */}
                            <button
                                onClick={() => onUpdateStatus(m.uid, m.status === "active" ? "inactive" : "active")}
                                className={`rounded p-1 transition-colors ${m.status === "active" ? "text-red-500 hover:bg-red-50" : "text-gpsc-green hover:bg-gpsc-green/10"}`}
                                title={m.status === "active" ? "Deactivate" : "Activate"}
                            >
                                {m.status === "active" ? <XCircle size={16} /> : <CheckCircle size={16} />}
                            </button>
                            <button className="text-gpsc-stone hover:bg-gpsc-cream rounded p-1 transition-colors">
                                <MoreVertical size={16} />
                            </button>
                        </div>
                    </td>
                </tr>
            ))}
        </tbody>
    );
};
export default AllMembers;
