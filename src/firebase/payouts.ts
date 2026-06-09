// firebase/payouts.ts
//
// Member-side payout requests. A member selects one or more eligible
// commissions and requests a payout; the selected commissions are locked
// (status → "requested") and a payout doc records the gross/fee/net.
//
// We re-read the commission docs here (rather than trusting amounts passed from
// the client UI) so the gross is always authoritative.

import { collection, doc, getDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "./config";
import { feeFor, netAfterFee, isEligible, MIN_PAYOUT } from "../utils/commission";
import { membershipPhase } from "../utils/membership";

export interface RequestPayoutInput {
    memberId: string;
    memberName: string;
    commissionIds: string[];
    method: string;
    accountNumber: string;
    accountName: string;
}

export async function requestPayout(input: RequestPayoutInput): Promise<{ gross: number; fee: number; net: number }> {
    const { memberId, commissionIds } = input;
    if (commissionIds.length === 0) throw new Error("NO_COMMISSIONS_SELECTED");

    // Only active memberships can withdraw — grace/expired members must renew first.
    const memberSnap = await getDoc(doc(db, "members", memberId));
    if (!memberSnap.exists()) throw new Error("MEMBER_NOT_FOUND");
    if (membershipPhase(memberSnap.data()) !== "active") throw new Error("MEMBERSHIP_NOT_ACTIVE");

    // Load + validate every selected commission (must belong to the member,
    // be claimable, and be eligible by time/level).
    const snaps = await Promise.all(commissionIds.map((id) => getDoc(doc(db, "commissions", id))));
    let gross = 0;
    for (const snap of snaps) {
        if (!snap.exists()) throw new Error("COMMISSION_NOT_FOUND");
        const c = snap.data();
        if (c.earnedBy !== memberId) throw new Error("NOT_YOUR_COMMISSION");
        // Claimable = not already requested/paid. (Legacy "released" still counts.)
        if (c.status === "requested" || c.status === "paid") throw new Error("ALREADY_CLAIMED");
        if (!isEligible(c.level, c.dateCreated)) throw new Error("NOT_YET_ELIGIBLE");
        gross += c.amount ?? 0;
    }

    if (gross < MIN_PAYOUT) throw new Error("BELOW_MINIMUM");

    const fee = feeFor(gross);
    const net = netAfterFee(gross);

    // One atomic batch: create the payout, lock the commissions.
    const batch = writeBatch(db);
    const payoutRef = doc(collection(db, "payouts"));
    batch.set(payoutRef, {
        memberId,
        memberName: input.memberName,
        commissionIds,
        grossAmount: gross,
        feeAmount: fee,
        amount: net, // net is what the member receives
        method: input.method,
        accountNumber: input.accountNumber,
        accountName: input.accountName,
        status: "requested",
        dateRequested: serverTimestamp(),
        dateSent: null,
        reference: null,
    });
    for (const id of commissionIds) {
        batch.update(doc(db, "commissions", id), { status: "requested", payoutId: payoutRef.id });
    }
    await batch.commit();

    return { gross, fee, net };
}
