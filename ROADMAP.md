# FaithShield Care — Project Roadmap

> **Stack:** React 19 + TypeScript + Vite 8 · Tailwind v4 · Firebase (Auth, Firestore, Storage) · Bun
> **Last updated:** 2026-06-11
> **Live:** https://faithshieldcare.com (apex serves; `www` 301→apex; SSL on both) · Firebase project `faithshieldcare` (Blaze)
> **Architecture:** fully client-side — admin actions run in the admin's browser, enforced by Firestore rules. **No Cloud Functions** (see Out of scope).

---

## Time conventions (locked)

| Concept              | Code constant | UI label  |
| -------------------- | ------------- | --------- |
| Membership validity  | 365 days      | "1 year"  |
| L2-6 commission hold | 7 days        | "1 week"  |
| Upgrade grace period | 90 days       | "90 days" |

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
- [x] **After-grace upgrades** — upgrading is allowed any time; within 90-day grace the member pays the **difference**, after grace they pay the **full** new package price (`basis` stored on the request)
- [x] **Commission-on-upgrade** — upline earns on what the member paid (difference within grace, full after); mirrors signup commission (level depth cap + 7-day hold), tagged `reason: "upgrade"`
- [x] **"Upgrade" tag** shown on commission rows (member Earnings + admin Commissions); admin upgrades panel flags "Full price · after grace"

### Admin

- [x] Add/Encode Member modal (matches sign-up form style)
- [x] Activate member → assigns referral code (golden rule enforced)
- [x] Payout management: approve/reject, mark sent
- [x] Pending upgrades panel

### Developer tooling

- [x] `bun run seed:members` — fast test-account seeding
- [x] `seed:members --rank-demo <tier>` — builds rank ladder for testing
- [x] `bun run seed:cleanup` — deletes all seed-\*@fsc.test accounts
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

### Production & infrastructure

- [x] Firebase project migrated `gpsc-firebase` → **`faithshieldcare`** (new project; .env + .firebaserc updated)
- [x] **Blaze plan** enabled (Cloud Storage for uploads)
- [x] Custom domain **`faithshieldcare.com`** live — apex serves, `www` 301→apex, auto SSL on both
- [x] Social link previews — Open Graph / Twitter Card / JSON-LD meta tags (preview **image** still pending from Keith)

### Approvals & payments (manual-confirm model)

- [x] Unified **Approvals** hub — pending signups + upgrades + renewals in one tab; real-time (onSnapshot), searchable, click-through detail modal
- [x] **Receipt upload** (payment proof) on signup / upgrade / renewal → Storage; admin views it in the Approvals modal and in member detail; latest proof mirrored onto the member on approval
- [x] **Admin view of claim attachments** (images + PDF fallback)
- [x] Real payment **QR codes** (GCash / Maya / GoTyme) from one source of truth (`src/data/paymentAccounts.ts`); GCash + Maya numbers live (**GoTyme number pending from client**)
- [x] **No deactivate / archive** (client rule: inactive = past 365 days only); reject = hard-delete of a never-activated pending signup; super-admin permanent delete retained

### Member dashboard

- [x] **Eligibility Timeline on the Claims tab** (shared component, also on Overview); removed the redundant second "File a claim" button
- [x] **Renewal flow** — member-facing "pay to renew" modal + admin approve (re-activates, resets eligibility/expiry, pays upline on full price)

### Admin dashboard

- [x] **Top Members** leaderboard — time-period filter (this month / last 2–3 months / this year / all-time), top 10, clickable row → opens member profile; "Unknown" sponsor bug fixed

### Security & privacy

- [x] Firestore rules **hardened** — members may only self-edit `mustChangePassword`; `isAdmin`/`isSuperAdmin` escalation blocked on create + update; `commissions`/`transactions` writes are admin-only
- [x] **PII split** — `publicProfiles` collection mirrors only non-sensitive fields (name/city/package/status/referral links); `members` reads locked to **owner + admin** so members can't read others' PII or receipts; cross-member reads (referral tree, downline counts, commission names) redirected to the mirror; admin **"Sync public profiles"** backfill in Settings
- [x] **One-account policy** — one mobile number = one account (hard block at signup + admin-encode via a public `phoneNumbers` index; number freed on delete); admin gets a **soft ⚠️ warning** when a new signup matches an existing member's name + birth date. **Deployed & verified live** (phone check confirmed in the production bundle)

---

## 📋 Backlog

### Auth & access

- [x] **Pending gate** — pending accounts can't reach the dashboard; see a "pending activation" holding screen until an admin activates them
- [x] **Membership lifecycle** — active 365 days → 30-day inactive renewal grace → expired. Phases **derived from dates** (`utils/membership.ts`); expired members are blocked with a renewal gate; grace members keep access + see a renewal banner
- [x] Renewal payment flow — member-facing "pay to renew" modal + admin approve (see Member dashboard)
- [ ] **Request to edit beneficiaries** — beneficiaries are signup-only; client wants members to *request* a change that an admin applies (not built yet; beneficiaries are already admin-write-only in the rules)

### Payments — manual-confirm model (decided) ✅

- [x] **Provider decided** — manual QR Ph / bank transfer (GCash / Maya / GoTyme) + admin confirmation. PayMongo **dropped**; its code (`functions/`, `firebase/payments.ts`) is stale/unused.
- [x] Real QR images + account names wired (`src/data/paymentAccounts.ts`)
- [x] Live domain confirmed → **`faithshieldcare.com`**
- [ ] **GoTyme full number** — still masked (`•••• 1213`); swap in when the client provides it (one-line edit)
- [ ] _(cleanup, optional)_ Remove the dead PayMongo code/secret if we're sure it's never coming back

### Firestore

