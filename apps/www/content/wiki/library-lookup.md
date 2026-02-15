# Library Lookup: Let the World's Libraries Do Your Typing

Typing out every field for every book is a noble pursuit. It is also a terrible use of your Sunday afternoon. This is why Library Lookup exists.

## How It Works

Go to **Book Lookup** from the navigation. You'll see a search form with a provider dropdown and fields for title, author, publisher, year range, and ISBN.

Pick a provider. Type something. Click **Search**.

Shelvd will query the selected library catalog and return matching records. Each result shows the title, author, publisher, year, and — when available — a cover thumbnail. Click any result to see the full details that library has on file.

If the record looks right, click **Add to Library** and the metadata flows into your book form, pre-filled and ready to review.

## Choosing a Provider

The dropdown contains your active providers — up to 27 libraries across 20 countries. Not all providers are equal:

- **Open Library** and **Google Books** are fast and have good cover images, but thin on bibliographic detail
- **Library of Congress**, **BnF**, and **DNB** have deep, precise MARC records — ideal for scholarly cataloging
- **CERL HPB** specializes in European rare books from 1455–1830, with provenance and printer data
- **HathiTrust** covers 13 million digitized volumes and tells you which libraries hold the book
- **DanBib**, **Finna**, **Libris** — national catalogs with excellent coverage of their own countries' output

The right provider depends on the book. A Danish novel? Try DanBib. A sixteenth-century Aldine? CERL HPB. A modern American first edition? Library of Congress.

You can configure which providers are active and in what order in **Settings → Book Lookup**.

## ISBN Search vs. Field Search

Some providers only support ISBN lookup (like HathiTrust). Others support full field search — title, author, publisher, year range — which is essential for older books that predate the ISBN system (everything before 1970, give or take).

When you select a provider that only does ISBN lookup, the field search inputs will be disabled. This isn't a bug — the provider's API simply doesn't support it.

## From Search Result to Book

When you find the right record and click **Add to Library**, Shelvd does several things:

1. Pre-fills the add form with all available metadata
2. Converts author names to "Last, First" format
3. Creates an external link back to the source record
4. Lets you review everything before saving

You're never locked in. Change anything, add anything, delete anything. The lookup gives you a head start, not a fait accompli.

## Tips

- **Try multiple providers** for the same book — different libraries hold different information
- **Use year range** to narrow results when a title is common
- **Don't despair** if a provider returns no results — not every book is in every catalog
- **Enrich later** — you can always search again from the Edit page using Enrich Mode

The world's libraries have been cataloging books for centuries. Let them do some of the work.
