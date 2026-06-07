// firebase/upgrades.ts
//
// Package-upgrade requests. A member self-requests an upgrade (after paying the
// difference offline); an admin verifies the payment and approves it. Approval
// applies the upgrade: changes the package, RESETS the eligibility timeline, and
// renews the membership to 365 days.

import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { upgradeDifference, upgradeTargets, graceDaysLeft, type PackageKey } from "../utils/upgrade";

export interface UpgradeRequest {
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
}

// Member creates an upgrade request (offline payment + proof handled separately).
export async function requestUpgrade(input: {
    memberId: string;
    memberName: string;
    toPackage: PackageKey;
}): Promise<void> {
    const snap = await getDoc(doc(db, "members", input.memberId));
    if (!snap.exists()) throw new Error("MEMBER_NOT_FOUND");
    const m = snap.data();

    if (m.status !== "active") throw new Error("NOT_ACTIVE");
    if (graceDaysLeft(m.dateActivated ?? m.dateCreated) <= 0) throw new Error("GRACE_EXPIRED");
    if (!upgradeTargets(m.package).includes(input.toPackage)) throw new Error("INVALID_TARGET");

    // Block duplicate pending requests.
    const existing = await getDocs(
        query(
            collection(db, "upgradeRequests"),
            where("memberId", "==", input.memberId),
            where("status", "==", "pending"),
        ),
    );
    if (!existing.empty) throw new Error("ALREADY_PENDING");

    await addDoc(collection(db, "upgradeRequests"), {
        memberId: input.memberId,
        memberName: input.memberName,
        fromPackage: m.package,
        toPackage: input.toPackage,
        amountDue: upgradeDifference(m.package, input.toPackage),
        status: "pending",
        dateRequested: serverTimestamp(),
        dateDecided: null,
        reason: null,
    });
}

// A member's current pending request (if any) — used to show a "pending" state.
export async function getPendingUpgradeForMember(memberId: string): Promise<UpgradeRequest | null> {
    const snap = await getDocs(
        query(collection(db, "upgradeRequests"), where("memberId", "==", memberId), where("status", "==", "pending")),
    );
    if (snap.empty) return null;
    const d = snap.docs[0];
    const data = d.data();
    return {
        id: d.id,
        memberId: data.memberId,
        memberName: data.memberName,
        fromPackage: data.fromPackage,
        toPackage: data.toPackage,
        amountDue: data.amountDue,
        status: data.status,
        dateRequested: data.dateRequested?.toDate?.()?.toISOString?.() ?? "",
        dateDecided: data.dateDecided?.toDate?.()?.toISOString?.() ?? null,
    };
}

// Admin: all pending upgrade requests, newest first.
export async function getPendingUpgradeRequests(): Promise<UpgradeRequest[]> {
    const snap = await getDocs(query(collection(db, "upgradeRequests"), where("status", "==", "pending")));
    return snap.docs
        .map((d) => {
            const data = d.data();
            return {
                id: d.id,
                memberId: data.memberId,
                memberName: data.memberName,
                fromPackage: data.fromPackage,
                toPackage: data.toPackage,
                amountDue: data.amountDue,
                status: data.status as "pending",
                dateRequested: data.dateRequested?.toDate?.()?.toISOString?.() ?? "",
                dateDecided: null,
            };
        })
        .sort((a, b) => (b.dateRequested > a.dateRequested ? 1 : -1));
}

// Admin approves: apply the upgrade. Changes package, RESETS eligibility
// (dateEligibility = now), and RENEWS membership to 365 days.
//
// NOTE: whether the upline earns a commission on the upgrade difference is still
// pending the client's decision — when confirmed, trigger it here on
// `request.amountDue` (or the full new package) before/after the member update.
export async function approveUpgrade(requestId: string): Promise<void> {
    const reqSnap = await getDoc(doc(db, "upgradeRequests", requestId));
    if (!reqSnap.exists()) throw new Error("REQUEST_NOT_FOUND");
    const req = reqSnap.data();
    if (req.status !== "pending") throw new Error("ALREADY_DECIDED");

    const now = new Date();
    const dateExpiry = new Date(now);
    dateExpiry.setFullYear(dateExpiry.getFullYear() + 1); // renew → 365 days
    const dateContestabilityEnd = new Date(now);
    dateContestabilityEnd.setMonth(dateContestabilityEnd.getMonth() + 1);

    await updateDoc(doc(db, "members", req.memberId), {
        package: req.toPackage,
        dateEligibility: serverTimestamp(), // ← timeline resets to 0
        dateActivated: serverTimestamp(), // restarts the grace clock too
        dateExpiry,
        dateContestabilityEnd,
        packageLocked: false,
    });

    await updateDoc(doc(db, "upgradeRequests", requestId), {
        status: "approved",
        dateDecided: serverTimestamp(),
    });
}

export async function rejectUpgrade(requestId: string, reason: string = ""): Promise<void> {
    await updateDoc(doc(db, "upgradeRequests", requestId), {
        status: "rejected",
        reason,
        dateDecided: serverTimestamp(),
    });
}
