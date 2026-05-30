// admin/DatabaseViewer.tsx
import React, { useState } from "react";
import { Database as DatabaseIcon, Users, FileText, Wallet, HandHeart } from "lucide-react";
import type { User, Claim } from "../types";
import type { CommissionRecord } from "./types";

interface TableConfig {
    data: Array<Record<string, unknown>>;
    label: string;
    icon: React.ElementType;
    desc: string;
}

interface Props {
    members: User[];
    claims: Claim[];
    commissions: CommissionRecord[];
    payouts: unknown[];
    loading: { stats?: boolean; members?: boolean; claims?: boolean; commissions?: boolean };
}

// Helper to convert any object to Record<string, unknown>
const toRecord = <T extends object>(obj: T): Record<string, unknown> => {
    return obj as unknown as Record<string, unknown>;
};

export const DatabaseViewer: React.FC<Props> = ({ members, claims, commissions, payouts, loading }) => {
    const [table, setTable] = useState("users");

    const tables: Record<string, TableConfig> = {
        users: {
            data: members.map((m) => toRecord({ ...m, rank: m.rankId, package: m.packageId })),
            label: "users",
            icon: Users,
            desc: "Member and admin accounts with referral relationships",
        },
        claims: {
            data: claims.map((c) => toRecord({ ...c, documents: `${c.documents?.length || 0} docs` })),
            label: "claims",
            icon: FileText,
            desc: "Benefit claims with status and amounts",
        },
        commissions: {
            data: commissions.map((c) => toRecord(c)),
            label: "commissions",
            icon: Wallet,
            desc: "Multi-level commission ledger (append-only)",
        },
        payouts: {
            data: (payouts as object[]).map((p) => toRecord(p)),
            label: "payouts",
            icon: HandHeart,
            desc: "Commission payout requests and disbursements",
        },
    };

    const current = tables[table];
    const columns = current.data.length > 0 ? Object.keys(current.data[0]) : [];

    if (loading.stats) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="bg-gpsc-cream-dark mb-4 h-8 w-48 rounded"></div>
                    <div className="bg-gpsc-cream-dark h-96 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    const renderCellValue = (value: unknown): React.ReactNode => {
        if (value === null || value === undefined) {
            return <span className="text-gpsc-stone italic">null</span>;
        }
        if (typeof value === "boolean") {
            return <span className="text-gpsc-navy">{String(value)}</span>;
        }
        if (typeof value === "number") {
            return <span className="text-gpsc-green">{value}</span>;
        }
        if (typeof value === "string") {
            // Truncate long strings
            const display = value.length > 50 ? value.slice(0, 47) + "..." : value;
            return <span className="text-gpsc-navy">{display}</span>;
        }
        if (typeof value === "object") {
            return <span className="text-gpsc-stone italic">[object]</span>;
        }
        return <span className="text-gpsc-navy">{String(value)}</span>;
    };

    return (
        <div className="space-y-6">
            <div>
                <div className="text-gpsc-stone text-xs tracking-wider uppercase">Behind the scenes</div>
                <h1 className="font-display text-gpsc-navy text-3xl">Database viewer</h1>
                <p className="text-gpsc-stone mt-2 max-w-2xl text-sm">
                    A read-only window into the data layer. In production this lives in PostgreSQL.
                </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(tables).map(([key, t]) => (
                    <button
                        key={key}
                        onClick={() => setTable(key)}
                        className={`rounded-2xl border p-4 text-left transition-all ${
                            table === key
                                ? "bg-gpsc-navy border-gpsc-navy text-white"
                                : "border-gpsc-cream-dark hover:border-gpsc-navy bg-white hover:shadow-sm"
                        }`}
                    >
                        <t.icon size={16} className="mb-2" />
                        <div className={`font-mono text-xs ${table === key ? "text-white" : "text-gpsc-navy"}`}>{t.label}</div>
                        <div className={`mt-1 text-xs ${table === key ? "text-white/60" : "text-gpsc-stone"}`}>{current.data.length} rows</div>
                    </button>
                ))}
            </div>

            <div className="border-gpsc-cream-dark overflow-hidden rounded-2xl border bg-white">
                <div className="border-gpsc-cream-dark flex flex-wrap items-center justify-between gap-3 border-b p-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <DatabaseIcon size={16} className="text-gpsc-green" />
                            <span className="text-gpsc-navy font-mono text-sm">
                                SELECT * FROM <strong>{current.label}</strong>;
                            </span>
                        </div>
                        <p className="text-gpsc-stone mt-1 text-xs">{current.desc}</p>
                    </div>
                    <div className="text-gpsc-stone text-xs">
                        <span className="text-gpsc-navy font-medium">{current.data.length}</span> rows ·
                        <span className="text-gpsc-navy ml-1 font-medium">{columns.length}</span> columns
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full font-mono text-xs">
                        <thead className="bg-gpsc-cream/50 text-gpsc-stone">
                            <tr>
                                {columns.map((c) => (
                                    <th key={c} className="p-3 text-left font-medium tracking-wider whitespace-nowrap uppercase">
                                        {c}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {current.data.map((row, i) => (
                                <tr key={i} className="border-gpsc-cream-dark hover:bg-gpsc-cream/40 border-t transition-colors">
                                    {columns.map((c) => (
                                        <td key={c} className="p-3 whitespace-nowrap">
                                            {renderCellValue(row[c])}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {current.data.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length} className="text-gpsc-stone p-8 text-center">
                                        No data
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-gpsc-navy rounded-2xl p-6 text-white">
                <h2 className="font-display mb-3 text-lg">Schema notes</h2>
                <ul className="space-y-2 text-sm text-white/80">
                    <li>
                        · <strong className="text-white">Append-only ledger.</strong> Commissions are never edited — reversals are new rows.
                    </li>
                    <li>
                        · <strong className="text-white">UUIDs as primary keys.</strong> Avoids leaking row counts in URLs.
                    </li>
                    <li>
                        · <strong className="text-white">Money in centavos.</strong> No floating-point rounding errors on commissions.
                    </li>
                    <li>
                        · <strong className="text-white">Adjacency-list tree.</strong> Every user has a sponsor_id pointing to their upline.
                    </li>
                    <li>
                        · <strong className="text-white">Soft deletes.</strong> Users and records carry a deleted_at field.
                    </li>
                </ul>
            </div>
        </div>
    );
};
