# Shelvd - Project Context

## Project Overzicht
Shelvd is een SaaS applicatie voor boekenverzamelaars om hun collectie te beheren.

## Tech Stack
- **Frontend**: Next.js 15.5.11 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel (Frontend) + Supabase EU Frankfurt (Database)
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Design**: Swiss Design theme

## URLs
- **Live Site**: https://shelvd-www.vercel.app
- **GitHub**: https://github.com/Simplinity/shelvd
- **Supabase Dashboard**: https://supabase.com/dashboard/project/euieagntkbhzkyzvnllx

## Supabase Configuratie
- **Project ID**: euieagntkbhzkyzvnllx
- **Region**: EU Frankfurt
- **Database URL**: `postgresql://postgres:[PASSWORD]@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres`
- **Database Password**: LsY1yr4siVYlZhiN

## Database Schema

### Reference Tables (Gedeeld, alleen-lezen voor users)
| Tabel | Records | Beschrijving |
|-------|---------|--------------|
| conditions | 9 | Boek conditie graderingen (Fine, VG, Good, etc.) |
| bindings | 65 | Bindtypes (incl. Sewn softcover, Unbound) |
| book_parts | 138 | Boekonderdelen (Title page, Colophon, etc.) |
| book_formats | 152 (76 unique) | Formaten (Folio, Quarto, Octavo, etc.) |
| languages | 85 | ISO 639 taalcodes |
| contributor_roles | 138 (69 unique) | MARC relator codes (Author, Illustrator, etc.) |
| dewey_classifications | 1,177 | Dewey Decimal classificaties |
| bisac_codes | 3,887 | Book Industry Standards categorieën |

### User Data Tables
| Tabel | Records | Beschrijving |
|-------|---------|--------------|
| profiles | 1 | User profielen (gekoppeld aan Supabase Auth) |
| books | 5,054 | Boeken in collectie |
| contributors | 4,097 | Auteurs, illustratoren, etc. (unieke namen) |
| book_contributors | 5,152 | Many-to-many relatie boeken ↔ contributors |
| book_images | 0 | Afbeeldingen per boek (nog niet geïmplementeerd) |
| publishers | 0 | Publishers (publisher_name direct in books tabel) |
| user_locations | 0 | Locaties (storage_location direct in books tabel) |

### Books Table - Belangrijke Velden
```
id                  UUID (primary key, system)
user_id             UUID (foreign key naar auth.users)
filemaker_id        TEXT (originele FileMaker UUID)
user_catalog_id     TEXT (gebruiker's eigen catalogus nummer)

-- Main Information
title               TEXT (required)
subtitle            TEXT
original_title      TEXT
language_id         UUID → languages
original_language_id UUID → languages
series              TEXT
series_number       TEXT
status              TEXT (in_collection, for_sale, sold, lost, etc.)
action_needed       TEXT (none, repair, bind, replace)

-- Publication
publisher_name      TEXT (direct, geen FK)
publication_place   TEXT
publication_year    VARCHAR(100) (supports "MCMLXIX [1969]", "(circa 1960)")
printer             TEXT
printing_place      TEXT

-- Edition
edition             TEXT (e.g. "First Edition")
impression          TEXT
issue_state         TEXT
edition_notes       TEXT

-- Physical
page_count          INTEGER
pagination_description TEXT (e.g. "xvi, [4], 352, [8] p., 24 plates")
volumes             TEXT
height_mm           INTEGER
width_mm            INTEGER
depth_mm            INTEGER
weight_grams        INTEGER
cover_type          TEXT (45+ options: hardcover, softcover, full_leather, half_leather, etc.)
binding_id          UUID → bindings
format_id           UUID → book_formats (Folio, Quarto, Octavo, etc.)
has_dust_jacket     BOOLEAN
is_signed           BOOLEAN
protective_enclosure TEXT (none, slipcase_publisher, slipcase_custom, clamshell_box, chemise, solander_box)

-- Condition
condition_id        INTEGER → conditions
condition_notes     TEXT

-- Identifiers
isbn_13             VARCHAR(17)
isbn_10             VARCHAR(13)
oclc_number         TEXT
lccn                TEXT
ddc                 TEXT
lcc                 TEXT
udc                 TEXT
bisac_code          TEXT (primary BISAC)
bisac_code_2        TEXT (secondary BISAC)
bisac_code_3        TEXT (tertiary BISAC)
topic               TEXT

-- Storage
storage_location    TEXT
shelf               TEXT
shelf_section       TEXT

-- Acquisition
acquired_from       TEXT
acquired_date       DATE
acquired_price      DECIMAL(10,2)
acquired_currency   VARCHAR(3)
acquired_notes      TEXT

-- Valuation
lowest_price        DECIMAL(10,2)
highest_price       DECIMAL(10,2)
estimated_value     DECIMAL(10,2)
sales_price         DECIMAL(10,2)
price_currency      VARCHAR(3)

-- Notes & Description
illustrations_description TEXT
signatures_description    TEXT
provenance          TEXT
bibliography        TEXT
summary             TEXT
catalog_entry       TEXT
internal_notes      TEXT

-- Timestamps
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
```

