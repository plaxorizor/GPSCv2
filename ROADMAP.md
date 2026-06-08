# Faith Shield Care — Project Roadmap

> **Stack:** React 19 + TypeScript + Vite 8 · Tailwind v4 · Firebase (Auth, Firestore, Storage) · Bun
> **Last updated:** 2026-06-08

---

## Time conventions (locked)
| Concept | Code constant | UI label |
|---|---|---|
| Membership validity | 365 days | "1 year" |
| L2-6 commission hold | 7 days | "1 week" |
| Upgrade grace period | 90 days | "90 days" |

---

## ✅ Done

### Auth & Sign-up
- [x] Multi-step sign-up form (referral code → personal info → address → beneficiaries → payment)
- [x] PH cascading address (Country locked to Philippines → Province → City/Municipality → Barangay)
- [x] Custom 🇵🇭 +63 mobile input (React 19-safe, stores `+63XXXXXXXXX`)
- [x] Birthdate as Month / Day / Year dropdowns
- [x] Gender: Male / Female only
- [x] Street address capped at 100 chars
- [x] Email mismatch shown only on blur (not while typing)
- [x] Password strength bar inline with label; no strength message
- [x] Continue button spinner + double-click guard
- [x] React 19-safe derived state (no setState-in-effect)

### Packages
- [x] 3 packages: Basic Care (₱698) / Family Care (₱1,698) / Premium Care (₱4,998)
- [x] Commission depth: Basic 1 level · Family 3 levels · Premium 6 levels
- [x] Commission rates: Basic 20% · Family 5% · Premium 3%
- [x] Beneficiary cap: Basic 0 · Family 2 · Premium 3
- [x] Package-specific eligibility timeline (from PPTX)
- [x] PackageComparison component with upgrade flow UI

### Rank system (recognition-only)
- [x] 7 tiers: Member → Consultant → District → Municipal/City → Provincial → Regional → National Consultant
- [x] Threshold: 10 active direct referrals per tier
- [x] Computed at runtime from tree; never stored in Firestore
- [x] Only **active** directs count toward rank

### Commission & Payouts
- [x] Commission lifecycle: `pending → requested → paid`
- [x] L1 (direct): claimable immediately after downline activation
- [x] L2-6: 7-day hold from downline's `dateCreated`
- [x] Per-commission claiming with bulk select
- [x] Minimum payout: ₱500
- [x] Transaction fee: 5% (deducted from gross)
- [x] Admin marks payout sent → commissions marked `paid`
- [x] Removed manual admin "release" step
- [x] Earnings page: "Claimable" (green) / "In Xd" (yellow) badges

### Upgrade mechanic
- [x] 90-day grace window from `dateActivated`
- [x] Member self-requests upgrade in-app (offline payment)
- [x] Pay price difference only (e.g., Basic→Family = ₱1,000)
- [x] Admin confirms → package updated, eligibility + expiry reset (365 days)
- [x] `UpgradeCard` component on member dashboard
- [x] `PendingUpgradesPanel` on admin dashboard

### Admin
- [x] Add/Encode Member modal (matches sign-up form style)
- [x] Activate member → assigns referral code (golden rule enforced)
- [x] Payout management: approve/reject, mark sent
- [x] Pending upgrades panel

### Developer tooling
- [x] `bun run seed:members` — fast test-account seeding
- [x] `seed:members --rank-demo <tier>` — builds rank ladder for testing
- [x] `bun run seed:cleanup` — deletes all seed-*@fsc.test accounts
- [x] Field naming convention: `date*` prefix (e.g., `dateActivated`, `dateCreated`)

### Referral tree
- [x] react-d3-tree v3 with custom HTML node cards
- [x] Live controls (zoom, orientation, node spacing)
- [x] Always expanded
- [x] Node shows: Package name · Rank name · City · Status

### Merge & code quality
- [x] Merged Keith's SignUp.tsx (React 19-safe useMemo version)
- [x] Merged Keith's Earnings.tsx (removed CSV button, kept claim badges)
- [x] PackageComparison.tsx — already identical, no change needed
- [x] TypeScript build passes (`bunx tsc -b` clean)

---

## 🚧 In Progress / Blocked

### Commission-on-upgrade
- [ ] Decide: does upgrading trigger a retroactive commission recalculation?
- **Blocked:** waiting for client's answer
- Hook is in `src/firebase/upgrades.ts → approveUpgrade()` (NOTE comment)

---

## 📋 Backlog

### Auth
- [ ] Email-exists check on sign-up (re-add when project is on **Firebase Blaze plan**)

### Payments — provider undecided ⚠️
- [ ] **Decide inbound payment provider** (client deciding):
  - PayMongo — already coded (`functions/index.ts`, `firebase/payments.ts`); **client may drop it**
  - GoTyme — under consideration. Likely manual QR Ph / bank transfer + admin confirmation (no hosted checkout API like PayMongo). Would reuse the manual-confirm pattern from the payout flow.
  - If PayMongo is dropped: remove/disable `createPaymentLink`, `paymongoWebhook`, `getTransactionStatus` and the `PAYMONGO_SECRET_KEY` secret.
- [ ] Replace placeholder GoTyme account numbers and QR images with real ones
- [ ] Confirm live domain (`faithshield.care` tentative)

### Eligibility timeline
- [ ] Client confirmation needed for `assumed: true` milestones:
  - Basic: hospital cash waiting period
  - Family: death contestability period
  - Premium: maternity / calamity waiting periods

### Firestore
- [ ] **Publish updated `firestore.rules`** — `upgradeRequests` collection block must be deployed or upgrade requests will fail
- [ ] Index any new collection queries as usage grows

### Features (not yet scoped)
- [ ] Claims filing flow (member submits benefit claim + documents)
- [ ] Push / in-app notifications (new commission, payout status, upgrade approved)
- [ ] Admin reports / export (CSV or PDF summary)
- [ ] Member profile edit page
- [ ] Password reset flow
- [ ] Account expiry renewal (re-subscribe after `dateExpiry`)
- [ ] Inactive member re-activation flow

---

## 🔒 Golden Rules (permanent, never change)
1. **A referral code is only issued when a member becomes active.**
2. **Only an admin (or super admin) can activate a member.**
3. Commission depth is package-gated: Basic=L1, Family=L3, Premium=L6 (no earnings beyond cap).
4. Rank is recognition-only — it does not affect commission rates or eligibility.

---

## Notes
- Keith occasionally pushes overwriting changes. Always check git diff before merging.
- `react-phone-input-2` is **incompatible with React 19** — do not reinstall. Use the custom +63 prefix input pattern.
- Clearing `node_modules/.vite` and restarting dev server is needed after adding new deps mid-session.
