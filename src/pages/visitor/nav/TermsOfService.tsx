import React from "react";
import LegalPage, { type LegalSection } from "./LegalPage";

const sections: LegalSection[] = [
    {
        heading: "Nature of the Program",
        body: (
            <p>
                Faith Shield Care is a community-based membership organization providing mutual financial assistance,
                livelihood opportunities, and member benefits. It is <strong>not</strong> an insurance company and is not
                regulated by the Insurance Commission. Benefits are provided as membership assistance, not insurance policies.
            </p>
        ),
    },
    {
        heading: "Eligibility & Membership",
        body: (
            <p>
                To join, you must provide accurate registration details and complete the required contribution for your chosen
                package. Membership becomes active only after your payment is verified and your account is activated by an
                administrator. You are responsible for keeping your account details accurate and your credentials secure.
            </p>
        ),
    },
    {
        heading: "Packages & Contributions",
        body: (
            <p>
                Each package has its own contribution amount, benefit coverage, and eligibility timelines. Memberships are valid
                for a fixed term and may be renewed or upgraded under the terms shown in your dashboard at the time of the
                transaction.
            </p>
        ),
    },
    {
        heading: "Referral Program & Commissions",
        body: (
            <p>
                A referral code is issued only once your membership is active. Commissions are earned according to the published
                package depth and rates, may be subject to holding periods, and are paid out subject to the minimum payout
                amount and applicable fees. Ranks are recognition-only and do not change commission rates.
            </p>
        ),
    },
    {
        heading: "Benefit Claims",
        body: (
            <p>
                Claims are subject to eligibility windows, required documentation, and verification. Approval and release of any
                benefit is at the organization's discretion based on the membership rules in effect at the time the claim is
                filed. Submitting false information may result in denial of the claim and termination of membership.
            </p>
        ),
    },
    {
        heading: "Member Conduct",
        body: (
            <p>
                You agree not to misuse the platform, misrepresent the program to recruits, or engage in fraudulent, unlawful, or
                abusive activity. We may suspend or terminate accounts that violate these Terms.
            </p>
        ),
    },
    {
        heading: "Termination",
        body: (
            <p>
                You may cancel your membership at any time. We may suspend or terminate a membership for violations of these
                Terms or applicable law. Contributions already made are handled according to our refund policy based on tenure
                and claims history.
            </p>
        ),
    },
    {
        heading: "Disclaimers & Limitation of Liability",
        body: (
            <p>
                The service is provided "as is." To the fullest extent permitted by law, Faith Shield Care is not liable for
                indirect or consequential damages arising from your use of the platform, beyond the contributions you have paid.
            </p>
        ),
    },
    {
        heading: "Governing Law",
        body: (
            <p>
                These Terms are governed by the laws of the Republic of the Philippines, and any disputes shall be resolved in
                the appropriate courts of the Philippines.
            </p>
        ),
    },
    {
        heading: "Changes to These Terms",
        body: (
            <p>
                We may revise these Terms from time to time. Continued use of the platform after changes take effect constitutes
                acceptance of the updated Terms.
            </p>
        ),
    },
];

const TermsOfService: React.FC = () => (
    <LegalPage
        title="Terms of Service"
        effectiveDate="9 June 2026"
        intro={
            <p>
                These Terms of Service govern your access to and use of the Faith Shield Care website and membership program. By
                signing up or using the platform, you agree to these Terms.
            </p>
        }
        sections={sections}
    />
);

export default TermsOfService;
