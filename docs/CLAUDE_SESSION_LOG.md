# Claude Session Log

> **RULE: This log is updated in real-time during every session. Each subtask is written here BEFORE committing code. Status: ⏳ doing / ✅ done / ❌ blocked. On connection loss, the next session reads this log first to know exactly where to resume. Every commit includes a log update. No exceptions.**

## Current State (2026-02-12)

**App version: v0.15.0.** All core features, marketing site, feedback system, PDF print inserts, cover images, activity logging, invite codes, tier system, and valuation history complete. 9 lookup providers active. 45 DB migrations applied. Marketing site: Landing, Privacy, Terms, About, Changelog, Roadmap, Marginalia (blog) — all live.

**No task in progress.** Session ended cleanly. Ready for next task from backlog.

---

## Recent Session Work (2026-02-12)

### v0.15.0 — Valuation History + Bug Fixes + Landing Page

**B2 Valuation History — ALL 8 STEPS COMPLETE ✅**
- B2.1: Migration 043 — valuation_history table + indexes + RLS ✅
- B2.2: Migration 044 — migrate estimated_value/lowest/highest → valuation_history entries ✅
- B2.3: Provenance auto-sync — price_paid → valuation entries (create/update/delete) ✅
- B2.4: Detail page timeline — ValuationTimeline component ✅
- B2.5: Edit page CRUD — ValuationHistoryEditor replaces old 6-field grid ✅
- B2.6: Value trend chart — Recharts line chart, dynamic import, shows with 2+ dated entries ✅
- B2.7: Activity logging — valuation changes logged ✅
- B2.8: Migration 045 — drop old columns (estimated_value, lowest_price, highest_price, valuation_date) ✅

**Documentation updates (v0.15.0):**
- project.md: B2 steps 7-8 marked done, migrations 026-045 documented, valuation history section, completed roadmap
- changelog.ts: APP_VERSION bumped to 0.15.0, full release entry
- roadmap.ts: Valuation History moved to 'shipped' with version 0.15.0
- Commit: `7df6dad`

**Critical bug fix: Tier resolution downgrade ✅**
- Problem: `is_lifetime_free` always returned `collector_pro`, downgrading dealer users (5,000 limit instead of 100,000)
- Fix: Tier hierarchy in `lib/tier.ts` — `highestTier()` function, lifetime Pro grants *at least* collector_pro
- Settings page: shows effective tier badge + "Lifetime Early Access" badge
- Files: `lib/tier.ts`, `settings/settings-form.tsx`
- Commit: `bd3ed2e`

**Critical bug fix: Server crash on book detail ✅**
- Problem: `formatCurrency` function passed as prop to client component (not serializable)
- Fix: Client components import `formatCurrency` directly, receive only `locale` string
- Files: `valuation-timeline.tsx`, `value-trend-chart.tsx`, `books/[id]/page.tsx`
- Commit: `0b795c0`

**UI fix: Feature gate Swiss design ✅**
- LimitReached + UpgradeHint stripped of amber/colored styling → clean Swiss borders
- Commit: `bcc8a6f`

**UI fix: Focus ring neutral ✅**
- Global `:focus-visible` changed from thick Swiss Red ring-2 to thin neutral ring-1
- Commit: `65de772`

**UI fix: Book list row vertical alignment ✅**
- Cover thumbnail (h-9) caused title to sit lower than other columns
- Added `items-center` to grid row + inner link grid
- Commit: `3cdda55`

**Bug fix: Cover images missing in list/grid view ✅**
- `cover_image_url` was not in any of the 4 `bookSelect` queries — field was in type and JSX but never fetched
- Added to all 4 select strings
- Commit: `43cd76c`

**Landing page update ✅**
- New 5th feature category "Tracking & History": Cover Images, PDF Inserts, Activity Feed
- Valuation card renamed → "Valuation History" with full description
- New Valuation History Spotlight section (mock timeline, provenance badge, +153% trend)
- Condition Spotlight: added condition history timeline paragraph
- Comparison section: added "No way to track value over time" row
- Commit: `4dd8eba`

---

## Previous Session Work (2026-02-11)

### v0.13.0 — Tier System, Activity Logging, Invite Codes

**#14 Tier System & Feature Gating — COMPLETE ✅**
- Migration 040: tier_features (19 features × 3 tiers) + tier_limits (books/tags/storage/bandwidth)
- Migration 041: Admin RLS for tier tables
- Migration 042: No unlimited in tier_limits
- Server: hasFeature() + client hooks (useFeature, useTierLimit, useTier) + TierProvider
- UI: FeatureGate, UpgradeHint, UpgradeHintInline, LimitGate, LimitReached
- Admin: /admin/tiers with feature matrix + limits editor
- Gating applied: book limit (add form), tag limit (tags manager), PDF inserts (detail page)
- Landing page pricing updated (3 real tiers + early access banner)
- "Lifetime free" → "Lifetime Collector Pro" (11 files)

**#4 Activity Logging — ALL 6 STEPS COMPLETE ✅**
- Foundation: activity_log table, 5 indices, RLS, SECURITY DEFINER RPCs, logActivity() utility
- Book instrumentation: created/updated (JSON diff)/deleted, import.completed
- Full platform: collections (5), account (3), admin (7) — 20 logActivity() calls
- Admin: dashboard feed + /admin/activity log viewer (filters, pagination)
- User-facing: /activity page, /stats recent feed, book detail timeline

**#13 Invite Codes — ALL 5 STEPS COMPLETE ✅**
- Tables: invite_codes + invite_code_redemptions, redeem RPC, admin RPCs, RLS
- Signup: optional code field with validation + benefits
- Admin: /admin/invite-codes list/create/toggle + detail pages
- Activity logging (2 actions)

