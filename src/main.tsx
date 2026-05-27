import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { SignInLayout } from "./pages/public/SignInLayout";
import { SignUpLayout } from "./pages/public/SignUpLayout";

import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/signin" element={<SignInLayout />} />
                <Route path="/signup" element={<SignUpLayout />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>,
);
