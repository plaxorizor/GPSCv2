import React from "react";
import { Copy, Share2, MessageCircle } from "lucide-react";
import type { Member, ReferralNode } from "../types";
import { formatDate } from "../../utils/formatter";

interface Props {
    user: Member;
    referralLink: string;
    onCopyReferralLink: () => void;
    onShareReferralLink: (method: "copy" | "messenger" | "whatsapp") => void;
    referralTree: ReferralNode[];
}

const treeStyles = `
/* Wrapper around all children — draws the vertical trunk */
.tree-children {
    position: relative;
    margin-left: 24px;
}

.tree-children::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 28px;
    width: 1.5px;
    background-color: #d6cfc0;
    border-radius: 1px;
}

/* Each individual child node row */
.tree-item {
    position: relative;
    margin-top: 8px;
    padding-left: 20px;
}

/* Horizontal elbow — connects trunk to card */
.tree-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 28px;
    width: 18px;
    height: 1.5px;
    background-color: #d6cfc0;
    border-radius: 1px;
}
`;

const ReferralNodeView: React.FC<{ node: ReferralNode }> = ({ node }) => (
    <div className="tree-item">
        <div className="border-gpsc-cream-dark flex items-center gap-3 rounded-xl border bg-white p-3">
            <div className="bg-gpsc-green font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm text-white">
                {node.initials}
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-gpsc-navy truncate font-medium">
                    {node.firstName} {node.lastName}
                </div>
                <div className="text-gpsc-stone truncate text-xs">
                    {node.packageName} · {node.city} · {formatDate(node.memberSince)}
                </div>
            </div>
            <div className="shrink-0 text-right">
                <div
                    className={`inline-block rounded-full px-2 py-1 text-xs ${
                        node.status === "active" ? "bg-gpsc-green/10 text-gpsc-green" : "bg-amber-100 text-amber-700"
                    }`}
                >
                    {node.status}
                </div>
                <div className="text-gpsc-stone mt-1 text-xs">
                    L{node.level} · {node.commissionRate}%
                </div>
            </div>
        </div>

        {node.downline.length > 0 && (
            <div className="tree-children">
                {node.downline.map((child) => (
                    <ReferralNodeView key={child.id} node={child} />
                ))}
            </div>
        )}
    </div>
);

export const MemberReferrals: React.FC<Props> = ({ user, referralLink, onCopyReferralLink, onShareReferralLink, referralTree }) => (
    <div className="space-y-6">
        <style>{treeStyles}</style>

        <div>
            <div className="text-gpsc-stone text-xs tracking-wider uppercase">Your network</div>
            <h1 className="font-display text-gpsc-navy text-3xl">My referrals</h1>
        </div>

        <div className="bg-gpsc-navy rounded-2xl p-6 text-white">
            <div className="grid items-center gap-6 sm:grid-cols-2">
                <div>
                    <div className="mb-2 text-xs tracking-wider text-white/60 uppercase">Your unique referral link</div>
                    <div className="rounded-xl bg-white/10 px-4 py-3 font-mono text-sm break-all">{referralLink}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={onCopyReferralLink}
                        className="text-gpsc-navy flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium"
                    >
                        <Copy size={14} /> Copy
                    </button>
                    <button
                        onClick={() => onShareReferralLink("messenger")}
                        className="bg-gpsc-green flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
                    >
                        <MessageCircle size={14} /> Messenger
                    </button>
                    <button
                        onClick={() => onShareReferralLink("whatsapp")}
                        className="bg-gpsc-green flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
                    >
                        <Share2 size={14} /> WhatsApp
                    </button>
                </div>
            </div>
        </div>

        <div className="border-gpsc-cream-dark rounded-2xl border bg-white p-6">
            <h2 className="font-display text-gpsc-navy mb-4 text-lg">Network tree</h2>

            {/* Root node — You */}
            <div className="relative">
                <div className="bg-gpsc-cream flex items-center gap-3 rounded-xl p-3">
                    <div className="bg-gpsc-navy font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white">
                        {user.initials}
                    </div>
                    <div className="flex-1">
                        <div className="text-gpsc-navy font-medium">You ({user.firstName})</div>
                        <div className="text-gpsc-stone text-xs">Root · Level 0</div>
                    </div>
                    <div className="text-gpsc-stone shrink-0 text-sm">Level 0</div>
                </div>

                {referralTree.length > 0 && (
                    <div className="tree-children">
                        {referralTree.map((node) => (
                            <ReferralNodeView key={node.id} node={node} />
                        ))}
                    </div>
                )}

                {referralTree.length === 0 && (
                    <div className="text-gpsc-stone py-8 text-center">No referrals yet. Share your link to start building your network.</div>
                )}
            </div>
        </div>
    </div>
);
