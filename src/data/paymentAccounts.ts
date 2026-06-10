// Single source of truth for the offline payment destinations (GCash / Maya /
// GoTyme). Used by the signup Payment step, the upgrade modal, and the renewal
// modal — update an account or QR here and all three screens follow.
//
// QR images live in /public/qr/ and are referenced by absolute path so Vite
// serves them as-is (no import needed). Drop the files there as:
//   public/qr/gcash.png
//   public/qr/maya.png
//   public/qr/gotyme.png
// Leave `qr` as "" to fall back to the "QR placeholder" box.

export interface PaymentAccount {
    label: string; // wallet name shown on the selector tab
    accountName: string; // recipient name/handle — confirms who they're paying
    number: string; // shown for confirmation (may be masked on share QRs)
    qr: string; // /qr/*.png in public, or "" for the placeholder box
}

export const PAYMENT_ACCOUNTS: PaymentAccount[] = [
    { label: "GCash", accountName: "AP**E J** D.", number: "+63 976 166 ••••", qr: "/qr/gcash.png" },
    { label: "Maya", accountName: "@ganda1205", number: "+63 *** *** 0503", qr: "/qr/maya.png" },
    { label: "GoTyme", accountName: "GoTyme Bank", number: "•••• 1213", qr: "/qr/gotyme.png" },
];
