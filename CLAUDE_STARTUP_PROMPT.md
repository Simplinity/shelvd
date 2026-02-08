# Claude Startup Prompt — Shelvd

## Project

**Shelvd** is a SaaS webapp for serious book collectors (first editions, signed copies, fine bindings, antiquarian). Built with Next.js 15 + Supabase + Tailwind + shadcn/ui, Swiss design. Live at https://shelvd.org. Current version: **v0.9.0**.

**Location:** `/Users/bruno/Developer/shelvd`

## First Actions — DO THESE IMMEDIATELY

```bash
cat /Users/bruno/Developer/shelvd/project.md
cat /Users/bruno/Developer/shelvd/CLAUDE_SESSION_LOG.md
cd /Users/bruno/Developer/shelvd && git status && git log --oneline -10
```

After reading, summarize: what's complete, what's in progress, any uncommitted changes.

## What's Built (all working)

### Core App
- **Collection:** CRUD, list/grid, bulk delete, 5000+ books
- **Search:** Global (client-side batch, optimized for collection filtering) + Advanced (14 fields, AND/OR)
- **Import/Export:** Excel template, CSV, JSON
- **Stats Dashboard:** Metrics, charts, top 10s, cached in user_stats
- **Cataloging:** ISBD (4 languages), 45+ cover types, 76 formats, 69 MARC roles, 3887 BISAC
- **Admin:** User management, stats bar, announcement system
- **Settings:** Account, config, external links (54 system types), book lookup providers, collections management, tags management
- **Duplicate Detection:** Server-side SQL, ISBN + title, grouped bulk delete
- **Book Lookup:** 9 providers (Open Library, Google Books, LoC, BnF, DNB, K10plus, SUDOC, LIBRIS, Standaard Boekhandel)
- **Multiple Collections:** Library + Wishlist (non-deletable defaults), custom collections, nav dropdown, bulk actions, settings page, toggleable chips on detail page
- **Custom Tags:** Colored tags, autocomplete/create, filter by tag, clickable on detail page
- **Currency & Valuation:** 29 currencies, ECB exchange rates (frankfurter.app), per-book gain/loss on detail, value summary bar on books list, value distribution chart on stats
- **Enrich Mode:** Enrich button in edit page header, ISBN lookup + field search fallback, comparison panel (new/different), merge selected fields, smart author comparison + auto-merge
- **Contributor Name Handling:** "Last, First" standard via `lib/name-utils.ts`, auto-converts lookup names, populates all DB fields
- **Provenance Tracking:** Visual timeline, 10 owner types, 14 association types, evidence sources, acquisition records migrated, integrated into ISBD generator and import/export
- **Locale & Number Formatting:** Single locale setting (en-US, nl-BE, de-DE, fr-FR, etc.) drives number/date display across all pages via shared `lib/format.ts`
- **Collapsible Form Sections:** Accordion on add/edit with field count badges, expand/collapse all
- **Book Detail:** External links with URLs + favicons, toggleable collection chips with toast, colored tag chips, Move to Library button, prev/next navigation

### Marketing Site (public, no auth)
- **Landing Page** (`/`) — Hero, 12-feature showcase, 4 visual spotlights, comparison grid, 3-tier pricing, CTAs
- **Privacy Policy** (`/privacy`) — GDPR-compliant, 11 sections, third-party table, GDPR rights
- **Terms of Service** (`/terms`) — 14 sections, data ownership, acceptable use, IP, liability
- **About** (`/about`) — Origin story, 28k books, problem/solution, what we care about, the name
- **Changelog** (`/changelog`) — 9 releases (0.1.0–0.9.0), timeline design, color-coded change types
- **Roadmap** (`/roadmap`) — 3-lane board (Shipped/Building/Planned), 26 items, category badges
- **Shared Components:** MarketingHeader (Info dropdown, 5 live + 1 coming soon), MarketingFooter (4-column grid)
- **App Versioning:** `APP_VERSION` in `lib/changelog.ts`, version badge in app header, git tag v0.9.0

