# A Grand Tour of 27 Libraries in 27 Countries

*Every lookup provider in Shelvd: what it holds, what it's good at, and where it falls short. Consider this your field guide to the world's library catalogs.*

---

## The Idea

No single library has every book. Not the Library of Congress, not the British Library, not that suspiciously well-stocked secondhand shop in Hay-on-Wye. But between them, the world's libraries hold more bibliographic data than any collector could generate in a lifetime.

Shelvd connects to **27 providers** across **27 countries** on **4 continents**. One search, twenty-seven libraries. Here's what each one brings to the table.

---

## General & Multi-National

### Open Library (🌐)
**What:** Community-maintained catalog with 20M+ editions. Part of the Internet Archive.
**Best for:** Modern books, English-language titles, cover images.
**Quirks:** Data quality varies wildly — it's crowd-sourced. Some records are pristine; others look like they were entered during a power cut. But the coverage is unmatched for post-1900 English titles.

### Google Books (🌐)
**What:** Google's book database. You know Google.
**Best for:** Quick ISBN lookups, cover images, descriptions.
**Quirks:** Rich but shallow. Good at finding books, less good at bibliographic precision. Publisher names are sometimes the imprint, sometimes the parent company, sometimes a mystery. But for getting a cover image and basic metadata, it's fast and reliable.

### WorldCat / OCLC (🌐)
**What:** The world's largest library catalog — 500M+ records from 100,000+ libraries.
**Best for:** Finding the most widely-held edition, OCLC numbers, broad coverage.
**Quirks:** Uses the Classify API, which returns aggregate data. Good for identifying *which* edition you have, less good for granular bibliographic detail.

---

## National Libraries — Western Europe

### Library of Congress (🇺🇸)
**What:** The largest library in the world. 170M+ items.
**Best for:** LCCN, LCC, DDC numbers. Authoritative records for English-language titles.
**Quirks:** SRU interface with MARCXML. Some older records are skeletal, but modern cataloging is exceptional. If the LoC has cataloged your book, the data is likely the best you'll find.

### British Library (🇬🇧)
**What:** The UK's national library. 170M+ items including the Magna Carta.
**Best for:** UK publications (legal deposit), historical British publishing, ESTC overlap.
**Quirks:** SRU/MARCXML. Recently migrated to a new discovery system. Excellent for anything published in Britain.

**What:** France's national library. 40M+ items. That building on the Seine that looks like four open books.
**Best for:** French-language publications, UNIMARC data, BnF identifiers.
**Quirks:** Uses UNIMARC (fields 200, 210, etc.) instead of MARC21. CQL queries need specific relation operators. Shelvd handles the translation.

### SUDOC (🇫🇷)
**What:** Union catalog of French university libraries. 15M+ records.
**Best for:** Academic French titles, theses, dissertations.
**Quirks:** Also UNIMARC. Field 214 for recent publications (replaces 210). Good complement to BnF.

### DNB — Deutsche Nationalbibliothek (🇩🇪)
**What:** Germany's national library. Everything published in German since 1913.
**Best for:** German-language publications, GND authority data.
**Quirks:** SRU/MARCXML. Excellent authority control. NSB/NSE markup (non-sorting characters) needs cleanup — Shelvd strips these automatically.

### K10plus / GBV (🇩🇪)
**What:** Union catalog of German and Dutch research libraries. 200M+ titles.
**Best for:** German academic titles, broad European coverage.
**Quirks:** PICA-based system. Uses the same SRU endpoint as CERL HPB but with different indexes.

### KB — Koninklijke Bibliotheek (🇳🇱)
**What:** The Dutch national library.
**Best for:** Dutch publications, historical Dutch printing.
**Quirks:** Custom Dublin Core format via SRU. Good for anything published in the Netherlands.

### KBR (🇧🇪)
**What:** Belgium's Royal Library. Everything published in Belgium.
**Best for:** Belgian publications, Plantin-Moretus holdings, Flemish and Walloon printing.
**Quirks:** SRU/MARCXML. Because Belgium has three official languages, records can be in Dutch, French, or German.

### Unicat (🇧🇪)
**What:** Belgian union catalog — all academic and research libraries.
**Best for:** Belgian academic holdings, theses.
**Quirks:** Broader than KBR alone. Good for finding which Belgian library holds a specific title.

### BNE — Biblioteca Nacional de España (🇪🇸)
**What:** Spain's national library.
**Best for:** Spanish-language publications, Latin American imprints.
**Quirks:** SRU/MARCXML. Good for Iberian publishing history.

### Swisscovery / SLSP (🇨🇭)
**What:** Swiss union catalog — 475 libraries.
**Best for:** Swiss publications, multilingual records (DE/FR/IT).
**Quirks:** Alma-based. Switzerland catalogues in three languages, so you might find the same book with German, French, and Italian subject headings.

---

## National Libraries — Nordic & Beyond

### BIBSYS / Oria (🇳🇴)
**What:** Norwegian union catalog — all academic and research libraries.
**Best for:** Norwegian publications, Scandinavian titles.
**Quirks:** Alma-based SRU. Good for Nordic academic coverage.

### Libris (🇸🇪)
**What:** Swedish union catalog — 400+ libraries.
**Best for:** Swedish publications, Nordic literature.
**Quirks:** Custom XSearch API. Good for Scandinavian coverage alongside BIBSYS and Finna.

