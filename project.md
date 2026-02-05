# Shelvd

> **Last updated:** 2026-02-05  
> **Author:** Bruno (owner) + Claude (AI assistant)

---

## 🚨 Claude Instructions

**READ THIS FIRST EVERY SESSION**

### Rule 1: Check database schema first
BEFORE writing any query, ALWAYS check schema:
```bash
/opt/homebrew/opt/libpq/bin/psql "postgresql://postgres:LsY1yr4siVYlZhiN@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres" -c "\d tablename"
```
NEVER guess column names. ALWAYS verify.

### Rule 2: Known column pitfalls
- `sales_price` (NOT sold_price)
- `isbn_13` / `isbn_10` (NOT isbn)
- `sold_date` DOES NOT EXIST
- `internal_notes` (NOT notes)
- `languages.name_en` (NOT name)
- `book_contributors.role_id` (NOT role)

### Rule 3: Supabase limits
- `.limit()` is UNRELIABLE - ALWAYS use `.range()` with pagination
- FK joins can fail silently - use separate queries + lookup Maps
- `.in()` has limits - batch in groups of 500 IDs

### Rule 4: Code changes
1. READ the file first
2. Use `str_replace` with EXACT old text
3. NEVER overwrite entire files
4. When in doubt: ASK

### Rule 5: Shell & Filesystem
- `rm` command WORKS - use `cd /path && rm file`
- Use `filesystem:` (lowercase)

### Rule 6: Session log
For every task: write progress to `CLAUDE_SESSION_LOG.md`.

---

## Project Overview

Shelvd is a SaaS webapp for serious book collectors.

### Vision
> Shelvd is the first modern webapp for serious book collectors - people who see their books as valuable objects, not just text. With bibliographic depth, professional cataloging, and the knowledge to do it right.

### Target Audience
- First edition collectors
- Signed copies
- Private press editions
- Fine bindings
- Antiquarian books

**Not:** casual readers, libraries, booksellers

### Competitive Position

| Platform | Weakness | Shelvd's advantage |
|----------|----------|-------------------|
| CLZ Books | Outdated UX, ISBN-centric | Modern web-app, bibliographic depth |
| LibraryThing | Reader-focused | Focus on physical copy |
| Libib | Too basic | Professional cataloging |

**Unique features:** ISBD-compliant entries (4 languages), 69 MARC roles, historical formats, 45+ cover types, bibliographic pagination.

---

## Tech Stack & Configuration

### Stack
- **Frontend:** Next.js 15 (App Router) + Tailwind CSS 4 + shadcn/ui
- **Database:** Supabase (PostgreSQL) - EU Frankfurt
- **Hosting:** Vercel
- **Design:** Swiss Design theme

### URLs
| Service | URL |
|---------|-----|
| Live site | https://shelvd.org |
| Live site (www) | https://www.shelvd.org |
| Vercel preview | https://shelvd-www.vercel.app |
| GitHub | https://github.com/Simplinity/shelvd |
| Supabase | https://supabase.com/dashboard/project/euieagntkbhzkyzvnllx |

### Supabase
- **Project ID:** euieagntkbhzkyzvnllx
- **Password:** LsY1yr4siVYlZhiN

```bash
# Database connection
/opt/homebrew/opt/libpq/bin/psql "postgresql://postgres:LsY1yr4siVYlZhiN@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres"
```

### Supabase Pagination Pattern
```typescript
// .limit() DOES NOT WORK - use this:
let allData: any[] = []
let offset = 0
while (true) {
  const { data: page } = await supabase
    .from('table')
    .select('*')
    .range(offset, offset + 999)
  
  if (!page || page.length === 0) break
  allData = [...allData, ...page]
  if (page.length < 1000) break
  offset += 1000
}
```

### Local Development
```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Test build
git push         # Auto-deploy via Vercel
```

---

## Database Schema

### Reference Tables (shared, read-only)
| Table | Records | Description |
|-------|---------|-------------|
| conditions | 9 | Fine, VG, Good, etc. |
| bindings | 65 | Binding types |
| book_formats | 76 | Folio, Quarto, Octavo, etc. |
| languages | 85 | ISO 639 language codes |
| contributor_roles | 69 | MARC relator codes |
| bisac_codes | 3,887 | Categories |

### User Data Tables (RLS per user)
| Table | Records | Description |
|-------|---------|-------------|
| books | 5,054 | Book collection |
| book_contributors | 5,152 | M:N relation books ↔ contributors |
| contributors | 4,097 | Shared between users |
| user_stats | 1 | Cached statistics |
| external_link_types | 55+ | System defaults + user custom link types |
| user_active_link_types | — | Which link types each user has activated |
| book_external_links | — | External links per book |

### Books - Key Fields
```
title, subtitle, original_title, series
publisher_name, publication_place, publication_year
edition, impression, issue_state
cover_type, binding_id, format_id, has_dust_jacket, is_signed
condition_id, condition_notes
paper_type, edge_treatment, endpapers_type, text_block_condition
isbn_13, oclc_number, lccn, bisac_code
storage_location, shelf
acquired_from, acquired_date, acquired_price
estimated_value, sales_price
status, action_needed
```

---

## Current Features

### ✅ Fully Working

**Collection Management**
- Books list (list/grid views)
- Add/Edit/Delete book
- Bulk delete with selection
- Contributors management

