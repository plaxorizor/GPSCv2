// main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthProvider from "./context/AuthProvider.tsx";

import Home from "./pages/visitor/Home.tsx";
import SignIn from "./pages/public/SignIn";
import SignUp from "./pages/public/SignUp.tsx";
import About from "./pages/visitor/nav/About";
import Membership from "./pages/visitor/nav/Membership";
import FAQ from "./pages/visitor/nav/FAQ";
import Contact from "./pages/visitor/nav/Contact";

import MemberArea from "./pages/member/MemberArea";
import ReferralTree from "./pages/ReferralTree";

import ProtectedRoute from "./components/ProtectedRoute";

import AdminArea from "./pages/admin/AdminArea";

import { firebaseConfig } from "./firebase/config.ts";
import { initializeApp } from "firebase/app";

import "./index.css";
import Dashboard from "./pages/Dashboard.tsx";

initializeApp(firebaseConfig);

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />

                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route
                        path="/referral"
                        element={
                            <ProtectedRoute>
                                <ReferralTree />
                            </ProtectedRoute>
                        }
                    />
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

                    <Route
                        path="/dashboard/member"
                        element={
                            <ProtectedRoute>
                                <MemberArea />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/dashboard/admin/*"
                        element={
                            <ProtectedRoute>
                                <AdminArea />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </React.StrictMode>,
);