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
