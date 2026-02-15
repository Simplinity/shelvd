# ISBD: The Catalog Entry Nobody Writes by Hand Anymore

ISBD — International Standard Bibliographic Description — is the formal grammar for describing a book in a single structured paragraph. It is the language of library catalogs, auction records, dealer descriptions, and union databases worldwide. Every punctuation mark is prescribed. Every area has a defined position. Nothing is optional, accidental, or decorative.

Shelvd generates ISBD entries automatically from your cataloging data. But understanding the rules means you can read any catalog entry in the world, spot errors in your own, and — when needed — write or edit one by hand.

This article explains the full ISBD framework, area by area, with the exact punctuation grammar and worked examples.

---

## The Anatomy of an ISBD Entry

A complete ISBD entry assembles up to eight areas into a single paragraph. Areas are separated by **`. — `** (period-space-dash-space). Within each area, specific punctuation marks introduce specific elements.

Here is a complete example:

> Tolkien, J.R.R. The Lord of the Rings : The Fellowship of the Ring / by J.R.R. Tolkien. — Second edition. — London : George Allen & Unwin, 1966. — xvi, 423 p. : maps ; 222 × 142 mm 8vo. Hardcover in dust jacket. — (Works of J.R.R. Tolkien). — Bibliography: Hammond & Scull A5b. Condition: Very Good. Foxing to prelims, slight lean. — ISBN 978-0-04-823045-4

Every mark in that paragraph carries meaning:

| Punctuation | Meaning |
|-------------|---------|
| `. — ` | Separates areas (period-space-dash-space) |
| ` : ` | Precedes subtitle (Area 1) or publisher (Area 4) |
| ` / ` | Introduces statement of responsibility |
| ` ; ` | Separates multiple responsibilities, or precedes dimensions |
| `, ` | Separates elements within an area (e.g. place, date) |
| `( )` | Encloses series statement |
| `. ` | Separates notes within the notes area |

---

## Area 1: Title and Statement of Responsibility

The most complex area. It identifies what the book is and who made it.

**Structure:**

```
Author(s). Title : subtitle / statement of responsibility
```

**Rules:**

- **Author entry**: The primary author(s) open the entry, in "Last, First" format, followed by a period and space. Multiple authors are separated by ` ; ` (space-semicolon-space).
- **Title**: Transcribed from the title page exactly as it appears — capitalisation, spelling, and all. Not from the cover. Not from the spine.
- **Subtitle**: Preceded by ` : ` (space-colon-space). Only include if present on the title page.
- **Statement of responsibility**: Preceded by ` / ` (space-slash-space). Names all persons responsible for the intellectual or artistic content: author, co-authors, editors, translators, illustrators, and others.

**Examples:**

Single author:
> Montaigne, Michel de. Les Essais / par Michel de Montaigne

Multiple authors:
> Strunk, William ; White, E.B. The Elements of Style / by William Strunk and E.B. White

With translator and illustrator:
> Homer. The Iliad / by Homer ; translated by Richmond Lattimore ; illustrated by Leonard Baskin

Edited work:
> The Oxford Book of English Verse / edited by Arthur Quiller-Couch

**How Shelvd builds this:** The generator reads the `title`, `subtitle`, and all contributors with their MARC relator roles. Authors are listed first as the heading, then all contributors are assembled into the statement of responsibility with role-appropriate connecting phrases ("by", "translated by", "illustrated by", etc.) in the selected language.

---

## Area 2: Edition Statement

Identifies which edition and impression this copy represents.

**Structure:**

```
Edition statement, impression
```

**Rules:**

- Transcribe the edition statement as it appears in the book: "First edition", "3e édition revue et augmentée", "Editio princeps".
- The impression (printing) follows the edition, separated by a comma.
- Do not invent an edition statement if the book does not carry one.

**Examples:**

> First edition, first impression

> 3rd revised and enlarged edition

> Édition définitive

**How Shelvd builds this:** Reads the `edition` and `impression` fields. If both are present, they are joined with a comma.

---

## Area 3: Material-Specific Details

