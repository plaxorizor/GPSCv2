import React, { useCallback, useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, Crosshair, Maximize2, Minimize2, SlidersHorizontal, RotateCcw } from "lucide-react";
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
// Factory so the renderer knows whether collapsing is enabled — when it is, a
// node with descendants becomes clickable and shows a +/− toggle badge.
const makeRenderNode =
    (collapsible: boolean) =>
    ({ nodeDatum, toggleNode }: CustomNodeElementProps) => {
        const a = (nodeDatum.attributes ?? {}) as Record<string, string>;
        const isRoot = a.status === "root";
        const collapsed = Boolean((nodeDatum as unknown as { __rd3t?: { collapsed?: boolean } }).__rd3t?.collapsed);
        const childCount = nodeDatum.children?.length ?? 0;
        const canToggle = collapsible && !isRoot && (childCount > 0 || collapsed);
        const W = 230;
        const H = 66;

        return (
            <g>
                <foreignObject x={-W / 2} y={-H / 2} width={W} height={H} style={{ overflow: "visible" }}>
                    <div
                        onClick={canToggle ? () => toggleNode() : undefined}
                        className={`flex h-full items-center gap-3 rounded-xl border p-3 shadow-sm ${
                            isRoot ? "border-fsc-navy/20 bg-fsc-cream" : "border-fsc-cream-dark bg-white"
                        } ${canToggle ? "cursor-pointer" : ""}`}
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
                        {canToggle && (
                            <span className="bg-fsc-navy/10 text-fsc-navy flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold leading-none">
                                {collapsed ? "+" : "–"}
                            </span>
                        )}
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

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.2;
const DEFAULT_ZOOM = 0.8;
const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

// Small on/off switch used throughout the Customize panel.
const PanelToggle: React.FC<{ label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }> = ({
    label,
    desc,
    checked,
    onChange,
}) => (
    <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-start justify-between gap-3 text-left">
        <span>
            <span className="text-fsc-navy block">{label}</span>
            {desc && <span className="text-fsc-stone block text-[11px] leading-tight">{desc}</span>}
        </span>
        <span
            className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${
                checked ? "bg-fsc-green" : "bg-fsc-cream-dark"
            }`}
        >
            <span className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`} />
        </span>
    </button>
);

// Labelled range slider with a live value readout.
const PanelSlider: React.FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (v: number) => void;
    fmt: (v: number) => string;
}> = ({ label, value, min, max, step, onChange, fmt }) => (
    <label className="block">
        <span className="mb-1 flex items-center justify-between">
            <span className="text-fsc-stone">{label}</span>
            <span className="text-fsc-navy tabular-nums">{fmt(value)}</span>
        </span>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="accent-fsc-navy h-1 w-full"
        />
    </label>
);

