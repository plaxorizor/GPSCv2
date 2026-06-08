// main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop";
import ScrollToTopButton from "./components/ScrollToTopButton";
import AuthProvider from "./context/AuthProvider.tsx";

import Home from "./pages/visitor/Home.tsx";
import SignIn from "./pages/public/SignIn";
import SignUp from "./pages/public/SignUp.tsx";
import ForgotPassword from "./pages/public/ForgotPassword.tsx";
import About from "./pages/visitor/nav/About";
import Membership from "./pages/visitor/nav/Membership";
import Referral from "./pages/visitor/nav/Referral";
import FAQ from "./pages/visitor/nav/FAQ";
import Contact from "./pages/visitor/nav/Contact";

import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

import { firebaseConfig } from "./firebase/config.ts";
import { initializeApp } from "firebase/app";

import "./index.css";
import Dashboard from "./pages/Dashboard.tsx";
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

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </React.StrictMode>,
);
