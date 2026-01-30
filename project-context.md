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

### Shared Tables (Gedeeld tussen users)
| Tabel | Records | Beschrijving |
|-------|---------|--------------|
| contributors | 4,097 | Auteurs, illustratoren, etc. (gedeeld, unieke namen) |

**Contributors RLS Policy:**
- Lezen: Iedereen kan alle contributors zien
- Aanmaken: Ingelogde user, met `created_by_user_id`
- Bewerken/Verwijderen: Alleen de creator

### User Data Tables (Per user via RLS)
| Tabel | Records | Beschrijving |
|-------|---------|--------------|
| profiles | 1 | User profielen (gekoppeld aan Supabase Auth) |
| books | 5,054 | Boeken in collectie |
| book_contributors | 5,152 | Many-to-many relatie boeken ↔ contributors |
| book_images | 0 | Afbeeldingen per boek (nog niet geïmplementeerd) |

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
- Contributors: Lezen=iedereen, Bewerken=alleen creator
- User data tables: Alleen eigen data (via `auth.uid()`)

## Bestandsstructuur

```
shelvd/
├── apps/
│   └── www/                            # Next.js frontend app
│       ├── app/
│       │   ├── (app)/                  # Authenticated routes
│       │   │   ├── books/
│       │   │   │   ├── page.tsx        # Books list (list/grid views, bulk delete, global search)
│       │   │   │   ├── search/
│       │   │   │   │   ├── page.tsx    # Advanced search page
│       │   │   │   │   └── book-search-form.tsx  # Search form component
│       │   │   │   └── [id]/
│       │   │   │       ├── page.tsx    # Book detail (met delete button)
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
│       │   ├── catalog-entry-generator.tsx # ISBD catalog entry generator
│       │   └── delete-book-button.tsx  # Single book delete with confirmation
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
- **Global Search Bar**: Zoekt in alle tekstvelden (title, subtitle, original_title, series, author, publisher, place, notes, ISBN)
  - Meerdere woorden = AND logica (alle termen moeten matchen)
  - URL parameter: `?q=search+terms`
  - Client-side filtering voor snelle resultaten
- **Recent Searches Dropdown**: 
  - Toont laatste 10 zoekopdrachten (localStorage)
  - Ondersteunt global én advanced searches
  - Toont aantal resultaten per zoekopdracht
  - Delete individuele items of "Clear all"
  - Click-outside sluit dropdown
- **Sortable Columns**:
  - Klik op kolomheader om te sorteren (Title, Author, Publisher, Place, Year, Status)
  - Klik opnieuw om richting te wisselen (A-Z ↔ Z-A)
  - Iconen: ▲ (ascending), ▼ (descending), ↕ (niet actief)
  - Client-side sorting via useMemo voor instant response
- **List View** (default): Tabel met Title, Author, Publisher, Place, Year, Status
  - Title beperkt tot 2 regels
  - Status badges met kleuren (In Col./For Sale/Sold/Lost)
  - 250 items per page, "Load more" knop
- **Grid View**: Cards met placeholder cover, Title, Author, Year
  - 2-5 kolommen responsive
- **View toggle** (list/grid icons)
- **Select mode**: Toggle button activeert checkbox selectie
  - Checkboxes in list view (met select all) en grid view
  - Selection bar met count en "Delete Selected" button
  - Bulk delete met type-to-confirm modal ("delete N books")
- Totaal count weergave
- **Advanced Search link**: Knop naar /books/search

### /books/search - Advanced Search
- **14 zoekbare velden**: Title, Subtitle, Original Title, Series, Author, Publisher, Publication Place, Publication Year, Language, Condition, Status, ISBN, Storage Location, Shelf
- **Search Modes**:
  - AND (default): Alle criteria moeten matchen
  - OR: Minstens één criterium moet matchen
- **Match Types**:
  - Contains/Fuzzy (default): Zoekt met `%term%`
  - Exact: Zoekt exact match
- **Empty Field Search**: 
  - Type `=` om lege velden te vinden
  - Type `!=` om niet-lege velden te vinden
- **Modify Search**: Button om bestaande zoekcriteria aan te passen (behoudt huidige filters)
- **Tip banner**: Legt `=` en `!=` syntax uit

### /books/[id] - Book Detail
- Toont alleen ingevulde velden (lege velden verborgen)
- Secties: Publication, Edition, Physical, Condition, Identifiers, Storage, Acquisition, Valuation, Notes, Catalog Entry
- Contributors gegroepeerd per rol
- Status badge
- **Edit knop** → /books/[id]/edit
- **Delete knop** → modal met type-to-confirm ("delete")

### /books/[id]/edit - Book Edit
- ALLE velden zichtbaar (ook lege)
- **Contributors sectie**:
  - Lijst van huidige contributors met remove (X) button
  - Toevoegen: naam autocomplete (4,097 contributors) + role dropdown (69 rollen)
  - Nieuwe contributor wordt automatisch aangemaakt indien niet bestaat
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

### Delete Functionaliteit
- **Single delete** (detail page):
  - Delete button naast Edit
  - Modal: type "delete" om te bevestigen
  - Toont boektitel in bevestigingsdialoog
- **Bulk delete** (list page):
  - "Select" toggle activeert selectie modus
  - Checkboxes verschijnen in list/grid view
  - "Delete Selected" button (disabled als niets geselecteerd)
  - Modal: type "delete N books" om te bevestigen
  - Toont lijst van boeken (max 5 getoond)
- **Hard delete**: Verwijdert eerst book_contributors (FK), dan book
- **Geen soft delete**: Actie is permanent, niet herstelbaar

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

### Contributors (Gedeeld)
- Contributors tabel is **gedeeld** tussen alle users
- Voordelen: Geen duplicaten, verrijking mogelijk (VIAF, Wikidata)
- Privacy: Andere users zien niet welke boeken jij hebt
- Alleen de namen van contributors zijn zichtbaar voor iedereen

## TODO / Volgende Stappen

### 🔴 High Priority
- [ ] **Admin interface voor contributors** - Nodig voor multi-user:
  - Admin role (`is_admin` op profiles of aparte `user_roles` tabel)
  - Admin UI om contributors te mergen, verrijken, corrigeren, verwijderen
  - RLS uitbreiden zodat admins alle contributors kunnen bewerken
  - Verificatie workflow (`is_verified` flag)
- [ ] Add book page (/books/add)
- [x] ~~Search/filter op books list~~ ✅ Geïmplementeerd (global + advanced search)
- [ ] **Saved Searches** (Subtask 4) - Bewaar zoekopdrachten in database voor hergebruik

### 🟡 Medium Priority
- [ ] Book cover image upload
- [x] ~~Sorting options (by title, author, year)~~ ✅ Geïmplementeerd (klikbare kolomheaders)
- [ ] Export functionality

### 🟢 Low Priority
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

### 2025-01-30 (ochtend) - Edit Form Enhancements
- Cover types dropdown (45+ options, gestructureerd per categorie)
- Protective enclosure dropdown (6 options)
- Pagination text field (bibliografische notatie)
- BISAC codes combobox met batch fetching (bypasses 1000-row limit)
- Shelf/section autocomplete dropdowns
- Auto-resizing textareas
- Book Format dropdown (76 formats: Folio, Quarto, Octavo, etc.)
- **Catalog Entry Generator** met ISBD-standaard en 4 talen (EN/FR/DE/NL)

### 2025-01-30 (middag) - Delete & Contributors
- **Single delete**: Delete button op detail page met type-to-confirm modal
- **Bulk delete**: Select mode toggle, checkboxes in list/grid view
  - Selection bar met count
  - Bulk delete modal met "delete N books" confirmatie
- **Contributors editing** in book edit form:
  - Toon huidige contributors met remove button
  - Toevoegen: naam autocomplete + role dropdown
  - Nieuwe contributors worden aangemaakt met `created_by_user_id`
  - Catalog entry generator gebruikt bijgewerkte contributors

### 2025-01-30 (avond) - Search Features
- **Global Search Bar** (Subtask 1):
  - Zoekt in title, subtitle, original_title, series, author, publisher_name, publication_place, notes, ISBN
  - Meerdere woorden = AND logica
  - Client-side filtering na fetch alle boeken
- **Empty Field Search** (Subtask 2):
  - `=` syntax voor lege velden
  - `!=` syntax voor niet-lege velden
  - Tip banner in UI
- **Recent Searches** (Subtask 3):
  - localStorage met max 10 items
  - Dropdown bij focus op search bar
  - Toont type (global/advanced), label, en resultaat count
  - Delete individueel of "Clear all"
- **Modify Search Fix**: Behoudt nu bestaande zoekcriteria
- **Debugging**: Console.log statements toegevoegd voor searchParams issues
- **Bug Fix**: `notes` kolom bestaat niet - heette `internal_notes`, veroorzaakte silent query failure
- **Sortable Columns**:
  - Klikbare headers: Title, Author, Publisher, Place, Year, Status
  - Toggle A-Z / Z-A bij herhaald klikken
  - Visuele iconen (ChevronUp/Down/ArrowUpDown)
  - Client-side useMemo voor instant sorting

---
*Laatst bijgewerkt: 2025-01-30 19:15*
