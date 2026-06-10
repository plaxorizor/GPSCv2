import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions();

export const createPaymentLink = async (pkg: "basic" | "family" | "premium") => {
    const fn = httpsCallable<{ package: string }, { checkoutUrl: string; transactionId: string }>(functions, "createPaymentLink");
    const result = await fn({ package: pkg });
    return result.data;
};

export const getTransactionStatus = async (transactionId: string) => {
    const fn = httpsCallable<{ transactionId: string }, Record<string, unknown>>(functions, "getTransactionStatus");
    const result = await fn({ transactionId });
    return result.data;
};
