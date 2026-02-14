# Claude Startup Prompt — Shelvd

## YOUR TOOLS — USE THEM DIRECTLY

You have **full access** to these tools. Do NOT ask permission, do NOT suggest the user runs commands. **Just use them.**

| Tool | How |
|------|-----|
| **filesystem** | `read_text_file`, `write_file`, `edit_file`, `list_directory`, `search_files` |
| **shell** | `run_command` — git, psql, npm, grep, sed, anything |
| **Supabase** | `psql "postgresql://postgres:LsY1yr4siVYlZhiN@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres"` |
| **Chrome** | `tabs_context_mcp`, `navigate`, `read_page`, `computer`, etc. |
| **web_search / web_fetch** | For current info, docs, references |

**Project:** `/Users/bruno/Developer/shelvd`
**Live:** https://shelvd.org (Vercel auto-deploy on push to main)

---

## FIRST ACTIONS — DO THESE IMMEDIATELY

```bash
cat /Users/bruno/Developer/shelvd/docs/project.md
cat /Users/bruno/Developer/shelvd/docs/CLAUDE_SESSION_LOG.md
cd /Users/bruno/Developer/shelvd && git status && git log --oneline -5
```

After reading, summarize: current state, uncommitted changes, what's next.

---

## PROJECT

**Shelvd** — SaaS webapp for serious book collectors (first editions, signed copies, fine bindings, antiquarian). Next.js 15 + Supabase + Tailwind + shadcn/ui, Swiss design. **v0.24.0.** 71 DB migrations. 22 ISBN lookup providers.

---

## KEY DOCS

| File | Purpose |
|------|---------|
| `docs/project.md` | **Master reference.** Schema, migrations, features, roadmap, pre-release polish list. |
| `docs/CLAUDE_SESSION_LOG.md` | **Session state.** Current status, recent work, what's next. Update after every task. |
| `docs/staging.md` | Deployment, env vars, production safety. |
| `docs/book-reference.md` | Domain knowledge: conditions, bindings, book parts. |

---

## CRITICAL RULES

1. **Read `project.md` + `CLAUDE_SESSION_LOG.md`** before ANY work
2. **Check DB schema** before queries — NEVER guess column names: `psql ... -c "\d tablename"`
3. **Update `CLAUDE_SESSION_LOG.md`** after every task
4. **Always build before push:** `cd apps/www && npx next build` then `git add -A && git commit -m "msg" && git push`
5. **Supabase:** use `.range()` not `.limit()` for pagination
6. **Read files before editing** — use exact text matching
7. **Explain plan → wait for OK** before executing
8. **Roadmap changes → also update `lib/roadmap.ts`**
9. **Version bumps:** changelog.ts + both package.json + git tag (Rule 9 in project.md)
10. **Tier system:** `getEffectiveTier()` — collector < collector_pro < dealer. Feature flags in DB, not hardcoded.
11. **DB migrations are additive:** ADD COLUMN only. DROP/RENAME = two releases.

---

## WHAT'S NEXT

See `docs/project.md` sections:
- **Pre-Release Polish** (P4–P25): OpenGraph, error pages, toasts, keyboard shortcuts, etc.
- **Todo — Core Product**: Bulk Image Import (6b), Mollie integration (14.7)
- **Post-Launch**: WooCommerce, Catawiki, AbeBooks, Catalog Generator, Sharing
