// firebase/requestApproval.ts
//
// Shared internals for approving an upgrade OR a renewal request. Both do the
// same thing to the member: renew the term to 365 days, reset the eligibility
// timeline + grace clock, surface the latest verified payment, mirror the
// (possibly new) package to the public profile, and mark the source request
// approved. The only differences are captured by `reactivate` (a renewal
// re-activates a lapsed member; an upgrade keeps an already-active one) and the
// request collection. Commission payout differs per flow and stays in the caller.

import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config";
import { writePublicProfile } from "./publicProfiles";

interface ApprovedPayment {
    paymentReceiptUrl?: string | null;
    paymentReference?: string | null;
    paymentMethod?: string | null;
}

export async function applyApprovedRequest(opts: {
    requestCollection: "upgradeRequests" | "renewalRequests";
    requestId: string;
    memberId: string;
    toPackage: string;
    /** Renewal re-activates a lapsed member; upgrade leaves status untouched. */
    reactivate: boolean;
    payment: ApprovedPayment;
}): Promise<void> {
    const now = new Date();
    const dateExpiry = new Date(now);
    dateExpiry.setFullYear(dateExpiry.getFullYear() + 1); // renew → 365 days
    const dateContestabilityEnd = new Date(now);
    dateContestabilityEnd.setMonth(dateContestabilityEnd.getMonth() + 1);

    await updateDoc(doc(db, "members", opts.memberId), {
        package: opts.toPackage,
        ...(opts.reactivate ? { status: "active" } : {}),
        dateActivated: serverTimestamp(), // restarts the grace clock too
        dateEligibility: serverTimestamp(), // ← timeline resets to 0
        dateExpiry,
        dateContestabilityEnd,
        packageLocked: false,
        // Surface the latest verified payment on the member record. The previous
        // proof is retained on its own request doc for the audit trail.
        ...(opts.payment.paymentReceiptUrl ? { paymentReceiptUrl: opts.payment.paymentReceiptUrl } : {}),
        ...(opts.payment.paymentReference ? { paymentReference: opts.payment.paymentReference } : {}),
        ...(opts.payment.paymentMethod ? { paymentMethod: opts.payment.paymentMethod } : {}),
    });

    await updateDoc(doc(db, opts.requestCollection, opts.requestId), {
        status: "approved",
        dateDecided: serverTimestamp(),
    });

    // Mirror the (possibly new) package — and re-activation, for a renewal — to
    // the public profile.
    await writePublicProfile(opts.memberId, opts.reactivate ? { status: "active", package: opts.toPackage } : { package: opts.toPackage });
}
