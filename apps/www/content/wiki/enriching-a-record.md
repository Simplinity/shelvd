# Enrich Mode: Stealing Metadata, Politely

You've added a book. It has a title, an author, maybe an ISBN. But the publisher field is empty. The pagination is blank. The binding type says nothing. The record is functional but anemic.

This is what Enrich Mode is for.

## What Enrich Does

Enrich Mode lets you pull metadata from library catalogs directly into an existing book record. It searches using the book's ISBN (or, if there's no ISBN, by title and author), fetches the library's data, and shows you a field-by-field comparison.

You then choose which fields to accept, which to ignore, and which to override. It's a merge, not a replacement.

## How to Use It

1. Open any book's **Edit** page
2. Click the **Enrich** button in the header bar (next to Cancel and Save)
3. Shelvd searches your active providers using the book's ISBN
4. When a match is found, you see a comparison table

The comparison shows three types of fields:

- **NEW** (green, pre-checked) — the library has data you don't. Accept it.
- **DIFFERENT** (amber, unchecked) — you have a value but the library has a different one. Review it.
- **Same** (hidden) — both records agree. Nothing to do.

Check the fields you want to merge, click **Apply**, and the data flows into your form. Review the result, then **Save**.

## No ISBN? No Problem

If your book doesn't have an ISBN — and many pre-1970 books don't — Enrich Mode offers a fallback: a mini search form with the book's title and author pre-filled, plus a provider picker. Search manually, find the right record, and enrich from there.

## Multi-Provider Enrichment

Different libraries hold different information. The BnF might have the pagination but not the binding type. The Library of Congress might have the subjects but not the physical dimensions. CERL HPB might have the printer and provenance that nobody else has.

You can enrich the same book from multiple providers, one after another. Each pass fills in more gaps. After three or four providers, your record starts looking like something a professional cataloger would be proud of.

## Smart Author Handling

Enrich Mode is clever about author names. It knows that "Tolkien, J.R.R." and "J.R.R. Tolkien" are the same person. It won't add duplicates. It will, however, add genuinely new contributors — a translator the library record mentions that you didn't know about, or an illustrator whose name appears in the MARC record.

New authors are automatically converted to "Last, First" format and merged into your contributors list.

## When to Enrich

- **After a manual add** — fill in the gaps you skipped
- **After an import** — spreadsheet data is often incomplete
- **When you discover a new provider** — enable it and enrich your existing records
- **Before generating a catalog or PDF** — ensure the record is as complete as possible

The goal is simple: get the best possible record by combining what you know with what the world's libraries know. Your knowledge of condition, provenance, and history stays. Their knowledge of pagination, classification, and publication details fills in the rest.
