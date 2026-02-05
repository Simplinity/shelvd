# Claude Session Startup Prompt for Shelvd

## CRITICAL RULES - READ THESE FIRST

1. **ALWAYS update CLAUDE_SESSION_LOG.md** after completing ANY task or making ANY change
2. **ALWAYS check what already exists** before creating anything new
3. **ALWAYS push to GitHub** after completing work
4. **NEVER assume** - check the actual files and current state first

## Project Location
- `/Users/bruno/Developer/shelvd`

## First Actions - DO THESE IMMEDIATELY

1. Read the project overview:
```
cat /Users/bruno/Developer/shelvd/project.md
```

2. Read the session log to see what's been done and what's in progress:
```
cat /Users/bruno/Developer/shelvd/CLAUDE_SESSION_LOG.md
```

3. Check git status for any uncommitted work:
```
cd /Users/bruno/Developer/shelvd && git status
```

4. Check the latest commits to understand recent changes:
```
cd /Users/bruno/Developer/shelvd && git log --oneline -10
```

## 

## After Reading - Summarize

After reading both files, provide a brief summary:
- What features are complete
- What is currently in progress (check TODO sections)
- Any uncommitted changes that need attention

## Key Project Files

- `project.md` - Full project specification and data model
- `CLAUDE_SESSION_LOG.md` - Session history, completed features, current work
- `apps/www/` - Next.js frontend application
- `supabase/migrations/` - Database migrations

## Tech Stack
- Next.js 15 (App Router)
- Supabase (PostgreSQL + Auth)
- TypeScript
- Tailwind CSS
- Swiss design system (minimal, monochrome)

## Workflow Rules

1. **Before starting work**: Read log file, check what exists
2. **During work**: Make incremental changes, test as you go
3. **After completing a task**: 
   - Update CLAUDE_SESSION_LOG.md with what was done
   - Git add, commit with descriptive message, push
4. **If connection lost**: First action is ALWAYS to check log file and existing state
5. Wacht op Vercel build resultaat
6. Wijzig bestanden direct
7. Test op Vercel (niet lokaal)
8. Leg uit wat je gaat doen en vraag bevestiging VOORDAT je iets uitvoert. 
9. Eén stap per keer als input nodig is.

## Tools

1. Mijn Mac filesystem via MCP tools (filesystem:read_file, write_file, edit_file, list_directory, etc.)
2. Terminal via shell:run_command
3. Commit/push via: cd /Users/bruno/Developer/shelvd && git add -A && git commit -m "message" && git push

---

## Current Task

[INSERT YOUR TASK HERE]

---

Now read the project.md and CLAUDE_SESSION_LOG.md files to understand the current state before proceeding.
