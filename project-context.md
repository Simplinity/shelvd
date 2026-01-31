# Shelvd - Project Context

> **Versie:** 1.5.0  
> **Laatste update:** 2025-01-31 18:00 CET  
> **Auteur:** Bruno (eigenaar) + Claude (AI assistant)  
> **Status:** Actief in ontwikkeling

---

## Project Overzicht
Shelvd is een SaaS applicatie voor boekenverzamelaars om hun collectie te beheren.

## Visie & Doelgroep

### Kernvisie
> **Shelvd is de eerste moderne webapp voor serieuze boekverzamelaars - mensen die hun boeken zien als waardevolle objecten, niet alleen tekst. Met bibliografische diepte, professionele catalogisering, en de kennis om het goed te doen.**

### Doelgroep: Serieuze Boekverzamelaars
Mensen die verzamelen:
- Eerste edities (ook moderne)
- Gesigneerde exemplaren
- Private press uitgaven
- Bijzondere banden
- Beperkte oplages
- Antiquarische boeken

**Niet primair gericht op:**
- Casual lezers die hun leeslijst bijhouden
- Bibliotheken (andere needs)
- Boekhandelaren (verkoop-focus)

### Concurrentiepositie

| Platform | Sterkte | Zwakte | Shelvd's Voordeel |
|----------|---------|--------|-------------------|
| **CLZ Books** | Grootste, veel data | Verouderde UX, ISBN-centric | Moderne web-app, bibliografische diepte |
| **LibraryThing** | Community, 2M+ users | Lezers-focus, rommelige UI | Focus op fysiek exemplaar |
| **Libib** | Modern, simpel | Te basic | Professionele catalogisering |

**Shelvd's unieke features:**
- ISBD-compliant catalogus entries (4 talen)
- 69 MARC contributor roles
- Historische boekformaten (Folio, Quarto, Octavo, etc.)
- 45+ cover/binding types
- Bibliografische paginering
- Romeinse jaartallen support

**Belangrijk inzicht:** ISBN is grotendeels irrelevant voor serieuze verzamelaars - elk boek vóór 1970 heeft geen ISBN. CLZ/LibraryThing zijn gebouwd rond ISBN scanning. Shelvd is gebouwd rond bibliografisch catalogiseren.

## Website Strategie: Kennisplatform

### Concept
De marketing website moet zich focussen op de kennis die vereist is voor het gebruik van Shelvd. Dit bouwt autoriteit, trekt traffic via SEO, en helpt gebruikers de app te begrijpen.

### Website Structuur
```
shelvd.com/
├── / (landing)
├── /features
├── /pricing
├── /knowledge/                    ← Kennisbank
│   ├── /glossary                  # A-Z alle termen
│   ├── /guides/
│   │   ├── /condition-grading     # Conditie bepalen
│   │   ├── /book-formats          # Folio, Quarto, etc.
│   │   ├── /binding-types         # Alle bindtypes
│   │   ├── /first-editions        # Eerste drukken herkennen
│   │   └── /cataloging-basics     # Hoe catalogiseer je?
│   └── /reference/
│       ├── /conditions            # 9 graderingen uitgelegd
│       ├── /formats               # 76 formaten
│       ├── /bindings              # 65 bindtypes
│       ├── /cover-types           # 45+ cover types
│       └── /contributor-roles     # 69 MARC rollen
├── /blog
└── /app (de applicatie zelf)
```

### Kennisbank Onderwerpen

**Fysieke Beschrijving:**
- Wat is Folio / Quarto / Octavo / Duodecimo?
- Bindtypes uitgelegd (half leather, quarter cloth, etc.)
- Cover types en hun kenmerken
- Hoe meet je een boek?

**Conditie:**
- Fine / Near Fine / Very Good / Good / Fair / Poor
- Dust jacket conditie apart
- Veelvoorkomende gebreken en terminologie

**Bibliografisch:**
- Wat is een eerste druk vs eerste editie?
- Hoe herken je een eerste druk?
- Wat is collatie?
- ISBD uitgelegd
- MARC codes voor contributors

**Waarde & Provenance:**
- Wat maakt een boek waardevol?
- Provenance documenteren
- Ex-libris en stempels
- Handtekeningen en inscripties

### Waarom Dit Werkt
1. **SEO:** Verzamelaars zoeken deze termen → vinden Shelvd
2. **Autoriteit:** "Ze weten waar ze over praten"
3. **Onboarding:** Users begrijpen de velden in de app
4. **Differentiatie:** CLZ/LibraryThing hebben dit niet
5. **Content marketing:** Gratis waarde → vertrouwen → conversie

## Feature Roadmap

### Geprioriteerde Roadmap

