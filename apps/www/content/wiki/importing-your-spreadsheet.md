# From Spreadsheet to Civilization

You have a spreadsheet. Of course you do. Every collector has one — the file that started small, grew unwieldy, and now contains 2,000 rows of varying quality, three different date formats, and a column called "misc" that you're afraid to open.

Shelvd can import it.

## The Template

Before you import anything, download the Shelvd Excel template from the Import page. It shows you exactly which columns Shelvd expects, in what order, with what formatting. You can either:

1. **Paste your data into the template** — map your columns to the right headers
2. **Rename your columns** to match the template headers — if your spreadsheet is already close

The template columns include: title, subtitle, author, ISBN-13, ISBN-10, publisher, publication year, edition, condition, and many more. Not all are required. Title is the only truly mandatory field.

## The Import Process

1. Go to **Books → Import** (or find it in the navigation)
2. Upload your .xlsx file
3. Shelvd reads the headers and maps them to fields
4. Preview the data — check for obvious problems
5. Click **Import**

The import creates one book per row. Authors are parsed into "Last, First" format. ISBNs are validated. Dates are normalized. Empty rows are skipped.

## What to Expect

Be realistic. A spreadsheet import is a migration, not a miracle.

- **Clean data** imports beautifully. If your spreadsheet has consistent formatting, proper ISBNs, and actual titles, you'll be delighted.
- **Messy data** imports less beautifully. Merged cells, inconsistent author names, dates in three formats — these will produce records that need manual cleanup.
- **Missing data** is fine. Empty cells become empty fields. You can fill them in later with Enrich Mode.

## After the Import

Once your books are in, the real work begins:

1. **Spot-check** a few records to make sure the mapping was correct
2. **Run a Collection Audit** to see which fields are missing across your library
3. **Use Enrich Mode** on books with ISBNs to pull in metadata from library catalogs
4. **Fix author names** that didn't parse correctly (the Contributors page in Settings can help)

The spreadsheet was the beginning. Shelvd is where the catalog starts to breathe.

## Supported Formats

Currently: **.xlsx** (Excel). If you have a .csv, open it in Excel first and save as .xlsx. If you have a .numbers file, export to Excel. If you have a handwritten ledger, we admire your commitment but cannot help programmatically.

## Export Too

What goes in must come out. Shelvd exports to Excel, CSV, and JSON — so your data is never trapped. See the Import/Export article for full details.
