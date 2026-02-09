# Claude Session Log

## Current State (2026-02-09)

**App version: v0.9.0.** All core features and marketing site complete. 9 lookup providers active. 25 DB migrations applied. Marketing site: Landing, Privacy, Terms, About, Changelog, Roadmap, Marginalia (blog) — all live. Only Knowledge Base remains for content pages.

**Recent session work:**
- **Feedback & Support system — Step 3/6: Admin support queue done**
  - `/admin/support` page with full queue table: type icon, subject, user email, priority dot, status chip, time ago
  - Filter bar: by type (bug/contact/callback) and status (new/acknowledged/in_progress) with count badges
  - Expandable detail panel: message, severity, steps, browser info, category, phone/time/urgency
  - Status workflow: dropdown to change status (new → acknowledged → in_progress → resolved/closed/spam)
  - Priority management: dropdown (none/low/medium/high/critical) with color dots
  - Admin notes: internal-only textarea (auto-saves on change)
  - Admin response: write response visible to user, "Send & Resolve" button
  - Delete with confirmation
  - Bulk actions: select multiple → acknowledge, close, spam, delete
  - "Support Queue" link added to admin dashboard
  - Server actions: updateFeedbackStatus, updateFeedbackPriority, updateAdminNotes, sendAdminResponse, deleteFeedback, bulkUpdateFeedbackStatus, bulkDeleteFeedback, getAllFeedback, getNewFeedbackCount
- **Step 2/6: User support page done**
  - `/support` page with three form types: Bug Report, Contact, Callback
  - Type selector cards (Swiss design: red left border on selected)
  - Bug form: subject, severity (4 levels), description, steps to reproduce
  - Contact form: category (5 options), subject, message, preferred response
  - Callback form: phone, preferred time, urgency, timezone (auto-detected), details
  - Auto-captures browser info (UA, screen size, URL, app version) as JSONB
  - Success state with ticket reference number
  - "My Submissions" list with expandable items, status chips, admin response display
  - Server action: `lib/actions/feedback.ts` (submitFeedback + getUserFeedback)
  - "Support" nav link added to app header (MessageSquare icon)
- **Step 1/6: Migration 025 applied**
  - `feedback` table, RLS, indexes, trigger (see migration 025)
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
| 5 | Feedback & bug reporting | High | Medium | Feedback form (bug/feature/question). `feedback` table with status tracking. Auto-attach browser info. Visible in admin. |
| 6 | Image upload | Medium | High | Cover images, spine, damage photos. Supabase Storage. Gallery on detail page. |
| 7 | Sharing & Public Catalog | Medium | High | Public profile page, shareable collection links, embed widget. |
| 8b | Knowledge base (`/help`) | Medium | Medium | Getting started guide, FAQ, feature docs, tips. Last marketing page. |
| 9 | Mobile responsiveness | High | High | Hamburger nav, touch targets, single-column forms, responsive cards/charts. Desktop-only in practice today. |

### Admin Enhancements
| # | Feature | Priority | Effort | Description |
|---|---------|----------|--------|-------------|
| A1 | System stats dashboard | High | Medium | Total books, users, storage, activity trends, growth charts. |
| A2 | Feedback queue | High | Medium | Review/respond to feedback. Depends on #5. |
| A3 | Activity log viewer | High | Medium | Filterable by user, action, date, entity. Depends on #4. |
| A4 | User management | Medium | Medium | Invite codes, approve registrations, user details view. |
| A6 | Data health checks | Low | Medium | Orphaned records, missing fields, import errors, DB consistency. |

### Under Consideration
- Insurance & valuation PDF reports
- Price history field (auction results, dealer quotes)
- Condition history (restorations, reports)
- Dealer & contact management
- Sales platform integration (WooCommerce, Catawiki, AbeBooks)
- PDF catalog export
- Templates system