| Prio | Feature | Status | Beschrijving |
|------|---------|--------|---------------|
| 1 | **Nieuwe fysieke velden** | 🔴 Todo | Paper type, edge treatment, endpapers, text block condition |
| 1 | **Bestaande velden in views** | 🔴 Todo | Printer, DJ condition, valuation date, dedication, colophon in alle views |
| 2 | **Publisher & Contributor koppeling** | 🔴 Todo | Echte FK koppeling naar reference tables |
| 3 | **Export functies** | 🔴 Todo | Excel export, CSV import/export (flatten contributors) |
| 4 | **Custom Tags** | 🔴 Todo | User-defined labels voor boeken |
| 5 | **Duplicate Detection** | 🔴 Todo | Identificeer dubbelen op ISBN, titel+auteur, etc. |
| 6 | **Statistics Dashboard** | 🔴 Todo | 20 statistieken met grafieken |
| 7 | **External Links** | 🔴 Todo | WorldCat, Google Books, AbeBooks, VIAF, etc. |
| 8 | **User Settings** | 🔴 Todo | Preferences, default currency, GDPR export/delete |
| 9 | **Sharing & Public Catalog** | 🔴 Todo | Publieke catalogus URL, embed widget |
| 10 | **Currency & Valuation** | 🔴 Todo | Exchange rates, collection value berekening |
| — | Landing page + Kennisbank | 🔴 Todo | Marketing site, SEO (parallel track) |
| — | Duplicate book functie | 🔴 Todo | Kopieer boek als template |
| — | Templates systeem | 🔴 Todo | Pre-filled forms |
| — | PDF catalogus export | 🔴 Todo | ISBD-formatted |
| — | Insurance Report | 🔴 Todo | PDF met waarde + foto's |
| — | JSON/MARC export | 🔴 Todo | Backup/bibliotheek integratie |
| — | Image upload | 🔴 Todo | Single + multiple images |

---

## Nieuwe Database Velden (Prio 1)

### Paper Type
Nieuw veld: `paper_type VARCHAR(50)`

| Code | Naam | Beschrijving |
|------|------|--------------|
| `wove` | Wove paper | Smooth, uniform texture (post-1750s standard) |
| `laid` | Laid paper | Visible chain/wire lines (traditional) |
| `rag` | Rag paper | 100% cotton/linen fibers (pre-1850, archival) |
| `wood_pulp` | Wood pulp paper | Standard modern paper (post-1850, acidic) |
| `acid_free` | Acid-free paper | Modern archival quality |
| `vellum` | Vellum | Calfskin parchment |
| `parchment` | Parchment | Sheep/goat skin |
| `japan` | Japan paper | Thin, strong, translucent (Japanese tissue) |
| `india` | India paper | Very thin, opaque (Bible paper) |
| `handmade` | Handmade paper | Individual sheet production |
| `machine_made` | Machine-made paper | Industrial production |
| `coated` | Coated paper | Glossy/matte surface coating |
| `uncoated` | Uncoated paper | No surface coating |
| `calendered` | Calendered paper | Smoothed by rolling |
| `rice` | Rice paper | Asian paper from rice straw |
| `tapa` | Tapa/bark cloth | Pacific Islands bark paper |

### Edge Treatment
Nieuw veld: `edge_treatment VARCHAR(50)`

| Code | Naam | Beschrijving |
|------|------|--------------|
| `untrimmed` | Untrimmed | Edges left rough from papermaking |
| `uncut` | Uncut | Pages not separated (unopened) |
| `rough_cut` | Rough cut | Irregularly trimmed |
| `trimmed` | Trimmed | Cleanly cut, uniform edges |
| `gilt_all` | Gilt (all edges) | Gold on top, fore-edge, and bottom |
| `gilt_top` | Gilt (top edge only) | Gold on top edge only (t.e.g.) |
| `gilt_fore` | Gilt (fore-edge) | Gold on fore-edge |
| `silver` | Silver edges | Silver leaf on edges |
| `gauffered` | Gauffered | Tooled/decorated gilt edges |
| `painted` | Painted edges | Hand-painted decoration |
| `fore_edge_painting` | Fore-edge painting | Hidden painting visible when fanned |
| `sprinkled` | Sprinkled | Speckled color pattern |
| `stained` | Stained | Single color stain (red, blue, etc.) |
| `marbled` | Marbled edges | Marbled pattern on edges |
| `deckle` | Deckle edges | Feathered, irregular (handmade paper) |
| `red_edges` | Red stained | Traditional red stain |
| `blue_edges` | Blue stained | Blue stain |
| `yellow_edges` | Yellow stained | Yellow stain |

### Endpapers Type
Nieuw veld: `endpapers_type VARCHAR(50)`

| Code | Naam | Beschrijving |
|------|------|--------------|
| `plain_white` | Plain white | Standard white endpapers |
| `plain_colored` | Plain colored | Single color endpapers |
| `marbled` | Marbled | Traditional marbled pattern |
| `combed_marbled` | Combed marbled | Combed marbling pattern |
| `paste_paper` | Paste paper | Decorated with paste |
| `printed` | Printed | Printed pattern or text |
| `illustrated` | Illustrated | With illustrations |
| `maps` | Maps | Endpaper maps |
| `photographic` | Photographic | Photo endpapers |
| `decorative` | Decorative pattern | Publisher's decorative design |
| `self_ends` | Self-ends | Same paper as text block |
| `cloth` | Cloth | Fabric endpapers |
| `leather` | Leather doublures | Leather-lined |
| `silk` | Silk | Silk endpapers (fine bindings) |
| `vellum` | Vellum | Vellum endpapers |
| `none` | None | No endpapers (pamphlets) |

