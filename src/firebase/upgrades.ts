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
    onSnapshot,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { upgradeCharge, upgradeTargets, isWithinGrace, type PackageKey } from "../utils/upgrade";
import { triggerUpgradeCommissions } from "./transactions";

export interface UpgradeRequest {
    id: string;
    memberId: string;
    memberName: string;
    fromPackage: string;
    toPackage: string;
    amountDue: number;
    basis: "difference" | "full"; // difference within grace, full price after
    status: "pending" | "approved" | "rejected";
    dateRequested: string;
    dateDecided: string | null;
    reason?: string | null;
    paymentReference?: string | null;
    paymentMethod?: string | null;
}

// Member creates an upgrade request (offline payment + proof handled separately).
export async function requestUpgrade(input: {
    memberId: string;
    memberName: string;
    toPackage: PackageKey;
    reference?: string;
    method?: string;
}): Promise<void> {
    const snap = await getDoc(doc(db, "members", input.memberId));
    if (!snap.exists()) throw new Error("MEMBER_NOT_FOUND");
    const m = snap.data();

    if (m.status !== "active") throw new Error("NOT_ACTIVE");
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

    // Within the 90-day grace window: pay only the difference. After it: full price.
    const inGrace = isWithinGrace(m.dateActivated ?? m.dateCreated);
    const basis: "difference" | "full" = inGrace ? "difference" : "full";

    await addDoc(collection(db, "upgradeRequests"), {
        memberId: input.memberId,
        memberName: input.memberName,
        fromPackage: m.package,
        toPackage: input.toPackage,
        amountDue: upgradeCharge(m.package, input.toPackage, inGrace),
        basis,
        status: "pending",
        dateRequested: serverTimestamp(),
        dateDecided: null,
        reason: null,
        paymentReference: input.reference?.trim() || null,
        paymentMethod: input.method ?? null,
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
        basis: data.basis ?? "difference",
        status: data.status,
        dateRequested: data.dateRequested?.toDate?.()?.toISOString?.() ?? "",
        dateDecided: data.dateDecided?.toDate?.()?.toISOString?.() ?? null,
    };
}

// Shared mapping for a pending upgrade-request doc.
function mapPendingUpgrade(id: string, data: Record<string, unknown>): UpgradeRequest {
    const d = data;
    return {
        id,
        memberId: d.memberId as string,
        memberName: d.memberName as string,
        fromPackage: d.fromPackage as string,
        toPackage: d.toPackage as string,
        amountDue: d.amountDue as number,
        basis: (d.basis as "difference" | "full") ?? "difference",
        status: "pending",
        dateRequested: (d.dateRequested as { toDate?: () => Date })?.toDate?.()?.toISOString?.() ?? "",
        dateDecided: null,
        paymentReference: (d.paymentReference as string | null) ?? null,
        paymentMethod: (d.paymentMethod as string | null) ?? null,
    };
}

// Admin: all pending upgrade requests, newest first.
export async function getPendingUpgradeRequests(): Promise<UpgradeRequest[]> {
    const snap = await getDocs(query(collection(db, "upgradeRequests"), where("status", "==", "pending")));
    return snap.docs.map((d) => mapPendingUpgrade(d.id, d.data())).sort((a, b) => (b.dateRequested > a.dateRequested ? 1 : -1));
}

// Admin: live subscription to pending upgrade requests. Returns an unsubscribe fn.
export function subscribePendingUpgradeRequests(cb: (requests: UpgradeRequest[]) => void): () => void {
    return onSnapshot(query(collection(db, "upgradeRequests"), where("status", "==", "pending")), (snap) => {
        cb(snap.docs.map((d) => mapPendingUpgrade(d.id, d.data())).sort((a, b) => (b.dateRequested > a.dateRequested ? 1 : -1)));
    });
}

// Admin approves: apply the upgrade. Changes package, RESETS eligibility
// (dateEligibility = now), RENEWS membership to 365 days, and pays the upline a
// commission on the amount the member actually paid — the DIFFERENCE if upgraded
// within the grace window (base already paid commission at signup), or the FULL
// new package price if upgraded after grace.
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

    // Pay the upline on what the member paid. Re-derive authoritatively from the
    // package pair + the basis recorded at request time (difference vs full),
    // rather than trusting the stored amountDue number.
    const charge = upgradeCharge(req.fromPackage as PackageKey, req.toPackage as PackageKey, req.basis !== "full");
    await triggerUpgradeCommissions(req.memberId, charge);
}

export async function rejectUpgrade(requestId: string, reason: string = ""): Promise<void> {
    await updateDoc(doc(db, "upgradeRequests", requestId), {
        status: "rejected",
        reason,
        dateDecided: serverTimestamp(),
    });
}