All marketing pages: Swiss design, literary wit, tongue-in-cheek humor throughout.

## Tech

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 15 (App Router), Tailwind CSS 4, shadcn/ui |
| DB | Supabase PostgreSQL (EU Frankfurt) |
| Hosting | Vercel (auto-deploy on push) |
| Design | Swiss Design (minimal, monochrome, red accent) |

### Key Files
- `project.md` — Full spec, schema, design decisions, pitfalls
- `CLAUDE_SESSION_LOG.md` — Session history, completed work, next priorities
- `apps/www/lib/changelog.ts` — APP_VERSION + changelog data (powers changelog page + header badge)
- `apps/www/lib/roadmap.ts` — Roadmap data (powers roadmap page)
- `apps/www/lib/isbn-providers/` — Book lookup provider code
- `apps/www/lib/constants.ts` — BookStatus (14 values), conditions, roles, etc.
- `apps/www/lib/format.ts` — Locale-aware formatters (formatInteger, formatDecimal, formatCurrency, formatDate)
- `apps/www/lib/currencies.ts` — 29 ISO 4217 currencies
- `apps/www/lib/name-utils.ts` — Contributor name parser
- `apps/www/components/marketing/` — MarketingHeader, MarketingFooter (shared across all public pages)
- `apps/www/components/` — Reusable components (collection-chips, tag-input, collection-nav, announcement-banner, etc.)
- `supabase/migrations/` — DB migrations (001–024)

### Database
```bash
/opt/homebrew/opt/libpq/bin/psql "postgresql://postgres:LsY1yr4siVYlZhiN@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres"
```

### Environment
- `GOOGLE_BOOKS_API_KEY=AIzaSyBcxf0XwSI8DFg8MTpD1SZYN4Uj9oOwQBY`

## Critical Rules

1. **ALWAYS read project.md and session log** before starting work
2. **ALWAYS check DB schema** before writing queries — NEVER guess column names
3. **ALWAYS update CLAUDE_SESSION_LOG.md** after completing any task
4. **ALWAYS push to GitHub** after completing work
5. **Use `.range()` not `.limit()`** for Supabase pagination
6. **Read files before editing** — use `str_replace` with exact old text
7. **Explain plan and ask confirmation** BEFORE executing changes
8. **One step at a time** if input is needed
9. **Test on Vercel** (not locally) — wait for build result
10. **Modify files directly** — don't show code blocks to copy/paste
11. **Roadmap changes → update `lib/roadmap.ts`** — the `/roadmap` page is data-driven from this file. Any feature added, moved between lanes, or removed in project.md MUST also be reflected in `lib/roadmap.ts` so the public website stays in sync.
12. **Version bumps → update `lib/changelog.ts`** — the `/changelog` page and app header version badge are driven from `APP_VERSION` and the `CHANGELOG` array. Any new release MUST add an entry here and bump the version in both `lib/changelog.ts` and `package.json` files.

## Workflow

1. Read log + check git status
2. Explain what you'll do → wait for OK
3. Make incremental changes
4. Update session log
5. `cd /Users/bruno/Developer/shelvd && git add -A && git commit -m "message" && git push`

## Next Priorities

| Feature | Status |
|---------|--------|
| Marketing site (8a–8g) | ✅ Done |
| Provenance tracking | ✅ Done |
| Currency & Valuation | ✅ Done |
| Enrich mode | ✅ Done |
| Contributor name handling | ✅ Done |
| Locale & number formatting | ✅ Done |
| Image upload (covers, spine, damage) | 🔴 Todo |
| Activity logging | 🔴 Todo |
| Feedback & bug reporting | 🔴 Todo |
| Sharing & Public Catalog | 🔴 Todo |
| Mobile responsiveness | 🔴 Todo |
| Blog (`/blog`) | 🔴 Todo |
| Knowledge base (`/help`) | 🔴 Todo |

---

## Current Task

[INSERT YOUR TASK HERE]