### Text Block Condition
Nieuw veld: `text_block_condition VARCHAR(50)`

| Code | Naam | Beschrijving |
|------|------|--------------|
| `tight` | Tight | Firmly bound, opens with resistance |
| `solid` | Solid | Well-attached, no looseness |
| `sound` | Sound | Good condition, minor wear acceptable |
| `tender` | Tender | Fragile, handle with care |
| `shaken` | Shaken | Loose in binding, but attached |
| `loose` | Loose | Pages detaching from binding |
| `detached` | Detached | Text block separated from covers |
| `broken` | Broken | Spine broken, sections loose |
| `recased` | Recased | Reattached to original covers |
| `rebacked` | Rebacked | New spine, original boards |
| `rebound` | Rebound | Completely new binding |

### Nieuwe Tekstvelden
- `dedication_text TEXT` - Transcriptie van de opdracht/dedicatie
- `colophon_text TEXT` - Transcriptie van het colofon

---

## Bestaande Velden → Toevoegen aan Views (Prio 1)

| Veld | Database | Edit Form | Detail View | List View |
|------|----------|-----------|-------------|----------|
| Printer | ✅ `printer` | 🔴 Add | 🔴 Add | 🔴 Add |
| Printing Place | ✅ `printing_place` | 🔴 Add | 🔴 Add | 🔴 Add |
| Dust Jacket Condition | ✅ `dust_jacket_condition_id` | 🔴 Add | 🔴 Add | - |
| Valuation Date | ✅ `valuation_date` | 🔴 Add | 🔴 Add | - |
| Topic | ✅ `topic` | ✅ Exists | 🔴 Add | - |
| Dedication Text | 🔴 New | 🔴 Add | 🔴 Add | - |
| Colophon Text | 🔴 New | 🔴 Add | 🔴 Add | - |

**Dust Jacket Condition** gebruikt dezelfde `conditions` dropdown (10 waarden).

---

## Publisher & Contributor Koppeling (Prio 2)

### Huidige Situatie
- **Publisher**: Vrij tekstveld `publisher_name` met autocomplete
- **Contributors**: Koppeling via `book_contributors` junction table

### Probleem
- `publishers` tabel bestaat met rijke data (city, country, founded_year, VIAF, Wikidata)
- Maar `books.publisher_name` is gewoon tekst, geen FK
- Zelfde voor printer (`books.printer` is tekst)

### Gewenste Oplossing
Hybride aanpak:
1. Autocomplete toont bestaande publishers
2. Bij selectie: sla `publisher_id` op (FK)
3. Bij nieuwe naam: maak automatisch nieuwe publisher aan
4. Behoud backward compatibility met bestaande data

**Complexiteit**: Migratie van bestaande data, UI aanpassingen, RLS policies.

---

## Custom Tags (Prio 4)

### Implementatie
Nieuwe tabellen:
```sql
CREATE TABLE user_tags (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7),  -- Hex color
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE book_tags (
  book_id UUID REFERENCES books(id),
  tag_id UUID REFERENCES user_tags(id),
  PRIMARY KEY (book_id, tag_id)
);
```

### UI
- Tag chips op book cards/rows
- Tag filter in search
- Tag management in settings

---

## Duplicate Detection (Prio 5)

### Match Criteria (user configurable)
1. **ISBN exact match** - Hoogste betrouwbaarheid
2. **Title + Author fuzzy** - Voor pre-ISBN boeken
3. **Title + Publisher + Year** - Alternatief
4. **Custom combinatie** - User kiest velden

### UI
- Warning bij Add/Import als potentiële duplicate gevonden
- Dedicated "Find Duplicates" tool
- Merge functionaliteit

---

## Export Functies (Prio 3)

### Excel/CSV Export
- Zelfde template als import
- **Contributors flatten**: "Author 1; Author 2; Author 3" in één kolom
- Alle velden inclusief nieuwe (paper, edges, etc.)

### Andere Exports (later)
- **PDF Catalog**: ISBD-formatted, met covers
- **JSON**: Complete backup, API-ready
- **MARC**: Voor bibliotheek integratie
- **Insurance Report**: Waardevolle boeken met foto's

---

## Statistics Dashboard (Prio 6)

### 20 Statistieken

