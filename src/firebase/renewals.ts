// firebase/renewals.ts
//
// Membership renewal requests. A lapsed (grace) member re-subscribes — paying the
// FULL price of a chosen tier (re-subscription model, so they may switch tiers).
// An admin verifies the offline payment and approves: sets the package, RE-ACTIVATES
// the member, RESETS the eligibility timeline, and renews the term to 365 days.

import { collection, doc, addDoc, getDoc, getDocs, updateDoc, query, where, onSnapshot, serverTimestamp, type DocumentData } from "firebase/firestore";
import { db } from "./config";
import { packagePrice, type PackageKey } from "../utils/upgrade";
import { triggerRenewalCommissions } from "./transactions";

export interface RenewalRequest {
    id: string;
    memberId: string;
    memberName: string;
    fromPackage: string;
    toPackage: string;
    amountDue: number;
    status: "pending" | "approved" | "rejected";
    dateRequested: string;
    dateDecided: string | null;
    reason?: string | null;
    paymentReference?: string | null;
    paymentMethod?: string | null;
}

// Member submits a renewal request (offline payment + proof handled separately).
export async function requestRenewal(input: {
    memberId: string;
    memberName: string;
    toPackage: PackageKey;
    reference?: string;
    method?: string;
}): Promise<void> {
    const snap = await getDoc(doc(db, "members", input.memberId));
    if (!snap.exists()) throw new Error("MEMBER_NOT_FOUND");
    const m = snap.data();

    // Block duplicate pending requests.
    const existing = await getDocs(
        query(collection(db, "renewalRequests"), where("memberId", "==", input.memberId), where("status", "==", "pending")),
    );
    if (!existing.empty) throw new Error("ALREADY_PENDING");

    await addDoc(collection(db, "renewalRequests"), {
        memberId: input.memberId,
        memberName: input.memberName,
        fromPackage: m.package ?? "",
        toPackage: input.toPackage,
        amountDue: packagePrice(input.toPackage), // full price (re-subscription)
        status: "pending",
        dateRequested: serverTimestamp(),
        dateDecided: null,
        reason: null,
        paymentReference: input.reference?.trim() || null,
        paymentMethod: input.method ?? null,
    });
}

const mapRequest = (id: string, data: DocumentData): RenewalRequest => ({
    id,
    memberId: data.memberId,
    memberName: data.memberName,
    fromPackage: data.fromPackage,
    toPackage: data.toPackage,
    amountDue: data.amountDue,
    status: data.status,
    dateRequested: data.dateRequested?.toDate?.()?.toISOString?.() ?? "",
    dateDecided: data.dateDecided?.toDate?.()?.toISOString?.() ?? null,
    paymentReference: data.paymentReference ?? null,
    paymentMethod: data.paymentMethod ?? null,
});

// A member's current pending renewal (if any).
export async function getPendingRenewalForMember(memberId: string): Promise<RenewalRequest | null> {
    const snap = await getDocs(
        query(collection(db, "renewalRequests"), where("memberId", "==", memberId), where("status", "==", "pending")),
    );
    if (snap.empty) return null;
    return mapRequest(snap.docs[0].id, snap.docs[0].data());
}

// Admin: all pending renewal requests, newest first.
export async function getPendingRenewalRequests(): Promise<RenewalRequest[]> {
    const snap = await getDocs(query(collection(db, "renewalRequests"), where("status", "==", "pending")));
    return snap.docs.map((d) => mapRequest(d.id, d.data())).sort((a, b) => (b.dateRequested > a.dateRequested ? 1 : -1));
}

// Admin: live subscription to pending renewal requests. Returns an unsubscribe fn.
export function subscribePendingRenewalRequests(cb: (requests: RenewalRequest[]) => void): () => void {
    return onSnapshot(query(collection(db, "renewalRequests"), where("status", "==", "pending")), (snap) => {
        cb(snap.docs.map((d) => mapRequest(d.id, d.data())).sort((a, b) => (b.dateRequested > a.dateRequested ? 1 : -1)));
    });
}

// Admin approves: re-activate the member at the chosen package, reset eligibility,
// renew the term to 365 days, and pay the upline a commission on the full price
// (a renewal is a re-subscription, so it pays like a fresh signup).
export async function approveRenewal(requestId: string): Promise<void> {
    const reqSnap = await getDoc(doc(db, "renewalRequests", requestId));
    if (!reqSnap.exists()) throw new Error("REQUEST_NOT_FOUND");
    const req = reqSnap.data();
    if (req.status !== "pending") throw new Error("ALREADY_DECIDED");

    const now = new Date();
    const dateExpiry = new Date(now);
    dateExpiry.setFullYear(dateExpiry.getFullYear() + 1); // renew → 365 days
    const dateContestabilityEnd = new Date(now);
    dateContestabilityEnd.setMonth(dateContestabilityEnd.getMonth() + 1);

    await updateDoc(doc(db, "members", req.memberId), {
        package: req.toPackage, // may differ from current — re-subscription
        status: "active",
        dateActivated: serverTimestamp(),
        dateEligibility: serverTimestamp(), // timeline resets to 0
        dateExpiry,
        dateContestabilityEnd,
        packageLocked: false,
    });

    await updateDoc(doc(db, "renewalRequests", requestId), {
        status: "approved",
        dateDecided: serverTimestamp(),
    });

    // Pay the upline on the full renewal price.
    await triggerRenewalCommissions(req.memberId, req.toPackage as PackageKey);
}

export async function rejectRenewal(requestId: string, reason: string = ""): Promise<void> {
    await updateDoc(doc(db, "renewalRequests", requestId), {
        status: "rejected",
        reason,
        dateDecided: serverTimestamp(),
    });
}
