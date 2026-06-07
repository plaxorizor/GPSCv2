// scripts/seed-members.mjs
//
// Quickly seeds a realistic tree of TEST members under a root account so you can
// exercise the "My Referrals" tree without registering each one by hand.
//
// What "realistic" means here (mirrors the real signup + activateMember flow):
//   • Random names, cities/provinces/barangays, packages, gender, civil status,
//     and birth dates (all members are 18+).
//   • Random status — most "active", some "pending".
//   • ACTIVE members get a real referral code (XXXX-XXXX-XXXX) plus a
//     referralCodes/{code} doc, exactly like activateMember() does. Pending
//     members have no code yet (same as production — codes appear on activation).
//
// How it satisfies the security rules:
//   • members/{uid}: created while signed in AS that new member (secondary app),
//     which the rules allow (request.auth.uid == uid).
//   • referralCodes/{code} + the activation update: written by the ADMIN on the
//     primary session, because the rules only let admins write referral codes.
//
// Usage (admin account is required — it does the privileged writes):
//   bun run seed:members -- --admin-email you@admin.com --admin-password Secret123
//
// Optional:
//   --root <uid>         attach the tree under this member uid (default: admin's uid)
//   --breadth 3          children per node          (default 2)
//   --depth 3            how many levels deep        (default 3)
//   --active-ratio 0.7   fraction of members active  (default 0.7)
//   --password Test12345! login password for all seeded members (default Test12345!)
//   --rank-demo 2        build the minimal ALL-ACTIVE tree that lifts the root to
//                        a rank tier (1=Consultant, 2=District, 3=Municipal…).
//                        Overrides breadth/depth. Count = Σ10^k, so tier 2 = 110
//                        members, tier 3 = 1110 — keep it small. Great for seeing
//                        the higher rank badges in the tree.

import { initializeApp, deleteApp } from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { doc, getFirestore, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

// --- Parse CLI args ---------------------------------------------------------
const args = process.argv.slice(2);
const getArg = (name, fallback) => {
    const i = args.indexOf(`--${name}`);
    return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const adminEmail = getArg("admin-email", null);
const adminPassword = getArg("admin-password", null);
const rootUidArg = getArg("root", null);
const memberPassword = getArg("password", "Test12345!");
const breadth = Number(getArg("breadth", "2"));
const depth = Number(getArg("depth", "3"));
const activeRatio = Number(getArg("active-ratio", "0.7"));
// --rank-demo <tier> builds the MINIMAL all-active tree that lifts the root to
// the given rank tier (1=Consultant, 2=District, 3=Municipal/City…). Overrides
// breadth/depth. Each tier multiplies the member count by 10, so keep it small.
const rankDemo = getArg("rank-demo", null) !== null ? Number(getArg("rank-demo", "2")) : null;

// Referrals needed to climb one rank tier — must match utils/rank.ts.
const RANK_THRESHOLD = 10;

if (!adminEmail || !adminPassword) {
    console.error(
        "\n✖ Provide --admin-email and --admin-password (an admin account — it writes referral codes).\n" +
            "  Example: bun run seed:members -- --admin-email you@admin.com --admin-password Secret123\n",
    );
    process.exit(1);
}

// --- Sample data pools ------------------------------------------------------
const FIRST = ["Juan", "Maria", "Jose", "Ana", "Pedro", "Liza", "Mark", "Grace", "Paolo", "Carla", "Nico", "Bea", "Ramon", "Ivy", "Diego", "Faith"];
const LAST = ["Dela Cruz", "Santos", "Reyes", "Bautista", "Garcia", "Ramos", "Mendoza", "Torres", "Flores", "Villanueva", "Aquino", "Castro"];
const PLACES = [
    { province: "Davao del Sur", city: "Davao City", barangays: ["Talomo", "Buhangin", "Toril"] },
    { province: "Cebu", city: "Cebu City", barangays: ["Lahug", "Mabolo", "Guadalupe"] },
    { province: "Metro Manila", city: "Quezon City", barangays: ["Diliman", "Cubao", "Fairview"] },
    { province: "Misamis Oriental", city: "Cagayan de Oro", barangays: ["Carmen", "Lapasan", "Nazareth"] },
    { province: "Iloilo", city: "Iloilo City", barangays: ["Jaro", "La Paz", "Molo"] },
    { province: "Benguet", city: "Baguio City", barangays: ["Burnham", "Session Road", "Aurora Hill"] },
    { province: "South Cotabato", city: "General Santos", barangays: ["Lagao", "Bula", "City Heights"] },
];
const STREETS = ["Rizal St.", "Mabini St.", "Bonifacio Ave.", "Quezon Blvd.", "Roxas Ave.", "Magsaysay St.", "Acacia St.", "Narra St."];
const PACKAGES = ["basic", "family", "premium"];
const GENDERS = ["male", "female"];
const CIVIL = ["single", "married", "widowed", "divorced", "separated"];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const randId = () => Math.random().toString(36).slice(2, 8);
const pad2 = (n) => String(n).padStart(2, "0");

// Random birth date for someone 18–70 years old (YYYY-MM-DD).
const randomBirthDate = () => {
    const year = new Date().getFullYear() - randInt(18, 70);
    return `${year}-${pad2(randInt(1, 12))}-${pad2(randInt(1, 28))}`;
};

// Same format as the app's generateReferralCode(): XXXX-XXXX-XXXX.
const generateReferralCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `${seg()}-${seg()}-${seg()}`;
};

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
    console.error("\n✖ Missing Firebase env vars. Run via `bun run seed:members` so .env is loaded.\n");
    process.exit(1);
}