| # | Statistiek | Type |
|---|------------|------|
| 1 | Total books count | Number |
| 2 | Total estimated value | Currency |
| 3 | Total acquisition cost | Currency |
| 4 | Unrealized gain/loss | Currency (value - cost) |
| 5 | Books by status | Pie chart |
| 6 | Books by condition | Pie chart |
| 7 | Books by century | Bar chart |
| 8 | Books by decade | Bar chart |
| 9 | Top 10 authors | List |
| 10 | Top 10 publishers | List |
| 11 | Top 10 publication places | List |
| 12 | Books by language | Pie chart |
| 13 | Books by cover type | Pie chart |
| 14 | Most valuable books | Top 10 list |
| 15 | Recent acquisitions | Timeline |
| 16 | Acquisition spending by year | Line chart |
| 17 | Acquisition spending by month | Bar chart |
| 18 | Books by storage location | Pie chart |
| 19 | Average book value | Number |
| 20 | Collection growth over time | Line chart |

---

## External Links (Prio 7)

Automatisch gegenereerde links naar externe bronnen:

| Service | URL Pattern | Vereist veld |
|---------|-------------|---------------|
| WorldCat | `https://www.worldcat.org/oclc/{oclc_number}` | OCLC |
| Google Books | `https://books.google.com/books?vid=ISBN{isbn}` | ISBN |
| OpenLibrary | `https://openlibrary.org/isbn/{isbn}` | ISBN |
| AbeBooks | `https://www.abebooks.com/servlet/SearchResults?isbn={isbn}` | ISBN |
| Library of Congress | `https://lccn.loc.gov/{lccn}` | LCCN |
| VIAF (contributors) | `https://viaf.org/viaf/{viaf_id}` | Contributor VIAF |
| Wikidata | `https://www.wikidata.org/wiki/{wikidata_id}` | Wikidata ID |

**Implementatie**: Iconen naast identifier velden, openen in nieuwe tab.

---

## User Settings (Prio 8)

### Settings Pagina

| Setting | Type | Default |
|---------|------|----------|
| Display name | Text | - |
| Default currency | Dropdown (EUR, USD, GBP, etc.) | EUR |
| Date format | DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD | DD/MM/YYYY |
| Default view | List / Grid | List |
| Items per page | Number | 250 |
| UI language | EN, NL, FR, DE | EN |
| Measurement units | Metric (mm) / Imperial (inches) | Metric |

### GDPR Compliance
- **Export all data** - Download complete collection as JSON
- **Delete account** - Verwijder alles met confirmation

### Exchange Rates (voor currency conversie)
- Handmatig instelbaar in settings
- Of: periodiek ophalen van externe API (later)
- Gebruikt voor collection value berekening

---

## Sharing & Public Catalog (Prio 9)

### Features
1. **Public catalog URL**: `shelvd.com/u/{username}`
2. **Privacy settings**: Welke velden publiek tonen
3. **Shareable wishlist**: Publieke link naar wishlist items
4. **Embed widget**: HTML snippet voor eigen website
5. **Static HTML export**: Download als standalone website

---

## Currency & Collection Value (Prio 10 - Laatste)

### Aanpak
1. Elk boek behoudt eigen `price_currency`
2. User heeft `default_currency` in settings
3. Bij berekening totale waarde: converteer naar default currency
4. Exchange rates: handmatig in settings OF via API

### Collection Value Display
- Dashboard widget met totale waarde
- Breakdown per currency (optioneel)
- Waarschuwing als exchange rates verouderd zijn

---

## Focus Principes

**Wel focussen op:**
- Snelle handmatige invoer (keyboard-first)
- Slimme autocomplete (leer van eigen collectie)
- Templates voor veelvoorkomende formaten
- Import/Export (Excel, CSV, JSON)
- Bibliografische diepte (paper, edges, endpapers, etc.)
- Professional cataloging output

**Niet focussen op:**
- ISBN barcode scanner (nice-to-have, niet core)
- Cover lookup via ISBN APIs (irrelevant voor doelgroep)
- "Auto-fill" magie
- Location management / shelf visualization
- Map view

---

## Templates Systeem (Gepland)

| Template | Pre-filled velden |
|----------|-------------------|
| Modern Hardcover | Cover: hardcover, Format: Octavo, Binding: Case binding |
| Modern Paperback | Cover: softcover, Format: Octavo, Binding: Perfect binding |
| 19th Century Cloth | Cover: cloth, Binding: Sewn, Has dust jacket: No |
| Leather Binding | Cover: full_leather, Binding: Sewn |
| Private Press | Cover: quarter_leather_paper, Limited edition: Yes |
| Pamphlet | Cover: paper_wrappers, Binding: Saddle stitch |

## Image Strategie

### Waarom Images Belangrijk Zijn
- Geen externe bronnen voor pre-1970 boeken
- Binding, conditie, provenance → visueel bewijs
- Handtekeningen, inscripties, ex-libris
- Verkoop: kopers willen foto's zien

### Technische Aanpak

| Aspect | Beslissing | Reden |
|--------|------------|-------|
| Formaat | WebP (JPEG fallback) | Beste compressie |
| Opslag | 1 formaat: 1200px breed | On-the-fly resize via Supabase |
| Max upload | 10MB | Hoge kwaliteit foto's toestaan |
| Max per boek | 10 images (Free: 3) | Kosten beheersen |
| Storage | Supabase Storage + Cloudflare CDN | Egress bescherming |

