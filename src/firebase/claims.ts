// firebase/claims.ts
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./config";

// Upload claim attachments to Storage and return their name + download URL.
export const uploadClaimFiles = async (
    memberId: string,
    files: File[],
): Promise<{ name: string; url: string }[]> => {
    const stamp = Date.now();
    return Promise.all(
        files.map(async (file, i) => {
            const path = `claims/${memberId}/${stamp}_${i}_${file.name}`;
            const snap = await uploadBytes(ref(storage, path), file);
            const url = await getDownloadURL(snap.ref);
            return { name: file.name, url };
        }),
    );
};

export interface NewClaimInput {
    benefit: string;
    amount: number;
    description: string;
    documents: string[];
    uploads?: { name: string; url: string }[]; // uploaded file attachments
}

// Member files a claim. Always starts as "submitted"; only an admin can move it
// forward (under_review → approved/rejected → released).
export const submitClaim = async (
    memberId: string,
    memberName: string,
    input: NewClaimInput,
) => {
    await addDoc(collection(db, "claims"), {
        memberId,
        memberName,
        benefit: input.benefit,
        amount: input.amount,
        description: input.description,
        documents: input.documents,
        uploads: input.uploads ?? [],
        status: "submitted",
        dateSubmitted: serverTimestamp(),
        dateDecided: null,
    });
};
