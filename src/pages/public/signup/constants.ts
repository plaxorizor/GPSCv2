// signup/constants.ts — shared tokens, plan data, payment info, and the form
// shape used across the signup steps. Single source of truth for the flow.

import { PAYMENT_ACCOUNTS } from "../../../data/paymentAccounts";

// ── Design tokens (mirrors pro.jsx GlobalStyles) ──────────────────
export const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=DM+Sans:wght@400;500;600;700&display=swap');
  .fsc-signup-root { font-family: 'DM Sans', system-ui, sans-serif; }
  .fsc-signup-root .font-display { font-family: 'Fraunces', Georgia, serif; }
  @keyframes signup-fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .signup-anim { animation: signup-fade-up 0.5s ease-out forwards; }
`;

export interface Plan {
    name: string;
    price: number;
    level: number;
    rate: number;
    coverage: string;
    tagline: string;
    popular?: boolean;
}

export const plans: Plan[] = [
    {
        name: "Basic",
        price: 698,
        level: 1,
        rate: 0.2,
        coverage: "Individual",
        tagline: "Individual protection, simple start",
    },
    {
        name: "Family",
        price: 1698,
        level: 3,
        rate: 0.05,
        coverage: "Family of 4",
        tagline: "Coverage for the whole household",
        popular: true,
    },
    {
        name: "Premium",
        price: 4998,
        level: 6,
        rate: 0.03,
        coverage: "Family of 5",
        tagline: "Full benefits and leadership rewards",
    },
];

export const STEPS = ["Package", "Your Info", "Sponsor & Beneficiaries", "Payment", "Review"];

// ── Payment details shown on the signup Payment step ──────────────
// Single source of truth — update account numbers and receipt contacts here.
export const PAYMENT_INFO = {
    // Accounts + QR codes come from the shared single source of truth.
    accounts: PAYMENT_ACCOUNTS,
    // Where members send their proof of payment for manual verification.
    // `href` makes the value a clickable link. (Email hidden for now — pending
    // confirmation from the client.)
    receiptContacts: [{ label: "Facebook", value: "fb.me/FaithShieldCare", href: "https://fb.me/FaithShieldCare" }],
    verificationDays: "1–2 business days",
};

// ── Shared input / label styles ───────────────────────────────────
export const inputCls =
    "w-full mt-1 px-4 py-3 rounded-xl border border-[#D0D2D8] bg-white text-[#1B2D6B] placeholder-[#6B6862] focus:outline-none focus:ring-2 focus:ring-[#C9922A] transition";
export const labelCls = "text-xs uppercase tracking-wider text-[#6B6862]";

// ── Form shape ────────────────────────────────────────────────────
export interface Beneficiary {
    name: string;
    relationship: string;
}

export interface SignupForm {
    package: string;
    firstName: string;
    middleName: string;
    lastName: string;
    suffix: string;
    email: string;
    confirmEmail: string;
    password: string;
    confirmPassword: string;
    mobile: string;
    gender: string;
    civilStatus: string;
    streetAddress: string;
    province: string;
    provinceCode: string;
    city: string;
    cityCode: string;
    barangay: string;
    country: string;
    referralCode: string;
    referenceNumber: string;
    beneficiaries: Beneficiary[];
}

export type SetSignupForm = React.Dispatch<React.SetStateAction<SignupForm>>;

// ── PH mobile helpers ─────────────────────────────────────────────
// Mobile is stored as the local part only (10 digits starting with "9");
// the "+63" prefix is fixed in the UI and prepended on save.
// Display helper: "9XX XXX XXXX".
export const formatPHMobile = (d: string) => [d.slice(0, 3), d.slice(3, 6), d.slice(6, 10)].filter(Boolean).join(" ");
// Valid local part = "9" followed by 9 more digits.
export const isValidPHMobile = (m: string) => /^9\d{9}$/.test(m.replace(/\D/g, ""));
