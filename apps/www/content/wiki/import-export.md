# Getting Data In and Out Without Losing Your Mind

*Excel import, CSV/JSON/Excel export, and the quiet dignity of structured data transfer.*

---

## The Promise

Your data is yours. Shelvd will never hold it hostage behind a paywall, a proprietary format, or a vague promise that "export is coming soon." You can get your entire library out of Shelvd at any time, in multiple formats, with all the fields you entered. You can also bring data *in* — from spreadsheets, from other tools, from that Excel file you've been maintaining since 2009 and are slightly afraid to open.

---

## Importing: From Spreadsheet to Shelvd

### The Template

Shelvd provides a downloadable Excel template with all supported columns. This is the easiest path: download the template, fill in your data, upload.

Go to **Books → Import** and download the template. It includes columns for:

- **Core fields:** title, subtitle, author, publisher, year, edition
- **Identifiers:** ISBN-13, ISBN-10, OCLC, LCCN
- **Physical description:** pagination, height, width, format, cover type, binding
- **Condition:** condition grade, dust jacket condition, condition notes
- **Valuation:** purchase price, estimated value, currency
- **Classification:** BISAC codes, DDC, LCC
- **Notes:** summary, internal notes, condition notes

### The Import Process

1. **Upload your file** — Excel (.xlsx) or CSV
2. **Column mapping** — Shelvd auto-maps columns by header name. If your headers don't match exactly, you can map them manually.
3. **Preview** — Review the first few rows to make sure everything looks right.
4. **Import** — Books are created in your library.

### Tips for a Clean Import

- **One book per row.** This seems obvious, but multi-volume works tempt people into creative row-spanning.
- **ISBNs as text.** If Excel has helpfully converted your ISBN to a number and dropped the leading zero, format the column as text before entering data.
- **Authors in "Last, First" format.** The system will try to parse other formats, but "Tolkien, J.R.R." is the safest bet.
- **Dates as years.** Enter `1847`, not `01/01/1847`. Publication year is a year, not a date.
- **Run duplicate detection after import.** You will have duplicates. Everyone does. See [Duplicate Detection](/wiki/duplicate-detection).

---

## Exporting: Getting Your Data Out

### Formats

Shelvd exports in three formats:

| Format | Best for | Details |
|--------|----------|---------|
| **Excel (.xlsx)** | Spreadsheet work | Full formatting, column headers, ready for Excel/Sheets |
| **CSV** | Universal interchange | Plain text, comma-separated, works everywhere |
| **JSON** | Developers, backups | Structured data, all fields, machine-readable |

### What Gets Exported

Everything. Every field you entered, every identifier, every condition note, every provenance entry. The export is a complete snapshot of your library data.

### Selective Export

You can export:

- **All books** — your entire library
- **A collection** — just the books in a specific collection
- **Selected books** — check the boxes in the books list, then export

### How to Export

1. Go to **Books** (list view)
2. Click the **Export** button in the header
3. Choose your format
4. Choose your scope (all, collection, or selected)
5. Download

The file will contain one row per book with all fields. Contributors are comma-separated in a single column. External links are included as URLs.

---

## A Word on Data Portability

We believe your book data should outlive any software you use to manage it. Shelvd could disappear tomorrow — hit by a bus, acquired by a company that "sunsets" features, or simply abandoned by its maker when he finally runs out of shelf space. Your data should survive all of these scenarios.

Export regularly. Keep backups. Your library is an asset, and its catalog is part of that asset. Treat the data with the same care you'd give the books.

---

*See also: [Your First Book](/wiki/your-first-book) · [Duplicate Detection](/wiki/duplicate-detection) · [Statistics](/wiki/statistics)*