**Search**
- Global search (5000+ books, client-side)
- Advanced search (14 fields, AND/OR)
- Recent searches (localStorage)
- Sortable columns

**Import/Export**
- Excel import with template
- Excel/CSV/JSON export
- Selective export

**Statistics Dashboard**
- Key metrics (total, value, profit/loss)
- Status & condition distribution
- Top 10 lists (authors, publishers, etc.)
- Acquisitions by year

**Cataloging**
- ISBD Catalog Entry Generator (4 languages)
- 45+ cover types
- 76 book formats
- 69 contributor roles
- BISAC codes (3,887)

**Admin Dashboard**
- Stats bar (users, books, signups)
- User management (search, filter, suspend/ban/delete)
- Admin nav link (red Shield, admin-only)

**User Settings**
- Account tab: Profile, Security, Address, Subscription, Danger Zone
- Configuration tab: Currency, Date Format, Items Per Page (list/grid)
- External Links tab: Activate/deactivate link types, add custom types

**External Links**
- 55 built-in link types across 8 categories (bibliographic, catalogs, digital libraries, etc.)
- Per-user activation (all active by default for new users)
- Add/edit/delete links on book add/edit pages
- Auto-fill URL with `https://{domain}/` when selecting type
- Open-in-new-tab button to search on external site
- Display on book detail page with favicons

**Duplicate Detection**
- Server-side SQL detection (instant scan of 5000+ books)
- ISBN-13, ISBN-10, and exact title matching
- Grouped results with collapse/expand
- Select all/deselect all per group
- Bulk delete selected duplicates
- View book in new tab

---

## Roadmap

### Active Priorities

| Prio | Feature | Status |
|------|---------|--------|
| 4 | Duplicate Detection | 🟢 Done |
| 5 | External Links | 🟢 Done |
| 6 | User Settings | 🟢 Done |
| 7 | Sharing & Public Catalog | 🔴 Todo |
| 8 | Currency & Valuation | 🔴 Todo |

### Parallel Track
- Custom Tags
- Landing page + Knowledge base
- Templates system
- PDF catalog export
- Image upload

---

## Features Under Consideration

> Identified 2025-02-02. Not yet prioritized.

### 🔴 Possibly Essential

**1. Images**
- Cover, spine, title page, signatures, damage
- *Impact:* No insurance/sales documentation without photos

**2. Wishlist / Desiderata**
- Want list with max price, priority
- Printable for fairs
- *Impact:* Every collector needs a want list

**3. Custom Collections / Tags**
- Group books by custom criteria
- *Impact:* Collectors think in collections

### 🟠 Possibly Important

**4. Insurance & Valuation Reports**
- PDF for insurer with photos + value

**5. Provenance (extended)**
- Previous owners, auction history, certificates

**6. Condition History**
- Document restorations, condition reports

### 🟢 Possibly Advanced

**7. Dealer & Contact Management**
**8. Market Prices & Comparison**
**9. Collation & Bibliographic Tools**
**10. Reference Library**
**11. Sales Platform Integration**
- Export to WooCommerce, Catawiki, AbeBooks, etc.
- Sync inventory with external shops

---

## Development Guidelines

### Protected Features - DO NOT TOUCH
These features work and must not break:
- Global Search (batch fetching)
- Advanced Search (14 fields)
- Excel Import/Export
- BISAC Combobox
- Contributors editing
- Catalog Entry Generator

### Design Decisions

**Status colors (Swiss Design)**
- `on_sale`: red solid
- `to_sell`: red light
- `reserved`: red outline
- `lost/destroyed`: black solid
- `in_collection`: gray

**Publication Year:** VARCHAR(100) for "MCMLXXIX [1979]", "(circa 1960)"

**Contributors:** Shared table, privacy via RLS

**Form elements:** All inputs, selects/dropdowns, and textareas must have the same height. Use consistent padding (`px-3 py-2 text-sm`) across all form elements.

---

## Marketing

### Website Strategy: Knowledge Platform
Marketing site focuses on collector knowledge:
- /knowledge/glossary
- /knowledge/guides (condition-grading, book-formats, etc.)
- /knowledge/reference

**Why:** SEO + authority + onboarding

### Pricing Model (proposal)

| Tier | Price | Books | Features |
|------|-------|-------|----------|
| Free | €0 | 100 | Basic |
| Collector | €7/month | 5,000 | + Templates, Export |
| Scholar | €15/month | Unlimited | + ISBD, API |
| Dealer | €29/month | Unlimited | + Multi-user |

---

## File Structure

```
shelvd/
├── apps/www/
│   ├── app/
│   │   ├── (app)/books/          # Collection pages
│   │   ├── (app)/stats/          # Statistics
│   │   ├── (auth)/               # Login/register
│   │   └── api/                  # API routes
│   ├── components/
│   └── lib/
│       ├── supabase/             # DB client + types
│       └── actions/              # Server actions (settings, external-links)
├── supabase/migrations/          # 006-009 external links, triggers, duplicate detection
└── project.md                    # This file
```

---

## Useful Commands

```bash
# Database status
/opt/homebrew/opt/libpq/bin/psql "postgresql://postgres:LsY1yr4siVYlZhiN@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres" -c "
SELECT 'books', count(*) from books
UNION ALL SELECT 'contributors', count(*) from contributors;"

# View table schema
/opt/homebrew/opt/libpq/bin/psql "..." -c "\d books"
```
