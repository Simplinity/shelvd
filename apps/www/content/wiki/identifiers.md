# ISBN, OCLC, LCCN, DDC, LCC, UDC: An Alphabet Soup That Actually Matters

Every book accumulates identifiers the way a traveler accumulates passport stamps. Each one connects the book to a different system, a different catalog, a different way of organizing human knowledge. Some identify the physical edition. Some classify the subject. Some exist only inside library computers. Together, they form a web of references that lets you find any book in any catalog in the world — if you know which number to use.

Shelvd tracks all of them. Here is what each one means, where it comes from, how it is structured, and why it matters to a collector.

---

## ISBN — International Standard Book Number

The most widely recognized book identifier in the world, and the most misunderstood.

### History

The ISBN system was born in 1966 as the **Standard Book Number (SBN)**, developed by Gordon Foster for W.H. Smith in the UK. It became an international standard (ISO 2108) in 1970 under the name ISBN. The system was administered by the International ISBN Agency in Berlin and adopted rapidly by publishers worldwide.

In 2007, the format was expanded from 10 digits to 13 digits to align with the EAN-13 barcode system used in retail. Every ISBN-10 can be converted to an ISBN-13 by adding the prefix "978" and recalculating the check digit.

### Structure

**ISBN-13** (current format, since 2007):

```
978-0-14-028329-7
 │   │  │    │   │
 │   │  │    │   └── Check digit (calculated)
 │   │  │    └────── Title identifier
 │   │  └─────────── Publisher identifier
 │   └────────────── Registration group (country/language)
 └──────────────────  EAN prefix (978 or 979)
```

- **978 / 979**: The EAN "Bookland" prefixes. 978 was used first; 979 is being allocated as 978 ranges fill up. The 979 prefix cannot be converted back to ISBN-10.
- **Registration group**: Identifies the country, region, or language area. "0" and "1" are English-speaking countries. "2" is French-speaking. "3" is German-speaking. "90" is the Netherlands, "94" is Belgium (Flanders).
- **Publisher identifier**: Identifies the publisher. Large publishers get short prefixes (more title numbers); small publishers get long prefixes.
- **Title identifier**: Identifies the specific edition.
- **Check digit**: A single digit (0–9) calculated from the other twelve using a modulus-10 algorithm. Catches transcription errors.

**ISBN-10** (original format, before 2007):

```
0-14-028329-4
│  │    │   │
│  │    │   └── Check digit (modulus-11, can be 'X' for 10)
│  │    └────── Title identifier
│  └─────────── Publisher identifier
└────────────── Registration group
```

The ISBN-10 check digit uses a modulus-11 algorithm, which means it can be the letter "X" (representing 10). This catches more errors than the ISBN-13 check digit but confuses non-specialists who think the "X" is a typo.

### What an ISBN identifies

An ISBN identifies a **specific edition** from a **specific publisher** in a **specific format**. This means:

- The hardcover and paperback of the same title have different ISBNs
- A reprinted edition with a new publisher has a different ISBN
- A translation has a different ISBN from the original
- A revised edition has a different ISBN from the first edition
- But a simple reprint (same publisher, same format, same text) typically keeps the same ISBN

### What an ISBN does NOT identify

- The *work* itself — there is no single ISBN for "War and Peace." There are hundreds of ISBNs for hundreds of editions.
- Books published before 1970 — they predate the system entirely
- Self-published works before the rise of ISBNs — many small press and private press publications never received one
- Most antiquarian books — the vast majority of pre-twentieth-century books have no ISBN

### Where to find it

- **Back cover**: Usually above or inside the barcode
- **Copyright page** (verso of title page): Often listed alongside CIP data
- **Barcode**: The 13 digits encoded in the EAN-13 barcode *are* the ISBN-13

### In Shelvd