### RLS (Row Level Security)
- Reference tables: Publiek leesbaar voor iedereen
- User data tables: Alleen eigen data (via `auth.uid()`)

## Bestandsstructuur

```
shelvd/
├── apps/
│   └── www/                            # Next.js frontend app
│       ├── app/
│       │   ├── (app)/                  # Authenticated routes
│       │   │   ├── books/
│       │   │   │   ├── page.tsx        # Books list (list/grid views)
│       │   │   │   └── [id]/
│       │   │   │       ├── page.tsx    # Book detail
│       │   │   │       ├── not-found.tsx
│       │   │   │       └── edit/
│       │   │   │           ├── page.tsx
│       │   │   │           └── book-edit-form.tsx
│       │   │   └── layout.tsx
│       │   ├── (auth)/                 # Auth routes (login, register)
│       │   └── page.tsx                # Homepage
│       ├── components/
│       │   ├── ui/                     # shadcn/ui components
│       │   ├── bisac-combobox.tsx      # BISAC code search/select
│       │   └── catalog-entry-generator.tsx # ISBD catalog entry generator
│       └── lib/
│           └── supabase/
│               ├── client.ts
│               ├── server.ts
│               └── middleware.ts
├── supabase/
│   ├── migrations/                     # Database migrations
│   └── seed/                           # Seed data SQL files
├── scripts/
│   ├── import_filemaker.py             # FileMaker Excel → Supabase
│   ├── fix_missing_fields.py           # Fix language imports
│   └── generate_bisac_sql.py           # BISAC codes generator
└── project-context.md                  # Dit bestand
```

## Pagina's & Features

### /books - Collection List
- **List View** (default): Tabel met Title, Author, Publisher, Place, Year, Status
  - Title beperkt tot 2 regels
  - Status badges met kleuren (In Col./For Sale/Sold/Lost)
  - 250 items per page, "Load more" knop
- **Grid View**: Cards met placeholder cover, Title, Author, Year
  - 2-5 kolommen responsive
- View toggle (list/grid icons)
- Totaal count weergave

### /books/[id] - Book Detail
- Toont alleen ingevulde velden (lege velden verborgen)
- Secties: Publication, Edition, Physical, Condition, Identifiers, Storage, Acquisition, Valuation, Notes, Catalog Entry
- Contributors gegroepeerd per rol
- Status badge
- Edit knop → /books/[id]/edit

### /books/[id]/edit - Book Edit
- ALLE velden zichtbaar (ook lege)
- **Dropdowns** voor:
  - Language, Original Language (85 languages)
  - Binding (65 types)
  - Book Format (76 formats: Folio, Quarto, Octavo, etc.)
  - Condition (9 grades)
  - Cover Type (45+ options)
  - Protective Enclosure (6 options)
  - Status (13 options)
  - Action Needed (4 options)