This area is used for cartographic materials, music, serials, and electronic resources. For printed monographs — which is what most collectors deal with — this area is omitted.

Shelvd skips Area 3 entirely, as it catalogs printed books.

---

## Area 4: Publication, Production, Distribution

Where and when the book was published, and by whom.

**Structure:**

```
Place : Publisher, Date. Printed by Printer, Printing place
```

**Rules:**

- **Place of publication**: City as given on the title page. Multiple places separated by ` ; `.
- **Publisher**: Preceded by ` : ` (space-colon-space). Use the publisher name as printed — "George Allen & Unwin", not "Allen & Unwin" or "Unwin".
- **Date**: Preceded by `, ` (comma-space). The year of publication. Use `[1923]` for inferred dates, `c. 1920` for approximate dates, `n.d.` for undated.
- **Printer**: If known (often from the colophon), follows after a period-space. Introduced by "Printed by" (or equivalent in the selected language).

**Examples:**

> London : George Allen & Unwin, 1954

> Paris ; Leipzig : A. Franck, 1860

> Antwerp : Christophe Plantin, 1568. Printed by Plantin, Antwerp

> [Amsterdam] : Elzevier, [c. 1640]

**How Shelvd builds this:** Reads `publication_place`, `publisher_name`, `publication_year`, `printer`, and `printing_place`. The colon, comma, and period-space are inserted automatically according to ISBD rules.

---

## Area 5: Physical Description

The material reality of the book: how big, how many pages, what it is made of.

**Structure:**

```
Pagination, volumes ; height × width mm format. Cover type. Dust jacket. Signed
```

**Rules:**

- **Pagination**: In standard bibliographic form. Preliminary pages in roman numerals, text pages in arabic: `xvi, 352 p., [4] leaves of plates`. If you have a `pagination_description`, it takes priority over a plain `page_count`.
- **Volumes**: For multi-volume works — "3 vol." or "2 dl." (Dutch).
- **Dimensions**: Preceded by ` ; ` (space-semicolon-space). Height × width in millimeters. If only height is known, give height alone.
- **Format**: The bibliographic format — 8vo, 4to, Fol., etc. — follows the dimensions.
- **Cover type**: After a period-space. The material and construction of the binding: "Full morocco", "Hardcover in dust jacket", "Original wrappers", "Limp vellum". Shelvd translates cover types into the selected language (e.g. "Plein maroquin" in French, "Ganzmaroquin" in German).
- **Dust jacket**: Noted separately if present and not already indicated by the cover type (e.g. if the cover type is "hardcover_dj", the dust jacket is implicit).
- **Signed**: If the book is signed, noted at the end.

**Examples:**

> xvi, 423 p. : maps ; 222 × 142 mm 8vo. Hardcover in dust jacket. Signed

> [8], 340, [2] p., 12 leaves of plates : ill. ; 310 mm Fol. Full calf

> 3 vol. ; 175 mm 12mo. Limp vellum

**How Shelvd builds this:** Reads `pagination_description` (or falls back to `page_count`), `volumes`, `height_mm`, `width_mm`, `format_abbreviation` (or `format_name`), `cover_type`, `binding_name`, `has_dust_jacket`, and `is_signed`. The semicolons, periods, and connecting text are inserted according to ISBD punctuation grammar.

---

## Area 6: Series Statement

If the book belongs to a named series.

**Structure:**

```
(Series name ; number)
```

**Rules:**

- Enclosed in parentheses.
- The series number is preceded by ` ; ` (space-semicolon-space).
- Transcribe the series title as it appears in the book.

**Examples:**

> (Bibliothèque de la Pléiade ; 141)

> (Penguin Classics)

> (The Loeb Classical Library ; 170)

**How Shelvd builds this:** Reads `series` and `series_number`. Wraps in parentheses with the semicolon separator.

---

## Area 7: Notes

Everything that does not fit neatly into the other areas. This is where the cataloger — and the collector — earns their keep.

**Structure:**

Notes are separated by `. ` (period-space). There is no prescribed order, but Shelvd follows a logical sequence:

