# Claude Session Log

## Current State (2026-02-09)

**App version: v0.10.0.** All core features, marketing site, and feedback system complete. 9 lookup providers active. 26 DB migrations applied. Marketing site: Landing, Privacy, Terms, About, Changelog, Roadmap, Marginalia (blog) — all live. Only Knowledge Base remains for content pages.

**Recent session work:**
- **Admin system stats dashboard (A1) — COMPLETE**
  - Server action (`lib/actions/admin-stats.ts`): fetches all platform stats bypassing RLS
  - Stats page (`/admin/stats`): key metrics (total books, estimated value, sales, avg value), secondary counts (users, collections, tags, provenance, ext links, no-ISBN), distribution bar charts (status, language, condition, publishers), growth timeline charts (books/month, signups/month), books per user table
  - Migration 026: 7 admin RPC functions (get_books_by_status_for_admin, get_books_by_condition_for_admin, get_top_publishers_for_admin, get_books_by_month_for_admin, get_books_per_user_for_admin, get_platform_stats_for_admin, get_signups_by_week_for_admin)
  - Swiss design: CSS-only bar charts (red accent on top item), monospace numbers, hover tooltips on timeline
  - Quick link from admin dashboard
- **Header redesign**: user menu dropdown (Settings/Support/Admin/Sign Out behind user icon), left-aligned nav
- **Resend email**: API key + from email env vars added to Vercel, redeploy triggered
- **Feedback & Support system — COMPLETE (all 6 steps done)**
  - Migration 025: `feedback` table with RLS, indexes, trigger (bug/contact/callback types, status workflow, priority, admin notes/response)
  - User support page (`/support`): three form types (bug report, contact, callback) with auto browser info capture, "My Submissions" tab with status chips + admin response display
  - Admin support queue (`/admin/support`): filterable by type/status/priority, expandable detail panel, status workflow, priority dots, admin notes, admin response, bulk actions (acknowledge/close/spam/delete)
  - Admin badge count: red badge on Support Queue link showing new submission count
  - Email notifications: Resend integration — admin users emailed on new submissions (needs `RESEND_API_KEY` + `RESEND_FROM_EMAIL` env vars on Vercel)
  - Support link in app nav (MessageSquare icon) + marketing footer
  - Files: `lib/actions/feedback.ts`, `lib/email.ts`, `app/(app)/support/`, `app/(app)/admin/support/`
- Blog / Marginalia: 22 articles written + blog pages built (`/blog`, `/blog/[slug]`)
- Header dropdown reordered (About, Marginalia, Privacy, Terms, Changelog, Roadmap), "coming soon" removed
- Blog renamed from "Blog" to "Marginalia" across header, footer, page title
- Docs reorganized: all reference docs moved to `docs/`, consolidated `book-reference.md`

---

## Feature Backlog — TODO

### Core Product
| # | Feature | Priority | Effort | Description |
|---|---------|----------|--------|-------------|
| 4 | Activity logging | High | Medium-High | `user_activity_log` table: user_id, action, entity_type, entity_id, details (JSON diff), timestamp. Admin gets filterable log viewer. Essential before multi-user beta. |
| 6 | Image upload | Medium | High | Cover images, spine, damage photos. Supabase Storage. Gallery on detail page. |
| 7 | Sharing & Public Catalog | Medium | High | Public profile page, shareable collection links, embed widget. |
| 8b | Knowledge base (`/help`) | Medium | Medium | Getting started guide, FAQ, feature docs, tips. Last marketing page. |
| 9 | Mobile responsiveness | High | High | Hamburger nav, touch targets, single-column forms, responsive cards/charts. Desktop-only in practice today. |

### Growth & Marketing
| # | Feature | Priority | Effort | Description |
|---|---------|----------|--------|-------------|
| G1 | Invite codes | High | Medium | Marketing & attribution tool. Admin creates codes per channel (`BOOKFAIR2026`, `INSTAGRAM`, `CATAWIKI`), partnership (`ANTIQUARIAAT-X`), campaign (`MARGINALIA`), or referral (per-user codes). Signup requires a valid code → tracks which channels bring users. Dashboard: signups per code, conversion rates, top channels. Creates exclusivity ("invitation-only for serious collectors") + measurable growth. DB: `invite_codes` table (code, label, source_type, max_uses, used_count, expires_at, created_by). Signup flow gets code input field. Admin gets code generator + analytics. |

### Admin Enhancements
| # | Feature | Priority | Effort | Description |
|---|---------|----------|--------|-------------|
| ~~A1~~ | ~~System stats dashboard~~ | ~~High~~ | ~~Medium~~ | ~~DONE — /admin/stats with metrics, distributions, growth charts~~ |
| A3 | Activity log viewer | High | Medium | Filterable by user, action, date, entity. Depends on #4. |
| A4 | User detail view | Low | Medium | Click user in admin table → full profile: books count, collections, last active, features used, support tickets. |
| A5 | Admin impersonation | Medium | Medium | "View as user" button in admin user table. Admin temporarily sees the platform as that user — their books, collections, settings, everything. Essential for debugging reported issues. Banner at top showing impersonation mode + "Exit" button. Supabase approach: admin session stores target user_id, RLS queries use that instead of auth user. Audit logged. |
| A6 | Data health checks | Low | Medium | Orphaned records, missing fields, import errors, DB consistency. |

### Completed
| # | Feature | Date |
|---|---------|------|
| A1 | System stats dashboard | 2026-02-09 |
| 5 + A2 | Feedback & Support + Admin queue | 2026-02-09 |

### Book Data Features
| # | Feature | Priority | Effort | Description |
|---|---------|----------|--------|-------------|
| B1 | Insurance & valuation PDF reports | Medium | Medium | Generate PDF reports for insurance: book list with photos, estimated values, total collection value. Timestamped, signed, official-looking. Export per collection or full library. |
| B2 | Valuation history | Medium | Medium | Separate from provenance. Track market value over time without ownership changes: appraisals, auction estimates, dealer quotes. `valuation_history` table: book_id, date, value, currency, source (appraisal/auction_result/dealer_quote/self_estimate), appraiser, notes. Chart on book detail showing value trend over time. |
| B3 | Condition history | Medium | Medium | Physical life of the book, separate from provenance (who owned it). `condition_history` table: book_id, date, event_type (restoration/rebinding/repair/damage/cleaning/deacidification/assessment), description, performed_by (restorer/workshop), cost, currency, before_condition_id, after_condition_id, notes. Chronological log on book detail. Current `condition_id` always reflects latest state. |

### Dealer & Marketplace
| # | Feature | Priority | Effort | Description |
|---|---------|----------|--------|-------------|
| D1 | Dealer directory & messaging | Medium | High | Two-tier system. **Dealer account (paid tier):** dealers register with business profile (name, type, location, phone, email, website, description, specialties). Visible in public dealer directory. **Regular users:** browse dealer directory, view dealer profiles, send a message to any dealer with their wishlist or any collection attached. Dealers receive messages in their account + email notification. DB: `dealer_profiles` table linked to user account, `dealer_messages` table (from_user, to_dealer, subject, message, attached_collection_id, attached_wishlist). No CRM, no transaction history, no ratings — keep it simple. |

### Under Consideration
- Sales platform integration (WooCommerce, Catawiki, AbeBooks)
- PDF catalog export
- Templates system