- **BISAC Combobox** (searchable, 3,887 codes, batch loading bypasses 1000-row limit)
- **Autocomplete dropdowns** voor: Series, Publisher, Acquired From, Storage Location, Shelf, Section, Publication Place, Printing Place
- **Auto-resizing textareas** voor alle notes/descriptions
- **Checkboxes** voor Dust Jacket, Signed
- **Number inputs** voor dimensions, prices
- **Catalog Entry Generator** button → generates ISBD-compliant entry
- Save/Cancel knoppen

### Catalog Entry Generator
- **ISBD-compliant** (International Standard Bibliographic Description)
- **4 talen**: English 🇬🇧, Français 🇫🇷, Deutsch 🇩🇪, Nederlands 🇳🇱
- **8 ISBD Areas**:
  1. Title & Statement of Responsibility (authors, translators, illustrators, etc.)
  2. Edition (edition, impression)
  3. Material-specific (not used for books)
  4. Publication (place, publisher, year, printer)
  5. Physical Description (pagination, dimensions, format, binding, cover)
  6. Series (series name, number)
  7. Notes (original title, bibliography, provenance, illustrations, signatures, condition)
  8. Identifiers (ISBN, OCLC, LCCN)
- **Standardized punctuation**: `. — ` between areas, ` : ` for subtitles, ` / ` for responsibility
- **69 contributor roles** supported (Author, Co-author, Editor, Translator, Illustrator, Artist, Photographer, Colorist, Engraver, Woodcutter, etc.)
- **45+ cover types** translated per language

## Import Status (FileMaker → Supabase)

| Veld | Excel | Database | Status |
|------|-------|----------|--------|
| Books | 5,054 | 5,054 | ✅ |
| Contributors | 8,194 | 4,097 unique | ✅ |
| Book-Contributor links | 5,152 | 5,152 | ✅ |
| Title | 5,054 | 5,054 | ✅ |
| Language | 5,038 | 5,035 | ✅ |
| Original Language | 3,526 | 3,514 | ✅ |
| Publisher | 3,872 | 3,872 | ✅ |
| Publication Year | 2,812 | 2,812 | ✅ (incl. Roman numerals) |
| Binding | 1,274 | 1,274 | ✅ |
| Condition | 1,330 | 1,330 | ✅ |
| All other fields | ✅ | ✅ | ✅ |

### Contributor Roles Distribution
| Role | Count |
|------|-------|
| Author | 4,511 |
| Translator | 386 |
| Illustrator | 122 |
| Editor | 96 |
| Photographer | 13 |
| Cover artist | 9 |
| Artist | 8 |
| Pseudonym | 5 |

## Handige Commands

### Database query
```bash
/opt/homebrew/opt/libpq/bin/psql "postgresql://postgres:LsY1yr4siVYlZhiN@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres" -c "SELECT count(*) FROM books;"
```

### Database status
```bash
/opt/homebrew/opt/libpq/bin/psql "postgresql://postgres:LsY1yr4siVYlZhiN@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres" -c "
SELECT 'books' as table_name, count(*) from books
UNION ALL SELECT 'contributors', count(*) from contributors
UNION ALL SELECT 'book_contributors', count(*) from book_contributors;"
```

### Re-import from FileMaker
```bash
cd ~/Documents/GitHub/shelvd
python3 scripts/import_filemaker.py
```

## Lokale Tools (Mac)

⚠️ **BELANGRIJK VOOR CLAUDE**: Onderstaande tools zijn geïnstalleerd. Gebruik deze exacte paden!

### PostgreSQL Client (psql)
```bash
/opt/homebrew/opt/libpq/bin/psql "postgresql://postgres:LsY1yr4siVYlZhiN@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres"
```

### Andere tools in PATH
- **Node/npm**: `node`, `npm`, `npx`
- **Python3**: `python3` (met pandas, psycopg2, openpyxl)
- **Git**: `git`

## Design Decisions

### ID Strategy
- **UUID (id)**: Systeem-intern, nooit getoond aan user, gebruikt in URLs/database
- **Catalog ID (user_catalog_id)**: Optioneel gebruikersnummer, alleen in detail view
- **FileMaker ID (filemaker_id)**: Originele UUID uit FileMaker, voor import tracking

