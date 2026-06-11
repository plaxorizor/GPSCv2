import { ArrowRight, CheckCircle } from "lucide-react";
import { formatCurrency } from "../../utils/formatter";
import { upgradeCharge, isWithinGrace, packageLabel, type PackageKey } from "../../utils/upgrade";
import { requestUpgrade } from "../../firebase/upgrades";
import OfflinePaymentRequestModal from "./OfflinePaymentRequestModal";
import type { Member } from "../../utils/types";

interface Props {
    member: Member;
    toPackage: PackageKey;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UpgradeModal({ member, toPackage, onClose, onSuccess }: Props) {
    const memberName = `${member.firstName} ${member.lastName}`.trim();
    const inGrace = isWithinGrace(member.dateActivated ?? member.dateCreated);
    const amount = upgradeCharge(member.package ?? "", toPackage, inGrace);

    return (
        <OfflinePaymentRequestModal
            title="Upgrade your coverage"
            submitLabel="Submit upgrade request"
            doneTitle="Upgrade request submitted!"
            doneBody={
                <>
                    Your upgrade to <span className="text-fsc-navy font-semibold">{packageLabel(toPackage)} Care</span> is awaiting admin confirmation
                    of your payment. Once verified, your coverage upgrades immediately and your eligibility timeline restarts.
                </>
            }
            summary={
                <div className="border-fsc-cream-dark bg-fsc-cream/40 flex items-center justify-between rounded-xl border px-4 py-3">
                    <div>
                        <p className="text-fsc-stone text-xs tracking-wider uppercase">Your upgrade</p>
                        <p className="font-display text-fsc-navy flex items-center gap-2 text-base">
                            {packageLabel(member.package ?? "—")} Care
                            <ArrowRight size={14} className="text-[#C9922A]" />
                            {packageLabel(toPackage)} Care
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-fsc-stone text-xs tracking-wider uppercase">{inGrace ? "Difference" : "Full price"}</p>
                        <p className="font-display text-fsc-navy text-xl font-semibold">{formatCurrency(amount)}</p>
                    </div>
                </div>
            }
            instructions={
                <ol className="text-fsc-stone mt-4 list-decimal space-y-2 pl-4 text-sm">
                    <li>
                        Send <strong>{formatCurrency(amount)}</strong> using one of the payment methods below.
                    </li>
                    <li>Send your proof of payment to the admin (Facebook), including your full name.</li>
                    <li>Submit the request below — an admin confirms and your upgrade applies immediately.</li>
                </ol>
            }
            note={
                <div className="bg-fsc-green/10 mt-3 flex items-start gap-2 rounded-lg p-2 text-xs text-[#15803D]">
                    <CheckCircle size={14} className="mt-0.5 shrink-0" />
                    <span>On approval, your eligibility timeline restarts at 0 and your membership renews to 365 days.</span>
                </div>
            }
            onClose={onClose}
            onSuccess={onSuccess}
            onSubmit={({ reference, method, receiptFile }) =>
                requestUpgrade({ memberId: member.uid, memberName, toPackage, reference, method, receiptFile })
            }
            mapError={(msg) =>
                msg === "ALREADY_PENDING"
                    ? "You already have a pending upgrade request."
                    : msg === "NOT_ACTIVE"
                      ? "Your membership must be active to upgrade."
                      : undefined
            }
        />
    );
}