// Primary app = ADMIN session (writes referral codes + activation updates).
const adminApp = initializeApp(firebaseConfig);
const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

// Secondary app = creates each member auth user without touching the admin session.
const memberApp = initializeApp(firebaseConfig, "seed-member");
const memberAuth = getAuth(memberApp);
const memberDb = getFirestore(memberApp);

let created = 0;
let activeCount = 0;

// Create one fake member whose sponsor is `parentUid`; returns the new uid.
// `forceActive` guarantees an active member (used by --rank-demo so every node
// counts toward rank).
async function createMember(parentUid, forceActive = false) {
    const firstName = rand(FIRST);
    const lastName = rand(LAST);
    const place = rand(PLACES);
    const email = `seed-${randId()}@fsc.test`;
    const isActive = forceActive || Math.random() < activeRatio;
    const status = isActive ? "active" : "pending";

    // 1) Create the auth user on the SECONDARY app (signs us in as them there).
    const cred = await createUserWithEmailAndPassword(memberAuth, email, memberPassword);
    const uid = cred.user.uid;

    // 2) Write the member's own doc (auth.uid == uid satisfies the rules).
    await setDoc(doc(memberDb, "members", uid), {
        firstName,
        lastName,
        middleName: null,
        suffix: null,
        email,
        loginEmail: email,
        hasRealEmail: true,
        mobile: `+639${randInt(100000000, 999999999)}`,
        birthDate: randomBirthDate(),
        gender: rand(GENDERS),
        civilStatus: rand(CIVIL),
        streetAddress: `${randInt(1, 999)} ${rand(STREETS)}`,
        barangay: rand(place.barangays),
        city: place.city,
        province: place.province,
        country: "Philippines",
        package: rand(PACKAGES),
        referralCode: null,
        referredBy: parentUid,
        beneficiaries: [],
        status,
        isAdmin: false,
        dateCreated: serverTimestamp(),
    });
    await signOut(memberAuth);

    // 3) ACTIVE members get a referral code + referralCodes doc, written by the
    //    ADMIN session (only admins may write referralCodes). Mirrors activateMember().
    if (isActive) {
        const code = generateReferralCode();
        await setDoc(doc(adminDb, "referralCodes", code), { uid });
        await updateDoc(doc(adminDb, "members", uid), {
            referralCode: code,
            activatedAt: serverTimestamp(),
        });
        activeCount++;
    }

    created++;
    return { uid, isActive };
}

