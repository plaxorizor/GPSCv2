import React from "react";
import LegalPage, { type LegalSection } from "./LegalPage";

const sections: LegalSection[] = [
    {
        heading: "Information We Collect",
        body: (
            <>
                <p>When you sign up or use FaithShield Care, we may collect:</p>
                <ul className="list-disc space-y-1 pl-5">
                    <li>Identity details — full name, birthdate, gender, and a valid ID where required.</li>
                    <li>Contact details — mobile number, email address, and home address.</li>
                    <li>Membership data — your package, referral code, sponsor, beneficiaries, and account status.</li>
                    <li>Transaction data — payments, commissions, payout requests, and claim records.</li>
                    <li>Technical data — basic device and usage information needed to operate the site securely.</li>
                </ul>
            </>
        ),
    },
    {
        heading: "How We Use Your Information",
        body: (
            <p>
                We use your information to create and manage your membership, process payments and commissions, evaluate and release benefit claims,
                maintain the referral structure, communicate important updates, and meet our legal and regulatory obligations.
            </p>
        ),
    },
    {
        heading: "Sharing of Information",
        body: (
            <p>
                We do not sell your personal information. We share it only with service providers who help us operate (such as payment and hosting
                providers), with your upline solely to the extent needed to administer commissions, and with government authorities when required by
                law.
            </p>
        ),
    },
    {
        heading: "Data Retention",
        body: (
            <p>
                We keep your information for as long as your membership is active and for a reasonable period afterward to comply with legal,
                accounting, and dispute-resolution requirements, after which it is securely deleted or anonymized.
            </p>
        ),
    },
    {
        heading: "Security",
        body: (
            <p>
                We apply organizational and technical safeguards to protect your data. While no system is perfectly secure, we continually work to
                protect your information against unauthorized access, alteration, or disclosure.
            </p>
        ),
    },
    {
        heading: "Your Rights",
        body: (
            <p>
                You may request access to, correction of, or deletion of your personal data, and you may object to certain processing, subject to
                applicable law. See our Data Privacy page for rights under the Philippine Data Privacy Act of 2012.
            </p>
        ),
    },
    {
        heading: "Changes to This Policy",
        body: <p>We may update this Privacy Policy from time to time. Material changes will be posted on this page with a revised effective date.</p>,
    },
];

const PrivacyPolicy: React.FC = () => (
    <LegalPage
        title="Privacy Policy"
        effectiveDate="9 June 2026"
        intro={
            <p>
                FaithShield Care ("we," "us," or "our") respects your privacy. This Privacy Policy explains what information we collect, how we use
                it, and the choices you have when you use our website and membership program.
            </p>
        }
        sections={sections}
    />
);

export default PrivacyPolicy;