Shelvd has separate fields for **ISBN-13** and **ISBN-10**. Library Lookup searches by ISBN and can populate both. The duplicate detection system uses ISBN matching as its primary method — if two books share an ISBN-13 or ISBN-10, they are flagged as potential duplicates.

---

## OCLC Number — Online Computer Library Center

### What it is

A unique numeric identifier assigned by **WorldCat**, the world's largest bibliographic database, maintained by OCLC (Online Computer Library Center). WorldCat aggregates catalog records from over 100,000 libraries in 178 countries, containing more than 500 million records.

Every record in WorldCat receives an OCLC number (also called the OCLC Control Number or OCN). Unlike ISBN, which is assigned by publishers, the OCLC number is assigned by catalogers — which means it exists for books that predate ISBN, for manuscripts, for maps, for everything libraries catalog.

### Structure

A plain numeric string, typically 7–10 digits, with no internal structure. Examples:

- `1234567`
- `62132878` (WorldCat record for a specific edition of *Don Quixote*)
- `1151511839`

Older records have shorter numbers. The number has no semantic meaning — it is purely a database identifier.

### Why it matters

The OCLC number is the single most universal book identifier for serious research. It connects your copy to every library in the world that holds the same edition. If your book has no ISBN (because it was printed in 1623), the OCLC number is likely the best identifier available.

It also enables WorldCat lookups: `https://www.worldcat.org/oclc/62132878` takes you directly to the record.

### Where to find it

You will not find it in the book itself. OCLC numbers come from library catalog records. In Shelvd, Library Lookup and Enrich Mode can pull OCLC numbers from providers that include them in their MARC records (field 035). HathiTrust, Library of Congress, and most SRU-based providers return OCLC numbers.

### In Shelvd

The **OCLC** field in the Identifiers section. Used for external links to WorldCat and for cross-referencing between providers.

---

## LCCN — Library of Congress Control Number

### What it is

A unique identifier assigned by the **Library of Congress** to each bibliographic record in its catalog. Despite the name, it is not limited to works *about* Congress — it covers every work the Library of Congress catalogs, which is most books published in the United States and a significant number of foreign publications.

### History

The system began in 1898 as the "Library of Congress Card Number" — a number printed on the catalog cards that libraries purchased from the LC. The cards are gone, but the numbers persist. The naming has evolved over the decades:

- **Library of Congress Card Number** (1898–1969)
- **Library of Congress Catalog Card Number** (1969–1979)
- **Library of Congress Control Number** (1979–present)

All three names refer to the same numbering system.

### Structure

The format changed over time:

**Pre-2001 format**: A two-digit year prefix, a hyphen, and a sequential number:
```
66-12345     (1966, record 12345)
98-000001    (1998, record 1)
```

**Post-2001 format**: A four-digit year prefix:
```
2001012345   (2001, record 12345)
2024567890   (2024, record 567890)
```

### Where to find it

- **Copyright page**: Often printed as part of the Cataloging-in-Publication (CIP) data, preceded by "Library of Congress Control Number:" or "LCCN:"
- **Library of Congress catalog**: `https://lccn.loc.gov/2024567890`

### In Shelvd

The **LCCN** field. Particularly useful for American publications. Library Lookup from the Library of Congress provider populates this automatically from MARC field 010.

---

## DDC — Dewey Decimal Classification

### What it is

A library classification system invented by **Melvil Dewey** in 1876. It divides all human knowledge into ten main classes, each subdivided into ten divisions, each further subdivided into ten sections — and so on, using decimal expansion. It is the most widely used classification system in the world, employed by libraries in over 200,000 libraries in 135 countries.

### Structure

A number with at least three digits, optionally extended with a decimal point:

```
823.912
│││ │││
││└─│││── Subdivision: English fiction
│└──│││── Division: English literature
└───│││── Main class: Literature
    │└┘── Further subdivision: 1900–1945
```

The ten main classes:

| Class | Subject |
|-------|---------|
| 000 | Computer science, information, general works |
| 100 | Philosophy and psychology |
| 200 | Religion |
| 300 | Social sciences |
| 400 | Language |
| 500 | Science |
| 600 | Technology |
| 700 | Arts and recreation |
| 800 | Literature |
| 900 | History and geography |

A DDC number like **823.912** means: 800 (Literature) → 820 (English literature) → 823 (English fiction) → 823.9 (20th century) → 823.912 (1900–1945).

### Why it matters for collectors

DDC numbers help you understand how librarians classify a work — which can differ from how you or the trade categorize it. A book you consider "natural history" might be classified under 508 (natural history) or 591 (zoology) or 639 (hunting and fishing) depending on its content. Knowing the DDC number helps you find related works in library catalogs.

### Where to find it

- **Copyright page**: Often printed as part of CIP data
- **Library catalog records**: Most library providers return DDC in MARC field 082

### In Shelvd

The **DDC** field. Populated automatically during Library Lookup from providers that include MARC field 082 in their records.

---

## LCC — Library of Congress Classification

### What it is

An alphanumeric classification system developed by the **Library of Congress** beginning in 1897. Unlike Dewey's purely numeric system, LCC uses one or two letters followed by numbers, allowing finer granularity.

### Structure

```
PR6039.O32
││     │
│└─────┘── Cutter number (author-specific)
└──────── Class and subclass letters
```

The main classes:

| Letter(s) | Subject |
|-----------|---------|
| A | General works |
| B | Philosophy, psychology, religion |
| C–F | History (auxiliary sciences, Americas, rest of world) |
| G | Geography, anthropology, recreation |
| H | Social sciences |
| J | Political science |
| K | Law |
| L | Education |
| M | Music |
| N | Fine arts |
| P | Language and literature |
| Q | Science |
| R | Medicine |
| S | Agriculture |
| T | Technology |
| U | Military science |
| V | Naval science |
| Z | Bibliography, library science |

**PR6039.O32** breaks down as: P (Language and literature) → PR (English literature) → PR6000 (1900–1960) → PR6039 (Authors T) → .O32 (Tolkien).

### DDC vs. LCC

DDC is used primarily by public libraries and is designed for browsing by patrons. LCC is used primarily by academic and research libraries and is designed for precise shelving of large collections. Both classify the same books differently. A collector doesn't need to choose between them — Shelvd stores both.

### Where to find it

- **Copyright page**: Sometimes printed as part of CIP data
- **Library catalog records**: MARC field 050

### In Shelvd

The **LCC** field. Populated automatically from providers that include MARC field 050.

---

## UDC — Universal Decimal Classification

### What it is

An expansion of the Dewey system developed in the 1890s by **Paul Otlet** and **Henri La Fontaine** in Brussels, Belgium. UDC uses the same basic decimal structure as DDC but adds auxiliary signs (colons, plus signs, brackets, equals signs) that allow relationships between subjects to be expressed.

### Structure

UDC numbers can be simple or highly complex:

- **821.111** — English literature (similar to DDC)
- **821.111-31** — English novels (the hyphen introduces a common auxiliary for literary form)
- **821.111-31"19"** — English novels of the 20th century (quotes introduce time auxiliaries)
- **94(44)"1789"** — History of France in 1789 (parentheses introduce place auxiliaries)

### Where it is used

UDC is the primary classification system in many European libraries, particularly in Belgium, the Netherlands, Spain, Portugal, and parts of Eastern Europe. If your books come from European institutional libraries, you may encounter UDC numbers in their records.

### In Shelvd

The **UDC** field. Less commonly populated by Library Lookup than DDC or LCC, as fewer providers include it in their MARC records. Useful for collectors whose libraries intersect with European institutional cataloging.

---

## Catalog ID — Your Own Number

### What it is

Whatever numbering or identification system you use for your own collection. Shelvd imposes no format — it is a free-text field for your personal reference.

### Common approaches

