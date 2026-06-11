// main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ScrollToTop from "./components/guards/ScrollToTop";
import ScrollToTopButton from "./components/guards/ScrollToTopButton";
import AuthProvider from "./context/AuthProvider.tsx";

import Home from "./pages/Home";
import SignIn from "./pages/public/SignIn";
import SignUp from "./pages/public/SignUp.tsx";
import ForgotPassword from "./pages/public/ForgotPassword.tsx";
import About from "./pages/info/About";
import Membership from "./pages/info/Membership";
import Referral from "./pages/info/Referral";
import FAQ from "./pages/info/FAQ";
import Contact from "./pages/info/Contact";
import PrivacyPolicy from "./pages/info/PrivacyPolicy";
import TermsOfService from "./pages/info/TermsOfService";
import DataPrivacy from "./pages/info/DataPrivacy";

import ProtectedRoute from "./components/guards/ProtectedRoute";
import GuestRoute from "./components/guards/GuestRoute";

import { firebaseConfig } from "./firebase/config.ts";
import { initializeApp } from "firebase/app";

import "./index.css";
import RoleGate from "./pages/RoleGate";
import NotFound from "./pages/NotFound.tsx";

initializeApp(firebaseConfig);

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <ScrollToTop />
                <ScrollToTopButton />
                <Routes>
                    <Route path="/" element={<Home />} />

                    <Route
                        path="/signin"
                        element={
                            <GuestRoute>
                                <SignIn />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/signup"
                        element={
                            <GuestRoute>
                                <SignUp />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/forgot-password"
                        element={
                            <GuestRoute>
                                <ForgotPassword />
                            </GuestRoute>
                        }
                    />
                    <Route path="/referral" element={<Referral />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/membership" element={<Membership />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-service" element={<TermsOfService />} />
                    <Route path="/data-privacy" element={<DataPrivacy />} />

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <RoleGate />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </React.StrictMode>,
);
