import React, { useCallback, useEffect, useRef, useState } from "react";
import Tree from "react-d3-tree";
import type { CustomNodeElementProps, RawNodeDatum } from "react-d3-tree";
import { PACKAGE_INFO } from "../../utils/types";
import type { Member, ReferralNode } from "../../utils/types";
import { rankFromChildren, rankName } from "../../utils/rank";
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
        subtitle: `${node.packageName ? node.packageName.charAt(0).toUpperCase() + node.packageName.slice(1) + " Care · " : ""}${node.rankName}`,
        status: node.status,
        meta: `Level ${node.level + 1} · ${node.commissionRate}%`,
    },
    children: node.downline.map(toDatum),
});

// Custom HTML card rendered inside an SVG <foreignObject> for each tree node.
// The tree is always fully expanded, so there is no collapse toggle.
const renderNode = ({ nodeDatum }: CustomNodeElementProps) => {
    const a = (nodeDatum.attributes ?? {}) as Record<string, string>;
    const isRoot = a.status === "root";
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
                </div>
            </foreignObject>
        </g>
    );
};

type Orientation = "vertical" | "horizontal";
type PathStyle = "step" | "diagonal" | "straight" | "elbow";

export const MemberReferrals: React.FC<Props> = ({ user, referralTree }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });

    // Live, in-page tree settings.
    const [orientation, setOrientation] = useState<Orientation>("vertical");
    const [pathStyle, setPathStyle] = useState<PathStyle>("step");
    const [spacing, setSpacing] = useState(1); // 0.6 (compact) … 1.6 (spacious)

    // Center the tree, accounting for orientation (top-down vs left-to-right).
    const recenter = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        const { width, height } = el.getBoundingClientRect();
        setTranslate(
            orientation === "vertical"
                ? { x: width / 2, y: 80 }
                : { x: 120, y: height / 2 },
        );
    }, [orientation]);

    useEffect(() => {
        recenter();
        window.addEventListener("resize", recenter);
        return () => window.removeEventListener("resize", recenter);
    }, [recenter]);

    // Root subtitle: "Package Care · Rank". Package from the viewer's own plan;
    // rank computed from their active direct referrals.
    const pkgKey = (user.package?.toLowerCase() ?? "") as keyof typeof PACKAGE_INFO;
    const pkgInfo = PACKAGE_INFO[pkgKey];
    const memberRankName = rankName(rankFromChildren(referralTree));
    const rootSubtitle = pkgInfo
        ? `${pkgKey.charAt(0).toUpperCase() + pkgKey.slice(1)} Care · ${memberRankName}`
        : memberRankName;

    const data: RawNodeDatum = {
        name: `${user.firstName} ${user.lastName}`.trim(),
        attributes: {
            initials: (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase(),
            subtitle: rootSubtitle,
            status: "root",
            meta: "",
        },
        children: referralTree.map(toDatum),
    };

    return (
        <div className="space-y-6">
            <style>{treeStyles}</style>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="font-display text-fsc-navy text-3xl">My Referrals</h1>

                {referralTree.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        {/* Orientation toggle */}
                        <div className="border-fsc-cream-dark flex overflow-hidden rounded-full border">
                            {(["vertical", "horizontal"] as const).map((o) => (
                                <button
                                    key={o}
                                    type="button"
                                    onClick={() => setOrientation(o)}
                                    className={`px-3 py-1.5 capitalize transition-colors ${
                                        orientation === o ? "bg-fsc-navy text-white" : "text-fsc-stone hover:bg-fsc-cream"
                                    }`}
                                >
                                    {o}
                                </button>
                            ))}
                        </div>

                        {/* Connector style */}
                        <select
                            value={pathStyle}
                            onChange={(e) => setPathStyle(e.target.value as PathStyle)}
                            className="border-fsc-cream-dark text-fsc-stone rounded-full border bg-white px-3 py-1.5"
                        >
                            <option value="step">Step lines</option>
                            <option value="diagonal">Curved lines</option>
                            <option value="straight">Straight lines</option>
                            <option value="elbow">Elbow lines</option>
                        </select>

                        {/* Spacing slider */}
                        <label className="border-fsc-cream-dark text-fsc-stone flex items-center gap-2 rounded-full border bg-white px-3 py-1.5">
                            Spacing
                            <input
                                type="range"
                                min={0.6}
                                max={1.6}
                                step={0.1}
                                value={spacing}
                                onChange={(e) => setSpacing(Number(e.target.value))}
                                className="accent-fsc-navy h-1 w-20"
                            />
                        </label>

                        <button
                            type="button"
                            onClick={recenter}
                            className="border-fsc-cream-dark text-fsc-stone hover:bg-fsc-cream rounded-full border px-3 py-1.5 transition-colors"
                        >
                            Re-center
                        </button>
                    </div>
                )}
            </div>

            <div className="border-fsc-cream-dark rounded-2xl border bg-white p-2">
                {referralTree.length > 0 ? (
                    <>
                        <div ref={containerRef} className="fsc-tree-wrap h-[60vh] min-h-[420px] w-full">
                            <Tree
                                data={data}
                                translate={translate}
                                orientation={orientation}
                                pathFunc={pathStyle}
                                renderCustomNodeElement={renderNode}
                                nodeSize={
                                    orientation === "vertical"
                                        ? { x: 260 * spacing, y: 120 * spacing }
                                        : { x: 160 * spacing, y: 260 * spacing }
                                }
                                separation={{ siblings: 1.1 * spacing, nonSiblings: 1.3 * spacing }}
                                depthFactor={orientation === "vertical" ? 130 * spacing : 260 * spacing}
                                collapsible={false}
                                zoomable
                                draggable
                                scaleExtent={{ min: 0.3, max: 1.5 }}
                                zoom={0.8}
                            />
                        </div>
                        <p className="text-fsc-stone px-3 pb-2 text-center text-[11px]">
                            Drag to pan · scroll to zoom · always fully expanded
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
