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

// Status → colors. Soft tint background, solid accent for avatar + border.
type NodeStyle = { bg: string; border: string; accent: string; dim?: boolean };
const NODE_STYLES: Record<string, NodeStyle> = {
    root: { bg: "#FFFFFF", border: "#1F3A5F", accent: "#1F3A5F" }, // navy
    active: { bg: "#ECFDF3", border: "#16A34A", accent: "#16A34A" }, // green
    pending: { bg: "#FFF7ED", border: "#F59E0B", accent: "#F59E0B" }, // orange
    inactive: { bg: "#FEF2F2", border: "#EF4444", accent: "#EF4444" }, // red
    expired: { bg: "#F1F5F9", border: "#94A3B8", accent: "#64748B", dim: true }, // slate, faded
};
const styleFor = (status: string): NodeStyle => NODE_STYLES[status] ?? NODE_STYLES.inactive;

// Legend entries shown under the tree.
const LEGEND: { label: string; status: string }[] = [
    { label: "Active", status: "active" },
    { label: "Pending", status: "pending" },
    { label: "Inactive", status: "inactive" },
    { label: "Expired", status: "expired" },
];

// Convert our ReferralNode shape into react-d3-tree's RawNodeDatum, stashing the
// display fields in `attributes`. `maxLevels` = the viewer's package commission
// depth; nodes deeper than that are "unreachable" (greyed/blurred).
const makeToDatum =
    (maxLevels: number) =>
    (node: ReferralNode): RawNodeDatum => ({
        name: `${node.firstName} ${node.lastName}`.trim(),
        attributes: {
            initials: node.initials,
            subtitle: `${node.packageName ? node.packageName.charAt(0).toUpperCase() + node.packageName.slice(1) + " Care · " : ""}${node.rankName}`,
            status: node.status,
            reachable: node.level < maxLevels,
            meta: `Level ${node.level + 1} · ${node.commissionRate}%`,
        },
        children: node.downline.map(makeToDatum(maxLevels)),
    });

