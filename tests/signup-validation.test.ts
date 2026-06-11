// Signup field validation — the pure, network-free checks extracted from SignUp.
import { describe, expect, it } from "bun:test";
import { ageFrom, checkPersonalInfo, checkBeneficiaries } from "../src/pages/public/signup/validation";
import type { Plan, SignupForm } from "../src/pages/public/signup/constants";

// A fully-valid step-2 form; tests override single fields to assert each rule.
const validForm = (over: Partial<SignupForm> = {}): SignupForm => ({
    package: "",
    firstName: "Juan",
    middleName: "",
    lastName: "Dela Cruz",
    suffix: "",
    email: "juan@example.com",
    confirmEmail: "juan@example.com",
    password: "Sup3rSecret!",
    confirmPassword: "Sup3rSecret!",
    mobile: "9171234567",
    gender: "male",
    civilStatus: "single",
    streetAddress: "123 Mabini St",
    province: "Cavite",
    provinceCode: "0421",
    city: "Bacoor",
    cityCode: "042108",
    barangay: "Zapote",
    country: "Philippines",
    referralCode: "ABCD-1234-EFGH",
    referenceNumber: "",
    beneficiaries: [{ name: "", relationship: "" }],
    ...over,
});

const basic: Plan = { name: "Basic", price: 698, level: 1, rate: 0.2, coverage: "Individual", tagline: "" };
const family: Plan = { name: "Family", price: 1698, level: 3, rate: 0.05, coverage: "Family of 4", tagline: "" };

describe("ageFrom", () => {
    it("computes whole years, accounting for month/day not yet reached", () => {
        const now = new Date("2026-06-11");
        expect(ageFrom("2000-06-11", now)).toBe(26); // birthday today
        expect(ageFrom("2000-06-12", now)).toBe(25); // birthday tomorrow
        expect(ageFrom("2008-06-11", now)).toBe(18); // exactly 18 today
    });
});

describe("checkPersonalInfo", () => {
    const bday18 = "2000-01-01"; // comfortably 18+

    it("passes a fully valid form", () => {
        expect(checkPersonalInfo(validForm(), bday18)).toBeNull();
    });

    it("collects ALL empty required fields at once", () => {
        const r = checkPersonalInfo(validForm({ firstName: "", lastName: "", city: "" }), bday18);
        expect(r?.invalidFields.has("firstName")).toBe(true);
        expect(r?.invalidFields.has("lastName")).toBe(true);
        expect(r?.invalidFields.has("city")).toBe(true);
        expect(r?.error).toMatch(/required fields/i);
    });

    it("flags a missing birth date", () => {
        const r = checkPersonalInfo(validForm(), "");
        expect(r?.invalidFields.has("birthDate")).toBe(true);
    });

    it("catches email / password mismatches", () => {
        expect(checkPersonalInfo(validForm({ confirmEmail: "nope@x.com" }), bday18)?.invalidFields.has("confirmEmail")).toBe(true);
        expect(checkPersonalInfo(validForm({ confirmPassword: "different" }), bday18)?.invalidFields.has("confirmPassword")).toBe(true);
    });

    it("rejects an invalid PH mobile", () => {
        expect(checkPersonalInfo(validForm({ mobile: "12345" }), bday18)?.invalidFields.has("mobile")).toBe(true);
    });

    it("rejects under-18 applicants", () => {
        const r = checkPersonalInfo(validForm(), "2020-01-01");
        expect(r?.invalidFields.has("birthDate")).toBe(true);
        expect(r?.error).toMatch(/18 years old/i);
    });

    it("checks required fields before logical ones (empty mobile → 'required', not 'invalid')", () => {
        const r = checkPersonalInfo(validForm({ mobile: "" }), bday18);
        expect(r?.error).toMatch(/required fields/i);
    });
});

describe("checkBeneficiaries", () => {
    it("Basic never requires beneficiaries", () => {
        expect(checkBeneficiaries(validForm({ beneficiaries: [{ name: "", relationship: "" }] }), basic)).toBeNull();
    });

    it("Family requires complete beneficiary rows", () => {
        const r = checkBeneficiaries(validForm({ beneficiaries: [{ name: "", relationship: "" }] }), family);
        expect(r?.invalidFields.has("ben-0-name")).toBe(true);
        expect(r?.invalidFields.has("ben-0-relationship")).toBe(true);
    });

    it("Family passes when every beneficiary is complete", () => {
        const r = checkBeneficiaries(validForm({ beneficiaries: [{ name: "Maria", relationship: "Spouse" }] }), family);
        expect(r).toBeNull();
    });
});