### Image Types voor Boekverzamelaars

| Type | Gebruik |
|------|--------|
| `cover_front` | Voorkant band (primair) |
| `cover_back` | Achterkant band |
| `spine` | Rug |
| `title_page` | Titelpagina |
| `colophon` | Colofon/drukkersinfo |
| `inscription` | Inscriptie/opdracht |
| `signature` | Handtekening |
| `ex_libris` | Ex-libris/stempel |
| `binding_detail` | Bindwerk detail |
| `damage` | Beschadiging |
| `illustration` | Illustratie/plaat |

### Kosten Schatting

| Scenario | Boeken | Images | Storage | Kosten/maand |
|----------|--------|--------|---------|---------------|
| 1 user (5K boeken) | 5,000 | 15,000 | 2.2 GB | ~€0.05 |
| 10 users | 30,000 | 90,000 | 13 GB | ~€0.27 |
| 100 users | 200,000 | 600,000 | 90 GB | ~€1.90 |

**Met Cloudflare CDN:** Egress praktisch €0.

## Pricing Model (Voorstel)

| Tier | Prijs | Boeken | Images/boek | Features |
|------|-------|--------|-------------|----------|
| **Free** | €0 | 100 | 1 | Basis catalogiseren |
| **Collector** | €7/maand | 5,000 | 5 | + Templates, Export |
| **Scholar** | €15/maand | Onbeperkt | 10 | + ISBD export, API |
| **Dealer** | €29/maand | Onbeperkt | 20 | + Multi-user, Verkoop integratie |

## Tech Stack
- **Frontend**: Next.js 15.5.11 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel (Frontend) + Supabase EU Frankfurt (Database)
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Design**: Swiss Design theme

## Development Tools

### 🚨 GOLDEN RULES - Code Wijzigingen

**REGEL 1: NOOIT bestaande code vervangen zonder analyse**

Voordat Claude code wijzigt in een bestaand bestand:
1. **LEES** eerst het HELE bestand (of relevante secties)
2. **IDENTIFICEER** bestaande functionaliteit die NIET geraakt mag worden
3. **GEBRUIK** `str_replace` met EXACTE oude tekst, NOOIT hele bestanden overschrijven
4. **VERIFIEER** dat alleen de bedoelde wijziging is gemaakt

**REGEL 2: Protected Features - NIET AANRAKEN**

Deze features zijn volledig werkend en mogen NIET gebroken worden:
- ✅ Global Search (batch fetching 5000+ boeken, client-side filtering)
- ✅ Advanced Search (14 velden, AND/OR, exact/fuzzy)
- ✅ Recent Searches (localStorage, dropdown)
- ✅ Sortable Columns (6 kolommen, toggle direction)
- ✅ List/Grid View toggle
- ✅ Bulk Delete (select mode, checkboxes)
- ✅ Single Delete (type-to-confirm)
- ✅ Excel Import (template, preview, validation)
- ✅ Add Book (form, contributors)
- ✅ Edit Book (alle velden, contributors, catalog generator)
- ✅ BISAC Combobox (batch loading)

**REGEL 3: Wijzigings-protocol**

```
1. VOOR wijziging:
   - `view` het bestand
   - Noteer bestaande imports, state, functies
   - Identificeer EXACT waar nieuwe code moet komen

2. BIJ wijziging:
   - Gebruik str_replace met minimale context
   - Voeg code TOE, vervang niet
   - Behoud ALLE bestaande imports en state

3. NA wijziging:
   - Check of bestand compileert: `npm run build`
   - Verifieer dat protected features nog werken
```

**REGEL 4: Bij twijfel - VRAAG**

Als niet 100% duidelijk is hoe nieuwe code toe te voegen zonder bestaande te breken:
- Stop
- Toon de gebruiker wat je van plan bent
- Vraag bevestiging

---

### Deployment & Version Control
- **Hosting**: Vercel (auto-deploy bij push naar main)
- **Version Control**: GitHub Desktop (Mac app)
- **Repository**: https://github.com/Simplinity/shelvd

### Lokale Development
- **IDE**: Cursor / VS Code
- **Package Manager**: npm
- **Build**: `npm run build` (Next.js)
- **Dev Server**: `npm run dev` (localhost:3000)

### Workflow
1. Code wijzigen lokaal
2. `npm run build` om te testen
3. Commit in GitHub Desktop
4. Push via GitHub Desktop → Vercel deploy automatisch

## URLs
- **Live Site**: https://shelvd-www.vercel.app
- **GitHub**: https://github.com/Simplinity/shelvd
- **Supabase Dashboard**: https://supabase.com/dashboard/project/euieagntkbhzkyzvnllx

## Supabase Configuratie
- **Project ID**: euieagntkbhzkyzvnllx
- **Region**: EU Frankfurt
- **Database URL**: `postgresql://postgres:[PASSWORD]@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres`
- **Database Password**: LsY1yr4siVYlZhiN