### Finna (🇫🇮)
**What:** Finnish aggregator — museums, libraries, archives. Open data.
**Best for:** Finnish publications, Nordic titles, open API.
**Quirks:** JSON API. One of the most developer-friendly library APIs. Finnish libraries take open data seriously.

### DanBib / bibliotek.dk (🇩🇰)
**What:** Danish union catalog. 14M+ records.
**Best for:** Danish publications, Scandinavian coverage.
**Quirks:** OpenSearch API with DKABM/Dublin Core XML. CQL queries use `dkcclterm` indexes. Year search uses `dkcclterm.år` — yes, with the Danish å.

### ÖNB — Österreichische Nationalbibliothek (🇦🇹)
**What:** Austria's national library. One of the oldest in the world.
**Best for:** Austrian publications, Habsburg-era printing.
**Quirks:** Alma-based SRU. Good for Central European bibliography.

### COBISS (🇸🇮🇷🇸🇧🇬🇲🇰🇧🇦🇲🇪🇦🇱🇽🇰)
**What:** Co-operative Online Bibliographic System and Services — 10M+ records across 780+ libraries in 8 countries: Slovenia, Serbia, Bulgaria, North Macedonia, Bosnia-Herzegovina, Montenegro, Albania, and Kosovo.
**Best for:** Southeastern European publications. If it was published in the Western Balkans, it's probably here.
**Quirks:** No public API — uses the legacy COBISS+ interface which returns server-rendered HTML. Expert search with prefixes (`BN=` for ISBN, `TI=` for title, `AU=` for author). Searches Slovenia first (largest database) then cascades through other national systems. Developed by IZUM in Maribor since the 1980s — one of the longest-running cooperative library networks in Europe.

---

## Asia-Pacific

### NDL — National Diet Library (🇯🇵)
**What:** Japan's national library. The largest in Asia.
**Best for:** Japanese publications, CJK metadata.
**Quirks:** OpenSearch API returning RSS/Dublin Core XML. Shelvd has a custom parser. Excellent for Japanese editions.

### Trove / NLA (🇦🇺)
**What:** Australia's national discovery service — libraries, newspapers, archives.
**Best for:** Australian publications, Oceania coverage.
**Quirks:** JSON API requiring an API key. Currently pending key approval — the provider is registered but temporarily disabled.

---

## Specialist Catalogs

### OPAC SBN (🇮🇹)
**What:** Italy's national union catalog — the Servizio Bibliotecario Nazionale.
**Best for:** Italian publications, Italian printing history.
**Quirks:** Custom JSON API with its own query language. Italian libraries have their own way of doing things.

### CERL HPB — Heritage of the Printed Book (🇪🇺)
**What:** 6M+ records of European rare books (1455–1830). Run by the Consortium of European Research Libraries.
**Best for:** Incunabula, early printed books, provenance research. If your book was printed before 1830, start here.
**Quirks:** SRU with PICA indexes (`pica.tit`, `pica.per`, `pica.yop`). Returns MARCXML with rich provenance data: author life dates, printers, former owners, physical dimensions, binding notes. The `pica.yop` index only supports exact year — no ranges.

### HathiTrust (🇺🇸)
**What:** 13M+ digitized volumes from 200+ research libraries.
**Best for:** Checking if a digital version exists, finding which libraries hold a copy.
**Quirks:** ISBN/OCLC/LCCN lookup only — no title or author search. This is an identifier-based API, not a search engine. But it tells you things no one else does: which university holds the book, whether a full-view digital copy exists, and the rights status.

### Europeana (🇪🇺)
**What:** 200M+ records from 4,000+ cultural institutions across 49 European countries. The mother of all European aggregators.
**Best for:** Pan-European fallback when national libraries come up empty. Also covers manuscripts, maps, prints, and other cultural objects beyond books.
**Quirks:** REST API with JSON responses. Searches across the Europeana Data Model (EDM), which means fields are language-tagged and can vary wildly between contributing institutions. ISBNs live in `dcIdentifier` rather than a dedicated field, so results need filtering. Filtered to `TYPE:TEXT` to keep it book-focused. Think of it as WorldCat's European cousin — breadth over depth.

### BNP / PORBASE (🇵🇹)
**What:** Union catalog of Portuguese libraries. PORBASE aggregates records from the Biblioteca Nacional de Portugal and dozens of academic and public libraries across the country.
**Best for:** Portuguese-language editions, books published in Portugal, and Lusophone literature in general.
**Quirks:** Not SRU — uses a URN HTTP service that returns MODS XML for a given ISBN. Dead simple: one ISBN in, one record out. No multi-field search (title, author) — ISBN only. But the MODS response is clean and well-structured: title, authors with roles, publisher, place, year, extent, language, edition, even UDC classification codes.

---

## Choosing the Right Provider

- **Modern books with ISBN**: Open Library, Google Books, your national library
- **Academic titles**: WorldCat, SUDOC, BIBSYS
- **European rare books (pre-1830)**: CERL HPB, then national libraries
- **Digital availability**: HathiTrust
- **Pan-European fallback**: Europeana
- **Regional publishing**: Use the national library of the country of publication
- **Portuguese**: BNP / PORBASE
- **Scandinavian**: Libris (SE), BIBSYS (NO), Finna (FI), DanBib (DK)

You can enable and prioritize providers in [Settings → Book Lookup](/settings?tab=book-lookup). There's no wrong order, but starting with your country's national library and Open Library covers most cases.

---

*See also: [Library Lookup](/wiki/library-lookup) · [Configuring Providers](/wiki/configuring-providers) · [Enriching a Record](/wiki/enriching-a-record)*
