import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Crosshair, ZoomIn, ZoomOut, SlidersHorizontal, RotateCcw, X } from "lucide-react";
import { QRCode } from "react-qrcode-logo";
import logo from "../../components/ui/Logo.png";
import Tree from "react-d3-tree";
import type { CustomNodeElementProps, RawNodeDatum } from "react-d3-tree";
import { PACKAGE_INFO } from "../../utils/types";
import type { Member, ReferralNode } from "../../utils/types";
import { rankFromChildren, rankName } from "../../utils/rank";
import ReferralCard, { type ReferralCardHandle } from "./ReferralCard";

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
    (onQrClick: () => void) =>
    ({ nodeDatum }: CustomNodeElementProps) => {
        const a = (nodeDatum.attributes ?? {}) as Record<string, string | number | boolean>;
        const status = String(a.status ?? "inactive");

        // Synthetic QR root — a scannable referral-link preview above the member.
        // Rendered larger with a quiet zone for reliable scanning; click to expand.
        if (status === "qr") {
            const W = 220;
            const H = 230;
            return (
                <g>
                    <foreignObject x={-W / 2} y={-H / 2} width={W} height={H} style={{ overflow: "visible" }}>
                        <button
                            type="button"
                            onClick={onQrClick}
                            title="Expand / share QR"
                            className="border-fsc-navy hover:bg-fsc-cream group flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 bg-white p-3 shadow-sm transition-colors"
                        >
                            <QRCode
                                value={String(a.qrValue ?? "")}
                                size={168}
                                quietZone={10}
                                ecLevel="H"
                                qrStyle="squares"
                                eyeRadius={6}
                                bgColor="#ffffff"
                                fgColor="#0E1F3D"
                                logoImage={logo}
                                logoWidth={34}
                                logoHeight={34}
                                logoPadding={2}
                                logoPaddingStyle="circle"
                            />
                            <span className="text-fsc-navy/50 text-[10px] font-bold tracking-widest uppercase">{String(a.code ?? "")}</span>
                        </button>
                    </foreignObject>
                </g>
            );
        }

        const reachable = a.reachable !== false; // unreachable = beyond commission depth
        const s = styleFor(status);
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
                            style={{
                                background: s.bg,
                                borderColor: s.border,
                                borderStyle: reachable ? "solid" : "dashed",
                            }}
                            className="flex h-full items-center gap-2.5 rounded-full border-2 pr-3 pl-1.5"
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
                        </div>
                    </div>
                </foreignObject>
            </g>
        );
    };

type Orientation = "vertical" | "horizontal";
type PathStyle = "step" | "diagonal" | "straight" | "elbow";

// Button-driven zoom range (scroll-zoom is disabled; buttons only).
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.2;
const DEFAULT_ZOOM = 1; // start at 100%
const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

