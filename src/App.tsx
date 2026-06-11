// App.tsx — providers, router, and route table.
import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ScrollToTop from "./components/guards/ScrollToTop";
import ScrollToTopButton from "./components/guards/ScrollToTopButton";
import ProtectedRoute from "./components/guards/ProtectedRoute";
import GuestRoute from "./components/guards/GuestRoute";
import AuthProvider from "./context/AuthProvider.tsx";

import Home from "./pages/Home";
import SignIn from "./pages/public/SignIn";
import ForgotPassword from "./pages/public/ForgotPassword.tsx";
import NotFound from "./pages/NotFound.tsx";

// Route-level code splitting: visitors landing on Home don't download the
// dashboard (recharts, react-d3-tree, admin panels) or the signup flow
// (PH address dataset). Each lazy page becomes its own chunk.
const RoleGate = lazy(() => import("./pages/RoleGate"));
const SignUp = lazy(() => import("./pages/public/SignUp.tsx"));
const About = lazy(() => import("./pages/info/About"));
const Membership = lazy(() => import("./pages/info/Membership"));
const Referral = lazy(() => import("./pages/info/Referral"));
const FAQ = lazy(() => import("./pages/info/FAQ"));
const Contact = lazy(() => import("./pages/info/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/info/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/info/TermsOfService"));
const DataPrivacy = lazy(() => import("./pages/info/DataPrivacy"));

const PageLoader = () => (
    <div className="flex min-h-screen items-center justify-center">
        <div className="border-fsc-green h-12 w-12 animate-spin rounded-full border-b-2"></div>
    </div>
);

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <ScrollToTop />
                <ScrollToTopButton />
                <Suspense fallback={<PageLoader />}>
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
                </Suspense>
            </BrowserRouter>
        </AuthProvider>
    );
}
