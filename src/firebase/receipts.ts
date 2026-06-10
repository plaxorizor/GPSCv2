// firebase/receipts.ts
//
// Payment-proof (receipt) uploads for signup / upgrade / renewal. Files land in
// Storage under receipts/{memberId}/… (see storage.rules) and the returned
// download URL is stored on the corresponding Firestore doc so an admin can view
// the proof in the Approvals queue.

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./config";

export type ReceiptKind = "signup" | "upgrade" | "renewal";

// Upload a payment-proof image for a member and return its download URL.
// The path mirrors the Storage security rules: receipts/{memberId}/...
export async function uploadReceipt(memberId: string, kind: ReceiptKind, file: File): Promise<string> {
    const safeName = file.name.replace(/[^\w.-]+/g, "_");
    const path = `receipts/${memberId}/${kind}_${Date.now()}_${safeName}`;
    const snap = await uploadBytes(ref(storage, path), file);
    return getDownloadURL(snap.ref);
}
