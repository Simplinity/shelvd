# Catalog Entry Specification

> **Shelvd — Antiquarian & Rare Book Collection Manager**
> Document version: 1.0 — 14 February 2026
> Purpose: Define all rules, norms, and per-country conventions for generating catalog entries in two modes (Trade Catalog and ISBD Formal) across 13 languages.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [ISBD Formal Mode — The Standard](#2-isbd-formal-mode)
3. [Trade Catalog Mode — Per-Country Conventions](#3-trade-catalog-mode)
4. [Database Field Mapping](#4-database-field-mapping)
5. [Translation Tables](#5-translation-tables)
6. [Contributor Role Translations](#6-contributor-role-translations)
7. [Cover Type & Binding Translations](#7-cover-type--binding-translations)
8. [Condition & Provenance Translations](#8-condition--provenance-translations)
9. [Implementation Notes](#9-implementation-notes)
10. [Differences Between Current Code and This Spec](#10-differences-between-current-code-and-this-spec)

---

## 1. Architecture Overview

### Two Output Modes

| Mode | Label in UI | Primary Audience | Origin Standard |
|------|-------------|-----------------|-----------------|
| **Trade Catalog** | "Trade" | Dealers, collectors, auction houses, book fairs | ILAB conventions + national trade association norms |
| **ISBD Formal** | "ISBD" | Libraries, institutional catalogs, bibliographies | IFLA ISBD Consolidated Edition (2011, updated 2021) |

### Two Output Fields in Database

```
catalog_entry        → Trade Catalog result (existing field, repurposed)
catalog_entry_isbd   → ISBD Formal result (NEW field — requires DB migration)
```

### 13 Supported Languages

| Code | Language | Flag | Trade Association | Institutional Standard |
|------|----------|------|-------------------|----------------------|
| `en` | English | 🇬🇧 | ABA (UK) / ABAA (US) | AACR2 → RDA / DCRM(B) |
| `fr` | Français | 🇫🇷 | SLAM | AFNOR Z44-074 → RDA |
| `de` | Deutsch | 🇩🇪 | VDA | RAK-WB → RDA |
| `nl` | Nederlands | 🇳🇱 | NVvA | ISBD/NL → RDA |
| `es` | Español | 🇪🇸 | AILA | Reglas de Catalogación → RDA |
| `pt` | Português | 🇵🇹 | ALAFARQ | ISBD/PT → RDA |
| `it` | Italiano | 🇮🇹 | ALAI | RICA → REICAT → RDA |
| `sv` | Svenska | 🇸🇪 | SVAF | KRS → RDA |
| `da` | Dansk | 🇩🇰 | ABF | Katalogiseringsregler → RDA |
| `no` | Norsk | 🇳🇴 | NABF | Katalogiseringsregler → RDA |
| `be-fr` | Français (Belgique) | 🇧🇪 | CLAM/BBA | AFNOR (follows France) |
| `be-nl` | Nederlands (België) | 🇧🇪 | CLAM/BBA | ISBD/NL (follows Netherlands) |
| `la` | Latina | 🏛️ | — | Traditional incunabula/antiquarian convention |

> **Note:** `be-fr` and `be-nl` share the same trade association (CLAM/BBA) but use different language labels. They follow the conventions of France and the Netherlands respectively, with minor Belgian specificities (e.g., "Stofomslag" vs "Stofwikkel").

### UI: Pop-Up Language Selector

The modal displays each option as:

```
🇬🇧  English        ABA / ABAA
🇫🇷  Français       SLAM
🇩🇪  Deutsch        VDA
🇳🇱  Nederlands     NVvA
🇪🇸  Español        AILA
🇵🇹  Português      ALAFARQ
🇮🇹  Italiano       ALAI
🇸🇪  Svenska        SVAF
🇩🇰  Dansk          ABF
🇳🇴  Norsk          NABF
🇧🇪  Belgique (FR)  CLAM/BBA
🇧🇪  België (NL)    CLAM/BBA
🏛️  Latina         —
```

Two columns of buttons: left column = Trade, right column = ISBD.
Clicking any button generates the entry in that mode + language and writes it to the corresponding database field.

---

## 2. ISBD Formal Mode

### 2.1 The Eight Areas

The ISBD Consolidated Edition (IFLA, 2011/2021) defines 8 areas for monographs. Area 0 (Content form and media type) and Area 3 (Material-specific) are typically omitted for printed monographs.

| Area | Name | ISBD Preceding Punctuation |
|------|------|---------------------------|
| 0 | Content form and media type | — (often omitted for print) |
| 1 | Title and statement of responsibility | (first area, no preceding punctuation) |
| 2 | Edition | `. — ` |
| 3 | Material or type of resource specific | `. — ` (omitted for monographs) |
| 4 | Publication, production, distribution | `. — ` |
| 5 | Physical description | `. — ` |
| 6 | Series | `. — ` |
| 7 | Notes | `. — ` |
| 8 | Resource identifier and terms of availability | `. — ` |

### 2.2 Prescribed Punctuation Rules

These are **universal** — they do not change per language.

| Symbol | Meaning | Example |
|--------|---------|---------|
| `. — ` | Separates areas (period-space-em dash-space) | `...first ed. — London : Penguin, 2005` |
| ` : ` | Precedes subtitle, publisher name | `Title : subtitle` / `London : Penguin` |
| ` / ` | Precedes first statement of responsibility | `Title / by Author` |
| ` ; ` | Separates subsequent SoR, dimensions, series number | `/ by A ; illustrated by B` |
| ` = ` | Precedes parallel title | `Title = Titre parallèle` |
| `, ` | Precedes date in Area 4, edition qualifier | `Penguin, 2005` |
| `( )` | Enclose series statement (Area 6) | `(World classics ; 42)` |
| `[ ]` | Enclose supplied/inferred information | `[London] : [s.n.], [ca. 1780]` |

### 2.3 Area 1: Title and Statement of Responsibility

**ISBD rule: Title comes FIRST.** No author precedes the title. The author appears only in the Statement of Responsibility (SoR) after a ` / `.

```
Title proper : other title information / first statement of responsibility ; subsequent SoR
```

**Rules:**
- Title is transcribed as it appears on the title page
- Subtitle preceded by ` : `
- SoR preceded by ` / `, subsequent SoR separated by ` ; `
- SoR reproduces the form on the title page — do NOT restructure into "by Author"
- If no author on title page, omit SoR entirely

**Example:**
```
A manual for writers of research papers, theses, and dissertations : Chicago style for students and researchers / Kate L. Turabian ; revised by Wayne C. Booth, Gregory G. Colomb, Joseph M. Williams
```

### 2.4 Area 2: Edition

```
. — Edition statement / statement of responsibility relating to edition
```

**Rules:**
- Transcribe as found: "2nd ed.", "Nouvelle éd. rev. et augm.", "3. Aufl."
- Do NOT normalize to a canonical form
- If impression is recorded separately, add after comma: "2nd ed., 3rd impression"

### 2.5 Area 4: Publication

```
. — Place : Publisher, Date
```

**Rules:**
- Place of publication first
- If unknown: `[S.l.]` (sine loco)
- Publisher preceded by ` : `
- If unknown: `[s.n.]` (sine nomine)
- Date preceded by `, `
- If estimated: `[ca. 1780]` or `[between 1770 and 1780]`
- Printer information (if distinct from publisher): add after period:
  `London : Penguin, 2005. Printed by Clays Ltd., St Ives`

### 2.6 Area 5: Physical Description

```
. — Extent : other physical details ; dimensions
```

**Rules:**
- **Extent** = pagination or number of volumes:
  - `xvi, 448 p.` or `2 vol. (viii, 312 ; vi, 287 p.)`
  - Use the pagination_description field if available, else construct from page_count
- **Other physical details** = illustrations info, preceded by ` : `
  - `: ill.` / `: ill. (some col.)` / `: 25 plates`
- **Dimensions** = height in cm (ISBD standard), preceded by ` ; `
  - `; 23 cm` (height only, rounded UP to nearest cm)
  - For rare books, mm is acceptable: `; 235 × 150 mm`
- **Binding** is NOT part of ISBD Area 5 — it goes in Area 7 (Notes) or Area 8

### 2.7 Area 6: Series

```
. — (Series title ; number)
```

**Rules:**
- Enclosed in parentheses
- Series number preceded by ` ; `
- Example: `(Penguin classics ; 142)`

### 2.8 Area 7: Notes

Notes area is free-form. Each note is separated by `. — ` or starts on a new line.

**Standard note order for monographs:**
1. Original title (for translations)
2. Edition/bibliographic history notes
3. Issue/state notes
4. Physical description notes (signatures, collation formula)
5. Illustrations description
6. Bibliography references
7. Provenance
8. Condition
9. Binding description (cover type, binding details)

**Example notes:**
```
Original title: Les fleurs du mal. — Bibliography: Brunet II, 1234. — 
Provenance: Bookplate of Lord X (1850–1920). — Condition: Fine. Slight 
foxing to endpapers. — Full morocco by Rivière & Son
```

### 2.9 Area 8: Resource Identifier

```
. — ISBN 978-0-226-82336-2
```

**Rules:**
- ISBN-13 preferred over ISBN-10
- OCLC, LCCN as additional identifiers
- Price/availability may follow: `ISBN 978-... : EUR 45.00`

### 2.10 Complete ISBD Example

```
A manual for writers of research papers, theses, and dissertations : 
Chicago style for students and researchers / Kate L. Turabian ; revised 
by Wayne C. Booth, Gregory G. Colomb, Joseph M. Williams. — 7th ed. — 
Chicago : University of Chicago Press, 2007. — xviii, 466 p. : ill. ; 
23 cm. — (Chicago guides to writing, editing, and publishing). — 
Includes bibliographical references (p. 409–435) and index. — 
ISBN 978-0-226-82336-2
```

---

## 3. Trade Catalog Mode

### 3.1 Universal Trade Conventions

All antiquarian trade descriptions across ILAB-affiliated countries share these conventions:

1. **Author-first** — The author's surname leads the entry (inverted: "Surname, Given names")
2. **Title from title page** — Transcribed, not normalized
3. **Publication line** — Place, Publisher, Date (minimal punctuation)
4. **Format before dimensions** — "8vo" or "In-8" comes before mm measurements
5. **Binding/Cover** — Described narratively, not coded
6. **Condition** — Grade + prose description; always present
7. **Provenance** — Described when known; adds value
8. **Bibliography references** — Cited in standard short form
9. **Punctuation** — Periods separate major sections; NO em-dashes (`. — ` is ISBD only)

### 3.2 Per-Country Specifics

#### 🇬🇧 English — ABA (UK) Convention

**Order:** Author. Title. Place, Publisher, Date. Format, collation/pagination. Binding. Condition. Notes.

**Example:**
```
DICKENS, Charles. A Tale of Two Cities. London, Chapman and Hall, 1859. 
8vo. viii, 254 pp. Original red cloth, gilt spine. Dust jacket. First 
edition, first issue. Spine slightly faded, light foxing to prelims. 
A very good copy in the scarce dust jacket. Provenance: Bookplate of 
Sir John Smith. Bibliography: Smith 42; Eckel p. 85.
```

**Rules specific to UK:**
- Author in CAPS for surname: `DICKENS, Charles`
- Format: English bibliographic terms (8vo, 4to, folio, 12mo, 16mo)
- Dimensions: mm or cm, both acceptable
- Pagination: `pp.` (pages), `ff.` (leaves), `ll.` (leaves, alternative)
- Condition grading: Fine / Near Fine / Very Good / Good / Fair / Poor
- Binding described in full prose
- "First edition" stated explicitly
- Dust jacket noted separately

#### 🇺🇸 English — ABAA (US) Convention

Virtually identical to UK ABA, with minor differences:
- "Dust wrapper" less common than "dust jacket"
- Price often in USD
- "Points" (identification markers for first editions) are more commonly detailed
- ABAA members tend toward slightly more verbose condition descriptions

#### 🇫🇷 Français — SLAM Convention

**Order:** AUTEUR. Titre. Lieu, Éditeur, Date. Format, pagination, planches. Reliure. État. Notes.

**Example:**
```
HUGO, Victor. Les Misérables. Paris, Pagnerre, 1862. 10 vol. in-8. 
Demi-maroquin rouge à coins, dos à nerfs orné de caissons dorés, tête 
dorée, couvertures et dos conservés (reliure de l'époque). Édition 
originale. Quelques rousseurs éparses, petite restauration au dos du 
tome III. Très bel exemplaire. Provenance : ex-libris du baron de X. 
Bibliographie : Vicaire IV, 322.
```

**Rules specific to France:**
- Author in CAPS for surname: `HUGO, Victor`
- Format: French terms — `in-folio`, `in-4`, `in-8`, `in-12`, `in-16`, `in-18`, `in-32`
  (NOTE: these are preceded by the number of volumes if multi-volume: `3 vol. in-8`)
- Pagination: `pp.` or `p.` — `ff.` for leaves — `n.ch.` (non chiffré = unnumbered)
- Binding terminology:
  - `Broché` = softcover/wrappers
  - `Cartonnage` = boards
  - `Demi-reliure` = half binding
  - `Plein maroquin` = full morocco
  - `Dos à nerfs` = raised bands on spine
  - `Couvertures conservées` = wrappers preserved (bound in)
  - `Reliure de l'époque` = contemporary binding
  - `Reliure postérieure` = later binding
- Condition: `État` — grading terms:
  - `Parfait état` = Fine
  - `Très bon état` = Very Good
  - `Bon état` = Good
  - `État correct` = Fair
  - `État moyen` / `État médiocre` = Poor
  - Common defects: `rousseurs` (foxing), `mouillures` (water stains), `coins émoussés` (bumped corners), `dos passé` (faded spine), `petite déchirure` (small tear), `annotations marginales` (marginal notes)
- `Édition originale` = First edition
- `Tirage de tête` = Deluxe issue
- `Exemplaire sur grand papier` = Large paper copy

#### 🇩🇪 Deutsch — VDA Convention

**Order:** VERFASSER. Titel. Ort, Verlag, Jahr. Format, Paginierung, Tafeln. Einband. Zustand. Anmerkungen.

**Example:**
```
GOETHE, Johann Wolfgang von. Faust. Der Tragödie erster Theil. Leipzig, 
Georg Joachim Göschen, 1790. 8vo. 168 S. Halblederband der Zeit mit 
Rückenschild und Rückenvergoldung. Erste Ausgabe in Buchform. Leicht 
gebräunt, vereinzelt stockfleckig, insgesamt ein sehr gutes Exemplar. 
Provenienz: Exlibris von Graf zu X. Bibliographie: Hagen 350; 
Goedeke IV/3, 126, 13.
```

**Rules specific to Germany:**
- Author in CAPS for surname
- Format: German uses same English terms (8vo, 4to, Folio) or Latin abbreviations
- Pagination: `S.` (Seiten = pages), `Bl.` (Blatt = leaf), `Bde.` (Bände = volumes), `Taf.` (Tafeln = plates)
- Binding terminology:
  - `Broschur` / `Broschiert` = softcover/wrappers
  - `Pappband` = boards
  - `Halblederband` = half leather
  - `Ganzlederband` = full leather
  - `Ganzpergament` = full vellum
  - `Leinenband` / `Leinen` = cloth
  - `Originalbroschur` = original wrappers
  - `Schutzumschlag` = dust jacket
  - `Mit Rückenschild` = with spine label
  - `Rückenvergoldung` = gilt spine
  - `Kopfgoldschnitt` = top edge gilt
- Condition: `Zustand`
  - `Sehr gut` = Very Good
  - `Gut` = Good
  - `Befriedigend` = Fair
  - Common defects: `stockfleckig` (foxed), `gebräunt` (browned), `berieben` (rubbed), `bestoßen` (bumped), `Einriss` (tear), `Feuchtigkeitsspuren` (water stains)
- `Erste Ausgabe` = First edition
- `Erstausgabe` = First edition (combined form)
- German dealers commonly reference VD16, VD17, VD18 for early German prints

#### 🇳🇱 Nederlands — NVvA Convention

**Order:** AUTEUR. Titel. Plaats, Uitgever, Jaar. Formaat, paginering, platen. Band. Conditie. Noten.

**Example:**
```
MULTATULI. Max Havelaar, of De koffij-veilingen der Nederlandsche 
Handel-Maatschappij. Amsterdam, J. de Ruyter, 1860. 8vo. [iv], 358, 
[2] p. Originele uitgeversbanden. Eerste druk. Lichte vochtvlekken in 
de marge, verder een goed exemplaar. Herkomst: Naamstempel op titelblad. 
Bibliografie: Van Hattem 1.
```

**Rules specific to Netherlands:**
- Author in CAPS for surname
- Format: same as English (8vo, 4to, folio)
- Pagination: `p.` (pagina's), `bl.` (bladen = leaves), `dl.` (delen = volumes), `pl.` (platen = plates)
- Binding terminology:
  - `Ingenaaid` / `Gebrocheerd` = softcover/wrappers
  - `Kartonnen band` = boards
  - `Half leer` / `Half marokijn` = half leather/morocco
  - `Geheel leer` / `Volledig marokijn` = full leather/morocco
  - `Perkamenten band` = vellum
  - `Linnen band` = cloth
  - `Originele uitgeversbanden` = original publisher's binding
  - `Stofomslag` = dust jacket
- Condition: `Conditie` or `Staat`
  - `Uitstekend` = Fine
  - `Zeer goed` = Very Good
  - `Goed` = Good
  - `Redelijk` = Fair
  - Common defects: `vochtvlekken` (water stains), `roestvlekjes` / `foxing` (foxing), `gescheurd` (torn), `gerestaureerd` (restored), `gebonden` (rebound)
- `Eerste druk` = First edition
- `Eerste uitgave` = First edition (alternative)

#### 🇪🇸 Español — AILA Convention

**Order:** AUTOR. Título. Lugar, Editor, Año. Formato, paginación, láminas. Encuadernación. Estado. Notas.

**Example:**
```
CERVANTES SAAVEDRA, Miguel de. El ingenioso hidalgo Don Quixote de la 
Mancha. Madrid, Juan de la Cuesta, 1605. 4to. [viii], 316, [2] ff. 
Pergamino de la época con título manuscrito en el lomo. Primera edición. 
Algunas manchas de humedad, pequeños defectos en la encuadernación. 
Buen ejemplar. Procedencia: ex-libris del Marqués de X. Bibliografía: 
Palau 51543.
```

**Rules specific to Spain:**
- Author in CAPS for surname
- Format: `folio`, `4to` / `4º`, `8vo` / `8º`, `12mo` / `12º`, `16mo` / `16º`
- Pagination: `pp.` / `p.` (páginas), `h.` / `ff.` (hojas = leaves), `vols.` (volúmenes), `láms.` (láminas = plates)
- Binding terminology:
  - `Rústica` = softcover/wrappers
  - `Cartoné` = boards
  - `Media piel` / `Media pasta` = half leather
  - `Plena piel` / `Pasta` = full leather
  - `Pergamino` = vellum
  - `Tela` = cloth
  - `Sobrecubierta` = dust jacket
  - `Encuadernación de la época` = contemporary binding
  - `Encuadernación posterior` = later binding
- Condition: `Estado` / `Estado de conservación`
  - `Perfecto` / `Impecable` = Fine
  - `Muy bien` / `Muy bueno` = Very Good
  - `Bien` / `Bueno` = Good
  - `Aceptable` = Fair
  - Common defects: `manchas de humedad` (water stains), `foxing` (foxing — English term commonly used), `desgaste` (wear), `lomo restaurado` (restored spine)
- `Primera edición` = First edition
- Palau (the great Spanish bibliography) is almost always referenced

#### 🇵🇹 Português — ALAFARQ Convention

**Order:** AUTOR. Título. Local, Editor, Ano. Formato, paginação, estampas. Encadernação. Estado. Notas.

**Example:**
```
CAMÕES, Luís de. Os Lusíadas. Lisboa, António Gonçalves, 1572. 4to. 
[iv], 183 ff. Encadernação inteira em pele da época. Primeira edição. 
Algumas manchas de humidade, margens aparadas. Bom exemplar. 
Proveniência: ex-libris do Conde de X. Bibliografia: Anselmo 744.
```

**Rules specific to Portugal:**
- Very similar to Spanish conventions
- Format: same terms
- Pagination: `pp.` / `p.` (páginas), `ff.` (fólios = leaves), `vols.` (volumes), `ests.` (estampas = plates)
- Binding:
  - `Brochura` = softcover/wrappers
  - `Cartonagem` = boards
  - `Meia encadernação` = half binding
  - `Encadernação inteira` = full binding
  - `Pergaminho` = vellum
  - `Tela` = cloth
  - `Sobrecapa` = dust jacket
- Condition: `Estado`
  - `Óptimo` / `Excelente` = Fine
  - `Muito bom` = Very Good
  - `Bom` = Good
  - `Regular` = Fair
  - Common defects: `manchas de humidade` (water stains), `foxing`, `lombada restaurada` (restored spine)
- `Primeira edição` = First edition

#### 🇮🇹 Italiano — ALAI Convention

**Order:** AUTORE. Titolo. Luogo, Editore, Anno. Formato, paginazione, tavole. Legatura. Condizioni. Note.

**Example:**
```
DANTE ALIGHIERI. La Divina Commedia. Venezia, Aldus Manutius, 1502. 
8vo. 232 cc. Legatura coeva in pergamena rigida con titolo manoscritto 
al dorso. Prima edizione aldina. Lievi fioriture sparse, piccolo 
restauro alla cuffia superiore. Bell'esemplare. Provenienza: ex-libris 
di casa X. Bibliografia: Renouard, p. 43, n. 5; EDIT16 CNCE 14949.
```

**Rules specific to Italy:**
- Author in CAPS for surname
- Format: `in-folio`, `in-4to` / `in-4°`, `in-8vo` / `in-8°`, `in-12mo` / `in-12°`, `in-16mo`
  (Italian dealers use both Latin/English terms and French-style "in-" forms)
- Pagination: `pp.` (pagine), `cc.` (carte = leaves), `voll.` (volumi), `tavv.` (tavole = plates), `nn.` (non numerate = unnumbered)
- Binding terminology:
  - `Brossura` = softcover/wrappers
  - `Cartonato` = boards
  - `Mezza pelle` / `Mezza legatura` = half leather
  - `Piena pelle` = full leather
  - `Marocchino` = morocco
  - `Pergamena` = vellum
  - `Tela` = cloth
  - `Sovraccoperta` = dust jacket
  - `Legatura coeva` / `dell'epoca` = contemporary binding
  - `Legatura posteriore` = later binding
- Condition: `Condizioni` / `Stato di conservazione`
  - `Ottimo` = Fine
  - `Molto buono` = Very Good
  - `Buono` = Good
  - `Discreto` = Fair
  - Common defects: `fioriture` (foxing), `macchie d'umidità` (water stains), `dorso restaurato` (restored spine), `leggere bruniture` (light browning), `gore` (water stains)
- `Prima edizione` = First edition
- `Edizione originale` = First/original edition
- Italian dealers heavily reference EDIT16, ICCU, SBN, Gamba

#### 🇸🇪 Svenska — SVAF Convention

**Order:** FÖRFATTARE. Titel. Ort, Förlag, År. Format, paginering, plancher. Band. Skick. Anmärkningar.

**Example:**
```
STRINDBERG, August. Röda rummet. Stockholm, Jos. Seligmann, 1879. 8vo. 
[iv], 374, [2] s. Halvfranskt band med guldpräglad rygg. Första 
upplagan. Något foxing, i övrigt ett gott exemplar. Proveniens: 
Namnstämpel på titelsidan.
```

**Rules specific to Sweden:**
- Format: 8vo, 4to, folio (Latin terms)
- Pagination: `s.` (sidor = pages), `bl.` (blad = leaves), `bd.` (band = volumes), `pl.` (plancher = plates)
- Binding: `Häftad` (wrappers), `Halvfranskt band` (half morocco), `Helfranskt band` (full morocco), `Klotband` (cloth), `Pergamentband` (vellum), `Skyddsomslag` (dust jacket)
- Condition: `Skick` — `Fint` (Fine), `Mycket gott` (Very Good), `Gott` (Good), `Acceptabelt` (Fair)
- `Första upplagan` = First edition

#### 🇩🇰 Dansk — ABF Convention

**Order:** FORFATTER. Titel. Sted, Forlag, År. Format, paginering, plancer. Bind. Tilstand. Bemærkninger.

**Example:**
```
KIERKEGAARD, Søren. Enten – Eller. København, C. A. Reitzel, 1843. 
8vo. 2 bd. (xii, 454; viii, 368 s.). Originale halvlæderbind. Første 
udgave. Lidt foxing, ellers et godt eksemplar.
```

**Rules specific to Denmark:**
- Format: 8vo, 4to, folio
- Pagination: `s.` (sider = pages), `bl.` (blade = leaves), `bd.` (bind = volumes), `pl.` (plancer = plates)
- Binding: `Hæftet` (wrappers), `Halvlæderbind` (half leather), `Hellæderbind` (full leather), `Shirting-` / `Lærredsbind` (cloth), `Pergamentbind` (vellum), `Smudsomslag` (dust jacket)
- Condition: `Tilstand` — `Fint` (Fine), `Meget godt` (Very Good), `Godt` (Good), `Acceptabelt` (Fair)
- `Første udgave` = First edition

#### 🇳🇴 Norsk — NABF Convention

**Order:** FORFATTER. Tittel. Sted, Forlag, År. Format, paginering, plansjer. Bind. Tilstand. Merknader.

**Example:**
```
IBSEN, Henrik. Et dukkehjem. København, Gyldendalske Boghandels Forlag, 
1879. 8vo. 136 s. Originalt forlagsbind. Første utgave. Noe foxing, 
ellers et godt eksemplar.
```

**Rules specific to Norway:**
- Very similar to Danish (languages closely related)
- Format: 8vo, 4to, folio
- Pagination: `s.` (sider), `bl.` (blad), `bd.` (bind), `pl.` (plansjer)
- Binding: `Heftet` (wrappers), `Halvskinnbind` (half leather), `Helskinnbind` (full leather), `Sjirtingbind` / `Lerretsbind` (cloth), `Pergamentbind` (vellum), `Smussomslag` (dust jacket)
- Condition: `Tilstand` — `Fint` (Fine), `Meget godt` (Very Good), `Godt` (Good), `Akseptabelt` (Fair)
- `Første utgave` = First edition

#### 🇧🇪 Belgique/België — CLAM/BBA Convention

Belgian entries follow the conventions of France (FR) or Netherlands (NL) depending on the dealer's language. CLAM/BBA does not impose a distinct format beyond ILAB ethics.

- `be-fr`: Uses SLAM (French) conventions exactly
- `be-nl`: Uses NVvA (Dutch) conventions exactly, with minor vocabulary preferences:
  - "Stofomslag" (preferred over "stofwikkel")
  - Belgian dealers may reference Belgian institutional catalogs (KBR, etc.)

#### 🏛️ Latina — Traditional Convention

Used for incunabula, early printed books, and scholarly antiquarian catalogs.

**Example:**
```
CICERO, Marcus Tullius. De officiis. Moguntiae [Mainz], Johannes Fust 
et Petrus Schoeffer, 1465. Fol. [88] ff. Lit. goth. Typ. 2:114G. 
Rub. Lig. saec. XV in corio supra asseres. Exemplar pulchrum, paucis 
maculis. Prov.: Inscriptio saec. XVI in f. 1r. GW 6921; HC 5238*; 
BMC I, 22; Goff C-571.
```

**Rules specific to Latin:**
- Author in nominative: `CICERO, Marcus Tullius`
- Place names in Latin: `Moguntiae` (Mainz), `Venetiis` (Venice), `Parisiis` (Paris), `Londini` (London), `Coloniae` (Cologne), `Basileae` (Basel), `Romae` (Rome), `Lugduni` (Lyon), `Lugduni Batavorum` (Leiden), `Amstelodami` (Amsterdam)
- Format: `Fol.` / `4to` / `8vo` (Latin abbreviations)
- Pagination: `ff.` (folia), `pp.` (paginae), `coll.` (columnae = columns)
- Binding:
  - `Lig.` (ligatura = binding)
  - `in corio` = in leather
  - `in pergamena` = in vellum
  - `supra asseres` = over wooden boards
  - `saec. XV` = 15th century
- Condition: Prose in Latin:
  - `Exemplar pulchrum` = Fine copy
  - `Exemplar bonum` = Good copy
  - `Maculae` = stains
  - `Madore affectum` = water-damaged
- Abbreviations:
  - `Lit. goth.` = Gothic type
  - `Typ.` = typeface identification
  - `Rub.` = rubricated
  - `Init.` = with initials
  - `Prov.` = provenance
- Reference works: GW, HC, Hain, BMC, Goff, ISTC, IGI, Polain, Proctor

### 3.3 Key Differences: Trade vs ISBD (Summary)

| Element | Trade | ISBD |
|---------|-------|------|
| **Author position** | FIRST (inverted, caps) | After title in SoR |
| **Area separator** | Period (`. `) | Period-space-em-dash-space (`. — `) |
| **Format position** | Before pagination | Not in Area 5 (in notes if at all) |
| **Dimensions** | mm or cm, after format | cm only, in Area 5 after ` ; ` |
| **Binding** | Inline, after physical | In Notes (Area 7) |
| **Condition** | Inline, prominent | In Notes (Area 7) |
| **Provenance** | Inline, with evidence type | In Notes (Area 7) |
| **First edition** | Stated explicitly | In Notes (Area 7) |
| **Author format** | SURNAME, Given (caps) | As on title page |
| **Language of labels** | Matches output language | Matches output language |

---

## 4. Database Field Mapping

### 4.1 Fields Currently Used in Catalog Generator

| DB Field | Currently Used? | ISBD Area | Trade Section |
|----------|----------------|-----------|---------------|
| `title` | ✅ Yes | Area 1 | Title |
| `subtitle` | ✅ Yes | Area 1 | Title |
| `original_title` | ✅ Yes | Area 7 | Notes |
| `series` | ✅ Yes | Area 6 | Series |
| `series_number` | ✅ Yes | Area 6 | Series |
| `publisher_name` | ✅ Yes | Area 4 | Publication |
| `publication_place` | ✅ Yes | Area 4 | Publication |
| `publication_year` | ✅ Yes | Area 4 | Publication |
| `printer` | ✅ Yes | Area 4 | Publication (trade: notes) |
| `printing_place` | ✅ Yes | Area 4 | Publication (trade: notes) |
| `edition` | ✅ Yes | Area 2 | Edition |
| `impression` | ✅ Yes | Area 2 | Edition |
| `issue_state` | ✅ Yes | Area 7 | Notes |
| `edition_notes` | ✅ Yes | Area 7 | Notes |
| `pagination_description` | ✅ Yes | Area 5 | Physical |
| `page_count` | ✅ Yes | Area 5 | Physical (fallback) |
| `volumes` | ✅ Yes | Area 5 | Physical |
| `height_mm` | ✅ Yes | Area 5 | Physical |
| `width_mm` | ✅ Yes | Area 5 | Physical |
| `cover_type` | ✅ Yes | Area 7 | Binding |
| `binding_id` → `binding_name` | ✅ Partial | Area 7 | Binding |
| `format_id` → `format_name/abbreviation` | ✅ Yes | Area 5 | Physical (format) |
| `has_dust_jacket` | ✅ Yes | Area 7 | Binding |
| `is_signed` | ✅ Yes | Area 7 | Notes |
| `condition_id` → `condition_name` | ✅ Yes | Area 7 | Condition |
| `condition_notes` | ✅ Yes | Area 7 | Condition |
| `bibliography` | ✅ Yes | Area 7 | Bibliography |
| `illustrations_description` | ✅ Yes | Area 7 | Physical/Notes |
| `signatures_description` | ✅ Yes | Area 7 | Physical/Notes |
| `isbn_13` | ✅ Yes | Area 8 | Identifiers |
| `isbn_10` | ✅ Yes | Area 8 | Identifiers |
| `oclc_number` | ✅ Yes | Area 8 | Identifiers |
| `lccn` | ✅ Yes | Area 8 | Identifiers |
| `contributors` (join) | ✅ Yes | Area 1 SoR | Author + Contributors |
| `provenance_entries` (join) | ✅ Yes | Area 7 | Provenance |

### 4.2 Fields NOT Currently Used But SHOULD Be

| DB Field | Why It Matters | ISBD Area | Trade Section |
|----------|---------------|-----------|---------------|
| `language_id` → language name | ISBD requires language note for non-dominant language works | Area 7 | Notes (trade: optional) |
| `original_language_id` | Needed for "Translated from [language]" note | Area 7 | Notes |
| `illustrations` | Boolean/enum — "with illustrations" vs detailed description | Area 5 | Physical |
| `depth_mm` | Rare but useful for large/unusual formats | Area 5 | Physical (optional) |
| `weight_g` / `weight_grams` | Not in catalogs, but useful for shipping descriptions | — | — |
| `colophon_text` | Important for early printed books — transcription adds scholarly value | Area 7 | Notes |
| `dedication_text` | "With printed dedication to..." adds trade value | Area 7 | Notes |
| `paper_type` | Describes the paper (laid, wove, Japan, India, etc.) — essential for fine printing | Area 5/7 | Physical/Notes |
| `edge_treatment` | Gilt edges, marbled edges, deckle — part of physical description | Area 5/7 | Physical |
| `endpapers_type` | Marbled endpapers, maps on endpapers — part of description | Area 7 | Notes |
| `text_block_condition` | Tight, shaken, broken — essential structural info | Area 7 | Condition |
| `dust_jacket_condition_id` | Separate DJ grading — standard in trade | Area 7 | Condition |
| `protective_enclosure` | Slipcase, clamshell box — adds to physical description | Area 7 | Physical/Notes |
| `signature_details` | Extra signing details beyond boolean is_signed | Area 7 | Notes |
| `user_catalog_id` | Dealer's own catalog number — important for trade entries | — | Header |
| `ddc` / `lcc` / `udc` | Classification — ISBD only, in Area 8 | Area 8 | — |
| `bisac_code` (×3) | Subject classification — not in catalog entry | — | — |
| `topic` | Free-text subject — could go in ISBD Area 7 | Area 7 | — |
| `summary` | Abstract/description — not in catalog but useful context | — | — |
| `sales_price` / `price_currency` | ISBD Area 8 allows price; trade always states price separately | Area 8 | — (separate) |

### 4.3 Fields That Should NOT Appear in Catalog Entry

These are internal/administrative fields:

| DB Field | Reason for Exclusion |
|----------|---------------------|
| `id`, `user_id`, `created_at`, `updated_at` | Internal |
| `filemaker_id` | Migration artifact |
| `status` | Internal (in_collection, sold, etc.) |
| `action_needed` | Internal workflow |
| `cover_image_url`, `cover_thumb_url` | Not text |
| `location_id`, `storage_location`, `shelf`, `shelf_section`, `storage_shelf` | Internal location |
| `purchase_source` | Private business info |
| `internal_notes`, `private_notes` | Private |
| `collection_id` | Internal organization |
| `height_cm`, `width_cm` | Redundant with mm fields |
| `place_printed` | Redundant with `printing_place` |
| `publisher_id`, `printer_id`, `binding_id`, `format_id`, `condition_id`, `language_id`, `original_language_id`, `dust_jacket_condition_id` | FK IDs — use resolved names |

### 4.4 Newly Used Fields (Implementation Checklist)

These fields exist in the DB but the current `generateCatalogEntry()` function does NOT read them. They must be added to the `BookData` type and passed through:

1. `language_id` → resolve to language name_en (and native name)
2. `original_language_id` → resolve to language name
3. `illustrations` (enum/boolean)
4. `colophon_text`
5. `dedication_text`
6. `paper_type`
7. `edge_treatment`
8. `endpapers_type`
9. `text_block_condition`
10. `dust_jacket_condition_id` → resolve to condition name
11. `protective_enclosure`
12. `signature_details`
13. `user_catalog_id`
14. `depth_mm`
15. `ddc`, `lcc`, `udc` (ISBD mode only)

---

## 5. Translation Tables

### 5.1 Fixed Labels

| Key | EN | FR | DE | NL | ES | PT | IT | SV | DA | NO | LA |
|-----|----|----|----|----|----|----|----|----|----|----|-----|
| bibliography | Bibliography | Bibliographie | Bibliographie | Bibliografie | Bibliografía | Bibliografia | Bibliografia | Bibliografi | Bibliografi | Bibliografi | Bibl. |
| provenance | Provenance | Provenance | Provenienz | Herkomst | Procedencia | Proveniência | Provenienza | Proveniens | Proveniens | Proveniens | Prov. |
| condition | Condition | État | Zustand | Conditie | Estado | Estado | Condizioni | Skick | Tilstand | Tilstand | Stat. |
| illustrations | Illustrations | Illustrations | Illustrationen | Illustraties | Ilustraciones | Ilustrações | Illustrazioni | Illustrationer | Illustrationer | Illustrasjoner | Ill. |
| signatures | Signatures | Signatures | Signaturen | Signaturen | Signaturas | Signaturas | Segnature | Signaturer | Signaturer | Signaturer | Sign. |
| original_title | Original title | Titre original | Originaltitel | Oorspronkelijke titel | Título original | Título original | Titolo originale | Originaltitel | Originaltitel | Originaltittel | Tit. orig. |
| first_edition | First edition | Édition originale | Erste Ausgabe | Eerste druk | Primera edición | Primeira edição | Prima edizione | Första upplagan | Første udgave | Første utgave | Ed. pr. |
| printed_by | Printed by | Imprimé par | Gedruckt von | Gedrukt door | Impreso por | Impresso por | Stampato da | Tryckt av | Trykt af | Trykt av | Typis |
| signed | Signed | Signé | Signiert | Gesigneerd | Firmado | Assinado | Firmato | Signerad | Signeret | Signert | Manu subscr. |
| dust_jacket | In dust jacket | Sous jaquette | Mit Schutzumschlag | Met stofomslag | Con sobrecubierta | Com sobrecapa | Con sovraccoperta | Med skyddsomslag | Med smudsomslag | Med smussomslag | — |
| dedication | Dedication | Dédicace | Widmung | Opdracht | Dedicatoria | Dedicatória | Dedica | Dedikation | Dedikation | Dedikasjon | Dedic. |
| colophon | Colophon | Colophon | Kolophon | Colofon | Colofón | Cólofon | Colophon | Kolofon | Kolofon | Kolofon | Coloph. |
| paper | Paper | Papier | Papier | Papier | Papel | Papel | Carta | Papper | Papir | Papir | Charta |
| edges | Edges | Tranches | Schnitt | Snede | Cortes | Cortes | Tagli | Snitt | Snit | Snitt | Marg. |
| endpapers | Endpapers | Gardes | Vorsätze | Schutbladen | Guardas | Guardas | Controguardie | Försättsblad | Forsatsblad | Forsatsblad | — |
| text_block | Text block | Corps d'ouvrage | Buchblock | Boekblok | Cuerpo del libro | Corpo do livro | Corpo del libro | Bokblock | Bogblok | Bokblokk | — |
| enclosure | Protective enclosure | Étui | Schuber | Foedraal | Estuche | Estojo | Custodia | Kassett | Kassette | Kassett | Theca |
| binding | Binding | Reliure | Einband | Band | Encuadernación | Encadernação | Legatura | Band | Bind | Bind | Lig. |

### 5.2 Abbreviations for Physical Description

| Key | EN | FR | DE | NL | ES | PT | IT | SV | DA | NO | LA |
|-----|----|----|----|----|----|----|----|----|----|----|-----|
| pages | p. | p. | S. | p. | p. | p. | pp. | s. | s. | s. | pp. |
| leaves | ff. | ff. | Bl. | bl. | h. | ff. | cc. | bl. | bl. | bl. | ff. |
| volumes | vol. | vol. | Bd. | dl. | vol. | vol. | vol. | bd. | bd. | bd. | vol. |
| plates | pl. | pl. | Taf. | pl. | láms. | ests. | tavv. | pl. | pl. | pl. | tab. |
| illustrations_abbr | ill. | ill. | Ill. | ill. | il. | il. | ill. | ill. | ill. | ill. | fig. |
| columns | col. | col. | Sp. | kol. | col. | col. | coll. | kol. | kol. | kol. | coll. |
| unnumbered | n.p. | n.ch. | ungez. | ongep. | s.p. | s.p. | n.n. | onr. | upag. | upag. | s.n. |

---

## 6. Contributor Role Translations

### 6.1 Statement of Responsibility Phrasing (Trade Mode)

In trade mode, contributors are listed after the title using phrasing natural to each language.

| Role | EN | FR | DE | NL |
|------|----|----|----|----|
| Author | by | par | von | door |
| Co-author | , co-author | , co-auteur | , Mitautor | , co-auteur |
| Editor | edited by | sous la direction de | herausgegeben von | onder redactie van |
| Translator | translated by | traduit par | übersetzt von | vertaald door |
| Illustrator | illustrated by | illustré par | illustriert von | geïllustreerd door |
| Photographer | photographs by | photographies de | Fotografien von | foto's door |
| Cover designer | cover by | couverture de | Umschlag von | omslagontwerp door |
| Engraver | engraved by | gravé par | gestochen von | gegraveerd door |
| Woodcutter | woodcuts by | bois gravés par | Holzschnitte von | houtsneden door |
| Etcher | etchings by | eaux-fortes de | Radierungen von | etsen door |
| Lithographer | lithographs by | lithographies de | Lithographien von | litho's door |
| Calligrapher | calligraphy by | calligraphie de | Kalligraphie von | kalligrafie door |
| Cartographer | maps by | cartes de | Karten von | kaarten door |
| Writer of foreword | foreword by | préface de | Geleitwort von | voorwoord door |
| Writer of introduction | introduction by | introduction de | Einleitung von | inleiding door |
| Writer of preface | preface by | avant-propos de | Vorwort von | ten geleide door |
| Writer of afterword | afterword by | postface de | Nachwort von | nawoord door |

| Role | ES | PT | IT | SV | DA | NO | LA |
|------|----|----|----|----|----|----|-----|
| Author | por | por | di | av | af | av | auct. |
| Co-author | , coautor | , co-autor | , coautore | , medförfattare | , medforfatter | , medforfatter | — |
| Editor | edición de | edição de | a cura di | redigerad av | redigeret af | redigert av | ed. |
| Translator | traducido por | traduzido por | tradotto da | översatt av | oversat af | oversatt av | interpr. |
| Illustrator | ilustrado por | ilustrado por | illustrato da | illustrerad av | illustreret af | illustrert av | pinx. |
| Photographer | fotografías de | fotografias de | fotografie di | fotografier av | fotografier af | fotografier av | — |
| Cover designer | cubierta de | capa de | copertina di | omslag av | omslag af | omslag av | — |
| Engraver | grabado por | gravado por | inciso da | graverad av | graveret af | gravert av | sculps. |
| Woodcutter | xilografías de | xilogravuras de | xilografie di | träsnitt av | træsnit af | tresnitt av | sculps. |
| Etcher | aguafuertes de | águas-fortes de | acqueforti di | etsningar av | raderinger af | raderinger av | sculps. |
| Lithographer | litografías de | litografias de | litografie di | litografier av | litografier af | litografier av | — |
| Calligrapher | caligrafía de | caligrafia de | calligrafia di | kalligrafi av | kalligrafi af | kalligrafi av | scrips. |
| Cartographer | mapas de | mapas de | carte di | kartor av | kort af | kart av | — |
| Writer of foreword | prólogo de | prefácio de | premessa di | förord av | forord af | forord av | praef. |
| Writer of introduction | introducción de | introdução de | introduzione di | inledning av | indledning af | innledning av | introd. |
| Writer of preface | prefacio de | prefácio de | prefazione di | företal av | forord af | forord av | praef. |
| Writer of afterword | epílogo de | posfácio de | postfazione di | efterord av | efterskrift af | etterord av | — |

---

## 7. Cover Type & Binding Translations

### 7.1 Main Cover Types (49 types in database)

The database has 49 cover_type values. Below are translations for ALL of them.

**Softcover/Wrappers group:**

| Value | EN | FR | DE | NL | ES | PT | IT | SV | DA | NO | LA |
|-------|----|----|----|----|----|----|----|----|----|----|-----|
| `softcover` | Softcover | Broché | Broschur | Softcover | Rústica | Brochura | Brossura | Häftad | Hæftet | Heftet | — |
| `softcover_dj` | Softcover, dust jacket | Broché, jaquette | Broschur, Schutzumschlag | Softcover, stofomslag | Rústica, sobrecubierta | Brochura, sobrecapa | Brossura, sovraccoperta | Häftad, skyddsomslag | Hæftet, smudsomslag | Heftet, smussomslag | — |
| `original_wraps` | Original wrappers | Couverture d'éditeur | Originalbroschur | Originele omslag | Cubiertas originales | Brochura original | Brossura editoriale | Originalhäfte | Originalt omslag | Originalt omslag | Lig. orig. |
| `printed_wrappers` | Printed wrappers | Couverture imprimée | Bedruckter Umschlag | Bedrukte omslag | Cubiertas impresas | Capas impressas | Copertina stampata | Tryckta omslag | Trykt omslag | Trykt omslag | — |
| `stiff_wraps` | Stiff wrappers | Cartonnage souple | Steifbroschur | Stijve omslag | Cubiertas rígidas | Brochura rígida | Brossura rigida | Styvt omslag | Stift omslag | Stivt omslag | — |

**Hardcover group:**

| Value | EN | FR | DE | NL | ES | PT | IT |
|-------|----|----|----|----|----|----|-----|
| `hardcover` | Hardcover | Relié | Gebunden | Hardcover | Cartoné | Capa dura | Cartonato |
| `hardcover_dj` | Hardcover, dust jacket | Relié, jaquette | Gebunden, Schutzumschlag | Hardcover, stofomslag | Cartoné, sobrecubierta | Capa dura, sobrecapa | Cartonato, sovraccoperta |
| `cardboard_covers` | Cardboard covers | Cartonnage | Pappband | Kartonnen band | Cartoné | Cartonagem | Cartonato |
| `paper_boards` | Paper boards | Cartonnage papier | Pappband, Papierüberzug | Papieren platten | Tapas de papel | Capas de papel | Cartone ricoperto |
| `library_binding` | Library binding | Reliure de bibliothèque | Bibliothekseinband | Bibliotheekband | Encuadernación de biblioteca | Encadernação de biblioteca | Legatura da biblioteca |

**Full binding group (material_hardcover / material_softcover):**

For each material (leather, calf, vellum, morocco, faux leather, cloth, buckram, linen, silk, canvas, moiré), there are hardcover and softcover variants. The pattern is:

| Material | EN (hard) | FR (hard) | DE (hard) | NL (hard) | ES | PT | IT |
|----------|-----------|-----------|-----------|-----------|----|----|-----|
| leather | Full leather | Plein cuir | Ganzleder | Volledig leer | Plena piel | Pele inteira | Piena pelle |
| calf | Full calf | Plein veau | Ganzkalbleder | Volledig kalfsleer | Plena becerra | Bezerro inteiro | Piena vitella |
| vellum | Full vellum | Plein vélin | Ganzpergament | Volledig perkament | Pleno pergamino | Pergaminho inteiro | Piena pergamena |
| morocco | Full morocco | Plein maroquin | Ganzmaroquin | Volledig marokijn | Pleno marroquín | Marroquim inteiro | Pieno marocchino |
| faux leather | Full faux leather | Pleine simili-cuir | Ganzkunstleder | Volledig kunstleer | Plena imitación piel | Imitação pele inteira | Piena finta pelle |
| cloth | Cloth | Toile | Leinen | Linnen | Tela | Tela | Tela |
| buckram | Buckram | Bougran | Buckram | Buckram | Buckram | Buckram | Buckram |
| linen | Linen | Lin | Leinen | Linnen | Lino | Linho | Lino |
| silk | Silk | Soie | Seide | Zijde | Seda | Seda | Seta |
| canvas | Canvas | Toile | Segeltuch | Canvas | Lona | Lona | Tela grezza |
| moiré | Moiré | Moiré | Moiré | Moiré | Muaré | Moiré | Moiré |

For softcover variants, prepend "Limp" / "souple" / "flexibel" / "slap" etc.

**Partial binding group (quarter, half, three-quarter × material_sides):**

| Pattern | EN | FR | DE | NL | ES | PT | IT |
|---------|----|----|----|----|----|----|-----|
| quarter_leather_paper | Quarter leather | Quart de cuir | Viertelleder | Kwart leer | Cuarto de piel | Quarto de pele | Quarto di pelle |
| quarter_leather_cloth | Quarter leather, cloth sides | Quart de cuir, plats toile | Viertelleder, Leinenbezug | Kwart leer, linnen platten | Cuarto de piel, tapas tela | Quarto de pele, pastas tela | Quarto di pelle, piatti tela |
| half_leather_paper | Half leather | Demi-cuir | Halbleder | Half leer | Media piel | Meia encadernação | Mezza pelle |
| half_leather_cloth | Half leather, cloth sides | Demi-cuir, plats toile | Halbleder, Leinenbezug | Half leer, linnen platten | Media piel, tapas tela | Meia pele, pastas tela | Mezza pelle, piatti tela |
| three_quarter_leather_paper | Three-quarter leather | Trois-quarts cuir | Dreiviertel-Leder | Driekwart leer | Tres cuartos piel | Três quartos pele | Tre quarti pelle |
| three_quarter_leather_cloth | Three-quarter leather, cloth | Trois-quarts cuir, toile | Dreiviertel-Leder, Leinen | Driekwart leer, linnen | Tres cuartos piel, tela | Três quartos pele, tela | Tre quarti pelle, tela |

The same pattern applies for faux leather and cloth variants with paper/cloth sides.

**Limp bindings:**

| Value | EN | FR | DE | NL | ES | PT | IT |
|-------|----|----|----|----|----|----|-----|
| `limp_leather` | Limp leather | Cuir souple | Flexibler Ledereinband | Slap leer | Piel flexible | Pele flexível | Pelle floscia |
| `limp_vellum` | Limp vellum | Vélin souple | Pergamenteinband | Slap perkament | Pergamino flexible | Pergaminho flexível | Pergamena floscia |

### 7.2 Scandinavian Binding Translations (SV, DA, NO)

| Value | SV | DA | NO |
|-------|----|----|-----|
| softcover | Häftad | Hæftet | Heftet |
| hardcover | Klotband / Inbunden | Indbundet | Innbundet |
| full_leather | Helskinnband | Helskindbind | Helskinnbind |
| full_calf | Helkalvskinnband | Helkalvskindbind | Helkalvskinnbind |
| full_vellum | Pergamentband | Pergamentbind | Pergamentbind |
| full_morocco | Helfranskt band | Helfranskt bind | Helfranskt bind |
| full_cloth | Klotband | Shirting-/Lærredsbind | Sjirtingbind/Lerretsbind |
| half_leather | Halvskinnband | Halvskindbind | Halvskinnbind |
| quarter_leather | Kvartskinnband | Kvartskindbind | Kvartskinnbind |
| limp_vellum | Mjukt pergamentband | Blødt pergamentbind | Mykt pergamentbind |
| dust_jacket | Skyddsomslag | Smudsomslag | Smussomslag |

---

## 8. Condition & Provenance Translations

### 8.1 Condition Grade Labels

Condition grades from the `conditions` table have English names. Trade entries use translated terms:

| EN Grade | FR | DE | NL | ES | PT | IT | SV | DA | NO |
|----------|----|----|----|----|----|----|----|----|-----|
| As New | Comme neuf | Wie neu | Als nieuw | Como nuevo | Como novo | Come nuovo | Som ny | Som ny | Som ny |
| Fine | Parfait état | Sehr gut | Uitstekend | Perfecto | Óptimo | Ottimo | Fint | Fint | Fint |
| Near Fine | Presque parfait | Fast sehr gut | Bijna uitstekend | Casi perfecto | Quase óptimo | Quasi ottimo | Nästan fint | Næsten fint | Nesten fint |
| Very Good | Très bon | Sehr gut erhalten | Zeer goed | Muy bueno | Muito bom | Molto buono | Mycket gott | Meget godt | Meget godt |
| Good | Bon | Gut | Goed | Bueno | Bom | Buono | Gott | Godt | Godt |
| Fair | État correct | Befriedigend | Redelijk | Aceptable | Regular | Discreto | Acceptabelt | Acceptabelt | Akseptabelt |
| Poor | Médiocre | Mangelhaft | Matig | Deficiente | Mau | Mediocre | Dåligt | Dårligt | Dårlig |

### 8.2 Dust Jacket Condition

Same grading table applies. In trade entries, DJ condition is noted separately:

- EN: "Dust jacket: Very Good. Price-clipped, small tear at head."
- FR: "Jaquette : Très bon. Prix coupé, petite déchirure en tête."
- DE: "Schutzumschlag: Sehr gut. Preis abgeschnitten, kleiner Einriss am Kapital."

### 8.3 Text Block Condition Labels

| Value | EN | FR | DE | NL | ES | PT | IT |
|-------|----|----|----|----|----|----|-----|
| tight | Tight | Solide | Fest | Stevig | Firme | Firme | Saldo |
| solid | Solid | Solide | Fest | Solide | Sólido | Sólido | Solido |
| sound | Sound | Bon | Gut | Goed | Sano | Bom | Buono |
| tender | Tender | Fragile | Empfindlich | Fragiel | Frágil | Frágil | Fragile |
| shaken | Shaken | Mou | Gelockert | Los | Flojo | Frouxo | Allentato |
| loose | Loose | Déboîté | Lose | Los | Suelto | Solto | Staccato |
| detached | Detached | Détaché | Abgelöst | Losgeraakt | Desprendido | Destacado | Staccato |
| broken | Broken | Cassé | Gebrochen | Gebroken | Roto | Partido | Rotto |
| recased | Recased | Remboîté | Neu eingehängt | Opnieuw ingehangen | Reencuadernado | Reencadernado | Rinfoderato |
| rebacked | Rebacked | Redossé | Neuer Rücken | Nieuwe rug | Lomo restaurado | Lombada restaurada | Dorso rifatto |
| rebound | Rebound | Relié à neuf | Neu gebunden | Opnieuw gebonden | Reencuadernado | Reencadernado | Rilegato |

### 8.4 Provenance Evidence Types

| Value | EN | FR | DE | NL | ES | PT | IT |
|-------|----|----|----|----|----|----|-----|
| bookplate | Bookplate | Ex-libris | Exlibris | Exlibris | Ex-libris | Ex-libris | Ex-libris |
| inscription | Inscription | Inscription | Widmung | Inscriptie | Inscripción | Inscrição | Iscrizione |
| stamp | Stamp | Cachet | Stempel | Stempel | Sello | Carimbo | Timbro |
| annotation | Annotations | Annotations | Anmerkungen | Aantekeningen | Anotaciones | Anotações | Annotazioni |
| binding | Binding mark | Marque de reliure | Einbandzeichen | Bandmerk | Marca de encuadernación | Marca de encadernação | Segno di legatura |
| shelfmark | Shelfmark | Cote | Signatur | Signatuur | Signatura | Cota | Segnatura |
| auction_record | Auction record | Notice de vente | Auktionsnachweis | Veilingnotitie | Registro de subasta | Registo de leilão | Nota d'asta |
| dealer_record | Dealer record | Notice de libraire | Händlernachweis | Antiquariaatsnotitie | Nota de librero | Nota de livreiro | Nota di libraio |

### 8.5 Provenance Transaction Types

| Value | EN | FR | DE | NL | ES | PT | IT |
|-------|----|----|----|----|----|----|-----|
| purchase | Purchased | Acheté | Erworben | Aangekocht | Adquirido | Adquirido | Acquistato |
| auction | Sold at auction | Vendu aux enchères | Versteigert | Geveild | Vendido en subasta | Vendido em leilão | Venduto all'asta |
| dealer | From dealer | Acquis chez | Vom Händler | Van antiquariaat | De librero | De livreiro | Da libraio |
| gift | Gift | Don | Geschenk | Geschenk | Donación | Doação | Dono |
| presentation | Presentation | Envoi | Widmungsexemplar | Presentexemplaar | Ejemplar de presentación | Exemplar de apresentação | Esemplare in omaggio |
| inheritance | Inherited | Hérité | Ererbt | Geërfd | Heredado | Herdado | Ereditato |

### 8.6 Association Types

| Value | EN | FR | DE | NL | ES | PT | IT |
|-------|----|----|----|----|----|----|-----|
| dedication_copy | Dedication copy | Exemplaire de dédicace | Widmungsexemplar | Opdrachtexemplaar | Ejemplar con dedicatoria | Exemplar com dedicatória | Esemplare con dedica |
| association_copy | Association copy | Exemplaire d'association | Beziehungsexemplar | Associatie-exemplaar | Ejemplar de asociación | Exemplar de associação | Esemplare d'associazione |
| presentation_copy | Presentation copy | Envoi autographe | Widmungsexemplar | Presentexemplaar | Ejemplar de presentación | Exemplar de apresentação | Esemplare d'omaggio |
| inscribed | Inscribed by author | Inscrit par l'auteur | Vom Autor signiert | Door auteur opgedragen | Inscrito por el autor | Inscrito pelo autor | Iscritto dall'autore |
| signed | Signed by author | Signé par l'auteur | Vom Autor signiert | Door auteur gesigneerd | Firmado por el autor | Assinado pelo autor | Firmato dall'autore |
| authors_copy | Author's own copy | Exemplaire de l'auteur | Handexemplar des Autors | Auteursexemplaar | Ejemplar del autor | Exemplar do autor | Esemplare dell'autore |
| annotated | Annotated | Annoté | Annotiert | Geannoteerd | Anotado | Anotado | Annotato |
| ex_library | Ex-library | Ex-bibliothèque | Aus Bibliothek | Ex-bibliotheek | Ex-biblioteca | Ex-biblioteca | Ex-biblioteca |
| review_copy | Review copy | Exemplaire de presse | Rezensionsexemplar | Recensie-exemplaar | Ejemplar de reseña | Exemplar de crítica | Esemplare per recensione |

---

## 9. Implementation Notes

### 9.1 Author Name Formatting

**Trade mode:** `SURNAME, Given names` (surname in capitals)
- Use `sort_name` from contributors table if available
- If `family_name` and `given_names` are populated, construct: `FAMILY_NAME.toUpperCase(), given_names`
- For corporate authors, use `canonical_name` as-is

**ISBD mode:** As on title page (not inverted, not caps)
- Use `display_name` or `canonical_name`
- If only `sort_name` is available, un-invert: "Dickens, Charles" → "Charles Dickens"

### 9.2 Format Display Order

**Trade:** Format (8vo) comes BEFORE dimensions, AFTER pagination.
```
8vo. xvi, 448 pp. 235 × 150 mm.
```

**ISBD:** Dimensions in Area 5 after ` ; `. Format optionally in parentheses.
```
xvi, 448 p. : ill. ; 24 cm (8vo)
```

### 9.3 Dimension Display

**Trade:** mm preferred for rare books, cm acceptable for modern. Always height × width.
**ISBD:** Height only, in cm, rounded UP to nearest whole cm. Width only if unusual.

### 9.4 ISBD Language of Labels

ISBD notes area labels should be in the **output language**. The prescribed punctuation is universal (not language-dependent).

### 9.5 Trade Price in Entry

Trade catalog entries do NOT embed the price. Price is managed separately in the UI. Exception: ISBD Area 8 allows `: EUR 45.00` after ISBN.

### 9.6 Paper Type Display

When `paper_type` has a value, include in physical description:

| Value | EN | FR | DE | NL |
|-------|----|----|----|----|
| wove | Wove paper | Papier vélin | Velinpapier | Velijnpapier |
| laid | Laid paper | Papier vergé | Büttenpapier | Vergépapier |
| japan | Japan paper | Papier Japon | Japanpapier | Japans papier |
| india | India paper | Papier bible | Dünndruckpapier | Indisch papier |
| vellum | Vellum | Vélin | Pergament | Perkament |
| handmade | Handmade paper | Papier à la cuve | Handgeschöpftes Papier | Handgeschept papier |

### 9.7 Edge Treatment Display

| Value | EN | FR | DE | NL |
|-------|----|----|----|----|
| gilt_all | All edges gilt | Toutes tranches dorées | Goldschnitt | Vergulde snede |
| gilt_top | Top edge gilt | Tête dorée | Kopfgoldschnitt | Bovenzijde verguld |
| marbled | Marbled edges | Tranches marbrées | Marmorschnitt | Gemarmerde snede |
| deckle | Deckle edges | Non rogné | Unbeschnitten | Onbesneden |
| untrimmed | Untrimmed | Non rogné | Unbeschnitten | Onbesneden |
| uncut | Uncut | Non coupé | Unaufgeschnitten | Ongeopend |
| sprinkled | Sprinkled edges | Tranches mouchetées | Gesprenkelter Schnitt | Bespikkelde snede |
| red_edges | Red stained edges | Tranches teintées rouge | Rotschnitt | Rode snede |

### 9.8 Protective Enclosure Display

| Value | EN | FR | DE | NL | ES | PT | IT |
|-------|----|----|----|----|----|----|-----|
| slipcase_publisher | Publisher's slipcase | Étui d'éditeur | Verlagsschuber | Uitgeversschuifhoes | Estuche editorial | Estojo do editor | Custodia editoriale |
| slipcase_custom | Custom slipcase | Étui sur mesure | Maßgefertigter Schuber | Schuifhoes op maat | Estuche a medida | Estojo sob medida | Custodia su misura |
| clamshell_box | Clamshell box | Boîte à rabat | Kassette | Cassette | Caja tipo concha | Caixa clamshell | Scatola a conchiglia |
| chemise | Chemise | Chemise | Chemise | Chemise | Camisa | Camisa | Camicia |
| solander_box | Solander box | Boîte Solander | Solander-Kassette | Solander-cassette | Caja Solander | Caixa Solander | Custodia Solander |

---

## 10. Differences Between Current Code and This Spec

### 10.1 Bugs / Deviations in Current `catalog-entry-generator.tsx`

| # | Issue | Current Behavior | Correct Behavior |
|---|-------|-----------------|------------------|
| 1 | **Author position** | Author BEFORE title (trade style) with `. — ` ISBD separators | Either: Trade mode (author first, period separators) OR ISBD mode (title first, `. — ` separators). Currently a broken hybrid. |
| 2 | **SoR adds "by/par/von/door"** | Constructs "by Author" in SoR | Trade: acceptable. ISBD: SoR should reflect title page wording. For generated entries, "by" is OK. |
| 3 | **Format position** | After dimensions (`. 8vo`) | Trade: BEFORE dimensions. ISBD: after dimensions in parentheses or omitted. |
| 4 | **Dimensions unit** | Always mm | Trade: mm is fine. ISBD: should be cm (rounded up). |
| 5 | **Cover type in Area 5** | Inline in physical description | Trade: after physical, as binding section. ISBD: in Notes (Area 7). |
| 6 | **Missing fields** | 15 DB fields not used | See §4.4 for the full list. |
| 7 | **Provenance labels** | Only English labels for evidence/transaction types | Must be translated per language. |
| 8 | **Only 4 languages** | EN, FR, DE, NL | Need 13 (EN, FR, DE, NL, ES, PT, IT, SV, DA, NO, BE-FR, BE-NL, LA). |
| 9 | **Only 17 cover types translated** | 17 of 49 | All 49 must be translated. |
| 10 | **No ISBD mode** | Only one mode (hybrid) | Need two distinct modes with correct formatting. |
| 11 | **Condition not translated** | Condition grade shown in English always | Must use translated grade name per output language. |
| 12 | **DJ condition ignored** | `dust_jacket_condition_id` not used | Should be included when `has_dust_jacket` is true. |
| 13 | **No Latin support** | — | Latin mode for incunabula and scholarly use. |

### 10.2 Implementation Priority

1. **Phase 1:** Add the 9 new languages + Latin to translations
2. **Phase 2:** Split into Trade mode and ISBD mode
3. **Phase 3:** Add 15 missing DB fields to BookData type
4. **Phase 4:** Fix format position, dimension display, binding placement
5. **Phase 5:** Translate all 49 cover types, condition grades, provenance labels
6. **Phase 6:** DB migration for `catalog_entry_isbd` field
7. **Phase 7:** UI update — two-column modal (Trade | ISBD) × 13 languages

---

*End of specification.*
