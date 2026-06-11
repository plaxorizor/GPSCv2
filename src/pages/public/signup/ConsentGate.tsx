// signup/ConsentGate.tsx — Privacy Policy / Terms tabs + agree gate shown
// before the registration flow. Owns its own tab state.

import { useState } from "react";

interface Props {
    onAgree: () => void;
    onBack: () => void;
}

export default function ConsentGate({ onAgree, onBack }: Props) {
    const [policyTab, setPolicyTab] = useState<"privacy" | "terms">("privacy");

    return (
        <div className="rounded-3xl p-8" style={{ backgroundColor: "#fff", border: "1px solid #D0D2D8" }}>
            <h2 className="font-display mb-2 text-2xl" style={{ color: "#1B2D6B" }}>
                Before you continue
            </h2>
            <p className="mb-6 text-sm" style={{ color: "#6B6862" }}>
                Please read and agree to our policies before creating your account.
            </p>

            {/* Tab bar */}
            <div className="mb-5 flex overflow-hidden rounded-xl" style={{ border: "1px solid #D0D2D8" }}>
                {(["privacy", "terms"] as const).map((tab) => {
                    const labels = { privacy: "Privacy Policy", terms: "Terms & Conditions" };
                    const active = policyTab === tab;
                    return (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setPolicyTab(tab)}
                            className="flex-1 py-2.5 text-xs font-medium transition-colors"
                            style={{
                                backgroundColor: active ? "#1B2D6B" : "#F2F3F5",
                                color: active ? "#fff" : "#6B6862",
                                borderRight: tab !== "terms" ? "1px solid #D0D2D8" : undefined,
                            }}
                        >
                            {labels[tab]}
                        </button>
                    );
                })}
            </div>

            {/* Tab content */}
            <div
                className="mb-6 space-y-3 overflow-y-auto rounded-2xl p-5 text-sm leading-relaxed"
                style={{ backgroundColor: "#F2F3F5", border: "1px solid #D0D2D8", maxHeight: "320px", color: "#4B4A47" }}
            >
                {policyTab === "privacy" && (
                    <>
                        <p>
                            FaithShield Care ("we", "us", or "our") is committed to protecting your personal information. This Privacy
                            Policy explains how we collect, use, and safeguard the data you provide when registering as a member.
                        </p>
                        <p>
                            <strong style={{ color: "#1B2D6B" }}>Information We Collect</strong>
                            <br />
                            We collect your name, email address, mobile number, birth date, civil status, location, referral code, and
                            beneficiary details. Proof of payment that you send us for verification is handled separately and is not
                            stored in your online account.
                        </p>
                        <p>
                            <strong style={{ color: "#1B2D6B" }}>How We Use Your Information</strong>
                            <br />
                            Your data is used to process your membership application, verify identity, manage your account, facilitate
                            referral rewards, and communicate important updates.
                        </p>
                        <p>
                            <strong style={{ color: "#1B2D6B" }}>Data Sharing</strong>
                            <br />
                            We do not sell or rent your personal data. Information may be shared only with service providers necessary
                            to operate our platform, or as required by law.
                        </p>
                        <p>
                            <strong style={{ color: "#1B2D6B" }}>Data Security</strong>
                            <br />
                            We use industry-standard security measures to protect your information. However, no online transmission is
                            100% secure and we cannot guarantee absolute security.
                        </p>
                        <p>
                            <strong style={{ color: "#1B2D6B" }}>Your Rights</strong>
                            <br />
                            You may request access to, correction of, or deletion of your personal data by contacting us at
                            support@faithshieldcare.com.
                        </p>
                    </>
                )}
                {policyTab === "terms" && (
                    <>
                        <p>
                            By registering for a FaithShield Care membership, you agree to be bound by these Terms &amp; Conditions.
                            Please read them carefully before proceeding.
                        </p>
                        <p>
                            <strong style={{ color: "#1B2D6B" }}>Eligibility</strong>
                            <br />
                            Membership is open to individuals 18 years of age or older. By registering, you confirm that all
                            information provided is accurate and truthful.
                        </p>
                        <p>
                            <strong style={{ color: "#1B2D6B" }}>Membership Plans</strong>
                            <br />
                            Each plan (Basic, Family, Premium) carries distinct benefits and referral structures. Plan details are
                            subject to change with prior notice to members.
                        </p>
                        <p>
                            <strong style={{ color: "#1B2D6B" }}>Referral Program</strong>
                            <br />
                            Referral commissions are credited upon successful activation of referred members. FaithShield Care
                            reserves the right to adjust commission rates with reasonable notice.
                        </p>
                        <p>
                            <strong style={{ color: "#1B2D6B" }}>Account Responsibility</strong>
                            <br />
                            You are responsible for maintaining the confidentiality of your account credentials. FaithShield Care is
                            not liable for unauthorized access resulting from your failure to secure your account.
                        </p>
                        <p>
                            <strong style={{ color: "#1B2D6B" }}>Termination</strong>
                            <br />
                            FaithShield Care reserves the right to suspend or terminate any account found to be in violation of these
                            Terms or engaged in fraudulent activity.
                        </p>
                        <p>
                            <strong style={{ color: "#1B2D6B" }}>Governing Law</strong>
                            <br />
                            These Terms are governed by the laws of the Republic of the Philippines.
                        </p>
                    </>
                )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 rounded-xl border py-3 text-sm font-medium transition-colors"
                    style={{ borderColor: "#D0D2D8", color: "#6B6862", backgroundColor: "#F2F3F5" }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#D0D2D8")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#F2F3F5")}
                >
                    I Disagree — Go Back
                </button>
                <button
                    type="button"
                    onClick={onAgree}
                    className="flex-1 rounded-xl py-3 text-sm font-medium text-white transition-colors"
                    style={{ backgroundColor: "#C9922A" }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#A87820")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#C9922A")}
                >
                    I Agree — Continue Registration
                </button>
            </div>
        </div>
    );
}
