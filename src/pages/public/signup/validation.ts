// signup/validation.ts
//
// Per-step validation for the signup flow, pulled out of the SignUp component so
// it's a set of small, testable functions instead of one 100-line branch. The
// pure checks (checkPersonalInfo, checkBeneficiaries, ageFrom) are unit-tested;
// validateSignupStep layers the two async checks (referral-code existence,
// one-account mobile lookup) on top.

import { getDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { isMobileTaken } from "../../../firebase/phoneRegistry";
import { isValidPHMobile, type Plan, type SignupForm } from "./constants";

export interface StepError {
    invalidFields: Set<string>;
    error: string;
}

const fail = (fields: string[], error: string): StepError => ({ invalidFields: new Set(fields), error });

// Whole years old as of `now`.
export function ageFrom(birthDate: string, now: Date = new Date()): number {
    const b = new Date(birthDate);
    let age = now.getFullYear() - b.getFullYear();
    const monthDiff = now.getMonth() - b.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < b.getDate())) age--;
    return age;
}

// Step 2 — everything decidable without a network call. Returns the first
// failure, or null if the personal-info step is internally valid.
export function checkPersonalInfo(form: SignupForm, birthDate: string): StepError | null {
    // First, flag every empty required field so they all light up red at once.
    const missing: string[] = [];
    if (!form.firstName.trim()) missing.push("firstName");
    if (!form.lastName.trim()) missing.push("lastName");
    if (!form.email.trim()) missing.push("email");
    if (!form.password) missing.push("password");
    if (!form.confirmPassword) missing.push("confirmPassword");
    if (!form.mobile.trim()) missing.push("mobile");
    if (!birthDate) missing.push("birthDate");
    if (!form.gender) missing.push("gender");
    if (!form.civilStatus) missing.push("civilStatus");
    if (!form.streetAddress.trim()) missing.push("streetAddress");
    if (!form.province.trim()) missing.push("province");
    if (!form.city.trim()) missing.push("city");
    if (!form.barangay.trim()) missing.push("barangay");
    if (missing.length > 0) return fail(missing, "Please fill in the required fields highlighted.");

    // Then the logical checks (fields are present but inconsistent).
    if (form.email !== form.confirmEmail) return fail(["confirmEmail"], "Emails do not match.");
    if (form.password !== form.confirmPassword) return fail(["confirmPassword"], "Passwords do not match.");
    if (!isValidPHMobile(form.mobile))
        return fail(["mobile"], "Enter a valid PH mobile number (09XX XXX XXXX or +63 9XX XXX XXXX).");
    if (ageFrom(birthDate) < 18) return fail(["birthDate"], "You must be at least 18 years old to register.");
    return null;
}

// Step 3 — beneficiaries are required (and complete) for non-Basic plans.
export function checkBeneficiaries(form: SignupForm, plan: Plan): StepError | null {
    if (plan.name === "Basic") return null;
    const missing: string[] = [];
    for (let i = 0; i < form.beneficiaries.length; i++) {
        if (!form.beneficiaries[i].name.trim()) missing.push(`ben-${i}-name`);
        if (!form.beneficiaries[i].relationship) missing.push(`ben-${i}-relationship`);
    }
    return missing.length > 0 ? fail(missing, "Please complete the beneficiary details highlighted.") : null;
}

// Validate one step. Returns the failure to show, or null if the step is valid.
export async function validateSignupStep(
    step: number,
    ctx: { form: SignupForm; birthDate: string; selectedPlan: Plan },
): Promise<StepError | null> {
    const { form, birthDate, selectedPlan } = ctx;

    if (step === 2) {
        const sync = checkPersonalInfo(form, birthDate);
        if (sync) return sync;
        // One-account policy: a mobile number may belong to only one member.
        if (await isMobileTaken(form.mobile))
            return fail(["mobile"], "This mobile number is already registered. Each person may only have one account.");
        return null;
    }

    if (step === 3) {
        if (!form.referralCode.trim()) return fail(["referralCode"], "Referral code is required.");
        const snap = await getDoc(doc(db, "referralCodes", form.referralCode));
        if (!snap.exists()) return fail(["referralCode"], "Invalid referral code.");
        return checkBeneficiaries(form, selectedPlan);
    }

    if (step === 4) {
        if (!form.referenceNumber.trim())
            return fail(["referenceNumber"], "Please enter the reference number from your payment receipt.");
        return null;
    }

    return null;
}
