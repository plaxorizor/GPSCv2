import React from "react";
import LegalPage, { type LegalSection } from "./LegalPage";

const sections: LegalSection[] = [
    {
        heading: "Our Commitment",
        body: (
            <p>
                Faith Shield Care is committed to protecting your personal data in accordance with Republic Act No. 10173, the
                Data Privacy Act of 2012, its Implementing Rules and Regulations, and the issuances of the National Privacy
                Commission (NPC).
            </p>
        ),
    },
    {
        heading: "Personal Data We Process",
        body: (
            <p>
                We process the personal data you provide during registration and membership, including your name, birthdate,
                gender, contact details, address, government ID where required, beneficiary details, and transaction history.
            </p>
        ),
    },
    {
        heading: "Lawful Basis & Purpose",
        body: (
            <p>
                We process your data based on your consent, the performance of our membership agreement with you, our legitimate
                interests in operating the program, and compliance with legal obligations. Processing is limited to managing your
                membership, benefits, commissions, and required reporting.
            </p>
        ),
    },
    {
        heading: "Data Sharing",
        body: (
            <p>
                We share personal data only with authorized personnel and service providers bound by confidentiality, with your
                upline strictly for commission administration, and with government agencies when legally required. We do not sell
                your personal data.
            </p>
        ),
    },
    {
        heading: "Storage, Retention & Disposal",
        body: (
            <p>
                Your data is stored using reasonable physical, organizational, and technical security measures. We retain it only
                for as long as necessary to fulfill the purposes above and legal requirements, after which it is securely
                disposed of.
            </p>
        ),
    },
    {
        heading: "Your Rights as a Data Subject",
        body: (
            <>
                <p>Under the Data Privacy Act, you have the right to:</p>
                <ul className="list-disc space-y-1 pl-5">
                    <li>be informed about how your data is processed;</li>
                    <li>access your personal data;</li>
                    <li>object to or withdraw consent for processing;</li>
                    <li>rectify inaccurate or incomplete data;</li>
                    <li>request erasure or blocking of your data;</li>
                    <li>data portability; and</li>
                    <li>be indemnified for damages and to lodge a complaint with the NPC.</li>
                </ul>
            </>
        ),
    },
    {
        heading: "Data Breach Notification",
        body: (
            <p>
                In the event of a personal data breach that may seriously affect you, we will notify the affected data subjects
                and the National Privacy Commission as required by law.
            </p>
        ),
    },
    {
        heading: "Data Protection Officer",
        body: (
            <p>
                You may exercise your rights or raise data privacy concerns by contacting our Data Protection Officer through our
                Contact page. We will respond within the timelines required by law.
            </p>
        ),
    },
];

const DataPrivacy: React.FC = () => (
    <LegalPage
        title="Data Privacy"
        effectiveDate="9 June 2026"
        intro={
            <p>
                This Data Privacy Statement explains how Faith Shield Care collects, uses, and protects your personal data in
                compliance with the Philippine Data Privacy Act of 2012.
            </p>
        }
        sections={sections}
    />
);

export default DataPrivacy;
