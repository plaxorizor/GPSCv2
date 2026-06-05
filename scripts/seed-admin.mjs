// scripts/seed-admin.mjs
//
// Bootstraps the first admin account after a database reset.
// Creates a Firebase Auth user (or reuses it if it already exists) and writes
// a members/{uid} doc with isAdmin: true so AdminRoute lets you into /admin.
//
// Usage:
//   npm run seed:admin                         (uses defaults below)
//   npm run seed:admin -- --email a@b.com --password Secret123 --first Juan --last Cruz
//
// Reads Firebase config from .env via Node's built-in --env-file (see package.json).

import { initializeApp } from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";

// --- Parse CLI args (--key value) -------------------------------------------
const args = process.argv.slice(2);
const getArg = (name, fallback) => {
    const i = args.indexOf(`--${name}`);
    return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const email = getArg("email", "admin@gpsc.com");
const password = getArg("password", "Admin12345!");
const firstName = getArg("first", "GPSC");
const lastName = getArg("last", "Admin");

// --- Build Firebase config from env -----------------------------------------
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error(
        "\n✖ Missing Firebase env vars. Run via `npm run seed:admin` so .env is loaded " +
            "(it uses `node --env-file=.env`).\n",
    );
    process.exit(1);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function main() {
    console.log(`\n→ Seeding admin: ${email}`);

    // 1) Create the auth user, or sign in if it already exists.
    let uid;
    try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        uid = cred.user.uid;
        console.log(`✓ Created auth user (uid: ${uid})`);
    } catch (err) {
        if (err?.code === "auth/email-already-in-use") {
            console.log("• Auth user already exists — signing in to reuse it.");
            const cred = await signInWithEmailAndPassword(auth, email, password);
            uid = cred.user.uid;
            console.log(`✓ Signed in (uid: ${uid})`);
        } else {
            throw err;
        }
    }

    // 2) Upsert the member doc.
    //
    // Security note: the hardened Firestore rules forbid a client (this script
    // included) from setting isAdmin: true. So we create the record as a normal
    // member (isAdmin: false) — which the rules DO allow — and you flip it to
    // admin once in the Firebase Console. We never overwrite isAdmin on an
    // existing doc, so re-running this can't accidentally demote a real admin.
    const existing = await getDoc(doc(db, "members", uid));
    const alreadyAdmin = existing.exists() && existing.data().isAdmin === true;

    const data = {
        firstName,
        lastName,
        middleName: null,
        suffix: null,
        email,
        mobile: null,
        package: null,
        referralCode: null,
        referredBy: null,
        city: "",
        province: "",
        country: "Philippines",
        status: "active",
        dateCreated: serverTimestamp(),
    };
    // Only set isAdmin when creating a brand-new doc; leave existing value alone.
    if (!existing.exists()) data.isAdmin = false;

    await setDoc(doc(db, "members", uid), data, { merge: true });
    console.log("✓ Wrote members/" + uid);

    console.log("\n✅ Account ready. Log in with:");
    console.log(`   email:    ${email}`);
    console.log(`   password: ${password}`);

    if (alreadyAdmin) {
        console.log("\n👑 This account is already an admin — you're all set.\n");
    } else {
        console.log(
            "\n⚠️  This account is a NORMAL member (isAdmin: false).\n" +
                "   To make it an admin, do this ONCE in the Firebase Console:\n" +
                "     1. Firestore Database → members → open doc id:\n" +
                `        ${uid}\n` +
                "     2. Set field  isAdmin  to  true  (boolean) → Update.\n" +
                "   Then log in and you'll land in the admin dashboard.\n",
        );
    }
    process.exit(0);
}

main().catch((err) => {
    console.error("\n✖ Seed failed:", err?.code || "", err?.message || err);
    if (err?.code === "permission-denied") {
        console.error(
            "  → Firestore rules blocked the write. Make sure a signed-in user may create " +
                "their own members/{uid} doc.\n",
        );
    }
    process.exit(1);
});
