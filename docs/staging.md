# Staging & Production Safety Guide

> **Created:** 2026-02-13
> **Status:** Phase 1 (pre-launch, working directly on `main`)

---

## Table of Contents

1. [Overview](#overview)
2. [Phase 1: Pre-Launch (Now)](#phase-1-pre-launch-now)
3. [Phase 2: Launch Day](#phase-2-launch-day)
4. [Phase 3: Post-Launch Setup](#phase-3-post-launch-setup)
5. [Daily Workflow After Staging](#daily-workflow-after-staging)
6. [Database Migration Rules](#database-migration-rules)
7. [Emergency Procedures](#emergency-procedures)
8. [Reference](#reference)

---

## Overview

While we are the only user, `main` is effectively our staging environment. Once real users arrive, we need proper separation between development and production. This document covers everything needed to make that transition safely.

**Architecture after launch:**

```
Feature branch (development)
  ↓ push
Preview deployment (Vercel auto-creates per branch)
  ↓ test on staging.shelvd.org with staging Supabase
Merge PR to main
  ↓ auto-deploy
Production (shelvd.org) with production Supabase
```

---

## Phase 1: Pre-Launch (Now)

### What stays the same
- Push directly to `main`
- Auto-deploy to production on Vercel
- Test everything yourself on shelvd.org

### What changes immediately

#### 1.1 Pre-migration backup script

**Create the script:**

File: `scripts/pre-migration-backup.sh`
```bash
#!/bin/bash
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
FILENAME="${BACKUP_DIR}/pre_migration_${TIMESTAMP}.sql"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo "Creating pre-migration backup..."
/opt/homebrew/opt/libpq/bin/pg_dump \
  "postgresql://postgres:LsY1yr4siVYlZhiN@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  > "$FILENAME"

SIZE=$(du -h "$FILENAME" | cut -f1)
echo "✅ Backup saved: $FILENAME ($SIZE)"
```

Make executable: `chmod +x scripts/pre-migration-backup.sh`

**Create the migration wrapper:**

File: `scripts/migrate.sh`
```bash
#!/bin/bash
set -euo pipefail

echo "═══════════════════════════════════════"
echo "  Shelvd Migration (with backup)"
echo "═══════════════════════════════════════"
echo ""

# Step 1: Backup
./scripts/pre-migration-backup.sh
echo ""

# Step 2: Migrate
echo "Applying migrations..."
npx supabase migration up --linked
echo ""

# Step 3: Regenerate types
echo "Regenerating TypeScript types..."
npx supabase gen types typescript --linked 2>/dev/null > apps/www/lib/supabase/database.types.ts
echo "✅ Types regenerated"
echo ""

echo "═══════════════════════════════════════"
echo "  Done. Don't forget to:"
echo "  1. Check the generated types file"
echo "  2. Build locally: cd apps/www && npx next build"
echo "  3. Commit and push"
echo "═══════════════════════════════════════"
```

Make executable: `chmod +x scripts/migrate.sh`

**Add to .gitignore:**
```
backups/
```

**Usage from now on:**
```bash
# Instead of: npx supabase migration up --linked
# Use:
./scripts/migrate.sh
```

This script does three things in order:
1. Creates a timestamped backup of the entire database
2. Runs all pending migrations
3. Regenerates TypeScript types (with stderr redirected)

If the migration fails, the backup is already saved and can be restored.

#### 1.2 Restoring from a backup

If a migration goes wrong:

```bash
# Find the most recent backup
ls -la backups/

# Restore it (this REPLACES the entire database)
/opt/homebrew/opt/libpq/bin/psql \
  "postgresql://postgres:LsY1yr4siVYlZhiN@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres" \
  < backups/pre_migration_YYYYMMDD_HHMMSS.sql
```

**⚠️ Warning:** This replaces ALL data in the database. Any data created between the backup and the restore will be lost. This is acceptable pre-launch (you're the only user) but dangerous post-launch (see Emergency Procedures below).

#### 1.3 Backward-compatible migrations (effective immediately)

Even before staging exists, start following this rule. It builds the habit.

**Safe operations (single release):**
- `ADD COLUMN` (with or without default)
- `CREATE TABLE`
- `CREATE INDEX`
- `CREATE FUNCTION` / `CREATE OR REPLACE FUNCTION`
- `INSERT` seed data

**Dangerous operations (require two releases):**
- `DROP COLUMN` → Release 1: stop reading the column in code. Release 2: drop it.
- `RENAME COLUMN` → Release 1: add new column, copy data, code reads new. Release 2: drop old column.
- `ALTER COLUMN TYPE` → Release 1: add new column with new type, code reads new. Release 2: drop old.
- `DROP TABLE` → Release 1: remove all code references. Release 2: drop table.

---

## Phase 2: Launch Day

### Checklist before going live

- [ ] All 4 pre-launch features complete (Image Upload 2+3, Mobile, Stripe)
- [ ] Full manual test of critical flows:
  - [ ] Signup (new user, with and without invite code)
  - [ ] Add book (manual, via lookup, via import)
  - [ ] Edit book (all sections, enrichment)
  - [ ] Collections (create, add books, switch, delete)
  - [ ] Tags (create, assign, filter)
  - [ ] Search (global, advanced)
  - [ ] Stripe checkout → tier upgrade → feature unlocked
  - [ ] Settings (profile, currency, providers)
  - [ ] Admin panel (users, activity, support, tiers)
  - [ ] Onboarding flow (wizard, checklist, empty states)
  - [ ] Password reset flow
- [ ] Performance check: pages load in < 2 seconds
- [ ] Error monitoring: check Vercel logs for any recurring errors
- [ ] DNS and SSL working on shelvd.org and www.shelvd.org
- [ ] Stripe webhooks configured for production
- [ ] Resend email configured for production (password reset, admin notifications)
- [ ] Legal pages accessible (privacy, terms)
- [ ] Social sharing metadata (OG images, descriptions)
- [ ] Create a full backup: `./scripts/pre-migration-backup.sh`

### Launch

1. Announce (socials, blog post, whatever you planned)
2. Monitor Vercel logs and Supabase dashboard for the first 24 hours
3. Keep an eye on error rates, slow queries, auth issues

---

## Phase 3: Post-Launch Setup

**Timeline:** Do this within 24-48 hours after launch, before you start building new features.

### 3.1 Create Staging Supabase Project

**Step 1: Create the project**
- Go to https://supabase.com/dashboard
- Click "New Project"
- Name: `shelvd-staging`
- Region: EU Frankfurt (same as production)
- Plan: Free tier (sufficient for staging)
- Generate and save the database password

**Step 2: Note the credentials**
Save these somewhere safe (not in git):
```
STAGING_SUPABASE_URL=https://XXXXXXXX.supabase.co
STAGING_SUPABASE_ANON_KEY=eyJ...
STAGING_SUPABASE_DB_PASSWORD=...
STAGING_DB_CONNECTION=postgresql://postgres:PASSWORD@db.XXXXXXXX.supabase.co:5432/postgres
```

**Step 3: Copy production schema to staging**

Option A — Apply all migrations:
```bash
# Link to staging project temporarily
npx supabase link --project-ref STAGING_PROJECT_REF

# Push all migrations
npx supabase db push

# Re-link back to production
npx supabase link --project-ref euieagntkbhzkyzvnllx
```

Option B — Full dump and restore (includes data):
```bash
# Dump production (schema + data)
/opt/homebrew/opt/libpq/bin/pg_dump \
  "postgresql://postgres:LsY1yr4siVYlZhiN@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres" \
  --no-owner --no-acl --clean --if-exists \
  > backups/production_full_$(date +%Y%m%d).sql

# Restore to staging
/opt/homebrew/opt/libpq/bin/psql \
  "STAGING_DB_CONNECTION" \
  < backups/production_full_YYYYMMDD.sql
```

**Option B is recommended** — you get your 5000+ books, real edge cases, and both user accounts. Since you own all the data, there are no privacy concerns.

**Step 4: Create test accounts on staging**

The `auth.users` table doesn't copy cleanly between Supabase projects. After restoring the schema and data:

1. Sign up manually on the staging app with a test email (e.g., `bruno+staging@yourdomain.com`)
2. In the staging Supabase dashboard, find the new user's UUID
3. Update the restored `user_profiles`, `books`, etc. to point to the new UUID:

```sql
-- Replace OLD_USER_ID with the production user UUID
-- Replace NEW_USER_ID with the staging test account UUID
UPDATE user_profiles SET id = 'NEW_USER_ID' WHERE id = 'OLD_USER_ID';
UPDATE books SET user_id = 'NEW_USER_ID' WHERE user_id = 'OLD_USER_ID';
UPDATE collections SET user_id = 'NEW_USER_ID' WHERE user_id = 'OLD_USER_ID';
UPDATE tags SET user_id = 'NEW_USER_ID' WHERE user_id = 'OLD_USER_ID';
UPDATE activity_log SET user_id = 'NEW_USER_ID' WHERE user_id = 'OLD_USER_ID';
-- ... repeat for all user-scoped tables
```

**Step 5: Verify staging works**

- Log into the staging app with your test account
- Verify books, collections, tags, provenance are all there
- Test add/edit/delete operations
- Run a test migration to confirm the pipeline works

### 3.2 Create Staging Vercel Project

**Step 1: Add staging branch in git**
```bash
git checkout main
git checkout -b staging
git push -u origin staging
```

**Step 2: Create Vercel project for staging**

Option A — Same Vercel project, branch deployment:
- In Vercel → shelvd-www → Settings → Domains
- Add `staging.shelvd.org` → assign to `staging` branch

Option B — Separate Vercel project (recommended for cleaner separation):
- In Vercel → "Add New Project" → same GitHub repo
- Project name: `shelvd-staging`
- Root directory: `apps/www`
- Framework: Next.js
- Domain: `staging.shelvd.org`
- Branch: `staging` (or just use preview deployments on PRs)

**Step 3: Set staging environment variables**

In the staging Vercel project, set:
```
NEXT_PUBLIC_SUPABASE_URL=https://STAGING_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...staging...
RESEND_API_KEY=... (same or separate)
STRIPE_SECRET_KEY=sk_test_... (Stripe TEST key, not production!)
STRIPE_WEBHOOK_SECRET=whsec_... (staging webhook)
GOOGLE_BOOKS_API_KEY=... (same)
```

**Important:** Stripe has separate test and live API keys. Staging MUST use test keys. This lets you test payments with Stripe's test card numbers without real charges.

### 3.3 Enable Branch Protection on GitHub

**Step 1:** Go to GitHub → Simplinity/shelvd → Settings → Branches

**Step 2:** Add branch protection rule:
- Branch name pattern: `main`
- Check: ✅ "Require a pull request before merging"
- Check: ✅ "Require approvals" → set to 0 (you're solo, but it forces the PR workflow)
- Optional: ✅ "Require status checks to pass" (if you add CI later)
- Check: ✅ "Do not allow bypassing the above settings"

**Step 3:** Click "Create"

After this, pushing directly to `main` is blocked. All changes must go through a PR.

### 3.4 Create `.env.staging` Template

File: `apps/www/.env.staging.example`
```bash
# Staging environment — DO NOT use production values
NEXT_PUBLIC_SUPABASE_URL=https://STAGING_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_staging_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_staging_service_role_key
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_staging_webhook
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_test_key
RESEND_API_KEY=your_resend_key
GOOGLE_BOOKS_API_KEY=your_google_key
NEXT_PUBLIC_APP_URL=https://staging.shelvd.org
```

---

## Daily Workflow After Staging

### Starting a new feature

```bash
# Always start from up-to-date main
git checkout main
git pull

# Create feature branch
git checkout -b feat/my-feature

# Work, commit, push
git add .
git commit -m "feat: description"
git push -u origin feat/my-feature
```

### Testing on staging

Vercel auto-creates a preview deployment for every branch push. The URL appears in the GitHub PR and in Vercel dashboard.

To test against the staging database, the preview deployment must use staging env vars. This happens automatically if you set them in Vercel for "Preview" environment.

### Database migrations on staging

```bash
# 1. Write your migration in supabase/migrations/
# 2. Apply to staging first:
npx supabase link --project-ref STAGING_PROJECT_REF
npx supabase migration up --linked

# 3. Test on staging app — everything works?

# 4. Apply to production:
npx supabase link --project-ref euieagntkbhzkyzvnllx
./scripts/migrate.sh    # backup + migrate + regen types

# 5. Re-link to staging for daily work:
npx supabase link --project-ref STAGING_PROJECT_REF
```

**Alternative:** Create a script that manages which project is linked:
```bash
# scripts/use-staging.sh
npx supabase link --project-ref STAGING_PROJECT_REF
echo "✅ Now linked to STAGING"

# scripts/use-production.sh
npx supabase link --project-ref euieagntkbhzkyzvnllx
echo "✅ Now linked to PRODUCTION"
```

### Merging to production

```bash
# On GitHub: Create Pull Request from feat/my-feature → main
# Review the changes (even if you're the only reviewer)
# Check the preview deployment works

# Merge the PR (via GitHub UI — squash merge recommended)

# Vercel auto-deploys to production

# Monitor Vercel logs for 5 minutes
```

### Keeping staging in sync

After merging to main, staging data may diverge. Periodically refresh:

```bash
# Dump production
/opt/homebrew/opt/libpq/bin/pg_dump \
  "PRODUCTION_DB_CONNECTION" \
  --no-owner --no-acl --clean --if-exists \
  > backups/production_sync_$(date +%Y%m%d).sql

# Restore to staging
/opt/homebrew/opt/libpq/bin/psql \
  "STAGING_DB_CONNECTION" \
  < backups/production_sync_YYYYMMDD.sql

# Re-create staging test accounts (auth.users won't transfer)
```

How often: monthly, or before a major feature that touches a lot of tables.

---

## Database Migration Rules

### The Golden Rule

**Every migration must work with both the old and new code simultaneously.**

### Safe Operations (single release)

| Operation | Example | Why safe |
|-----------|---------|----------|
| Add column | `ALTER TABLE books ADD COLUMN foo TEXT` | Old code ignores it |
| Add column with default | `ALTER TABLE books ADD COLUMN foo TEXT DEFAULT 'bar'` | Old code ignores it |
| Create table | `CREATE TABLE new_things (...)` | Old code doesn't reference it |
| Create index | `CREATE INDEX idx_foo ON books(foo)` | Transparent to application |
| Create/replace function | `CREATE OR REPLACE FUNCTION ...` | Only called by new code |
| Add enum value | `ALTER TYPE my_enum ADD VALUE 'new_val'` | Old code doesn't use it |
| Insert seed data | `INSERT INTO reference_table ...` | Old code doesn't read new rows |
| Add RLS policy | `CREATE POLICY ...` | Makes access more specific |

### Dangerous Operations (two releases)

| Operation | Release 1 | Release 2 |
|-----------|-----------|-----------|
| Drop column | Deploy code that stops reading/writing the column | `ALTER TABLE DROP COLUMN` |
| Rename column | Add new column, copy data, deploy code using new column | Drop old column |
| Change column type | Add new column with new type, copy/convert data, deploy code | Drop old column |
| Drop table | Remove all code references | `DROP TABLE` |
| Rename table | Create new table, copy data, deploy code using new table | Drop old table |
| Remove enum value | Deploy code that stops using the value, migrate existing rows | Not possible in PostgreSQL — create new enum type |

### Migration Checklist

Before every migration:

- [ ] Is it additive only? If not, is this release 1 or release 2 of a two-step change?
- [ ] Run `./scripts/migrate.sh` (includes backup)
- [ ] Regenerate types (included in migrate.sh)
- [ ] Build locally: `cd apps/www && npx next build`
- [ ] Test the affected feature
- [ ] Commit migration + types + code changes together

---

## Emergency Procedures

### Scenario 1: Bad code deploy (database is fine)

**Symptoms:** App crashes, pages don't load, JavaScript errors.
**Impact:** Users see errors but data is safe.

**Fix:**
1. Go to Vercel dashboard → Deployments
2. Find the last green deployment (before the broken one)
3. Click "..." → "Promote to Production"
4. App is restored in ~5 seconds
5. Debug on a feature branch, fix, deploy properly

### Scenario 2: Bad migration (data corrupted or wrong schema)

**Symptoms:** App errors related to missing/wrong columns, data inconsistencies.
**Impact:** Potentially serious — data may be wrong.

**Fix:**
1. Immediately rollback code on Vercel (Scenario 1 steps)
2. Assess the damage:
   - Was it just a schema change? → Write a reverse migration
   - Was data modified/deleted? → Restore from backup
3. If restoring from backup:
```bash
# Find the pre-migration backup
ls -la backups/pre_migration_*

# Restore (⚠️ this replaces ALL data)
/opt/homebrew/opt/libpq/bin/psql \
  "PRODUCTION_DB_CONNECTION" \
  < backups/pre_migration_YYYYMMDD_HHMMSS.sql
```
4. **⚠️ Data loss window:** Any data created by users between the backup and the restore is lost. Communicate to affected users if necessary.

### Scenario 3: Supabase outage

**Symptoms:** All database operations fail. App shows loading spinners forever.
**Impact:** App is unusable but data is safe (Supabase handles this).

**Fix:**
1. Check https://status.supabase.com
2. Nothing to do — wait for Supabase to resolve
3. Consider adding a "maintenance mode" banner (via Vercel env var toggle) so users see a friendly message instead of errors

### Scenario 4: Vercel outage

**Symptoms:** Site doesn't load at all (DNS timeout or Vercel error page).
**Impact:** App is completely down but data is safe.

**Fix:**
1. Check https://vercel-status.com
2. Nothing to do — wait for Vercel to resolve
3. If prolonged: consider a static maintenance page on a different host (Cloudflare Pages, etc.)

### Scenario 5: Stripe webhook failure

**Symptoms:** Users pay but their tier doesn't upgrade. Or: cancellations don't downgrade.
**Impact:** Revenue/access mismatch.

**Fix:**
1. Check Stripe dashboard → Webhooks → Events
2. Find failed events, check error messages
3. Fix the webhook handler
4. Use Stripe's "Resend" button to replay failed events
5. Manually adjust affected users' tiers in admin panel if needed

---

## Reference

### Connection Strings

```
# Production Supabase
postgresql://postgres:LsY1yr4siVYlZhiN@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres

# Staging Supabase (fill in after Phase 3)
postgresql://postgres:PASSWORD@db.STAGING_REF.supabase.co:5432/postgres
```

### Supabase Project References

```
# Production
euieagntkbhzkyzvnllx

# Staging (fill in after Phase 3)
STAGING_PROJECT_REF
```

### Key Scripts

| Script | Purpose |
|--------|---------|
| `scripts/pre-migration-backup.sh` | Dump production database to `backups/` |
| `scripts/migrate.sh` | Backup + migrate + regenerate types |
| `scripts/use-staging.sh` | Link Supabase CLI to staging (after Phase 3) |
| `scripts/use-production.sh` | Link Supabase CLI to production (after Phase 3) |

### Key URLs

| Environment | URL | Supabase |
|-------------|-----|----------|
| Production | https://shelvd.org | euieagntkbhzkyzvnllx |
| Staging | https://staging.shelvd.org | TBD |
| Vercel Preview | auto-generated per PR | Uses staging env vars |
