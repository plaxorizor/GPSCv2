// firebase/claims.ts
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

export interface NewClaimInput {
    benefit: string;
    amount: number;
    description: string;
    documents: string[];
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
        status: "submitted",
        submittedAt: serverTimestamp(),
        decidedAt: null,
    });
};
