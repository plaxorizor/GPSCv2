import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";

admin.initializeApp();
const db = admin.firestore();

const PAYMONGO_SECRET = functions.config().paymongo.secret_key;
const BASE_URL = "https://api.paymongo.com/v1";
const authHeader = {
    Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET + ":").toString("base64")}`,
};

const PACKAGE_AMOUNTS: Record<string, number> = {
    basic: 69800, // PayMongo uses centavos
    family: 169800,
    premium: 499800,
};

// ----------------------------
// 1. Create Payment Link
// ----------------------------
export const createPaymentLink = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required.");

    const { package: pkg } = data;
    if (!PACKAGE_AMOUNTS[pkg]) throw new functions.https.HttpsError("invalid-argument", "Invalid package.");

    const memberId = context.auth.uid;

    // Create transaction record first
    const txRef = await db.collection("transactions").add({
        memberId,
        package: pkg,
        amount: PACKAGE_AMOUNTS[pkg] / 100,
        status: "pending",
        dateCreated: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create PayMongo payment link
    const response = await axios.post(
        `${BASE_URL}/links`,
        {
            data: {
                attributes: {
                    amount: PACKAGE_AMOUNTS[pkg],
                    currency: "PHP",
                    description: `GPSC ${pkg.charAt(0).toUpperCase() + pkg.slice(1)} Package`,
                    remarks: `${memberId}|${txRef.id}`, // pass IDs for webhook
                },
            },
        },
        { headers: { ...authHeader, "Content-Type": "application/json" } },
    );

    const link = response.data.data;

    // Save payment link ID to transaction
    await txRef.update({ paymentLinkId: link.id });

    return {
        checkoutUrl: link.attributes.checkout_url,
        transactionId: txRef.id,
    };
});

// ----------------------------
// 2. PayMongo Webhook
//    (called by PayMongo when payment succeeds)
// ----------------------------
export const paymongoWebhook = functions.https.onRequest(async (req, res) => {
    const event = req.body?.data?.attributes;
    if (!event) {
        res.sendStatus(400);
        return;
    }

    // Only handle successful payments
    if (event.type !== "payment.paid") {
        res.sendStatus(200);
        return;
    }

    const remarks = event.data?.attributes?.description ?? "";
    const [memberId, transactionId] = remarks.split("|");

    if (!memberId || !transactionId) {
        res.sendStatus(400);
        return;
    }

    // Fetch transaction to get package
    const txSnap = await db.collection("transactions").doc(transactionId).get();
    if (!txSnap.exists) {
        res.sendStatus(404);
        return;
    }

    const pkg = txSnap.data()?.package;

    // Confirm transaction + activate member + trigger commissions
    await confirmPayment(transactionId, memberId, pkg);

    res.sendStatus(200);
});

// ----------------------------
// 3. Get Transaction Status
// ----------------------------
export const getTransactionStatus = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required.");

    const { transactionId } = data;
    const snap = await db.collection("transactions").doc(transactionId).get();
    if (!snap.exists) throw new functions.https.HttpsError("not-found", "Transaction not found.");

    return snap.data();
});

// ----------------------------
// Helper: confirm payment
// ----------------------------
const confirmPayment = async (transactionId: string, memberId: string, pkg: string) => {
    // 1. Mark transaction confirmed
    await db.collection("transactions").doc(transactionId).update({
        status: "confirmed",
    });

    // 2. Activate member
    await db.collection("members").doc(memberId).update({
        package: pkg,
        status: "active",
    });

    // 3. Trigger commissions (6-level walk)
    await triggerCommissions(memberId, pkg);
};

// ----------------------------
// Commission engine (server-side)
// ----------------------------
type Package = "basic" | "family" | "premium";

const COMMISSION_TABLE: Record<Package, Record<number, number>> = {
    basic: { 1: 100, 2: 50, 3: 30, 4: 20, 5: 15, 6: 10 },
    family: { 1: 250, 2: 125, 3: 75, 4: 50, 5: 38, 6: 25 },
    premium: { 1: 750, 2: 375, 3: 225, 4: 150, 5: 113, 6: 75 },
};

const MAX_LEVELS: Record<Package, number> = {
    basic: 1,
    family: 3,
    premium: 6,
};

const triggerCommissions = async (newMemberId: string, pkg: string) => {
    const commissions = COMMISSION_TABLE[pkg as Package];
    if (!commissions) return;

    let currentUid = newMemberId;

    for (let level = 1; level <= 6; level++) {
        const memberSnap = await db.collection("members").doc(currentUid).get();
        if (!memberSnap.exists) break;

        const referredBy = memberSnap.data()?.referredBy as string | null;
        if (!referredBy) break;

        const uplineSnap = await db.collection("members").doc(referredBy).get();
        if (!uplineSnap.exists) break;

        const uplinePkg = uplineSnap.data()?.package as Package | null;
        if (!uplinePkg) {
            currentUid = referredBy;
            continue;
        }

        if (level <= MAX_LEVELS[uplinePkg]) {
            await db.collection("commissions").add({
                earnedBy: referredBy,
                fromMember: newMemberId,
                level,
                amount: commissions[level],
                status: "pending",
                dateCreated: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        currentUid = referredBy;
    }
};