### Supabase Limits & Workarounds
- **Default row limit**: 1000 rijen per query
- **Workaround**: Batch fetching met `.range(from, to)` in loops van 1000
- **Toegepast in**: Global search, BISAC codes dropdown

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
│       │   │   │   ├── add/
│       │   │   │   │   ├── page.tsx    # Add new book manually
│       │   │   │   │   └── book-add-form.tsx
│       │   │   │   ├── import/
│       │   │   │   │   ├── page.tsx    # Excel bulk import
│       │   │   │   │   └── book-import-form.tsx
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
  - **Batch fetching**: Haalt ALLE boeken op in batches van 1000 (bypasses Supabase limit)
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
- **Add Book link**: Knop naar /books/add
- **Import link**: Knop naar /books/import
- **Advanced Search link**: Knop naar /books/search

### /books/add - Add Book Manually
- Formulier voor handmatig toevoegen van een boek
- Zelfde velden als Edit form
- Contributors kunnen direct worden toegevoegd
- Na save: redirect naar book detail page

### /books/import - Excel Bulk Import
- **Template Download**: Genereer Excel template met alle velden
  - Swiss Design styling (rood/zwart headers)
  - Kolommen: Title, Subtitle, Original Title, Series, Author, Publisher, etc.
  - Gegeneerd met `exceljs` library
- **Upload & Preview**:
  - Drag & drop of file picker voor .xlsx/.xls
  - Preview tabel met eerste 10 rijen
  - Validatie: verplichte velden, data types
  - Toont errors per rij (rode highlighting)
- **Bulk Import**:
  - Importeert alle geldige rijen
  - Contributors worden automatisch aangemaakt indien nieuw
  - Parseert contributor strings ("Author Name (Role)" format)
  - Progress indicator tijdens import
- **Import Button** op /books page header

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

### ✅ Prio 1 - Nieuwe Velden & Views (VOLTOOID)
- [x] **Nieuwe database velden** - paper_type, edge_treatment, endpapers_type, text_block_condition, dedication_text, colophon_text
- [x] **Paper Type dropdown** - 16 waarden (wove, laid, rag, vellum, japan, india, etc.)
- [x] **Edge Treatment dropdown** - 18 waarden (untrimmed, gilt, gauffered, fore-edge painting, etc.)
- [x] **Endpapers dropdown** - 16 waarden (marbled, paste paper, leather doublures, etc.)
- [x] **Text Block Condition dropdown** - 11 waarden (tight, solid, shaken, rebacked, etc.)
- [x] **Dust Jacket Condition** - Edit form, detail view (zelfde conditions dropdown)
- [x] **Valuation Date** - Edit form, detail view
- [x] **Dedication Text** - Edit form, detail view
- [x] **Colophon Text** - Edit form, detail view
- [x] **Add Book form** - Alle nieuwe velden toegevoegd
- [x] **TypeScript types** - Geregenereerd

**Opmerking:** Printer & Printing Place stonden al in Publication sectie ✅

### ~~Prio 2 - Publisher & Contributor Koppeling~~ **GESCHRAPT**
> **Reden:** De publishers tabel is leeg en zou een data-kerkhof worden bij schaal.
> Publisher_name als vrij tekst + autocomplete werkt goed genoeg.
> Contributors tabel blijft WEL (M:N relatie, 8194 entries, actief in gebruik).

### ✅ Prio 2 - Export Functies **VOLTOOID**
- [x] **Excel export** - Zelfde template als import, flatten contributors
- [ ] **CSV export** - Alle velden (optioneel, later)
- [ ] **CSV import** - Zelfde als Excel import (optioneel, later)

### 🟡 Prio 3 - Custom Tags
- [ ] **user_tags tabel** - Met kleur support
- [ ] **book_tags junction** - Many-to-many
- [ ] **Tag UI** - Chips, filter, management

### 🟡 Prio 4 - Duplicate Detection
- [ ] **ISBN exact match** - Hoogste prioriteit
- [ ] **Title + Author fuzzy** - Voor pre-ISBN boeken
- [ ] **Warning bij Add/Import** - Potentiële duplicates
- [ ] **Find Duplicates tool** - Dedicated pagina

### 🟡 Prio 5 - Statistics Dashboard
- [ ] **20 statistieken** - Counts, values, charts
- [ ] **Collection value** - Met currency conversie

### 🟡 Prio 6 - External Links
- [ ] **WorldCat, Google Books, AbeBooks** - Via ISBN/OCLC
- [ ] **VIAF, Wikidata** - Voor contributors
- [ ] **Library of Congress** - Via LCCN

### 🟢 Prio 7 - User Settings
- [ ] **Settings pagina** - Currency, date format, view preferences
- [ ] **GDPR compliance** - Export all data, delete account

### 🟢 Prio 8 - Sharing & Public Catalog
- [ ] **Public catalog URL** - shelvd.com/u/{username}
- [ ] **Privacy settings** - Welke velden publiek
- [ ] **Shareable wishlist** - Publieke link
- [ ] **Embed widget** - HTML snippet