### View Philosophy
- **List view**: Data-dense tabel voor scannen collectie
- **Grid view**: Visueel browsen met covers (placeholders nu)
- **Detail view**: Alleen ingevulde velden
- **Edit view**: Alle velden zichtbaar

### Publication Year
- VARCHAR(100) om bibliografische notaties te ondersteunen:
  - Romeinse cijfers: "MCMLXXIX [1979]"
  - Circa datums: "(circa 1960)"
  - Onzekere datums: "[1942]", "[1927-1928?]"
  - Historisch: "An VI De La République [1798]"

### Cover Types (45+ options)
Gestructureerd in categorieën:
- **Basic**: softcover, hardcover (± dust jacket)
- **Full leather**: leather, calf, vellum, morocco, faux leather
- **Full cloth**: cloth, buckram, linen, silk, canvas, moiré
- **Quarter binding**: leather-paper, leather-cloth, faux leather-paper, cloth-paper
- **Half binding**: leather-paper, leather-cloth, faux leather-paper, cloth-paper
- **Three-quarter binding**: leather-paper, leather-cloth, etc.
- **Other**: cardboard, paper boards, library binding, original wraps, printed wrappers, limp leather/vellum

### Book Formats (76 unique)
Historische bibliografische formaten:
- **Folio** (13): Atlas, Crown, Demy, Double Elephant, Elephant, Foolscap, Imperial, etc.
- **Quarto** (10): Crown, Demy, Foolscap, Imperial, Large Post, etc.
- **Octavo** (12): Crown, Demy, Foolscap, Imperial, Large Crown, etc.
- **Duodecimo** (5), **Sextodecimo** (5), **Octodecimo** (3), etc.
- **Modern** (8): A4, A5, A6, B5, B6, US Legal, US Letter, etc.
- **Descriptive** (4): Elephant, Miniature, Oversize, Pocket
- **Square** (3): Large, Medium, Small
- **Other**: Accordion, Broadside, Broadsheet, Scroll

## TODO / Volgende Stappen

### High Priority
- [ ] Add book page (/books/add)
- [ ] Contributors editing (add/remove from book)
- [ ] Search/filter op books list

### Medium Priority
- [ ] Book cover image upload
- [ ] Sorting options (by title, author, year)
- [ ] Bulk actions
- [ ] Export functionality

### Low Priority
- [ ] Auto-generate catalog IDs
- [ ] "Show catalog ID in list" toggle setting
- [ ] ISBN lookup/autofill
- [ ] Barcode scanner

## Sessie Log

### 2025-01-29 - Database Setup
- Alle 8 reference tables aangemaakt
- Alle seed data geïmporteerd (5,649 records)

### 2025-01-29 - Next.js & Supabase Integratie
- Supabase client/server/middleware setup
- TypeScript database types
- Swiss Design CSS theme met Tailwind 4
- Auth flow (login/register)
- RLS security fixed

### 2025-01-29 - FileMaker Import & Books UI
- FileMaker data volledig geïmporteerd (5,054 boeken)
- Fixed: Language import (was 0, nu 5,035)
- Fixed: Binding import (was 1,207, nu 1,274)
- Fixed: Publication year (nu met Romeinse cijfers etc.)
- Books list page met list/grid views
- Book detail page
- Book edit page (alle velden)

### 2025-01-30 - Edit Form Enhancements
- Cover types dropdown (45+ options, gestructureerd per categorie)
- Protective enclosure dropdown (6 options)
- Pagination text field (bibliografische notatie)
- BISAC codes combobox met batch fetching (bypasses 1000-row limit)
- Shelf/section autocomplete dropdowns
- Auto-resizing textareas
- Book Format dropdown (76 formats: Folio, Quarto, Octavo, etc.)
- **Catalog Entry Generator** met ISBD-standaard en 4 talen (EN/FR/DE/NL)

---
*Laatst bijgewerkt: 2025-01-30 03:30*