export const MemberReferrals: React.FC<Props> = ({ user, referralTree }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });

    // Live, in-page tree settings.
    const [orientation, setOrientation] = useState<Orientation>("vertical");
    const [pathStyle, setPathStyle] = useState<PathStyle>("step");
    const [spacing, setSpacing] = useState(1); // 0.6 (compact) … 1.6 (spacious)
    const [siblingSep, setSiblingSep] = useState(1.1); // gap between siblings
    const [levelDistance, setLevelDistance] = useState(1); // multiplier on depth gap
    const [zoom, setZoom] = useState(DEFAULT_ZOOM);
    const [fullscreen, setFullscreen] = useState(false);

    // Behavior toggles.
    const [collapsible, setCollapsible] = useState(false);
    const [initialDepth, setInitialDepth] = useState(2); // levels shown when collapsible
    const [collapseNeighbors, setCollapseNeighbors] = useState(false);
    const [draggable, setDraggable] = useState(true);
    const [zoomable, setZoomable] = useState(true);
    const [transitions, setTransitions] = useState(false);
    const [transitionDuration, setTransitionDuration] = useState(500);

    const [showSettings, setShowSettings] = useState(false);

    // Restore every tree setting to its default.
    const resetSettings = () => {
        setOrientation("vertical");
        setPathStyle("step");
        setSpacing(1);
        setSiblingSep(1.1);
        setLevelDistance(1);
        setCollapsible(false);
        setInitialDepth(2);
        setCollapseNeighbors(false);
        setDraggable(true);
        setZoomable(true);
        setTransitions(false);
        setTransitionDuration(500);
        setZoom(DEFAULT_ZOOM);
        recenter();
        remount();
    };

    // react-d3-tree only reads `zoom`/`translate` on mount, so bumping this key
    // remounts the Tree to apply button-driven zoom / re-center actions.
    const [viewKey, setViewKey] = useState(0);
    const remount = useCallback(() => setViewKey((k) => k + 1), []);

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

    // Re-center shortly after a fullscreen toggle (container size changed).
    useEffect(() => {
        const t = setTimeout(() => {
            recenter();
            remount();
        }, 50);
        return () => clearTimeout(t);
    }, [fullscreen, recenter, remount]);

    const zoomBy = (delta: number) => {
        setZoom((z) => clampZoom(+(z + delta).toFixed(2)));
        remount();
    };
    const resetView = () => {
        setZoom(DEFAULT_ZOOM);
        recenter();
        remount();
    };

    // Close fullscreen with Escape.
    useEffect(() => {
        if (!fullscreen) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFullscreen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [fullscreen]);

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

    const renderNode = makeRenderNode(collapsible);

    // Behavior props that need a Tree remount to take effect (react-d3-tree reads
    // them when building its internal state). Layout sliders update live.
    const behaviorKey = [orientation, collapsible, initialDepth, collapseNeighbors, draggable, zoomable, transitions, viewKey].join("-");

    // The Tree body, reused at two sizes (in-page card vs. fullscreen overlay).
    const treeBody = (heightClass: string) => (
        <div ref={containerRef} className={`fsc-tree-wrap w-full ${heightClass}`}>
            <Tree
                key={behaviorKey}
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
                separation={{ siblings: siblingSep, nonSiblings: siblingSep + 0.2 }}
                depthFactor={(orientation === "vertical" ? 130 : 260) * levelDistance}
                collapsible={collapsible}
                initialDepth={collapsible ? initialDepth : undefined}
                shouldCollapseNeighborNodes={collapseNeighbors}
                draggable={draggable}
                zoomable={zoomable}
                enableLegacyTransitions={transitions}
                transitionDuration={transitionDuration}
                scaleExtent={{ min: MIN_ZOOM, max: MAX_ZOOM }}
                zoom={zoom}
            />
        </div>
    );

    const toolbar = referralTree.length > 0 && (
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

                        {/* Customize panel toggle */}
                        <button
                            type="button"
                            onClick={() => setShowSettings((v) => !v)}
                            title="Customize tree"
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-colors ${
                                showSettings
                                    ? "border-fsc-navy bg-fsc-navy text-white"
                                    : "border-fsc-cream-dark text-fsc-stone hover:bg-fsc-cream"
                            }`}
                        >
                            <SlidersHorizontal size={14} /> Customize
                        </button>

                        {/* Zoom controls */}
                        <div className="border-fsc-cream-dark flex items-center overflow-hidden rounded-full border bg-white">
                            <button
                                type="button"
                                onClick={() => zoomBy(-ZOOM_STEP)}
                                disabled={zoom <= MIN_ZOOM}
                                title="Zoom out"
                                className="text-fsc-stone hover:bg-fsc-cream px-2.5 py-1.5 transition-colors disabled:opacity-40"
                            >
                                <ZoomOut size={14} />
                            </button>
                            <span className="text-fsc-stone w-10 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
                            <button
                                type="button"
                                onClick={() => zoomBy(ZOOM_STEP)}
                                disabled={zoom >= MAX_ZOOM}
                                title="Zoom in"
                                className="text-fsc-stone hover:bg-fsc-cream px-2.5 py-1.5 transition-colors disabled:opacity-40"
                            >
                                <ZoomIn size={14} />
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={resetView}
                            title="Reset view"
                            className="border-fsc-cream-dark text-fsc-stone hover:bg-fsc-cream flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-colors"
                        >
                            <Crosshair size={14} /> Reset
                        </button>

                        <button
                            type="button"
                            onClick={() => setFullscreen((v) => !v)}
                            title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                            className="border-fsc-cream-dark text-fsc-stone hover:bg-fsc-cream flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-colors"
                        >
                            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                            {fullscreen ? "Exit" : "Fullscreen"}
                        </button>
        </div>
    );

    const settingsPanel = showSettings && referralTree.length > 0 && (
        <div className="border-fsc-cream-dark grid gap-x-8 gap-y-5 rounded-2xl border bg-white p-5 text-xs sm:grid-cols-2 lg:grid-cols-3">
            {/* Layout */}
            <div className="space-y-3">
                <div className="text-fsc-navy font-display border-fsc-cream-dark border-b pb-1 text-sm">Layout</div>
                <label className="block">
                    <span className="text-fsc-stone mb-1 block">Connector style</span>
                    <select
                        value={pathStyle}
                        onChange={(e) => setPathStyle(e.target.value as PathStyle)}
                        className="border-fsc-cream-dark text-fsc-navy w-full rounded-lg border bg-white px-2 py-1.5"
                    >
                        <option value="step">Step lines</option>
                        <option value="diagonal">Curved lines</option>
                        <option value="straight">Straight lines</option>
                        <option value="elbow">Elbow lines</option>
                    </select>
                </label>
                <PanelSlider label="Node spacing" value={spacing} min={0.6} max={1.8} step={0.1} onChange={setSpacing} fmt={(v) => `${v.toFixed(1)}×`} />
                <PanelSlider label="Sibling gap" value={siblingSep} min={0.6} max={2.5} step={0.1} onChange={setSiblingSep} fmt={(v) => `${v.toFixed(1)}×`} />
                <PanelSlider label="Level distance" value={levelDistance} min={0.6} max={2.5} step={0.1} onChange={setLevelDistance} fmt={(v) => `${v.toFixed(1)}×`} />
            </div>

            {/* Behavior */}
            <div className="space-y-3">
                <div className="text-fsc-navy font-display border-fsc-cream-dark border-b pb-1 text-sm">Behavior</div>
                <PanelToggle
                    label="Collapsible branches"
                    desc="Click a node to expand or collapse its downline"
                    checked={collapsible}
                    onChange={setCollapsible}
                />
                {collapsible && (
                    <label className="flex items-center justify-between gap-3">
                        <span className="text-fsc-stone">Initial depth shown</span>
                        <input
                            type="number"
                            min={1}
                            max={10}
                            value={initialDepth}
                            onChange={(e) => setInitialDepth(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
                            className="border-fsc-cream-dark text-fsc-navy w-16 rounded-lg border px-2 py-1 text-center"
                        />
                    </label>
                )}
                <PanelToggle
                    label="Collapse neighbors"
                    desc="Auto-collapse other branches when one opens"
                    checked={collapseNeighbors}
                    onChange={setCollapseNeighbors}
                />
                <PanelToggle label="Drag to pan" checked={draggable} onChange={setDraggable} />
                <PanelToggle label="Scroll to zoom" checked={zoomable} onChange={setZoomable} />
            </div>

            {/* Animation */}
            <div className="space-y-3">
                <div className="text-fsc-navy font-display border-fsc-cream-dark border-b pb-1 text-sm">Animation</div>
                <PanelToggle label="Animated transitions" desc="Smoothly animate expand / collapse" checked={transitions} onChange={setTransitions} />
                {transitions && (
                    <PanelSlider
                        label="Duration"
                        value={transitionDuration}
                        min={100}
                        max={1500}
                        step={50}
                        onChange={setTransitionDuration}
                        fmt={(v) => `${v}ms`}
                    />
                )}
                <button
                    type="button"
                    onClick={resetSettings}
                    className="border-fsc-cream-dark text-fsc-stone hover:bg-fsc-cream mt-1 flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-colors"
                >
                    <RotateCcw size={13} /> Reset all settings
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <style>{treeStyles}</style>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="font-display text-fsc-navy text-3xl">My Referrals</h1>
                {!fullscreen && toolbar}
            </div>

            {!fullscreen && settingsPanel}

            {!fullscreen && (
                <div className="border-fsc-cream-dark rounded-2xl border bg-white p-2">
                    {referralTree.length > 0 ? (
                        <>
                            {treeBody("h-[60vh] min-h-[420px]")}
                            <p className="text-fsc-stone px-3 pb-2 text-center text-[11px]">
                                Drag to pan · scroll or use +/− to zoom · open Customize for more
                            </p>
                        </>
                    ) : (
                        <div className="text-fsc-stone py-12 text-center">
                            No referrals yet. Share your link to start building your network.
                        </div>
                    )}
                </div>
            )}

            {fullscreen && referralTree.length > 0 && (
                <div className="fixed inset-0 z-50 flex flex-col bg-white p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="font-display text-fsc-navy text-xl">My Referrals</h2>
                        {toolbar}
                    </div>
                    {settingsPanel && <div className="mb-3 max-h-[40vh] overflow-y-auto">{settingsPanel}</div>}
                    {treeBody("min-h-0 flex-1")}
                </div>
            )}

            {/* Referral Link & QR */}
            <ReferralCard member={user} />
        </div>
    );
};
