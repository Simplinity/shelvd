# Finding That One Book You Know You Own

You own it. You cataloged it. You know it's there. You just can't find it. This is what search is for.

## Global Search

The search bar at the top of the books list searches across your entire library. Type anything — a title, an author, an ISBN, a publisher — and results appear instantly.

Global search is client-side: Shelvd loads your complete book list (yes, all 5,000+ if that's what you have) and filters in the browser. This means search is fast — no waiting for server round-trips.

## Advanced Search

For more precise queries, click the Advanced Search toggle. This opens 14 searchable fields:

- Title, Subtitle, Author, Publisher
- Publication Year (from/to range)
- ISBN-13, ISBN-10, OCLC, LCCN
- Series, Edition, Condition
- Storage Location, Topic

Each field supports partial matching — type "Shak" in the author field and you'll find Shakespeare (and anyone else whose name contains "Shak").

## AND / OR Logic

Advanced search supports two modes:

- **AND** (default) — all criteria must match. Title "Hamlet" AND Author "Shakespeare" returns only Hamlet by Shakespeare.
- **OR** — any criterion can match. Title "Hamlet" OR Author "Marlowe" returns Hamlet (any author) and anything by Marlowe.

## Sorting

The books list can be sorted by:

- Title (A–Z / Z–A)
- Author (A–Z / Z–A)
- Year (newest/oldest first)
- Date added (most recent first)
- Condition
- Value

Click any column header to sort. Click again to reverse.

## Filters

Beyond search, you can filter the books list by:

- **Collection** — show only books in a specific collection (Library, Wishlist, custom)
- **Tag** — show only books with a specific tag
- **Both** — collection + tag filters stack (intersection: books must match both)

Filters appear as indicators in the UI. Click the X to clear them.

## Tips for Large Libraries

If you have thousands of books:

- Use Advanced Search with multiple fields to narrow results quickly
- Combine collection and tag filters before searching
- Use the **Storage Location** field to record physical locations — then search by location when you need to find the actual book on the actual shelf
- Keep author names consistent ("Shakespeare, William" not "W. Shakespeare") — consistent data makes search reliable