// Transitions are always on with this duration; drag/expand are always enabled.
const TRANSITION_MS = 500;

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
    const cardRef = useRef<ReferralCardHandle>(null); // to open the share modal from the QR node
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const [ready, setReady] = useState(false); // gate Tree until centered (no off-center flash)

    // Show the member's referral QR as a scannable preview node above them, but
    // only when active (a referral code exists — enforced by the golden rule).
    const referralLink = `${window.location.origin}/signup?ref=${user.referralCode}`;
    const showQrRoot = user.status === "active" && !!user.referralCode;

    // Live, in-page tree settings.
    const [orientation, setOrientation] = useState<Orientation>("vertical");
    const [pathStyle, setPathStyle] = useState<PathStyle>("step");
    const [spacing, setSpacing] = useState(1); // 0.6 (compact) … 1.6 (spacious)
    const [siblingSep, setSiblingSep] = useState(1.1); // gap between siblings
    const [levelDistance, setLevelDistance] = useState(1); // multiplier on depth gap
    const [zoom, setZoom] = useState(DEFAULT_ZOOM);
    const [showSettings, setShowSettings] = useState(false);

    // Restore every tree setting to its default.
    const resetSettings = () => {
        setOrientation("vertical");
        setPathStyle("step");
        setSpacing(1);
        setSiblingSep(1.1);
        setLevelDistance(1);
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
                ? { x: width / 2, y: showQrRoot ? 140 : 80 } // QR root is taller, start lower
                : { x: showQrRoot ? 150 : 120, y: height / 2 },
        );
    }, [orientation, showQrRoot]);

    // Center the tree before paint whenever it (re)appears — on first load the
    // referral data can arrive after mount, and the container size changes on
    // orientation toggles. Gating on `ready` avoids an off-center flash
    // (otherwise the Tree mounts at {0,0} = root pinned to top-left).
    useLayoutEffect(() => {
        if (referralTree.length === 0) return;
        recenter();
        remount();
        setReady(true);
    }, [referralTree.length, orientation, recenter, remount]);

    // Keep it centered on window resize.
    useEffect(() => {
        const onResize = () => {
            recenter();
            remount();
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [recenter, remount]);

    const resetView = () => {
        setZoom(DEFAULT_ZOOM);
        recenter();
        remount();
    };

    // Close the settings modal with Escape.
    useEffect(() => {
        if (!showSettings) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShowSettings(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [showSettings]);

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
            remount(); // re-applies the clamped translate (props read on mount)
        }
    }, [remount]);

    const handleTreeUpdate = useCallback(
        (target: { zoom: number; translate: { x: number; y: number } }) => {
            lastTransform.current = { zoom: target.zoom, translate: target.translate };
            clearTimeout(idleTimer.current);
            idleTimer.current = setTimeout(clampToBounds, 180);
        },
        [clampToBounds],
    );

    // Zoom about the viewport center (not the root). The Tree's root sits at the
    // transform origin, so we re-derive translate to keep the centered point fixed.
    const zoomBy = (delta: number) => {
        const zNew = clampZoom(+(zoom + delta).toFixed(2));
        if (zNew === zoom) return;
        const tOld = lastTransform.current?.translate ?? translate;
        let tNew = tOld;
        const el = containerRef.current;
        if (el) {
            const { width, height } = el.getBoundingClientRect();
            const cx = width / 2;
            const cy = height / 2;
            const k = zNew / zoom;
            tNew = { x: cx - (cx - tOld.x) * k, y: cy - (cy - tOld.y) * k };
        }
        lastTransform.current = { zoom: zNew, translate: tNew };
        setZoom(zNew);
        setTranslate(tNew);
        remount();
    };

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

    const memberNode: RawNodeDatum = {
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

    // QR → You → downline (when the QR preview applies).
    const data: RawNodeDatum = showQrRoot
        ? {
              name: "",
              attributes: { status: "qr", qrValue: referralLink, code: user.referralCode, reachable: true },
              children: [memberNode],
          }
        : memberNode;

    // Always fully expanded (collapsing disabled). The QR root opens the share modal.
    const renderNode = makeRenderNode(() => cardRef.current?.open());

    // Behavior props that need a Tree remount to take effect (react-d3-tree reads
    // them when building its internal state). Layout sliders update live; zoom is
    // button-driven and applied via remount.
    const behaviorKey = [orientation, zoom, viewKey].join("-");

    // The wrapper always renders so it can be measured; the Tree itself waits for
    // `ready` (set after the first centering pass) to avoid an off-center flash.
    const treeBody = (heightClass: string) => (
        <div ref={containerRef} className={`fsc-tree-wrap w-full ${heightClass}`}>
            {ready && (
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
                depthFactor={(orientation === "vertical" ? (showQrRoot ? 175 : 130) : 260) * levelDistance}
                collapsible={false}
                draggable
                zoomable={false}
                enableLegacyTransitions
                transitionDuration={TRANSITION_MS}
                scaleExtent={{ min: MIN_ZOOM, max: MAX_ZOOM }}
                zoom={zoom}
                onUpdate={handleTreeUpdate}
            />
            )}
        </div>
    );

    // Floating top-left: Settings · Re-center · Zoom (icon-only).
    const floatingControls = referralTree.length > 0 && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            <button
                type="button"
                onClick={() => setShowSettings(true)}
                title="Tree settings"
                className="border-fsc-cream-dark text-fsc-stone hover:bg-fsc-cream flex h-9 w-9 items-center justify-center rounded-full border bg-white shadow-sm transition-colors"
            >
                <SlidersHorizontal size={16} />
            </button>
            <button
                type="button"
                onClick={resetView}
                title="Re-center the tree"
                className="border-fsc-cream-dark text-fsc-stone hover:bg-fsc-cream flex h-9 w-9 items-center justify-center rounded-full border bg-white shadow-sm transition-colors"
            >
                <Crosshair size={16} />
            </button>
            <div className="border-fsc-cream-dark flex h-9 items-center overflow-hidden rounded-full border bg-white shadow-sm">
                <button
                    type="button"
                    onClick={() => zoomBy(-ZOOM_STEP)}
                    disabled={zoom <= MIN_ZOOM}
                    title="Zoom out"
                    className="text-fsc-stone hover:bg-fsc-cream flex h-full items-center px-2.5 transition-colors disabled:opacity-40"
                >
                    <ZoomOut size={16} />
                </button>
                <span className="text-fsc-stone w-11 text-center text-xs tabular-nums">{Math.round(zoom * 100)}%</span>
                <button
                    type="button"
                    onClick={() => zoomBy(ZOOM_STEP)}
                    disabled={zoom >= MAX_ZOOM}
                    title="Zoom in"
                    className="text-fsc-stone hover:bg-fsc-cream flex h-full items-center px-2.5 transition-colors disabled:opacity-40"
                >
                    <ZoomIn size={16} />
                </button>
            </div>
        </div>
    );

    // Centered settings dialog — all tree options live here.
    const settingsModal = showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
            <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-display text-fsc-navy text-lg">Tree Settings</h2>
                    <button onClick={() => setShowSettings(false)} className="text-fsc-stone hover:text-fsc-navy transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-4 text-xs">
                    {/* Orientation */}
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-fsc-stone">Orientation</span>
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
                    </div>

                    {/* Connector style */}
                    <label className="flex items-center justify-between gap-3">
                        <span className="text-fsc-stone">Connector style</span>
                        <select
                            value={pathStyle}
                            onChange={(e) => setPathStyle(e.target.value as PathStyle)}
                            className="border-fsc-cream-dark text-fsc-navy w-40 rounded-lg border bg-white px-2 py-1.5"
                        >
                            <option value="step">Step lines</option>
                            <option value="diagonal">Curved lines</option>
                            <option value="straight">Straight lines</option>
                            <option value="elbow">Elbow lines</option>
                        </select>
                    </label>

                    <div className="border-fsc-cream-dark space-y-3 border-t pt-3">
                        <PanelSlider label="Node spacing" value={spacing} min={0.6} max={1.8} step={0.1} onChange={setSpacing} fmt={(v) => `${v.toFixed(1)}×`} />
                        <PanelSlider label="Sibling gap" value={siblingSep} min={0.6} max={2.5} step={0.1} onChange={setSiblingSep} fmt={(v) => `${v.toFixed(1)}×`} />
                        <PanelSlider label="Level distance" value={levelDistance} min={0.6} max={2.5} step={0.1} onChange={setLevelDistance} fmt={(v) => `${v.toFixed(1)}×`} />
                    </div>
                </div>

                <div className="border-fsc-cream-dark mt-5 flex justify-end border-t pt-4">
                    <button
                        type="button"
                        onClick={resetSettings}
                        className="border-fsc-cream-dark text-fsc-stone hover:bg-fsc-cream flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors"
                    >
                        <RotateCcw size={13} /> Reset all settings
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <style>{treeStyles}</style>

            {/* Full-bleed canvas: fixed layer that fills the viewport, clearing the
                fixed sidebar on lg. No card/margins/rounding — just the canvas. */}
            <div className="fixed inset-0 z-0 overflow-hidden bg-white lg:left-16">
                {referralTree.length > 0 ? (
                    <>
                        {treeBody("h-full w-full")}
                        {floatingControls}
                    </>
                ) : (
                    <div className="text-fsc-stone flex h-full items-center justify-center px-6 text-center">
                        No referrals yet. Share your link to start building your network.
                    </div>
                )}
            </div>

            {settingsModal}

            {/* QR modal host — the visible card is hidden; the in-canvas QR node opens it */}
            <ReferralCard ref={cardRef} member={user} showTrigger={false} />
        </>
    );
};