- [x] **`firestore.rules` deployed** — `upgradeRequests` / `renewalRequests` / hardened security / `publicProfiles` / `phoneNumbers` all live
- [x] **Storage rules deployed** — `receipts/{uid}/…` (payment proof) + `claims/{uid}/…` (attachments), owner+admin access
- [ ] Index any new collection queries as usage grows

### Features (not yet scoped)

- [x] Claims filing flow — per-benefit claim modal (auto/variable amount, required + optional docs, file upload to Storage)
- [x] Admin view of claim attachments (rendered in the admin Claims detail modal)
- [x] Account expiry renewal (re-subscribe after `dateExpiry` via the renewal flow)
- [x] Inactive member re-activation (admin approves a renewal → re-activates)
- [ ] Push / in-app notifications / toast (new commission, payout status, upgrade approved)
- [ ] Admin reports / export (CSV or PDF summary)
- [ ] Member profile edit page (contact info only — beneficiaries stay admin-controlled)
- [ ] Inbox / messaging feature

---

## 🧹 Code health & housekeeping — ✅ ALL THREE PHASES DONE (2026-06-11)

> Keith's "file structure is messy" complaint was fair. Audited, restructured, and verified in one sitting
> (commits `89f698b` Phase 1 → `dc22532` Phase 2 → `d5aa775` Phase 3). **Not yet deployed — local commits only.**

### Phase 1 — Dead code & footguns ✅

- [x] `firebase.json` no longer registers the `functions/` codebase (a plain `firebase deploy` used to try to build the dead Cloud Functions backend) and `functions/` (180 MB) is deleted
- [x] Orphaned modules deleted: PayMongo client (`firebase/payments.ts`), old ReferralTree page + TreeNode, GlobalStyles, AdminRoute, ui/Button, unreferenced assets, old `src` QR images
- [x] Vercel leftovers removed (`vercel.json`, `.vercelignore`, `.vercel/`); `react-hook-form` dropped (zero imports)
- [x] OG design sources (`og-image.svg`, `og-logo.png` 1.5 MB, `icons.svg`) moved out of `public/` into `design/` so they no longer ship to hosting

### Phase 2 — Folder restructure ✅

**House rule going forward: `pages/` holds only routed screens; everything reusable lives in `components/<area>/`.**

- [x] `components/` split: `ui/` · `guards/` · `modals/` · `admin/` · `member/` · `layout/` (PublicNav + Footer, shared by Home **and** info pages) · `landing/` (Home sections)
- [x] `pages/visitor/nav/` → `pages/info/`; `Home.tsx` promoted to `pages/`; `Dashboard.tsx` → `RoleGate.tsx`
- [x] `firebase/transactions.ts` → `commissions.ts` (its real job); dead PayMongo `createTransaction`/`confirmTransaction` stripped
- [x] Duplicate `pages/admin/utils.ts` deleted (exact copy of `utils/formatter`); `formatter.tsx` → `.ts`

### Phase 3 — Modularity, performance & tests ✅

- [x] **Route-level code splitting** — new `App.tsx` (routes/providers) + bootstrap-only `main.tsx`; dashboard, signup, and info pages are lazy chunks. Visitors no longer download the **4.8 MB barangay dataset** or the **740 kB dashboard** bundle; `AddMemberModal` loads only when an admin clicks "Add Member"
- [x] **`SignUp.tsx` 1,613 → ~460 lines** — split into `pages/public/signup/` (constants, ConsentGate, PackageStep, PersonalInfoStep, SponsorBeneficiariesStep, PaymentStep, ReviewStep)
- [x] **`Members.tsx` 908 → ~600 lines** — detail modal extracted to `components/admin/MemberDetailModal` (self-contained: resolves rank + delete-eligibility itself)
- [x] **Unit tests — `bun run test`, 50 passing** — commission hold/fee math, rank ladder, membership lifecycle, upgrade pricing, benefit eligibility (`tests/` + `tsconfig.tests.json`, runner is Bun's built-in — zero new runtime deps)
- [x] `package.json` renamed `gpscv2` → `faithshieldcare`

### Remaining (small, no rush)

- [ ] **`Logo.png` is 1.58 MB** and ships on every page — ask Keith/client for an optimized version (<100 kB) or compress it; biggest remaining transfer cost
- [ ] Run the full verify trio before any deploy: `bun run test && bun run lint && bun run build`

---

## ⏳ Waiting on others (not code)

- [ ] **GoTyme full number** — from client
- [ ] **OG preview image** (`public/og-image.png`) — Keith
- [ ] **Facebook link re-scrape** (FB Sharing Debugger) — Keith

---

## 🚫 Out of scope (decided — do not re-add without the client asking)

- **No Cloud Functions.** App is fully client-side; rules enforce security. A stale, unwired Functions backend exists in `functions/src/index.ts` — do not wire it up.
- **Auto-delete stale pending signups** — dev idea, not a client requirement.
- **Nightly scheduled status/expiry job** — needs functions; dropped.
- **Email-exists check on signup** — dropped (Firebase Auth already rejects duplicate emails at registration).
- **PayMongo / hosted checkout** — dropped in favor of manual QR + admin confirm.

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
- **Deploy:** `bunx firebase-tools deploy --only firestore:rules,storage,hosting --project faithshieldcare`. CLI active project was once stuck on the old `gpsc-firebase` — `firebase use faithshieldcare` fixed it; keep `--project` explicit as a safety net.
- **publicProfiles** is the only collection members may read about *other* members. After importing members or if a downline looks stale, run admin → Settings → **Sync public profiles** — it also seeds the `phoneNumbers` registry (one-account policy). **Run it once after the one-account deploy** so pre-existing members' numbers are protected.
- A **301 redirect is cached "permanently"** by browsers — if a domain/redirect change doesn't show, test in incognito / a fresh browser profile.
