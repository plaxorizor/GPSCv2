import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBYVk5bNCEhLFMR4sZWAPKgzhXjSOaPef8",
    authDomain: "gpsc-firebase.firebaseapp.com",
    projectId: "gpsc-firebase",
    storageBucket: "gpsc-firebase.firebasestorage.app",
    messagingSenderId: "318343326640",
    appId: "1:318343326640:web:fdc9692c25f10431644475",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
