import * as admin from "firebase-admin";
import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import axios from "axios";

admin.initializeApp();
const db = admin.firestore();

const PAYMONGO_SECRET_KEY = defineSecret("PAYMONGO_SECRET_KEY");

const BASE_URL = "https://api.paymongo.com/v1";

const PACKAGE_AMOUNTS: Record<string, number> = {
    basic: 69800,
    family: 169800,
    premium: 499800,
};

// ----------------------------
// 1. Create Payment Link
// ----------------------------
export const createPaymentLink = onCall({ secrets: [PAYMONGO_SECRET_KEY] }, async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Login required.");

    const pkg = request.data.package as string;
    if (!PACKAGE_AMOUNTS[pkg]) throw new HttpsError("invalid-argument", "Invalid package.");

    const memberId = request.auth.uid;
    const secret = PAYMONGO_SECRET_KEY.value();
    const authHeader = {
        Authorization: `Basic ${Buffer.from(secret + ":").toString("base64")}`,
    };

    const txRef = await db.collection("transactions").add({
        memberId,
        package: pkg,
        amount: PACKAGE_AMOUNTS[pkg] / 100,
        status: "pending",
        dateCreated: admin.firestore.FieldValue.serverTimestamp(),
    });

    const response = await axios.post(
        `${BASE_URL}/links`,
        {
            data: {
                attributes: {
                    amount: PACKAGE_AMOUNTS[pkg],
                    currency: "PHP",
                    description: `GPSC ${pkg} Care Package`,
                    remarks: `${memberId}|${txRef.id}`,
                },
            },
        },
        { headers: { ...authHeader, "Content-Type": "application/json" } },
    );

    const link = response.data.data;
    await txRef.update({ paymentLinkId: link.id });

    return {
        checkoutUrl: link.attributes.checkout_url,
        transactionId: txRef.id,
    };
});

// ----------------------------
// 2. PayMongo Webhook
// ----------------------------
export const paymongoWebhook = onRequest(async (req, res) => {
    const event = req.body?.data?.attributes;
    if (!event) {
        res.sendStatus(400);
        return;
    }
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

    const txSnap = await db.collection("transactions").doc(transactionId).get();
    if (!txSnap.exists) {
        res.sendStatus(404);
        return;
    }

    const pkg = txSnap.data()?.package;
    await confirmPayment(transactionId, memberId, pkg);

    res.sendStatus(200);
});

// ----------------------------
// 3. Get Transaction Status
// ----------------------------
export const getTransactionStatus = onCall(async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Login required.");

    const { transactionId } = request.data;
    const snap = await db.collection("transactions").doc(transactionId).get();
    if (!snap.exists) throw new HttpsError("not-found", "Transaction not found.");

    return snap.data();
});

// ----------------------------
// Helper: confirm payment
// ----------------------------
const confirmPayment = async (transactionId: string, memberId: string, pkg: string) => {
    await db.collection("transactions").doc(transactionId).update({ status: "confirmed" });
    await db.collection("members").doc(memberId).update({ package: pkg, status: "active" });
    await triggerCommissions(memberId, pkg);
};

// ----------------------------
// Commission engine
// ----------------------------
type PackageName = "Basic" | "Family" | "Premium";

const COMMISSION_TABLE: Record<PackageName, Record<number, number>> = {
    Basic: { 1: 100, 2: 50, 3: 30, 4: 20, 5: 15, 6: 10 },
    Family: { 1: 250, 2: 125, 3: 75, 4: 50, 5: 38, 6: 25 },
    Premium: { 1: 750, 2: 375, 3: 225, 4: 150, 5: 113, 6: 75 },
};

const MAX_LEVELS: Record<PackageName, number> = {
    Basic: 1,
    Family: 3,
    Premium: 6,
};

const triggerCommissions = async (newMemberId: string, pkg: string) => {
    const commissions = COMMISSION_TABLE[pkg as PackageName];
    if (!commissions) return;

    let currentUid = newMemberId;

    for (let level = 1; level <= 6; level++) {
        const memberSnap = await db.collection("members").doc(currentUid).get();
        if (!memberSnap.exists) break;

        const referredBy = memberSnap.data()?.referredBy as string | null;
        if (!referredBy) break;

        const uplineSnap = await db.collection("members").doc(referredBy).get();
        if (!uplineSnap.exists) break;

        const uplinePkg = uplineSnap.data()?.package as PackageName | null;
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
