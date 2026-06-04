import { useState, useEffect } from "react";
import { Copy, Share2, Check, ExternalLink, X } from "lucide-react";
import { QRCode } from "react-qrcode-logo";
import type { Member } from "../../utils/types";

const ReferralCard: React.FC<{ member: Member }> = ({ member }) => {
    const referralLink = `${window.location.origin}/signup?ref=${member.referralCode}`;

    const [linkCopied, setLinkCopied] = useState(false);
    const [modalCodeCopied, setModalCodeCopied] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const copyText = (text: string, setter: (v: boolean) => void) => {
        navigator.clipboard.writeText(text).then(() => {
            setter(true);
            setTimeout(() => setter(false), 2000);
        });
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setModalOpen(false);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    return (
        <>
            {/* Only show the referral card if the member is active */}
            {member.status === "active" && (
                <div className="border-gpsc-navy/ overflow-hidden rounded-2xl border">
                    {/* QR section — top */}
                    <button
                        onClick={() => setModalOpen(true)}
                        className="group relative flex w-full flex-col items-center gap-3 rounded-2xl bg-white px-8 pt-8 pb-8 transition-colors hover:bg-gray-50"
                    >
                        <QRCode value={referralLink} qrStyle="squares" ecLevel="H" size={160} eyeRadius={6} bgColor="#ffffff" fgColor="#0E1F3D" />
                        <div className="flex w-full items-center gap-2">
                            <div className="bg-gpsc-navy/15 h-px flex-1" />
                            <span className="text-gpsc-navy/40 text-[12px] font-bold tracking-widest uppercase">{member.referralCode}</span>

                            <div className="bg-gpsc-navy/15 h-px flex-1" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <span className="text-gpsc-navy flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold shadow-lg">
                                <ExternalLink size={12} /> Expand QR
                            </span>
                        </div>
                    </button>
                </div>
            )}

            {modalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setModalOpen(false);
                    }}
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
                    <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl bg-white p-8 shadow-2xl">
                        <button onClick={() => setModalOpen(false)} className="text-gpsc-stone hover:text-gpsc-navy absolute top-4 right-4">
                            <X size={20} />
                        </button>
                        <div className="text-center">
                            <p className="text-gpsc-stone mt-1 text-sm">Share this QR code to invite members</p>
                        </div>
                        <div className="bg-gpsc-navy/5 flex justify-center rounded-2xl p-5">
                            <QRCode value={referralLink} qrStyle="squares" ecLevel="H" size={220} eyeRadius={6} bgColor="#f9f7f2" fgColor="#0E1F3D" />
                        </div>
                        <div className="bg-gpsc-cream-dark/50 flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3">
                            <div className="min-w-0">
                                <p className="text-gpsc-stone text-[10px] font-semibold tracking-widest uppercase">Referral Link</p>
                                <p className="text-gpsc-navy/70 truncate text-xs">{referralLink}</p>
                            </div>
                            <button
                                onClick={() => copyText(referralLink, setLinkCopied)}
                                className="bg-gpsc-navy hover:bg-gpsc-navy/80 flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-white"
                            >
                                {linkCopied ? (
                                    <>
                                        <Check size={12} />
                                        <span>Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={12} />
                                        <span>Copy</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="bg-gpsc-cream-dark/50 flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3">
                            <div>
                                <p className="text-gpsc-stone text-[10px] font-semibold tracking-widest uppercase">Referral Code</p>
                                <p className="text-gpsc-navy font-mono font-bold tracking-widest">{member.referralCode}</p>
                            </div>
                            <button
                                onClick={() => copyText(member.referralCode, setModalCodeCopied)}
                                className="bg-gpsc-navy hover:bg-gpsc-navy/80 flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-white"
                            >
                                {modalCodeCopied ? (
                                    <>
                                        <Check size={12} />
                                        <span>Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={12} />
                                        <span>Copy</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <button className="bg-gpsc-green flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110">
                            <Share2 size={14} /> Share
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
export default ReferralCard;