### 🟢 Prio 9 - Currency & Valuation
- [ ] **Exchange rates** - Handmatig in settings of API
- [ ] **Collection value berekening** - Converteer naar default currency

### Parallel Track
- [ ] **Landing page + Kennisbank** - Marketing site, SEO
- [ ] **Duplicate book functie** - Kopieer als template
- [ ] **Templates systeem** - Pre-filled forms
- [ ] **PDF catalogus export** - ISBD-formatted
- [ ] **Insurance Report** - PDF met waarde + foto's
- [ ] **JSON/MARC export** - Backup/bibliotheek
- [ ] **Image upload** - Single + multiple

### ✅ Voltooid
- [x] ~~Add book page (/books/add)~~ Geïmplementeerd
- [x] ~~Search/filter op books list~~ Geïmplementeerd (global + advanced search)
- [x] ~~Excel import (/books/import)~~ Geïmplementeerd
- [x] ~~Sorting options (by title, author, year)~~ Geïmplementeerd (klikbare kolomheaders)

### Later / Nice-to-have
- [ ] Admin interface voor contributors (multi-user)
- [ ] Auto-generate catalog IDs
- [ ] ISBN lookup/autofill
- [ ] Barcode scanner
- [ ] Customizable columns
- [ ] Print view
- [ ] Timeline view

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

### 2025-01-31 - Add Book & Excel Import
- **Add Book Page** (/books/add):
  - Formulier voor handmatig toevoegen van boeken
  - Zelfde structuur als Edit form
  - Contributors toevoegen met autocomplete
  - Redirect naar detail page na save
- **Excel Import** (/books/import):
  - Template download met Swiss Design styling (exceljs)
  - Drag & drop upload voor .xlsx/.xls
  - Preview met validatie (eerste 10 rijen)
  - Bulk import met progress indicator
  - Automatische contributor parsing en creatie
  - Import knop toegevoegd aan /books header
- **Global Search Bug Fix**:
  - Probleem: Supabase default limit van 1000 rijen
  - Oplossing: Batch fetching in chunks van 1000
  - Nu worden alle 5000+ boeken correct doorzocht
- **Code Cleanup**:
  - Debug alerts verwijderd
  - Protective comments toegevoegd aan fetchBooks modes
  - Drie search modes gedocumenteerd: DEFAULT, GLOBAL SEARCH, ADVANCED FILTERS

### 2025-01-31 (ochtend) - Strategische Planning
- **Visie & Doelgroep gedocumenteerd**:
  - Kernvisie: moderne webapp voor serieuze boekverzamelaars
  - Doelgroep: mensen die boeken zien als waardevolle objecten
  - Niet: casual lezers, bibliotheken, boekhandelaren
- **Concurrentie-analyse**:
  - CLZ Books, LibraryThing, Libib vergeleken
  - Shelvd's unieke positie: bibliografische diepte + moderne UX
  - Belangrijk inzicht: ISBN irrelevant voor pre-1970 boeken
- **Website Strategie: Kennisplatform**:
  - Marketing site moet focussen op kennis voor boekverzamelaars
  - Glossary, guides, reference pages gepland
  - SEO + autoriteit + onboarding in één
- **Feature Roadmap geprioriteerd**:
  1. Landing page + Kennisbank
  2. Duplicate book functie
  3. CSV export
  4. Templates systeem
  5. Uitgebreide autocomplete
  6. PDF catalogus export
  7. Multiple images
  8. Image upload (single)
- **Image Strategie uitgewerkt**:
  - WebP formaat, 1200px breed, Supabase Storage
  - 11 image types voor boekverzamelaars gedefinieerd
  - Cloudflare CDN voor egress bescherming
- **Pricing Model voorstel**:
  - Free (€0/100 boeken), Collector (€7), Scholar (€15), Dealer (€29)
- **Focus principes**:
  - Wel: snelle handmatige invoer, autocomplete, templates, Excel/CSV
  - Niet: ISBN scanner, auto-fill, cover lookup APIs

### 2025-01-31 (middag) - Feature Planning & Roadmap
- **Correcties geïdentificeerd**:
  - Weight, OCLC, LCCN, DDC, LCC, UDC stonden al in UI
  - Publisher bestaat in UI als vrij tekstveld
  - Previous Owners zit in provenance veld
  - Limited Edition Number zit in edition_notes
  - Recent Searches bestaat al (laatste 10)
- **4 Nieuwe fysieke velden gedefinieerd**:
  - Paper Type (16 waarden): wove, laid, rag, vellum, japan, india, etc.
  - Edge Treatment (18 waarden): untrimmed, gilt_all, gauffered, fore_edge_painting, etc.
  - Endpapers Type (16 waarden): marbled, paste_paper, illustrated, leather doublures, etc.
  - Text Block Condition (11 waarden): tight, solid, shaken, loose, rebacked, etc.