1. **Original title** — if the book is a translation
2. **Edition notes** — limitation details, variant bindings, bibliographic points
3. **Issue/state** — "First issue with errata slip", "Second state with corrected title page"
4. **Bibliography** — references to standard bibliographies: "Connolly 78", "Carter A12", "PMM 321"
5. **Provenance** — the ownership chain, assembled from structured provenance entries
6. **Illustrations** — technique, quantity, and any notable artists
7. **Signatures** — the collation formula: "A–Z⁸, Aa–Cc⁸"
8. **Condition** — grade and detailed notes

**Provenance formatting:**

Shelvd generates the provenance note from your structured provenance entries. Each owner in the chain is described with their evidence type, dates, and transaction details, separated by em-dashes:

> Provenance: Bookplate of Lord Amherst of Hackney (1835–1909) — Sotheby's London, lot 85, 2 Nov 1977 — Purchased by current owner, 2019 [from notable collection]

**Condition formatting:**

The condition grade is always included if present, followed by detailed notes:

> Condition: Very Good. Foxing to prelims, slight lean, minor rubbing to extremities. Dust jacket with small chips to head of spine.

**Examples of complete notes areas:**

> Original title: Les Fleurs du mal. First edition, one of 1,300 copies on papier vélin. Bibliography: Carteret I, 115. Provenance: Bookplate of Paul Valéry — Librairie Auguste Blaizot, Paris. Illustrations: Frontispiece portrait by Bracquemond. Condition: Near Fine. Slight toning to half-title.

**How Shelvd builds this:** Reads `original_title`, `edition_notes`, `issue_state`, `bibliography`, structured `provenanceEntries`, `illustrations_description`, `signatures_description`, `condition_name`, and `condition_notes`. Each non-empty note is joined with period-space separators.

---

## Area 8: Standard Number and Terms of Availability

The machine-readable identifiers.

**Structure:**

```
ISBN 978-0-04-823045-4. OCLC: 12345678. LCCN: 66-12345
```

**Rules:**

- ISBN first (13-digit preferred, 10-digit if no 13 exists).
- OCLC and LCCN follow, each preceded by its label and a colon.
- Separated by `. ` (period-space).

**How Shelvd builds this:** Reads `isbn_13` (preferred), `isbn_10`, `oclc_number`, and `lccn`.

---

## The Complete Assembly

All areas are joined with the ISBD area separator: **`. — `** (period-space-dash-space).

If an area is empty, it is skipped entirely. The separator only appears between areas that have content. This means a minimal entry might look like:

> The Pilgrim's Progress / by John Bunyan. — London : Nathaniel Ponder, 1678

While a fully cataloged entry from an experienced collector might run to several hundred words.

---

## The Thirteen Languages

Shelvd generates catalog entries in **thirteen languages**: English, French, German, Dutch, Spanish, Portuguese, Italian, Swedish, Danish, Norwegian, Belgian French, Belgian Dutch, and Latin. Each language affects:

- **Connecting phrases**: "by" / "par" / "von" / "door" / "por" / "di" / "av" / "af" / "auct."
- **Role descriptions**: "translated by" / "traduit par" / "übersetzt von" / "vertaald door" / "tradotto da" — and so on for all 17 contributor roles
- **Abbreviations**: "p." / "S." / "s." / "pp." / "ff." (pages vary by language), "vol." / "Bd." / "dl." / "bd." (volumes)
- **Labels**: "Condition" / "État" / "Zustand" / "Conditie" / "Estado" / "Condizioni" / "Skick" / "Tilstand"
- **Cover types**: All 49 cover types translated — "Full morocco" / "Plein maroquin" / "Ganzmaroquin" / "Volledig marokijn" / "Pleno marroquín" / "Pieno marocchino" / "Helfranskt band"
- **Condition grades**: "Fine" / "Parfait état" / "Sehr gut" / "Uitstekend" / "Perfecto" / "Ottimo" / "Fint"

The structural punctuation (`. — `, ` : `, ` / `, ` ; `) remains identical across all languages. ISBD is an international standard — the grammar is universal; only the vocabulary changes.

