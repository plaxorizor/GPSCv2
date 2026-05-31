import { Copy, Share2 } from "lucide-react";
import { QRCode } from "react-qrcode-logo";
import type { Member } from "../../utils/types";

const ReferralCard: React.FC<{ member: Member }> = ({ member }) => {

    const referralLink = `${window.location.origin}/signup?ref=${member.referralCode}`;

    const handleCopyReferralLink = async () => {
        await navigator.clipboard.writeText(referralLink);
        alert("Referral link copied!");
    };

    return (
        <>
            <div className="bg-gpsc-navy rounded-2xl p-6 text-white">
                <div className="mb-4 text-xs tracking-wider text-white/60 uppercase">Your Referral Link</div>
                <div className="mb-6 flex gap-2">
                    <button
                        onClick={handleCopyReferralLink}
                        className="text-gpsc-navy flex flex-1 items-center justify-center gap-2 rounded-lg bg-white py-2 text-sm font-medium"
                    >
                        <Copy size={14} /> Copy
                    </button>
                    <button className="bg-gpsc-green flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium">
                        <Share2 size={14} /> Share
                    </button>
                </div>
                <div className="border-t border-white/10 pt-6">
                    <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-xl bg-white p-3">
                        <QRCode value={referralLink} qrStyle="dots" ecLevel="H" size={150} eyeRadius={50} />
                    </div>
                </div>
            </div>
        </>
    );
};
export default ReferralCard;
