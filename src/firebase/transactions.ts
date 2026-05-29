import { doc, addDoc, updateDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./config";
import { triggerCommissions } from "./commissions";

type Package = "basic" | "family" | "premium";

const PACKAGE_AMOUNTS: Record<Package, number> = {
    basic: 698,
    family: 1698,
    premium: 4998,
};

// Call this when member selects a package and pays
export const createTransaction = async (memberId: string, pkg: Package) => {
    const txRef = await addDoc(collection(db, "transactions"), {
        memberId,
        package: pkg,
        amount: PACKAGE_AMOUNTS[pkg],
        status: "pending",
        dateCreated: serverTimestamp(),
    });
    return txRef.id;
};

// Call this after payment gateway confirms payment
export const confirmTransaction = async (transactionId: string, memberId: string, pkg: Package) => {
    // 1. Mark transaction as confirmed
    await updateDoc(doc(db, "transactions", transactionId), {
        status: "confirmed",
    });

    // 2. Activate the member
    await updateDoc(doc(db, "members", memberId), {
        package: pkg,
        status: "active",
    });

    // 3. Fire commissions up the chain
    await triggerCommissions(memberId, pkg);
};
