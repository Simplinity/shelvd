# Shelvd - Project Context

## Project Overzicht
Shelvd is een SaaS applicatie voor boekenverzamelaars om hun collectie te beheren.

## Tech Stack
- **Frontend**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Supabase (EU Frankfurt)
- **Styling**: Tailwind CSS (te configureren)

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
| bindings | 63 | Bindtypes (Hardcover, Paperback, etc.) |
| book_parts | 138 | Boekonderdelen (Title page, Colophon, etc.) |
| book_formats | 152 | Formaten (Folio, Quarto, Octavo, etc.) |
| languages | 85 | ISO 639 taalcodes |
| contributor_roles | 138 | MARC relator codes (Author, Illustrator, etc.) |
| dewey_classifications | 1,177 | Dewey Decimal classificaties |
| bisac_codes | 3,887 | Book Industry Standards categorieën |
| **Totaal** | **5,649** | |

### User Data Tables
- `profiles` - User profielen (gekoppeld aan Supabase Auth)
- `contributors` - Auteurs, illustratoren, etc.
- `books` - Boeken in collectie
- `book_contributors` - Many-to-many relatie boeken ↔ contributors
- `book_images` - Afbeeldingen per boek

### RLS (Row Level Security)
- Reference tables: Publiek leesbaar voor iedereen
- User data tables: Alleen eigen data (via `auth.uid()`)

## Bestandsstructuur

```
shelvd/
├── supabase/
│   ├── migrations/
│   │   ├── 001_reference_tables.sql    # 8 reference tables
│   │   ├── 002_contributors.sql        # Contributors table
│   │   └── 003_user_data.sql           # Profiles, books, book_contributors, book_images
│   ├── seed/
│   │   ├── conditions.sql              # 9 records
│   │   ├── bindings.sql                # 63 records (21 unique + duplicates)
│   │   ├── book_parts.sql              # 138 records
│   │   ├── book_formats.sql            # 152 records
│   │   ├── languages.sql               # 85 records
│   │   ├── contributor_roles.sql       # 138 records
│   │   ├── dewey_classifications.sql   # 1,177 records
│   │   └── bisac_codes.sql             # 3,887 records
│   └── seed.sql                        # Master seed file (imports all seed files)
├── scripts/
│   └── generate_bisac_sql.py           # Genereert BISAC SQL uit Excel
├── src/
│   └── app/
│       └── page.tsx                    # Next.js homepage
└── project-context.md                  # Dit bestand
```

## Handige Commands

### Database seeden (volledige reset)
```bash
cd ~/Documents/GitHub/shelvd
psql "postgresql://postgres:LsY1yr4siVYlZhiN@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres" -f supabase/seed.sql
```

### BISAC codes regenereren uit Excel
```bash
cd ~/Documents/GitHub/shelvd
python3 scripts/generate_bisac_sql.py
```

### Database status checken
```bash
psql "postgresql://postgres:LsY1yr4siVYlZhiN@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres" -c "
SELECT 'conditions' as table_name, count(*) from conditions
UNION ALL SELECT 'bindings', count(*) from bindings
UNION ALL SELECT 'book_parts', count(*) from book_parts
UNION ALL SELECT 'book_formats', count(*) from book_formats
UNION ALL SELECT 'languages', count(*) from languages
UNION ALL SELECT 'contributor_roles', count(*) from contributor_roles
UNION ALL SELECT 'dewey_classifications', count(*) from dewey_classifications
UNION ALL SELECT 'bisac_codes', count(*) from bisac_codes;"
```

## Lokale Tools (Mac)

⚠️ **BELANGRIJK VOOR CLAUDE**: Onderstaande tools zijn geïnstalleerd. Gebruik deze exacte paden!

### PostgreSQL Client (psql)
```bash
# Exacte locatie (Homebrew libpq)
/opt/homebrew/opt/libpq/bin/psql

# Database query uitvoeren
/opt/homebrew/opt/libpq/bin/psql "postgresql://postgres:LsY1yr4siVYlZhiN@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres" -c "SELECT count(*) FROM books;"
```

### Andere tools in PATH
- **Node/npm**: `node`, `npm`, `npx`
- **Python3**: `python3`
- **Git**: `git`

---

## Claude AI Tools Beschikbaar

### Filesystem MCP
- ✅ Bestanden lezen/schrijven op Mac
- ✅ Directories aanmaken/lijsten

### Shell MCP (`mcp-shell`)
- ✅ Terminal commands uitvoeren op Mac
- ⚠️ psql zit NIET in PATH → gebruik `/opt/homebrew/opt/libpq/bin/psql`

### Claude in Chrome MCP
- ✅ Browser automatisatie
- ✅ Webpagina's navigeren en interacteren
- ✅ Screenshots maken

### Werkwijze Regel
⚠️ **ALTIJD** eerst uitleggen wat je gaat doen en toestemming vragen voordat je bestanden aanmaakt, wijzigt of andere acties uitvoert. Nooit zomaar beginnen met schrijven!

## Volgende Stappen
1. ✅ Supabase client opzetten in Next.js
2. ⏳ Authenticatie flow bouwen (Email/Password)
3. ⏳ Boeken CRUD pagina's bouwen
4. ✅ Styling met Tailwind CSS (Swiss Design)

## Sessie Log

### 2025-01-29 - Database Setup Voltooid
- Alle 8 reference tables aangemaakt via migrations
- Alle seed data geïmporteerd (5,649 records totaal)
- BISAC codes generator script aangemaakt
- Bestandsstructuur opgezet

### 2025-01-29 - Next.js & Supabase Integratie
- Supabase client/server/middleware setup
- TypeScript database types
- Swiss Design CSS theme met Tailwind 4
- Eerste GitHub push voorbereid

---
*Laatst bijgewerkt: 2025-01-29*
