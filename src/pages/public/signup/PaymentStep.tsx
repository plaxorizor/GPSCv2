// signup/PaymentStep.tsx — Step 4: amount due, QR / account picker, where to
// send the proof of payment, reference number, and the optional receipt upload.

import ReceiptUploadField from "../../../components/ui/ReceiptUploadField";
import { labelCls, PAYMENT_INFO, type Plan, type SignupForm, type SetSignupForm } from "./constants";

interface Props {
    form: SignupForm;
    setForm: SetSignupForm;
    selectedPlan: Plan;
    fieldCls: (key: string) => string;
    selectedPaymentMethod: string;
    onSelectPaymentMethod: (label: string) => void;
    receiptFile: File | null;
    onReceiptChange: (file: File | null) => void;
}

export default function PaymentStep({
    form,
    setForm,
    selectedPlan,
    fieldCls,
    selectedPaymentMethod,
    onSelectPaymentMethod,
    receiptFile,
    onReceiptChange,
}: Props) {
    return (
        <div>
            <h2 className="font-display mb-2 text-2xl" style={{ color: "#1B2D6B" }}>
                Step 4 · Payment
            </h2>
            <p className="mb-6 text-sm" style={{ color: "#6B6862" }}>
                Send your payment to one of the accounts below. After paying, send your receipt to us so we can verify it and
                activate your account.
            </p>

            <div
                className="mb-6 flex items-center justify-between rounded-2xl px-5 py-4"
                style={{ backgroundColor: "#F2F3F5", border: "1px solid #D0D2D8" }}
            >
                <div>
                    <p className="text-xs tracking-wider uppercase" style={{ color: "#6B6862" }}>
                        Amount Due
                    </p>
                    <p className="font-display text-2xl font-semibold" style={{ color: "#1B2D6B" }}>
                        ₱{selectedPlan.price.toLocaleString("en-PH")}
                    </p>
                </div>
                <span className="rounded-full px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: "#C9922A" }}>
                    {selectedPlan.name} Care
                </span>
            </div>

            {/* Payment method selector */}
            <div className="mb-4 flex gap-2">
                {PAYMENT_INFO.accounts.map((acct) => {
                    const active = selectedPaymentMethod === acct.label;
                    return (
                        <button
                            key={acct.label}
                            type="button"
                            onClick={() => onSelectPaymentMethod(acct.label)}
                            className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors"
                            style={{
                                backgroundColor: active ? "#1B2D6B" : "#F2F3F5",
                                color: active ? "#fff" : "#6B6862",
                                border: `1px solid ${active ? "#1B2D6B" : "#D0D2D8"}`,
                            }}
                        >
                            {acct.label}
                        </button>
                    );
                })}
            </div>

            {/* Selected payment method card */}
            {PAYMENT_INFO.accounts
                .filter((a) => a.label === selectedPaymentMethod)
                .map((acct) => (
                    <div
                        key={acct.label}
                        className="mb-6 flex flex-col items-center rounded-2xl p-6"
                        style={{ border: "1px solid #D0D2D8", backgroundColor: "#fff" }}
                    >
                        {acct.qr ? (
                            <img
                                src={acct.qr}
                                alt={`${acct.label} QR code`}
                                className="aspect-square w-full max-w-[16rem] rounded-xl object-contain"
                                style={{ border: "1px solid #D0D2D8" }}
                            />
                        ) : (
                            <div
                                className="flex aspect-square w-full max-w-[16rem] items-center justify-center rounded-xl text-xs"
                                style={{ backgroundColor: "#F3F4F6", color: "#9CA3AF", border: "2px dashed #D1D5DB" }}
                            >
                                QR placeholder
                            </div>
                        )}
                        <p className="mt-3 text-xs" style={{ color: "#6B6862" }}>
                            Account name:{" "}
                            <span className="font-medium" style={{ color: "#1B2D6B" }}>
                                {acct.accountName}
                            </span>
                        </p>
                        <p className="text-xs" style={{ color: "#6B6862" }}>
                            Number:{" "}
                            <span className="font-medium" style={{ color: "#1B2D6B" }}>
                                {acct.number}
                            </span>
                        </p>
                    </div>
                ))}

            {/* Offline proof-of-payment: members send their receipt to us for
                manual verification. */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#F2F3F5", border: "1px solid #D0D2D8" }}>
                <p className="text-sm font-semibold" style={{ color: "#1B2D6B" }}>
                    After paying, send your proof of payment
                </p>
                <p className="mt-1 text-xs" style={{ color: "#6B6862" }}>
                    Take a screenshot or photo of your transaction receipt and send it to us, including your full name, so we can
                    match your payment and activate your account:
                </p>
                <ul className="mt-3 space-y-1 text-sm" style={{ color: "#1B2D6B" }}>
                    {PAYMENT_INFO.receiptContacts.map((c) => (
                        <li key={c.label}>
                            {c.label}:{" "}
                            {c.href ? (
                                <a
                                    href={c.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium underline"
                                    style={{ color: "#C9922A" }}
                                >
                                    {c.value}
                                </a>
                            ) : (
                                <span className="font-medium">{c.value}</span>
                            )}
                        </li>
                    ))}
                </ul>
                <div className="mt-4">
                    <label className={labelCls}>
                        Reference number <span style={{ color: "#C41E1E" }}>*</span>
                    </label>
                    <input
                        required
                        type="text"
                        inputMode="numeric"
                        placeholder="e.g. 1234 5678 9012"
                        className={fieldCls("referenceNumber")}
                        value={form.referenceNumber}
                        onChange={(e) => setForm((prev) => ({ ...prev, referenceNumber: e.target.value }))}
                    />
                    <p className="mt-1 text-xs" style={{ color: "#6B6862" }}>
                        Enter the reference number shown on your transaction receipt.
                    </p>
                </div>

                <div className="mt-4">
                    <label className={labelCls}>
                        Receipt screenshot{" "}
                        <span className="normal-case" style={{ color: "#6B6862" }}>
                            (optional, speeds up verification)
                        </span>
                    </label>
                    <div className="mt-1">
                        <ReceiptUploadField file={receiptFile} onChange={onReceiptChange} />
                    </div>
                </div>

                <p className="mt-3 text-xs" style={{ color: "#6B6862" }}>
                    Your account stays <span className="font-medium">Pending</span> until our team verifies your payment, usually
                    within {PAYMENT_INFO.verificationDays}.
                </p>
            </div>
        </div>
    );
}
