import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "./config";

export const registerUser = (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password);

export const loginUser = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);

export const logoutUser = () => signOut(auth);

export const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);

export const onAuthChange = (callback: (user: User | null) => void) => onAuthStateChanged(auth, callback);
