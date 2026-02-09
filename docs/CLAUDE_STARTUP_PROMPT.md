# Claude Startup Prompt — Shelvd

## YOUR TOOLS — YOU HAVE THESE, USE THEM DIRECTLY

You have **full access** to the following tools. Do NOT ask the user for permission to use them, do NOT say you can't access them, do NOT suggest the user runs commands themselves. **Just use them.**

| Tool | What it does | How to use |
|------|-------------|------------|
| **filesystem** (lowercase f) | Read, write, edit, move, search files on the local Mac | `read_text_file`, `write_file`, `edit_file`, `list_directory`, `search_files`, etc. |
| **shell** | Run any shell command on the local Mac | `run_command` — git, psql, npm, grep, sed, anything |
| **Supabase (PostgreSQL)** | Direct DB access | `psql "postgresql://postgres:LsY1yr4siVYlZhiN@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres"` |
| **Chrome browser** | Navigate, click, read pages, take screenshots | `tabs_context_mcp`, `navigate`, `read_page`, `computer`, etc. |
| **web_search / web_fetch** | Search the web, fetch URLs | For current info, docs, references |

**Project location:** `/Users/bruno/Developer/shelvd`
**Live site:** https://shelvd.org (Vercel auto-deploy on push to main)

---

## PROJECT

**Shelvd** — SaaS webapp for serious book collectors (first editions, signed copies, fine bindings, antiquarian). Next.js 15 + Supabase + Tailwind + shadcn/ui, Swiss design. **v0.9.0.**

---

## FIRST ACTIONS — DO THESE IMMEDIATELY

```bash
cat /Users/bruno/Developer/shelvd/docs/project.md
cat /Users/bruno/Developer/shelvd/docs/CLAUDE_SESSION_LOG.md
cd /Users/bruno/Developer/shelvd && git status && git log --oneline -10
```

After reading, summarize: what's complete, what's in progress, any uncommitted changes, what's next.

---

## KEY DOCS

| File | Purpose |
|------|---------|
| `docs/project.md` | **Master reference.** Full spec, DB schema, migrations, completed features, backlog, design decisions, file structure, pricing. |
| `docs/CLAUDE_SESSION_LOG.md` | **Session state.** Current status, recent work, TODO backlog. Update after every task. |
| `docs/CLAUDE_STARTUP_PROMPT.md` | This file. Quick-start context. |
| `docs/book-reference.md` | Domain knowledge: conditions, bindings, book parts, illustration types. |

---

## TECH STACK

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 15 (App Router), Tailwind CSS 4, shadcn/ui |
| DB | Supabase PostgreSQL (EU Frankfurt), 24 migrations |
| Hosting | Vercel (auto-deploy on push) |
| Design | Swiss Design (minimal, monochrome, red accent `#dc2626`) |
| Env | `GOOGLE_BOOKS_API_KEY=AIzaSyBcxf0XwSI8DFg8MTpD1SZYN4Uj9oOwQBY` |

---

## KEY FILES

- `apps/www/lib/changelog.ts` — APP_VERSION + changelog data (powers `/changelog` + header badge)
- `apps/www/lib/roadmap.ts` — Roadmap items (powers `/roadmap`)
- `apps/www/lib/blog.ts` — Blog metadata + markdown parsing (powers `/blog`)
- `apps/www/lib/isbn-providers/` — 9 book lookup providers
- `apps/www/lib/constants.ts` — BookStatus (14), conditions, roles
- `apps/www/lib/format.ts` — Locale-aware formatters
- `apps/www/lib/currencies.ts` — 29 ISO 4217 currencies
- `apps/www/lib/name-utils.ts` — Contributor name parser ("Last, First" standard)
- `apps/www/components/marketing/` — MarketingHeader, MarketingFooter
- `content/blog/` — 22 blog articles (.md, by Bruno van Branden)
- `supabase/migrations/` — 001–024

---

## CRITICAL RULES

1. **Read `docs/project.md` and `docs/CLAUDE_SESSION_LOG.md`** before starting ANY work
2. **Check DB schema** before writing queries — NEVER guess column names
3. **Update `docs/CLAUDE_SESSION_LOG.md`** after completing any task
4. **Push to GitHub** after completing work: `git add -A && git commit -m "msg" && git push`
5. **Supabase:** use `.range()` not `.limit()` for pagination
6. **Read files before editing** — use exact text matching
7. **Explain plan → wait for OK** before executing changes
8. **One step at a time** if input is needed
9. **Test on Vercel** (not locally) — wait for build result
10. **Modify files directly** — never show code blocks to copy/paste
11. **Roadmap changes → also update `lib/roadmap.ts`** (public `/roadmap` page is data-driven)
12. **Version bumps → also update `lib/changelog.ts`** + `package.json`

---

## WORKFLOW

1. Read docs + check git status
2. Explain plan → wait for OK
3. Make incremental changes
4. Update session log
5. `cd /Users/bruno/Developer/shelvd && git add -A && git commit -m "message" && git push`

---

## WHAT'S DONE (summary — full details in project.md)

**Core:** Collections, Search, Import/Export, Stats, Cataloging (ISBD), Admin, Settings, External Links, Duplicate Detection, Multiple Collections, Tags, Currency & Valuation, Enrich Mode, Contributor Names, Provenance, Locale Formatting, Collapsible Forms, Book Detail Page.

**Lookup:** 9 providers (Open Library, Google Books, LoC, BnF, DNB, K10plus, SUDOC, LIBRIS, Standaard Boekhandel).

**Marketing:** Landing, Privacy, Terms, About, Changelog, Roadmap, Marginalia (blog, 22 articles). All with Swiss design + literary wit.

---

## WHAT'S TODO (full details in session log)

| Priority | Feature |
|----------|---------|
| 🔴 High | Mobile responsiveness |
| 🔴 High | Activity logging |
| 🔴 High | Feedback & bug reporting |
| 🔴 High | Admin: stats dashboard, feedback queue, activity viewer |
| 🟡 Medium | Image upload |
| 🟡 Medium | Sharing & Public Catalog |
| 🟡 Medium | Knowledge base (`/help`) |
| 🟡 Medium | Admin: user management |
| 🟢 Low | Data health checks |
