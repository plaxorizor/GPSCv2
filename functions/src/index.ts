import { setGlobalOptions } from "firebase-functions";
import { onCall, HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

initializeApp();
setGlobalOptions({ maxInstances: 10 });

const db = getFirestore();

// ── Types ─────────────────────────────────────────────────────────────────────

type Package = "basic" | "family" | "premium";

const PACKAGE_AMOUNTS: Record<Package, number> = {
    basic: 698,
    family: 1698,
    premium: 4998,
};

const COMMISSION_RATES: Record<number, number> = {
    1: 0.2,
    2: 0.05,
    3: 0.03,
    4: 0.02,
    5: 0.01,
    6: 0.01,
};

const PACKAGE_MAX_LEVELS: Record<Package, number> = {
    basic: 1,
    family: 3,
    premium: 6,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateReferralCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const segment = (len: number) =>
        Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `${segment(4)}-${segment(4)}-${segment(4)}`;
}

function assertAdmin(auth: CallableRequest["auth"]) {
    if (!auth?.token["admin"]) {
        throw new HttpsError("permission-denied", "Admin access required.");
    }
}

// ── triggerCommissions (internal — not exported as a callable) ────────────────

async function triggerCommissions(newMemberId: string, pkg: Package) {
    // Normalise casing — Firestore may store "Basic", "basic", etc.
    const normPkg = (pkg as string).toLowerCase() as Package;
    const packagePrice = PACKAGE_AMOUNTS[normPkg];
    if (!packagePrice) return; // unknown package, bail out safely

    // Denormalise the new member's name/city onto every commission doc so the
    // dashboards don't have to join back to members (keeps "Unknown" away).
    const newMemberSnap = await db.doc(`members/${newMemberId}`).get();
    const nm = newMemberSnap.data();
    const fromMemberName = `${nm?.firstName ?? ""} ${nm?.lastName ?? ""}`.trim() || "Unknown";
    const fromMemberCity = (nm?.city as string | undefined) ?? "";

    let currentUid = newMemberId;

    for (let level = 1; level <= 6; level++) {
        const memberSnap = await db.doc(`members/${currentUid}`).get();
        if (!memberSnap.exists) break;

        const referredBy = memberSnap.data()?.referredBy as string | undefined;
        if (!referredBy) break;

        const uplineSnap = await db.doc(`members/${referredBy}`).get();
        if (!uplineSnap.exists) break;

        const uplinePackage = (uplineSnap.data()?.package as string | undefined)?.toLowerCase() as
            | Package
            | undefined;
        if (!uplinePackage || !PACKAGE_MAX_LEVELS[uplinePackage]) break;

        if (level <= PACKAGE_MAX_LEVELS[uplinePackage]) {
            const amount = packagePrice * COMMISSION_RATES[level];
            await db.collection("commissions").add({
                earnedBy: referredBy,
                fromMember: newMemberId,
                fromMemberName,
                fromMemberCity,
                level,
                amount,
                status: "pending",
                dateCreated: FieldValue.serverTimestamp(),
            });
        }

        currentUid = referredBy;
    }
}

// ── setAdminClaim ─────────────────────────────────────────────────────────────
// Call this once to grant admin access to a user.
// Only works if the caller is already an admin, OR if no admins exist yet
// (first-time bootstrap).

export const setAdminClaim = onCall(async (request) => {
    const { uid } = request.data as { uid: string };
    if (!uid) throw new HttpsError("invalid-argument", "uid is required.");

    // Allow if caller is already an admin
    const callerIsAdmin = request.auth?.token.admin === true;

    // Bootstrap: allow if there are currently zero admins in the system
    if (!callerIsAdmin) {
        const adminQuery = await db
            .collection("members")
            .where("isAdmin", "==", true)
            .limit(1)
            .get();
        if (!adminQuery.empty) {
            throw new HttpsError("permission-denied", "Only an existing admin can grant admin access.");
        }
    }

    await getAuth().setCustomUserClaims(uid, { admin: true });
    // Keep the Firestore field in sync for display purposes (read-only from client)
    await db.doc(`members/${uid}`).update({ isAdmin: true });

    return { success: true };
});

// ── activateMember ────────────────────────────────────────────────────────────

export const activateMember = onCall(async (request) => {
    assertAdmin(request.auth);

    const { uid } = request.data as { uid: string };
    if (!uid) throw new HttpsError("invalid-argument", "uid is required.");

    const memberRef = db.doc(`members/${uid}`);
    const memberSnap = await memberRef.get();
    if (!memberSnap.exists) throw new HttpsError("not-found", "Member not found.");

    const data = memberSnap.data()!;
    const now = new Date();

    const expiresAt = new Date(now);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const contestabilityEndsAt = new Date(now);
    contestabilityEndsAt.setMonth(contestabilityEndsAt.getMonth() + 1);

    const isFirstActivation = !data.referralCode;

    if (isFirstActivation) {
        // Generate a collision-free referral code
        let referralCode = "";
        let attempts = 0;
        while (attempts < 10) {
            const candidate = generateReferralCode();
            const existing = await db.doc(`referralCodes/${candidate}`).get();
            if (!existing.exists) {
                referralCode = candidate;
                break;
            }
            attempts++;
        }
        if (!referralCode) throw new HttpsError("internal", "Failed to generate a unique referral code.");

        await memberRef.update({
            status: "active",
            referralCode,
            activatedAt: FieldValue.serverTimestamp(),
            expiresAt,
            contestabilityEndsAt,
            packageLocked: false,
        });

        await db.doc(`referralCodes/${referralCode}`).set({ uid });

        const pkg = data.package as Package | undefined;
        if (pkg) {
            await triggerCommissions(uid, pkg);
        }

        return { referralCode };
    } else {
        // Reactivation — no commissions
        await memberRef.update({
            status: "active",
            activatedAt: FieldValue.serverTimestamp(),
            expiresAt,
            contestabilityEndsAt,
            packageLocked: false,
        });

        return { referralCode: data.referralCode };
    }
});

// ── deactivateMember ──────────────────────────────────────────────────────────

export const deactivateMember = onCall(async (request) => {
    assertAdmin(request.auth);

    const { uid } = request.data as { uid: string };
    if (!uid) throw new HttpsError("invalid-argument", "uid is required.");

    await db.doc(`members/${uid}`).update({ status: "inactive" });
    return { success: true };
});

// ── upgradeMember ─────────────────────────────────────────────────────────────

export const upgradeMember = onCall(async (request) => {
    assertAdmin(request.auth);

    const { uid, newPackage } = request.data as { uid: string; newPackage: "family" | "premium" };
    if (!uid || !newPackage) throw new HttpsError("invalid-argument", "uid and newPackage are required.");

    const memberSnap = await db.doc(`members/${uid}`).get();
    if (!memberSnap.exists) throw new HttpsError("not-found", "Member not found.");

    const data = memberSnap.data()!;

    if (data.packageLocked) {
        throw new HttpsError("failed-precondition", "Package is locked. Contestability period has expired.");
    }

    const contestabilityEndsAt = data.contestabilityEndsAt?.toDate?.() as Date | undefined;
    if (!contestabilityEndsAt || new Date() > contestabilityEndsAt) {
        await db.doc(`members/${uid}`).update({ packageLocked: true });
        throw new HttpsError("failed-precondition", "Contestability period has expired.");
    }

    await db.doc(`members/${uid}`).update({ package: newPackage });
    return { success: true };
});

// ── releaseCommission ─────────────────────────────────────────────────────────

export const releaseCommission = onCall(async (request) => {
    assertAdmin(request.auth);

    // Releasing is an APPROVAL step only — it marks the commission available to
    // withdraw. It does NOT create a payout; members request payouts separately
    // and an admin marks those as sent. Reference/notes are optional.
    const { commissionId, reference } = request.data as {
        commissionId: string;
        reference?: string;
    };

    if (!commissionId) {
        throw new HttpsError("invalid-argument", "commissionId is required.");
    }

    const commissionRef = db.doc(`commissions/${commissionId}`);
    const snap = await commissionRef.get();
    if (!snap.exists) throw new HttpsError("not-found", "Commission not found.");
    if (snap.data()?.status === "released") {
        throw new HttpsError("already-exists", "Commission already released.");
    }

    await commissionRef.update({
        status: "released",
        reference: reference ?? null,
        releasedAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
});

// ── updateClaimStatus ─────────────────────────────────────────────────────────

export const updateClaimStatus = onCall(async (request) => {
    assertAdmin(request.auth);

    const { claimId, status } = request.data as {
        claimId: string;
        status: "approved" | "rejected" | "released";
    };

    if (!claimId || !status) throw new HttpsError("invalid-argument", "claimId and status are required.");

    await db.doc(`claims/${claimId}`).update({ status });
    return { success: true };
});
