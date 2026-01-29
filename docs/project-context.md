# Shelvd — Book Collection Management App

**Website:** [shelvd.org](https://shelvd.org)

> **Project Start:** 28 January 2026  
> **Purpose:** Professional book collection management for serious collectors  
> **Design Philosophy:** Swiss Design (International Typographic Style)  
> **Target Scale:** Thousands of users, each with 1000+ books

---

## 1. Project Overview

### What is Shelvd?
**Shelvd** is a professional book collection management SaaS designed for serious book collectors, antiquarians, and bibliophiles. The platform supports comprehensive cataloging with detailed bibliographic metadata, physical descriptions, provenance tracking, and valuation.

### Target Audience
- Private book collectors with large collections (1000+ books)
- Antiquarian book dealers
- Small libraries and institutions
- Estate managers handling book collections

### Key Differentiators
- **Professional-grade metadata** (DDC, LCC, BISAC, LCCN, OCN support)
- **Antiquarian-focused** fields (edition, impression, issue state, provenance)
- **Physical description** (binding types, book formats, condition grading)
- **Multi-contributor support** with authority records (VIAF, Wikidata)
- **Export integrations** (future: WooCommerce, marketplaces)

### NOT Building
- We are NOT replicating the FileMaker UI
- We ARE building a modern, Swiss Design web app
- The FileMaker screenshots show DATA REQUIREMENTS, not UI design

---

## 2. Infrastructure Setup (COMPLETED)

### 2.1 Supabase Configuration

| Setting | Value |
|---------|-------|
| **Project URL** | `https://euieagntkbhzkyzvnllx.supabase.co` |
| **Database Password** | `LsY1yr4siVYlZhiN` |
| **Connection String** | `postgresql://postgres:LsY1yr4siVYlZhiN@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres` |
| **Anon Key** | `sb_publishable_IFS4iDwe1q6DUoQk9asdgA_QP1GTzsX` |
| **Region** | EU (Frankfurt) |

### 2.2 Local Development Setup

```bash
# Project location
cd /Users/bruno/Documents/GitHub/shelvd

# Run development server (port 3001, ReVend uses 3000)
npm run dev

# Supabase CLI is installed and linked
supabase login
supabase link --project-ref euieagntkbhzkyzvnllx

# PostgreSQL client installed for direct SQL execution
brew install libpq
echo 'export PATH="/opt/homebrew/opt/libpq/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Execute SQL files directly
psql "postgresql://postgres:LsY1yr4siVYlZhiN@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres" -f supabase/seed/filename.sql
```

### 2.3 GitHub Repository
- Repository: `shelvd` on Bruno's GitHub account
- Created via GitHub Desktop
- Linked to Supabase for migrations

---

## 3. Database Status

### 3.1 Tables Created (16 total)

All tables exist in Supabase:

| Table | Status | RLS |
|-------|--------|-----|
| `bindings` | ✅ Created | Public read |
| `bisac_codes` | ✅ Created | Public read |
| `book_contributors` | ✅ Created | Needs RLS |
| `book_formats` | ✅ Created | Public read |
| `book_images` | ✅ Created | Needs RLS |
| `book_parts` | ✅ Created | Public read |
| `books` | ✅ Created | Needs RLS |
| `conditions` | ✅ Created | Public read |
| `contributor_aliases` | ✅ Created | Needs RLS |
| `contributor_roles` | ✅ Created | Public read |
| `contributors` | ✅ Created | Needs RLS |
| `dewey_classifications` | ✅ Created | Public read |
| `languages` | ✅ Created | Needs RLS |
| `publishers` | ✅ Created | Needs RLS |
| `user_locations` | ✅ Created | Needs RLS |
| `user_profiles` | ✅ Created | Needs RLS |

### 3.2 Seed Data Status

| Table | Records | Status | Notes |
|-------|---------|--------|-------|
| `conditions` | 9 | ✅ Imported | M, F+, F, VG+, VG, G+, G, G-, P |
| `bindings` | 21 | ✅ Imported | With descriptions and groups |
| `book_parts` | 46 | ✅ Imported | Categorized by matter type |
| `bisac_codes` | 0 | ❌ **TODO** | Session crashed during scrape |
| `book_formats` | 0 | ❌ **TODO** | 84 records from FileMaker |
| `dewey_classifications` | 0 | ❌ **TODO** | 915 records from FileMaker |
| `languages` | 0 | ❌ **TODO** | ISO 639 codes |
| `contributor_roles` | 0 | ❌ **TODO** | MARC relator codes |

### 3.3 BISAC Codes - Special Note

**Problem:** The original FileMaker export has 3,887 codes, but BISG 2025 has significantly more (~5,000+). For example, Fiction alone went from 116 to 414 codes.

**Options:**
1. Import FileMaker Excel as-is (3,887 codes) - quick but outdated
2. Scrape BISG 2025 website (~45-60 min) - complete but time-consuming
3. Purchase BISG license ($590) - official 2025 data

**Source files:**
- FileMaker export: `/Users/bruno/Desktop/Bisac codes.xlsx`
- BISG website: https://www.bisg.org/complete-bisac-subject-headings-list

---

## 4. Documentation Created

| File | Content |
|------|---------|
| `docs/project-context.md` | This file - complete project overview |
| `docs/conditions.md` | 9 condition grades with descriptions |
| `docs/bindings.md` | 21 binding types with descriptions and groups |
| `docs/book-parts.md` | 46 book parts categorized by matter type |

---

## 5. Design System: Swiss Design

### Core Principles
| Principle | Implementation |
|-----------|----------------|
| **Bold Typography** | Large headers (48-72px), strong hierarchy |
| **Grid System** | Strict 8px/12-column grid |
| **Minimal Color** | Black, white, one accent (Swiss Red #D52B1E) |
| **Sans-serif** | Inter or Helvetica Neue |
| **Whitespace** | Generous padding, breathing room |
| **No Decoration** | Pure function, no gradients/shadows |

### Color Palette
```css
:root {
  --swiss-red: #D52B1E;
  --swiss-red-dark: #B91C1C;
  --black: #0A0A0A;
  --gray-900: #171717;
  --gray-600: #525252;
  --gray-400: #A3A3A3;
  --gray-200: #E5E5E5;
  --gray-100: #F5F5F5;
  --white: #FAFAFA;
}
```

---

## 6. Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15+ | React framework with App Router |
| **React** | 19+ | UI library |
| **TypeScript** | ^5 | Type safety |
| **Tailwind CSS** | ^4 | Utility-first styling |
| **Supabase** | - | PostgreSQL database, Auth, Storage |

---

## 7. Contributors - Authority Records

### Design Decision
Contributors are **globally shared** across all users. One "Stephen King" entry exists, and all users link to it.

### Name Variants Problem
Old books have names written many ways:
- "Johann Wolfgang von Goethe"
- "Goethe, J.W. von"
- "J.W. Goethe"

### Solution: Aliases Table
```
Contributors (canonical record)
├── canonical_name: "Goethe, Johann Wolfgang von"
├── viaf_id: "2466221"
├── wikidata_id: "Q5879"
└── aliases:
    ├── "J.W. Goethe" (abbreviation)
    ├── "Jean Wolfgang de Goethe" (translation, French)
    └── etc.
```

---

## 8. File Locations

### Project Files
```
/Users/bruno/Documents/GitHub/shelvd/
├── apps/www/                 # Next.js app
│   ├── app/
│   │   ├── globals.css       # Swiss Design CSS
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   ├── constants.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   └── package.json
├── docs/
│   ├── project-context.md    # This file
│   ├── conditions.md
│   ├── bindings.md
│   └── book-parts.md
├── supabase/
│   ├── migrations/
│   │   ├── 001_reference_tables.sql
│   │   ├── 002_contributors.sql
│   │   └── 003_user_data.sql
│   └── seed/
│       ├── bindings.sql      # ✅ Imported
│       ├── book_parts.sql    # ✅ Imported
│       └── bisac_codes.sql   # ❌ Empty, needs data
└── package.json
```

### FileMaker Exports (on Desktop)
```
/Users/bruno/Desktop/
├── Bisac codes.xlsx          # 3,887 BISAC codes
├── Libri_fmp12.xml           # FileMaker DDR export
├── Summary.xml               # FileMaker summary
└── Libri screenshots/        # 20 FileMaker screenshots
```

---

## 9. Next Steps (TODO)

### Immediate Priority
1. **BISAC codes** - Either import FileMaker Excel or scrape BISG 2025
2. **book_formats** - Export from FileMaker and import (84 records)
3. **dewey_classifications** - Export from FileMaker and import (915 records)
4. **languages** - Create from ISO 639 standard
5. **contributor_roles** - Create from MARC relator codes

### After Seed Data
6. Set up RLS policies for user isolation
7. Create Supabase client in Next.js
8. Build auth flow
9. Build book list page
10. Build book detail page with tabs

---

## 10. Commands Reference

```bash
# Start development
cd /Users/bruno/Documents/GitHub/shelvd
npm run dev

# Execute SQL on Supabase
psql "postgresql://postgres:LsY1yr4siVYlZhiN@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres" -f supabase/seed/filename.sql

# Check tables in Supabase
psql "postgresql://postgres:LsY1yr4siVYlZhiN@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres" -c "\dt"

# Supabase CLI
supabase login
supabase link --project-ref euieagntkbhzkyzvnllx
supabase db push
```

---

## 11. Session Recovery Notes

If a Claude session crashes:
1. This document contains all project context
2. Supabase credentials are in section 2.1
3. Current status of imports is in section 3.2
4. FileMaker exports are on Desktop (section 8)
5. Use the psql command to import SQL files directly

---

*Last updated: 29 January 2026, 01:45 CET*