**User Profile Expansion ✅**
- Migration 039: phone, company_name, website on user_profiles
- Admin user detail: all profile fields displayed
- Settings form: new fields in Profile section

**RLS Security Fix ✅**
- Migration 035: re-enabled RLS on languages, publishers, contributor_aliases

---

## Previous Session Work (2026-02-09 – 2026-02-10)

### v0.12.0 — Cover Images, PDF Inserts, Condition History

**Image Upload (#6) — Fase 1 COMPLETE ✅** (URL-based)
- Migration 030: cover_image_url on books table
- URL input on add/edit forms with live thumbnail preview
- Cover on detail page, list view (24×36px), grid view (fills card)
- Auto-fill during enrichment
- Lookup→Add: cover_url mapped from sessionStorage
- Clickable covers with lightbox overlay

**Printable PDF Book Inserts — COMPLETE ✅**
- Vintage catalog card (3×5"): 1930s library aesthetic, Courier typewriter, red vertical line
- Full catalog sheet: 6 paper sizes, Swiss typography, all sections, adaptive
- API route + BookPdfButton dropdown on detail page

**B3 Condition History — COMPLETE ✅**
- Timeline + CRUD + auto-prompt on condition change

**Lookup/Enrich UX Reorganisation ✅**
- Lookup moved to header nav
- Book detail: Lookup → Enrich button
- Add form: full Enrich panel

---

## Feature Backlog — TODO

### 🔴 Urgent — Do Next
| # | Feature | Effort | Description |
|---|---------|--------|-------------|
| 9 | Mobile responsiveness (app) | High | Website ✅. App: hamburger nav, touch targets, single-column forms, responsive cards/charts. Desktop-only in practice. |
| 12 | User Onboarding | Medium | Welcome wizard, smart empty states, getting started checklist, contextual hints, demo book. |

### 🟡 Important — Before Launch
| # | Feature | Effort | Description |
|---|---------|--------|-------------|
| 6 | Image Upload (fase 2 — Blob) | High | Cover images, spine, damage photos. Vercel Blob Storage. Gallery on detail page. Tier-gated (Pro: 5GB, Dealer: 25GB). |
| 7 | Sharing & Public Catalog | High | Public profile page, shareable collection links, embed widget. Pro+ only. |
| 10 | Collection Audit | Medium | Per-user library health score. Missing contributors, books without identifiers, provenance gaps. One-click fixes. Pro+ only. |
| 8b | Knowledge base (`/help`) | Medium | Getting started guide, FAQ, feature docs, tips. Last marketing page. |
| 14.7 | Payments & Upgrade Flow | High | Stripe integration, checkout flow, upgrade/downgrade, billing portal. All upgrade links currently point to `/#pricing` as placeholder. |

### 🟢 Planned — Post-Launch
| # | Feature | Effort | Description |
|---|---------|--------|-------------|
| 11 | Catalog Generator (DOCX) | Medium-High | Select books → professional DOCX catalog. Numbered entries, title page, TOC. Dealer only. |
| B1 | Insurance & valuation PDF reports | Medium | PDF reports for insurance: book list with photos, estimated values, total collection value. Now unblocked (B2 complete). |
| 15 | Community | Medium-High | Forum/discussion for collectors and dealers. |
| A5 | Admin impersonation | Medium | "View as user" for debugging. Audit logged. |
| A6 | Platform health checks | Medium | Orphaned records, cross-user inconsistencies, import errors. |
| A8 | Weekly admin digest | Medium | Automated Monday email via Resend + Vercel Cron. |
| A9 | Onboarding funnel (admin view) | Low | Visual journey tracker on user detail. |
| S1 | WooCommerce integration | Medium | Sync books → WooCommerce products. Dealer only. |
| S2 | Catawiki integration | High | Auction upload from Shelvd. Dealer only. |
| S3 | AbeBooks integration | Medium-High | XML feed for AbeBooks/ZVAB dealer inventory. Dealer only. |
| D1 | Dealer directory & messaging | High | Business profiles, public directory, messaging with collection attachment. |

### Under Consideration
- PDF catalog export
- Templates system

---

### Completed Features (chronological)
| # | Feature | Date | Version |
|---|---------|------|---------|
| A1 | System stats dashboard | 2026-02-09 | v0.10.0 |
| 5 + A2 | Feedback & Support + Admin queue | 2026-02-09 | v0.10.0 |
| B3 | Condition history | 2026-02-09 | v0.11.0 |
| UX1 | Edit page UX/UI overhaul | 2026-02-09 | v0.11.0 |
| PDF | Printable PDF inserts | 2026-02-09 | v0.11.0 |
| AUTH | Auth page live stats + literary quotes | 2026-02-09 | v0.11.0 |
| 6.1 | Image Upload (fase 1 — URL) | 2026-02-10 | v0.12.0 |
| A4 | User management | 2026-02-11 | v0.13.0 |
| 4 | Activity logging (6 steps, 20 log points) | 2026-02-11 | v0.13.0 |
| A3 | Activity log viewer | 2026-02-11 | v0.13.0 |
| 13 | Invite codes | 2026-02-11 | v0.13.0 |
| SEC | RLS security fix | 2026-02-11 | v0.13.0 |
| UP | User profile expansion | 2026-02-11 | v0.13.0 |
| 14 | Tier System & Feature Gating | 2026-02-11 | v0.13.0 |
| B2 | Valuation History (8 steps) | 2026-02-12 | v0.15.0 |
| — | Landing page update (new features) | 2026-02-12 | v0.15.0 |
