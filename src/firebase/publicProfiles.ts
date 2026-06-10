// firebase/publicProfiles.ts
//
// `publicProfiles/{uid}` is a world-readable (to any signed-in user) MIRROR of the
// NON-sensitive fields of a member, kept in sync at every member write site
// (signup, admin-create, activate, upgrade, renewal, delete). It exists so that
// cross-member views — the referral tree, downline counts, commission name
// lookups — can resolve other members WITHOUT exposing PII or payment data, which
// stay locked to owner+admin on the `members` collection.
//
// Fields mirrored here are deliberately limited: name, coarse city, package,
// status, and the structural referral links. NEVER mirror email, mobile, address,
// birth date, beneficiaries, or any payment field.

import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "./config";
import { claimMobile } from "./phoneRegistry";

export interface PublicProfileFields {
    firstName?: string;
    lastName?: string;
    city?: string | null;
    package?: string | null;
    status?: string;
    referredBy?: string | null;
    referralCode?: string | null;
}

// Drop undefined keys so a partial update never writes `undefined` to Firestore.
function compact(fields: PublicProfileFields): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fields)) if (v !== undefined) out[k] = v;
    return out;
}

// Upsert the public mirror for a member. merge:true so a partial update (e.g. just
// status on activation) keeps the previously-mirrored fields intact.
export async function writePublicProfile(uid: string, fields: PublicProfileFields): Promise<void> {
    await setDoc(doc(db, "publicProfiles", uid), compact(fields), { merge: true });
}

export async function deletePublicProfile(uid: string): Promise<void> {
    await deleteDoc(doc(db, "publicProfiles", uid));
}

// Admin-only: (re)build every public profile AND seed the phone registry from the
// members collection. Safe to run repeatedly — use it to seed existing members or
// to repair any drift.
export async function backfillPublicProfiles(): Promise<number> {
    const snap = await getDocs(collection(db, "members"));
    await Promise.all(
        snap.docs.map(async (d) => {
            const m = d.data();
            await writePublicProfile(d.id, {
                firstName: (m.firstName as string) ?? "",
                lastName: (m.lastName as string) ?? "",
                city: (m.city as string | null) ?? null,
                package: (m.package as string | null) ?? null,
                status: (m.status as string) ?? "pending",
                referredBy: (m.referredBy as string | null) ?? null,
                referralCode: (m.referralCode as string | null) ?? null,
            });
            // Register the member's mobile so the one-account policy covers them.
            const mobile = m.mobile as string | undefined;
            if (mobile) await claimMobile(mobile, d.id);
        }),
    );
    return snap.size;
}