// Custom HTML card rendered inside an SVG <foreignObject> for each tree node.
// Factory so the renderer knows whether collapsing is enabled — when it is, a
// node with descendants becomes clickable and shows a +/− toggle badge.
const makeRenderNode =
    (collapsible: boolean) =>
    ({ nodeDatum, toggleNode }: CustomNodeElementProps) => {
        const a = (nodeDatum.attributes ?? {}) as Record<string, string | number | boolean>;
        const status = String(a.status ?? "inactive");
        const isRoot = status === "root";
        const reachable = a.reachable !== false; // unreachable = beyond commission depth
        const s = styleFor(status);
        const collapsed = Boolean((nodeDatum as unknown as { __rd3t?: { collapsed?: boolean } }).__rd3t?.collapsed);
        const childCount = nodeDatum.children?.length ?? 0;
        const canToggle = collapsible && !isRoot && (childCount > 0 || collapsed);
        const W = 214;
        const H = 56;

        return (
            <g>
                <foreignObject x={-W / 2} y={-H / 2} width={W} height={H} style={{ overflow: "visible" }}>
                    <div
                        className="h-full"
                        style={{
                            // Unreachable nodes are greyed + softly blurred.
                            filter: reachable ? undefined : "grayscale(1) blur(0.6px)",
                            opacity: reachable ? 1 : 0.45,
                        }}
                    >
                        <div
                            onClick={canToggle ? () => toggleNode() : undefined}
                            style={{
                                background: s.bg,
                                borderColor: s.border,
                                borderStyle: reachable ? "solid" : "dashed",
                            }}
                            className={`flex h-full items-center gap-2.5 rounded-full border-2 pr-3 pl-1.5 ${
                                canToggle ? "cursor-pointer" : ""
                            }`}
                        >
                            <div
                                style={{ background: s.accent }}
                                className="font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs text-white"
                            >
                                {String(a.initials ?? "")}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div
                                    className="text-fsc-navy truncate text-sm font-medium"
                                    style={{ textDecoration: status === "expired" ? "line-through" : undefined }}
                                >
                                    {nodeDatum.name}
                                </div>
                                <div className="text-fsc-stone truncate text-[10px]">{String(a.subtitle ?? "")}</div>
                            </div>
                            {canToggle && (
                                <span
                                    style={{ color: s.accent, borderColor: s.border }}
                                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border bg-white text-xs font-bold leading-none"
                                >
                                    {collapsed ? "+" : "–"}
                                </span>
                            )}
                        </div>
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

    // --- Pan bounds -------------------------------------------------------
    // react-d3-tree has no translateExtent, so we constrain panning ourselves:
    // track the live transform via onUpdate, and once the user stops, if the
    // tree has been dragged past the edge (leaving < margin visible) we snap it
    // back inside bounds. Keeps the tree from being lost in infinite empty space.
    const lastTransform = useRef<{ zoom: number; translate: { x: number; y: number } } | null>(null);
    const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const clampToBounds = useCallback(() => {
        const el = containerRef.current;
        const g = el?.querySelector<SVGGElement>(".rd3t-g");
        const t = lastTransform.current;
        if (!el || !g || !t) return;
        let bbox: DOMRect;
        try {
            bbox = g.getBBox();
        } catch {
            return; // not laid out yet
        }
        if (!bbox.width || !bbox.height) return;

        const { width: cw, height: ch } = el.getBoundingClientRect();
        const m = 110; // keep at least this many px of the tree on screen
        const z = t.zoom;
        const minX = m - (bbox.x + bbox.width) * z;
        const maxX = cw - m - bbox.x * z;
        const minY = m - (bbox.y + bbox.height) * z;
        const maxY = ch - m - bbox.y * z;
        const cx = Math.min(maxX, Math.max(minX, t.translate.x));
        const cy = Math.min(maxY, Math.max(minY, t.translate.y));

        if (Math.abs(cx - t.translate.x) > 1 || Math.abs(cy - t.translate.y) > 1) {
            setTranslate({ x: cx, y: cy });
            setZoom(z);
            remount(); // re-applies the clamped translate (props read on mount)
        }
    }, [remount]);

    const handleTreeUpdate = useCallback(
        (target: { zoom: number; translate: { x: number; y: number } }) => {
            lastTransform.current = { zoom: target.zoom, translate: target.translate };
            setZoom(target.zoom); // keep the % readout in sync with scroll-zoom
            clearTimeout(idleTimer.current);
            idleTimer.current = setTimeout(clampToBounds, 180);
        },
        [clampToBounds],
    );

    // Root subtitle: "Package Care · Rank". Package from the viewer's own plan;
    // rank computed from their active direct referrals.
    const pkgKey = (user.package?.toLowerCase() ?? "") as keyof typeof PACKAGE_INFO;
    const pkgInfo = PACKAGE_INFO[pkgKey];
    const memberRankName = rankName(rankFromChildren(referralTree));
    const rootSubtitle = pkgInfo
        ? `${pkgKey.charAt(0).toUpperCase() + pkgKey.slice(1)} Care · ${memberRankName}`
        : memberRankName;

    // Commission depth of the viewer's package — nodes deeper than this are
    // "unreachable" (greyed). basic 1 · family 3 · premium 6.
    const maxLevels = pkgInfo?.level ?? 1;
    const toDatum = makeToDatum(maxLevels);

    const data: RawNodeDatum = {
        name: `${user.firstName} ${user.lastName}`.trim(),
        attributes: {
            initials: (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase(),
            subtitle: rootSubtitle,
            status: "root",
            reachable: true,
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
                onUpdate={handleTreeUpdate}
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

    const legend = (
        <div className="text-fsc-stone flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 px-3 pb-2 text-[11px]">
            {LEGEND.map((l) => (
                <span key={l.status} className="inline-flex items-center gap-1.5">
                    <span
                        className="h-2.5 w-2.5 rounded-full border"
                        style={{ background: styleFor(l.status).bg, borderColor: styleFor(l.status).border }}
                    />
                    {l.label}
                </span>
            ))}
            <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full border border-dashed border-[#94A3B8] bg-[#F1F5F9] opacity-50" />
                Beyond your level
            </span>
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
                            {legend}
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
                    {legend}
                </div>
            )}

            {/* Referral Link & QR */}
            <ReferralCard member={user} />
        </div>
    );
};