- **2 Nieuwe tekstvelden**: dedication_text, colophon_text
- **Bestaande velden voor views**: printer, printing_place, dust_jacket_condition, valuation_date, topic
- **10-punts Roadmap vastgesteld**:
  1. Nieuwe velden + bestaande velden in views
  2. Publisher & Contributor FK koppeling
  3. Export functies (Excel/CSV)
  4. Custom Tags
  5. Duplicate Detection
  6. Statistics Dashboard (20 stats)
  7. External Links (WorldCat, AbeBooks, VIAF, etc.)
  8. User Settings + GDPR
  9. Sharing & Public Catalog
  10. Currency & Valuation (laatste)
- **Export beslissing**: Contributors flatten ("Author 1; Author 2")
- **Currency beslissing**: Per-boek currency, conversie naar default bij totals, handmatige exchange rates in settings
- **Golden Rules toegevoegd**: Code wijzigings-protocol gedocumenteerd om bestaande features niet te breken

### 2025-01-31 (namiddag) - Prio 1 Implementatie
- **Database migration** (004_physical_description_fields.sql):
  - paper_type VARCHAR(50) - 16 waarden
  - edge_treatment VARCHAR(50) - 18 waarden
  - endpapers_type VARCHAR(50) - 16 waarden
  - text_block_condition VARCHAR(50) - 11 waarden
  - dedication_text TEXT
  - colophon_text TEXT
- **Edit form** (`book-edit-form.tsx`):
  - 4 nieuwe dropdowns in Physical Description
  - Dust Jacket Condition in Condition & Status
  - Valuation Date in Valuation
  - Dedication/Colophon in Notes
- **Detail view** (`page.tsx`):
  - Alle nieuwe velden met format helpers
  - Dust Jacket Condition fetch
- **Add book form** (`book-add-form.tsx`):
  - Alle nieuwe velden toegevoegd
- **TypeScript types** geregenereerd
- **Build succesvol** ✅

### 2025-01-31 (namiddag 2) - UI/UX Swiss Design
- **Header redesign** (Optie B gekozen):
  - Witte achtergrond met dikke rode lijn onderaan (4px)
  - Rode logo behouden (bg-primary)
  - SHELVD tekst nu uppercase
  - Alle nav items toegevoegd: Collection, Add, Import, Search
  - Iconen voor Add (+), Import (upload), Search (magnifier)
  - Consistente gray-500/black kleurenschema voor user menu
- **Status kleuren** (Swiss Design palette):
  - on_sale: solid rood (`bg-red-600 text-white`)
  - to_sell: licht rood (`bg-red-100 text-red-700`)
  - reserved: rode outline (`border border-red-600 text-red-600`)
  - lent/borrowed: zwarte outline (`border border-black text-black`)
  - lost/destroyed: solid zwart (`bg-black text-white`)
  - in_collection/sold/double/ordered/donated: grijs variaties
- **Demo pagina verwijderd** (/header-demo)
- **Action needed badge**: amber → rood (`bg-red-100 text-red-700`)
- **Build succesvol** ✅

### 2025-01-31 (namiddag 3) - Roadmap Herziening
- **Prio 2 (Publisher FK) GESCHRAPT**:
  - Publishers tabel is leeg (0 entries)
  - Zou data-kerkhof worden bij schaal (wie vult metadata in voor 500k+ publishers?)
  - Huidige aanpak werkt: `publisher_name` vrij tekst + autocomplete
- **Contributors tabel BLIJFT**:
  - M:N relatie (meerdere contributors per boek)
  - Actief in gebruik: 8194 contributors, 5152 koppelingen
  - Essentieel voor rollen (Author, Illustrator, Translator, etc.)
- **Roadmap hernummerd**: 10 → 9 prioriteiten

### 2025-01-31 (namiddag 4) - Prio 2 Export Implementatie
- **Excel export API** (`/api/export`):
  - Exporteert alle boeken van user naar .xlsx
  - Zelfde kolom structuur als import template
  - Flattened contributors: "Name (Role); Name2 (Role2)"
  - Resolves alle FK relaties (language, binding, condition, format, location)
  - Inclusief nieuwe Prio 1 velden (paper_type, edge_treatment, etc.)
  - Styled header row, alternating row colors
  - Auto-generated filename met datum
- **Export button** toegevoegd in books list (naast Import)
- **Build succesvol** ✅

---

## Changelog

| Versie | Datum | Wijzigingen |
|--------|-------|-------------|
| 1.5.0 | 2025-01-31 | Excel export (Prio 2) |
| 1.4.0 | 2025-01-31 | Publisher FK geschrapt, roadmap 10→9 prio's |
| 1.3.1 | 2025-01-31 | Action needed badge rood |
| 1.3.0 | 2025-01-31 | Swiss Design UI (header, status kleuren) |
| 1.2.0 | 2025-01-31 | Prio 1 implementatie (nieuwe velden) |
| 1.1.0 | 2025-01-31 | Golden Rules, 10-punts roadmap |
| 1.0.0 | 2025-01-30 | Initiële documentatie |
