import React, { useCallback, useEffect, useRef, useState } from "react";
import Tree from "react-d3-tree";
import type { CustomNodeElementProps, RawNodeDatum } from "react-d3-tree";
import type { Member, ReferralNode } from "../../utils/types";
import ReferralCard from "./ReferralCard";

interface Props {
    user: Member;
    //referralLink: string;
    referralTree: ReferralNode[];
}

// react-d3-tree styling: recolor the connector links + hide default node circle.
const treeStyles = `
.fsc-tree-wrap .rd3t-link {
    stroke: #d6cfc0;
    stroke-width: 1.5px;
}
.fsc-tree-wrap svg {
    cursor: grab;
}
.fsc-tree-wrap svg:active {
    cursor: grabbing;
}
`;

// Convert our ReferralNode shape into react-d3-tree's RawNodeDatum, stashing the
// display fields in `attributes` (values must be string/number/boolean).
const toDatum = (node: ReferralNode): RawNodeDatum => ({
    name: `${node.firstName} ${node.lastName}`.trim(),
    attributes: {
        initials: node.initials,
        subtitle: `${node.packageName} Care · ${node.city}`,
        status: node.status,
        meta: `Level ${node.level + 1} · ${node.commissionRate}%`,
    },
    children: node.downline.map(toDatum),
});

// Custom HTML card rendered inside an SVG <foreignObject> for each tree node.
const renderNode = ({ nodeDatum, toggleNode }: CustomNodeElementProps) => {
    const a = (nodeDatum.attributes ?? {}) as Record<string, string>;
    const isRoot = a.status === "root";
    const childCount = nodeDatum.children?.length ?? 0;
    const collapsed = !!nodeDatum.__rd3t.collapsed;
    const W = 230;
    const H = 66;

    return (
        <g>
            <foreignObject x={-W / 2} y={-H / 2} width={W} height={H} style={{ overflow: "visible" }}>
                <div
                    className={`flex h-full items-center gap-3 rounded-xl border p-3 shadow-sm ${
                        isRoot ? "border-fsc-navy/20 bg-fsc-cream" : "border-fsc-cream-dark bg-white"
                    }`}
                >
                    <div
                        className={`font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs text-white ${
                            isRoot ? "bg-fsc-navy" : "bg-fsc-green"
                        }`}
                    >
                        {a.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-fsc-navy truncate text-sm font-medium">{nodeDatum.name}</div>
                        <div className="text-fsc-stone truncate text-[11px]">{a.subtitle}</div>
                    </div>
                    {!isRoot && (
                        <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${
                                a.status === "active" ? "bg-fsc-green/10 text-fsc-green" : "bg-[#C9922A]/10 text-[#A87820]"
                            }`}
                        >
                            {a.status}
                        </span>
                    )}
                    {/* Collapse/expand toggle when there are children */}
                    {childCount > 0 && (
                        <button
                            type="button"
                            onClick={toggleNode}
                            className="bg-fsc-navy/90 hover:bg-fsc-navy absolute -bottom-2 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full text-[11px] font-bold text-white"
                            aria-label={collapsed ? "Expand" : "Collapse"}
                        >
                            {collapsed ? "+" : "−"}
                        </button>
                    )}
                </div>
            </foreignObject>
        </g>
    );
};

export const MemberReferrals: React.FC<Props> = ({ user, referralTree }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });

    // Center the tree horizontally and give it some top padding.
    const recenter = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        const { width } = el.getBoundingClientRect();
        setTranslate({ x: width / 2, y: 80 });
    }, []);

    useEffect(() => {
        recenter();
        window.addEventListener("resize", recenter);
        return () => window.removeEventListener("resize", recenter);
    }, [recenter]);

    const data: RawNodeDatum = {
        name: `${user.firstName} ${user.lastName}`.trim(),
        attributes: {
            initials: (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase(),
            subtitle: "You · Root",
            status: "root",
            meta: "",
        },
        children: referralTree.map(toDatum),
    };

    return (
        <div className="space-y-6">
            <style>{treeStyles}</style>

            <div className="flex items-center justify-between">
                <h1 className="font-display text-fsc-navy text-3xl">My Referrals</h1>
                <button
                    type="button"
                    onClick={recenter}
                    className="border-fsc-cream-dark text-fsc-stone hover:bg-fsc-cream rounded-full border px-3 py-1.5 text-xs transition-colors"
                >
                    Re-center
                </button>
            </div>

            <div className="border-fsc-cream-dark rounded-2xl border bg-white p-2">
                {referralTree.length > 0 ? (
                    <>
                        <div ref={containerRef} className="fsc-tree-wrap h-[60vh] min-h-[420px] w-full">
                            <Tree
                                data={data}
                                translate={translate}
                                orientation="vertical"
                                pathFunc="step"
                                renderCustomNodeElement={renderNode}
                                nodeSize={{ x: 260, y: 120 }}
                                separation={{ siblings: 1.1, nonSiblings: 1.3 }}
                                depthFactor={130}
                                collapsible
                                zoomable
                                draggable
                                scaleExtent={{ min: 0.3, max: 1.5 }}
                                zoom={0.8}
                            />
                        </div>
                        <p className="text-fsc-stone px-3 pb-2 text-center text-[11px]">
                            Drag to pan · scroll to zoom · tap a card's −/+ to collapse a branch
                        </p>
                    </>
                ) : (
                    <div className="text-fsc-stone py-12 text-center">
                        No referrals yet. Share your link to start building your network.
                    </div>
                )}
            </div>

            {/* Referral Link & QR */}
            <ReferralCard member={user} />
        </div>
    );
};