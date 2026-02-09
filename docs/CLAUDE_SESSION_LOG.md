# Claude Session Log

## Current State (2026-02-09)

**App version: v0.9.0.** All core features, marketing site, and feedback system complete. 9 lookup providers active. 25 DB migrations applied. Marketing site: Landing, Privacy, Terms, About, Changelog, Roadmap, Marginalia (blog) — all live. Only Knowledge Base remains for content pages.

**Recent session work:**
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

### Admin Enhancements
| # | Feature | Priority | Effort | Description |
|---|---------|----------|--------|-------------|
| A1 | System stats dashboard | High | Medium | Total books, users, storage, activity trends, growth charts. |
| A3 | Activity log viewer | High | Medium | Filterable by user, action, date, entity. Depends on #4. |
| A4 | User management | Medium | Medium | Invite codes, approve registrations, user details view. |
| A6 | Data health checks | Low | Medium | Orphaned records, missing fields, import errors, DB consistency. |

### Completed
| # | Feature | Date |
|---|---------|------|
| 5 + A2 | Feedback & Support + Admin queue | 2026-02-09 |

### Under Consideration
- Insurance & valuation PDF reports
- Price history field (auction results, dealer quotes)
- Condition history (restorations, reports)
- Dealer & contact management
- Sales platform integration (WooCommerce, Catawiki, AbeBooks)
- PDF catalog export
- Templates system
