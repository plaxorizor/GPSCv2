// scripts/seed-cleanup.mjs
//
// Deletes every TEST member created by seed-members.mjs — i.e. accounts whose
// email looks like  seed-xxxxxx@fsc.test  — removing BOTH the Firestore
// members/{uid} doc and the Firebase Auth user.
//
// Why it needs two sets of credentials:
//   • The client SDK can only delete the Auth user that is currently signed in.
//     So for each test member we sign in AS them (using the shared seed
//     password) and delete their own account + doc — which the rules allow.
//   • To first DISCOVER the list of test members we read the members collection,
//     which needs an account that can read it (your admin/root account).
//
// Usage:
//   bun run seed:cleanup -- --admin-email you@test.com --admin-password Secret123
//
// Optional:
//   --password Test12345!   the password the seed members were created with
//                           (default Test12345! — must match seed-members.mjs)

import { initializeApp } from "firebase/app";
import {
    getAuth,
    signInWithEmailAndPassword,
    deleteUser,
    signOut,
} from "firebase/auth";
import {
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    doc,
    getFirestore,
} from "firebase/firestore";

// --- Parse CLI args ---------------------------------------------------------
const args = process.argv.slice(2);
const getArg = (name, fallback) => {
    const i = args.indexOf(`--${name}`);
    return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const adminEmail = getArg("admin-email", null);
const adminPassword = getArg("admin-password", null);
const memberPassword = getArg("password", "Test12345!");

if (!adminEmail || !adminPassword) {
    console.error(
        "\n✖ Provide --admin-email and --admin-password (an account that can read members).\n" +
            "  Example: bun run seed:cleanup -- --admin-email you@test.com --admin-password Secret123\n",
    );
    process.exit(1);
}

// --- Firebase config from env -----------------------------------------------
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("\n✖ Missing Firebase env vars. Run via `bun run seed:cleanup` so .env is loaded.\n");
    process.exit(1);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function main() {
    // 1) Sign in as admin and find all seed members.
    console.log(`\n→ Signing in as ${adminEmail} to list test members…`);
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

    // Emails all start with "seed-". Prefix range query: ">= seed-" and "< seed."
    // ('.' sorts just after '-', so this captures exactly "seed-*"). We then
    // double-check the @fsc.test suffix in JS to be safe.
    const snap = await getDocs(
        query(
            collection(db, "members"),
            where("email", ">=", "seed-"),
            where("email", "<", "seed."),
        ),
    );

    const targets = snap.docs
        .map((d) => ({ uid: d.id, email: d.data().email }))
        .filter((m) => typeof m.email === "string" && m.email.endsWith("@fsc.test"));

    if (targets.length === 0) {
        console.log("• No seed-*@fsc.test members found. Nothing to clean up.\n");
        process.exit(0);
    }

    console.log(`→ Found ${targets.length} test member(s). Deleting…\n`);
    await signOut(auth);

    let deleted = 0;
    let orphanDocs = 0;
    let failed = 0;

    for (const t of targets) {
        try {
            // Sign in AS the test member so we can delete their own doc + auth user.
            await signInWithEmailAndPassword(auth, t.email, memberPassword);

            // Delete the Firestore doc first (while still authenticated)…
            try {
                await deleteDoc(doc(db, "members", t.uid));
            } catch (docErr) {
                orphanDocs++;
                console.warn(`  ! Could not delete doc for ${t.email} (${docErr?.code || docErr}). Will still remove auth.`);
            }

            // …then the Auth user (this ends the session).
            await deleteUser(auth.currentUser);
            deleted++;
            console.log(`  ✓ Removed ${t.email}`);
        } catch (err) {
            failed++;
            console.warn(`  ✗ Failed for ${t.email}: ${err?.code || err?.message || err}`);
            // Make sure we're not left signed in as a half-deleted user.
            try { await signOut(auth); } catch { /* ignore */ }
        }
    }

    console.log(`\n✅ Cleanup finished.`);
    console.log(`   Removed:   ${deleted}`);
    if (orphanDocs) console.log(`   Orphan docs (auth gone, doc left): ${orphanDocs} — delete these from the admin dashboard.`);
    if (failed) console.log(`   Failed:    ${failed} (wrong --password? account already gone?)`);
    console.log("");
    process.exit(0);
}

main().catch((err) => {
    console.error("\n✖ Cleanup failed:", err?.code || "", err?.message || err);
    process.exit(1);
});
