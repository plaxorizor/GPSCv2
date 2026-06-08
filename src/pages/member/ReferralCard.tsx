import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Copy, Share2, Check, ExternalLink, X, Download } from "lucide-react";
import { QRCode } from "react-qrcode-logo";
import type { Member } from "../../utils/types";
import logo from "../../components/ui/Logo.png";

export interface ReferralCardHandle {
    open: () => void;
}

const ReferralCard = forwardRef<ReferralCardHandle, { member: Member; showTrigger?: boolean }>(({ member, showTrigger = true }, ref) => {
    const referralLink = `${window.location.origin}/signup?ref=${member.referralCode}`;

    const [linkCopied, setLinkCopied]           = useState(false);
    const [modalCodeCopied, setModalCodeCopied]  = useState(false);
    const [modalOpen, setModalOpen]              = useState(false);

    const copyText = (text: string, setter: (v: boolean) => void) => {
        navigator.clipboard.writeText(text).then(() => {
            setter(true);
            setTimeout(() => setter(false), 2000);
        });
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Join Faith Shield Care",
                    text: `Join Faith Shield Care using my referral code: ${member.referralCode}`,
                    url: referralLink,
                });
            } catch {
                // user cancelled
            }
        } else {
            // Fallback for desktop browsers that don't support Web Share API
            copyText(referralLink, setLinkCopied);
        }
    };

    const handleDownload = () => {
        const canvas = document.getElementById("qr-modal-canvas") as HTMLCanvasElement;
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = `faithshield-referral-${member.referralCode}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    useImperativeHandle(ref, () => ({ open: () => setModalOpen(true) }), []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setModalOpen(false);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    return (
        <>
            {showTrigger && member.status === "active" && (
                <div className="border-fsc-cream-dark flex items-center justify-center overflow-hidden rounded-2xl border">
                    <button
                        onClick={() => setModalOpen(true)}
                        className="group relative flex w-full flex-col items-center gap-3 rounded-2xl bg-white px-8 pt-8 pb-8 transition-colors hover:bg-fsc-cream"
                    >
                        <QRCode
                            value={referralLink}
                            qrStyle="squares"
                            ecLevel="H"
                            size={160}
                            eyeRadius={6}
                            bgColor="#ffffff"
                            fgColor="#0E1F3D"
                            logoImage={logo}
                            logoWidth={32}
                            logoHeight={32}
                            logoPadding={2}
                            logoPaddingStyle="circle"
                        />
                        <div className="flex w-full items-center gap-2">
                            <div className="bg-fsc-navy/15 h-px flex-1" />
                            <span className="text-fsc-navy/40 text-[12px] font-bold tracking-widest uppercase">{member.referralCode}</span>
                            <div className="bg-fsc-navy/15 h-px flex-1" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <span className="text-fsc-navy flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold shadow-lg">
                                <ExternalLink size={12} /> Expand QR
                            </span>
                        </div>
                    </button>
                </div>
            )}

            {modalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
                    <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl bg-white p-8 shadow-2xl">
                        <button
                            onClick={() => setModalOpen(false)}
                            aria-label="Close"
                            className="text-fsc-stone hover:text-fsc-navy hover:bg-fsc-cream absolute top-3 right-3 rounded-lg p-2 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {/* Header */}
                        <div className="text-center">
                            <h2 className="font-display text-fsc-navy text-xl">Your Referral QR</h2>
                            <p className="text-fsc-stone mt-1 text-sm">
                                Share to invite members ·{" "}
                                <span className="text-fsc-navy font-mono font-bold">{member.referralCode}</span>
                            </p>
                        </div>

                        {/* QR with logo — canvas scales down on narrow screens */}
                        <div className="bg-fsc-navy/5 flex w-full justify-center rounded-2xl p-4 [&>canvas]:h-auto [&>canvas]:max-w-full sm:p-5">
                            <QRCode
                                id="qr-modal-canvas"
                                value={referralLink}
                                qrStyle="squares"
                                ecLevel="H"
                                size={220}
                                eyeRadius={6}
                                bgColor="#f9f7f2"
                                fgColor="#0E1F3D"
                                logoImage={logo}
                                logoWidth={44}
                                logoHeight={44}
                                logoPadding={3}
                                logoPaddingStyle="circle"
                            />
                        </div>

                        {/* Referral link */}
                        <div className="bg-fsc-cream-dark/50 flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3">
                            <div className="min-w-0">
                                <p className="text-fsc-stone text-[10px] font-semibold tracking-widest uppercase">Referral Link</p>
                                <p className="text-fsc-navy/70 truncate text-xs">{referralLink}</p>
                            </div>
                            <button
                                onClick={() => copyText(referralLink, setLinkCopied)}
                                className="bg-fsc-navy hover:bg-fsc-navy/80 flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-white transition-colors"
                            >
                                {linkCopied
                                    ? <><Check size={12} /><span>Copied!</span></>
                                    : <><Copy size={12} /><span>Copy</span></>}
                            </button>
                        </div>

                        {/* Referral code */}
                        <div className="bg-fsc-cream-dark/50 flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3">
                            <div>
                                <p className="text-fsc-stone text-[10px] font-semibold tracking-widest uppercase">Referral Code</p>
                                <p className="text-fsc-navy font-mono font-bold tracking-widest">{member.referralCode}</p>
                            </div>
                            <button
                                onClick={() => copyText(member.referralCode, setModalCodeCopied)}
                                className="bg-fsc-navy hover:bg-fsc-navy/80 flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-white transition-colors"
                            >
                                {modalCodeCopied
                                    ? <><Check size={12} /><span>Copied!</span></>
                                    : <><Copy size={12} /><span>Copy</span></>}
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex w-full gap-3">
                            <button
                                onClick={handleDownload}
                                className="border-fsc-cream-dark text-fsc-navy hover:bg-fsc-cream flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-colors"
                            >
                                <Download size={14} /> Save QR
                            </button>
                            <button
                                onClick={handleShare}
                                className="bg-fsc-green flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
                            >
                                <Share2 size={14} /> Share
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});
ReferralCard.displayName = "ReferralCard";
export default ReferralCard;
