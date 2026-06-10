// firebase/adminCreateMember.ts
//
// Lets an admin encode a member from a paper application form WITHOUT logging
// the admin out, and WITHOUT needing a password on the form.
//
// How it stays logged in: we spin up a throwaway *secondary* Firebase app,
// create the new auth user there, and write the member's Firestore doc while
// authenticated AS that new user. That satisfies the existing security rule
// (`request.auth.uid == uid`) with no rules change, then we sign the secondary
// session out and discard it. The admin's primary session is never touched.
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { firebaseConfig } from "./config";
import { activateMember } from "./admin";
import { isMobileTaken, normalizeMobilePH } from "./phoneRegistry";

export interface EncodeMemberInput {
    package: string; // "basic" | "family" | "premium"
    firstName: string;
    middleName?: string;
    lastName: string;
    suffix?: string;
    email?: string; // optional — real email if the member has one
    mobile: string; // required
    birthDate?: string;
    gender?: string;
    civilStatus?: string;
    streetAddress?: string;
    barangay?: string;
    city?: string;
    province?: string;
    country?: string;
    referralCode?: string; // the REFERRER's code — required unless isRoot
    isRoot?: boolean; // founder/top-of-tree member with no referrer (rare)
    beneficiaries?: { name: string; relationship: string }[];
}

export interface EncodeMemberResult {
    uid: string;
    loginEmail: string;
    tempPassword: string;
    usedSyntheticEmail: boolean;
    activated: boolean; // false if the member was created but activation failed
}

// Strong-ish random temp password. Member changes it on first login.
function generateTempPassword(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    const arr = new Uint32Array(10);
    crypto.getRandomValues(arr);
    let p = "";
    for (const n of arr) p += chars[n % chars.length];
    return p + "9!"; // guarantee length >= 6 and some variety
}

// Members with no email get a synthetic login built from their mobile number.
// It never has to be a real inbox — it's just a unique login identifier.
function mobileToSyntheticEmail(mobile: string): string {
    const digits = mobile.replace(/\D/g, "");
    return `${digits}@members.faithshieldcare.com`;
}

export async function adminCreateMember(input: EncodeMemberInput): Promise<EncodeMemberResult> {
    const realEmail = input.email?.trim();
    const usedSyntheticEmail = !realEmail;
    const loginEmail = realEmail || mobileToSyntheticEmail(input.mobile);
    const tempPassword = generateTempPassword();

    // Throwaway app instance so the admin's session is untouched.
    const secondaryApp = initializeApp(firebaseConfig, `encode-${Date.now()}`);
    const secondaryAuth = getAuth(secondaryApp);
    const secondaryDb = getFirestore(secondaryApp);

    try {
        // Golden rule: every member must have a referrer — unless explicitly
        // flagged as a founder/root member (the rare top of the tree).
        const code = input.referralCode?.trim();
        if (!input.isRoot && !code) throw new Error("REFERRAL_REQUIRED");

        // One-account policy: block a mobile number that's already registered.
        if (await isMobileTaken(input.mobile)) throw new Error("MOBILE_TAKEN");

        // Resolve the referrer — referralCodes is publicly readable.
        let referredBy: string | null = null;
        if (code) {
            const refSnap = await getDoc(doc(secondaryDb, "referralCodes", code));
            if (!refSnap.exists()) throw new Error("INVALID_REFERRAL");
            referredBy = (refSnap.data().uid as string) ?? null;
        }

        // Create the auth user (this signs the SECONDARY app in as the new member).
        const cred = await createUserWithEmailAndPassword(secondaryAuth, loginEmail, tempPassword);
        const uid = cred.user.uid;

        // Write the member doc as the new member (satisfies auth.uid == uid).
        await setDoc(doc(secondaryDb, "members", uid), {
            referralCode: null,
            referredBy,
            firstName: input.firstName.trim(),
            middleName: input.middleName?.trim() || null,
            lastName: input.lastName.trim(),
            suffix: input.suffix?.trim() || null,
            email: realEmail || null,
            loginEmail, // the actual login identifier (real or synthetic)
            hasRealEmail: !usedSyntheticEmail,
            mobile: input.mobile.trim(),
            telephone: null,
            birthDate: input.birthDate || null,
            birthPlace: null,
            gender: input.gender || null,
            civilStatus: input.civilStatus || null,
            streetAddress: input.streetAddress?.trim() || null,
            barangay: input.barangay?.trim() || null,
            city: input.city?.trim() || null,
            province: input.province?.trim() || null,
            postalCode: null,
            country: input.country?.trim() || "Philippines",
            package: input.package.toLowerCase(),
            beneficiaries: input.beneficiaries ?? [],
            paymentProofFileName: null,
            status: "pending", // flipped to active by activateMember() below
            isAdmin: false,
            encodedByAdmin: true,
            mustChangePassword: true, // member should set their own password
            dateCreated: serverTimestamp(),
        });

        // Mirror the non-sensitive fields (written AS the new member, so the
        // publicProfiles self-create rule — "pending", no referral code — passes).
        // activateMember() below flips it to active and adds the referral code.
        await setDoc(doc(secondaryDb, "publicProfiles", uid), {
            firstName: input.firstName.trim(),
            lastName: input.lastName.trim(),
            city: input.city?.trim() || null,
            package: input.package.toLowerCase(),
            status: "pending",
            referredBy,
            referralCode: null,
        });

        // Reserve the mobile number (written as the new member, satisfies the rule).
        await setDoc(doc(secondaryDb, "phoneNumbers", normalizeMobilePH(input.mobile)), { uid });

        await signOut(secondaryAuth);

        // Admin-encoded members are assumed paid → activate immediately.
        // activateMember runs as the ADMIN (primary session): it sets status
        // active, generates the referral code, and triggers upline commissions.
        let activated = true;
        try {
            await activateMember(uid);
        } catch (e) {
            console.error("[adminCreateMember] activation failed (member left pending):", e);
            activated = false;
        }

        return { uid, loginEmail, tempPassword, usedSyntheticEmail, activated };
    } finally {
        // Always tear down the throwaway app.
        await deleteApp(secondaryApp);
    }
}