The Latin option exists for incunabula and early printed books, where place names appear in their Latin forms (Venetiis, Parisiis, Moguntiae) and provenance is abbreviated to "Prov." — as the great bibliographies have always done it.

---

## Generating a Catalog Entry in Shelvd

1. Open any book and click **Edit**
2. Scroll to the **Catalog Entry** section
3. Click **Trade** (left button) for a dealer-style entry, or **ISBD** (right button) for a formal bibliographic entry
4. A language modal appears showing thirteen options, each with a flag, language name, and the relevant trade association (e.g. "🇫🇷 Français — SLAM" or "🇩🇪 Deutsch — VDA")
5. Click your language. The entry is generated using every field you’ve filled in, formatted according to the conventions of that mode and country
6. Review, edit if needed, and save

The two modes write to separate database fields — `catalog_entry` (Trade) and `catalog_entry_isbd` (ISBD) — so you can have both a dealer description and a formal bibliographic record for the same book. Both are included in PDF catalog sheets.

The more fields you have filled in, the richer the entry. An empty book produces an empty entry. A fully cataloged book produces a professional-grade description that would be at home in any auction catalog or institutional record.

For the full breakdown of per-country Trade conventions (format terms, binding vocabulary, condition grades), see [Trade Catalogs: How 13 Countries Describe the Same Book](/wiki/trade-catalog-conventions).

---

## A Worked Example

Given the following book data:

| Field | Value |
|-------|-------|
| Author | Baudelaire, Charles |
| Title | Les Fleurs du mal |
| Edition | First edition |
| Publication place | Paris |
| Publisher | Poulet-Malassis et de Broise |
| Year | 1857 |
| Pagination | [4], 248, [4] p. |
| Height | 187 mm |
| Format | 8vo |
| Cover type | Printed wrappers |
| Series | — |
| Original title | — |
| Edition notes | One of 1,100 copies on papier vélin |
| Bibliography | Carteret I, 115; Clouzot, 37 |
| Provenance | Bookplate of Poulet-Malassis (publisher's copy) |
| Condition | Very Good |
| Condition notes | Light foxing to preliminaries, wrappers lightly soiled, spine slightly darkened |

Shelvd generates (in English):

> Baudelaire, Charles. Les Fleurs du mal / by Charles Baudelaire. — First edition. — Paris : Poulet-Malassis et de Broise, 1857. — [4], 248, [4] p. ; 187 mm 8vo. Printed wrappers. — One of 1,100 copies on papier vélin. Bibliography: Carteret I, 115; Clouzot, 37. Provenance: Bookplate of Poulet-Malassis (publisher's copy). Condition: Very Good. Light foxing to preliminaries, wrappers lightly soiled, spine slightly darkened.

And in French:

> Baudelaire, Charles. Les Fleurs du mal / par Charles Baudelaire. — Édition originale. — Paris : Poulet-Malassis et de Broise, 1857. — [4], 248, [4] p. ; 187 mm 8vo. Couverture imprimée. — Un des 1 100 exemplaires sur papier vélin. Bibliographie : Carteret I, 115 ; Clouzot, 37. Provenance : Ex-libris de Poulet-Malassis (exemplaire de l'éditeur). État : Très bon. Légères rousseurs aux préliminaires, couvertures légèrement salies, dos légèrement assombri.

---

## Common Mistakes

**Cataloging from the cover, not the title page.** Covers lie. Spines abbreviate. The title page is the source of truth.

**Inventing edition statements.** If the book does not say "First edition," do not write "First edition." You may note in Area 7 that you *believe* it to be a first edition based on bibliographic evidence, but the edition area is for transcription, not deduction.

**Confusing dimensions.** ISBD uses height only (in centimeters in library practice, in millimeters in Shelvd). Width is included in Shelvd for collector thoroughness but is not standard ISBD.

**Over-abbreviating.** Write "illustrated by", not "illus." The abbreviations in ISBD are prescribed — don't invent your own.

**Omitting the condition.** Library catalogers don't record condition because institutional copies are assumed to be complete. Collectors and dealers always record condition. In Shelvd, condition is part of Area 7 (Notes) because it matters.
