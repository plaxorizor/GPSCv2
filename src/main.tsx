import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/public/Home.tsx";
import SignIn from "./pages/public/SignIn.tsx";
import SignUp from "./pages/public/SignUp.tsx";

import { firebaseConfig } from "./firebase/config.ts";
import { initializeApp } from "firebase/app";

import "./index.css";

initializeApp(firebaseConfig);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>,
);
