// firebase/phoneRegistry.ts
//
// Enforces the one-account-per-person policy via the mobile number. `phoneNumbers/
// {normalizedNumber}` is a tiny public index (number → uid), mirroring the
// referralCodes pattern, so an UNAUTHENTICATED visitor at signup can check whether
// a number is already taken before registering (members reads are owner+admin only).

import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./config";

// Canonical PH mobile key (digits only, country-coded): 639XXXXXXXXX.
// Accepts "+63 917…", "0917…", "917…" → all map to the same key.
export function normalizeMobilePH(raw: string): string {
    let d = (raw || "").replace(/\D/g, "");
    if (d.startsWith("0")) d = "63" + d.slice(1);
    else if (d.length === 10 && d.startsWith("9")) d = "63" + d;
    return d;
}

// True if this number is already registered to a DIFFERENT member.
export async function isMobileTaken(rawMobile: string, exceptUid?: string): Promise<boolean> {
    const key = normalizeMobilePH(rawMobile);
    if (!key) return false;
    const snap = await getDoc(doc(db, "phoneNumbers", key));
    return snap.exists() && snap.data().uid !== exceptUid;
}

// Claim a number for a member. Written AS that member (auth.uid == uid) so it
// satisfies the create rule; a number can never be reassigned (no update rule).
export async function claimMobile(rawMobile: string, uid: string): Promise<void> {
    const key = normalizeMobilePH(rawMobile);
    if (!key) return;
    await setDoc(doc(db, "phoneNumbers", key), { uid });
}

// Free a number when a member is deleted, so it can be used again.
export async function releaseMobile(rawMobile: string): Promise<void> {
    const key = normalizeMobilePH(rawMobile);
    if (!key) return;
    await deleteDoc(doc(db, "phoneNumbers", key)).catch(() => {});
}