- **Sequential numbering**: 001, 002, 003...
- **Shelf-based codes**: A-137 (bookcase A, shelf 1, position 37)
- **Subject-based codes**: LIT-FR-042 (French literature, item 42)
- **Accession numbers**: 2024-001, 2024-002... (year of acquisition + sequence)
- **Location codes**: OFFICE-3-12 (office, shelf 3, position 12)

### Why bother

If you have a few hundred books, you probably don't need a Catalog ID — you know where everything is. If you have several thousand, a systematic identification scheme means you can locate any book without remembering which shelf it is on.

The Catalog ID is also useful for cross-referencing with physical labels, insurance inventories, or existing numbering systems you may have used before switching to Shelvd.

### In Shelvd

The **Catalog ID** field. Searchable, sortable, and visible on the detail page. It is *your* number — Shelvd never generates or modifies it.

---

## Topic / Subject Keywords

### What it is

Free-text subject keywords that describe what the book is about. Not a classification number — just human-readable terms.

### Examples

- "English literature, Modernism, World War I"
- "Natural history, Ornithology, South America"
- "Mathematics, Number theory, Prime numbers"
- "Cookery, French cuisine, 18th century"

### How it differs from BISAC

BISAC codes (covered in a separate article) are standardized subject categories from a controlled vocabulary of 3,887 terms. Topic keywords are free-form — you can use whatever terms make sense for your collection.

Both have their place. BISAC codes enable standardized searching and categorization. Topic keywords let you add specificity that no controlled vocabulary can anticipate.

### In Shelvd

The **Topic** field. Free-text, comma-separated. Used in search and visible on the book detail page.

---

## How Identifiers Flow Into Shelvd

You rarely need to enter identifiers by hand. Here is how they typically arrive:

**Library Lookup**: Search by ISBN, and the provider returns a MARC record containing the OCLC number (field 035), LCCN (field 010), DDC (field 082), and LCC (field 050). All are automatically mapped to the corresponding Shelvd fields.

**Enrich Mode**: When you enrich a book from a different provider, any new identifiers that the second provider returns are offered as enrichment candidates — shown as "NEW" fields you can merge into your record.

**HathiTrust**: Returns LCCN, OCLC, DDC, and LCC for all records, making it one of the richest identifier sources available.

**Manual entry**: For Catalog ID and UDC (less commonly available from providers), you enter them yourself.

---

## Identifiers and Duplicate Detection

Shelvd's duplicate detection system uses identifiers as its primary matching method:

1. **ISBN-13 match**: Two books with the same ISBN-13 are almost certainly the same edition.
2. **ISBN-10 match**: Same logic, for older records.
3. **Exact title match**: When no ISBN is available, title matching serves as a fallback.

OCLC numbers are not currently used for duplicate detection but could be in the future — they are a strong signal of identical editions, particularly for pre-ISBN books.

---

## A Summary Table

| Identifier | Assigned by | Format | Found in book? | Typical source in Shelvd |
|-----------|-------------|--------|----------------|--------------------------|
| ISBN-13 | Publisher | 13 digits (978/979-...) | Yes (back cover, copyright page) | Manual entry, Lookup |
| ISBN-10 | Publisher | 10 digits (may end in X) | Yes (copyright page) | Manual entry, Lookup |
| OCLC | WorldCat/OCLC | Numeric (7–10 digits) | No | Library Lookup, Enrich |
| LCCN | Library of Congress | Year + sequence | Sometimes (CIP data) | Library Lookup, Enrich |
| DDC | Library cataloger | Decimal number | Sometimes (CIP data) | Library Lookup, Enrich |
| LCC | Library cataloger | Letters + numbers | Sometimes (CIP data) | Library Lookup, Enrich |
| UDC | Library cataloger | Decimal + auxiliaries | Rarely | Manual entry |
| Catalog ID | You | Free-form | N/A | Manual entry |
| Topic | You | Free-text keywords | N/A | Manual entry |
