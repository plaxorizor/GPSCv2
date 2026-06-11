import { createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./config";

export const registerUser = (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password);

export const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);