// Recursively build a downline `levels` deep, `breadth` children per node.
// Golden rule: only ACTIVE members can have a referral code, and therefore only
// active members can have sponsored anyone — so we only grow a downline under
// active nodes. Pending members are always childless leaves.
async function buildDownline(parentUid, levels) {
    if (levels <= 0) return;
    for (let i = 0; i < breadth; i++) {
        const child = await createMember(parentUid);
        const tag = child.isActive ? "active" : "pending (leaf)";
        console.log(`  ${"  ".repeat(depth - levels)}↳ created ${child.uid} · ${tag}`);
        if (child.isActive) await buildDownline(child.uid, levels - 1);
    }
}

// Build the MINIMAL all-active tree that makes `parentUid` reach rank `tier`.
// A node reaches tier T by having RANK_THRESHOLD active directs at tier T-1.
// tier 0 means "just an active member" (a leaf that still counts as a direct).
async function buildRankDemo(parentUid, tier, indent = 0) {
    if (tier <= 0) return; // parent is already satisfied by its active children
    for (let i = 0; i < RANK_THRESHOLD; i++) {
        const child = await createMember(parentUid, true); // force active
        console.log(`  ${"  ".repeat(indent)}↳ ${child.uid} · needs tier ${tier - 1}`);
        await buildRankDemo(child.uid, tier - 1, indent + 1);
    }
}

async function main() {
    console.log(`\n→ Signing in as admin ${adminEmail}…`);
    const adminCred = await signInWithEmailAndPassword(adminAuth, adminEmail, adminPassword);
    const rootUid = rootUidArg || adminCred.user.uid;
    console.log(`→ Tree root uid: ${rootUid}${rootUidArg ? "" : " (admin's own account)"}`);

    if (rankDemo !== null) {
        // Σ 10^k for k=1..tier  →  total all-active members created.
        const demoTotal = Array.from({ length: rankDemo }, (_, k) => Math.pow(RANK_THRESHOLD, k + 1)).reduce((a, b) => a + b, 0);
        console.log(
            `→ Rank-demo: building the minimal all-active tree to make the root a tier-${rankDemo} rank ` +
                `(${["", "Consultant", "District", "Municipal/City", "Provincial", "Regional", "National"][rankDemo] ?? "?"}).`,
        );
        console.log(`  This creates ${demoTotal} active members. Each higher tier ×10 — be patient.\n`);
        await buildRankDemo(rootUid, rankDemo);
    } else {
        const maxTotal = breadth === 1 ? depth : (Math.pow(breadth, depth + 1) - breadth) / (breadth - 1);
        console.log(
            `→ Seeding up to ~${maxTotal} members (breadth ${breadth} × depth ${depth}, ~${Math.round(activeRatio * 100)}% active).` +
                `\n  Pending members are childless leaves, so the real total will be a bit lower.\n`,
        );
        await buildDownline(rootUid, depth);
    }

    console.log(`\n✅ Done. Created ${created} test members (${activeCount} active, ${created - activeCount} pending).`);
    console.log(`   Log in as the root account and open "My Referrals" to see the tree.`);
    console.log(`   All test members use password: ${memberPassword}`);
    console.log(`   Their emails are seed-*@fsc.test — run \`bun run seed:cleanup\` to remove them later.\n`);

    await deleteApp(memberApp);
    process.exit(0);
}

main().catch(async (err) => {
    console.error("\n✖ Seed failed:", err?.code || "", err?.message || err);
    if (err?.code === "permission-denied") {
        console.error("  → A write was blocked. Make sure --admin-email is a real ADMIN (referralCodes require admin).\n");
    }
    try { await deleteApp(memberApp); } catch { /* ignore */ }
    process.exit(1);
});
