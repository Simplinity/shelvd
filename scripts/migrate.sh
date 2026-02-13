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
