# Claude Startup Prompt — Shelvd

## Project

**Shelvd** is a SaaS webapp for serious book collectors (first editions, signed copies, fine bindings, antiquarian). Built with Next.js 15 + Supabase + Tailwind + shadcn/ui, Swiss design. Live at https://shelvd.org.

**Location:** `/Users/bruno/Developer/shelvd`

## First Actions — DO THESE IMMEDIATELY

```bash
cat /Users/bruno/Developer/shelvd/project.md
cat /Users/bruno/Developer/shelvd/CLAUDE_SESSION_LOG.md
cd /Users/bruno/Developer/shelvd && git status && git log --oneline -10
```

After reading, summarize: what's complete, what's in progress, any uncommitted changes.

## What's Built (all working)

- **Collection:** CRUD, list/grid, bulk delete, 5000+ books
- **Search:** Global (client-side batch, optimized for collection filtering) + Advanced (14 fields, AND/OR)
- **Import/Export:** Excel template, CSV, JSON
- **Stats Dashboard:** Metrics, charts, top 10s
- **Cataloging:** ISBD (4 languages), 45+ cover types, 76 formats, 69 MARC roles, 3887 BISAC
- **Admin:** User management, stats bar
- **Settings:** Account, config, external links (54 system types), book lookup providers, collections management
- **Duplicate Detection:** Server-side SQL, ISBN + title, grouped bulk delete
- **Book Lookup:** 9 providers (Open Library, Google Books, LoC, BnF, DNB, K10plus, SUDOC, LIBRIS, Standaard Boekhandel)
- **Multiple Collections:** Library + Wishlist (non-deletable defaults), custom collections, nav dropdown, bulk actions, settings page, toggleable chips on detail page
- **Custom Tags:** Colored tags, autocomplete/create, filter by tag, clickable on detail page
- **Currency & Valuation:** 29 currencies, ECB exchange rates (frankfurter.app), per-book gain/loss on detail, value summary bar on books list, value distribution chart on stats
- **Book Detail:** External links with URLs + favicons, toggleable collection chips with toast, colored tag chips, Move to Library button, prev/next navigation

## Tech

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 15 (App Router), Tailwind CSS 4, shadcn/ui |
| DB | Supabase PostgreSQL (EU Frankfurt) |
| Hosting | Vercel (auto-deploy on push) |
| Design | Swiss Design (minimal, monochrome) |

### Key Files
- `project.md` — Full spec, schema, design decisions, pitfalls
- `CLAUDE_SESSION_LOG.md` — Session history, completed work, next priorities
- `apps/www/lib/isbn-providers/` — Book lookup provider code
- `apps/www/lib/constants.ts` — BookStatus (14 values), conditions, roles, etc.
- `apps/www/components/` — Reusable components (collection-chips, tag-input, collection-nav, move-to-library-button)
- `apps/www/lib/currencies.ts` — 29 ISO 4217 currencies
- `supabase/migrations/` — DB migrations (001–015)

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

## Workflow

1. Read log + check git status
2. Explain what you'll do → wait for OK
3. Make incremental changes
4. Update session log
5. `cd /Users/bruno/Developer/shelvd && git add -A && git commit -m "message" && git push`

## Next Priorities

| Feature | Status |
|---------|--------|
| Currency & Valuation | ✅ Done |
| Enrich mode (merge lookup fields on edit) | 🔴 Todo |
| Image upload (covers, spine, damage) | 🔴 Todo |
| Sharing & Public Catalog | 🔴 Todo |
| Landing page + Knowledge base | 🔴 Todo |

---

## Current Task

[INSERT YOUR TASK HERE]
