# The Awkward Conversation: You Own This Twice

*How duplicate detection works, how to clean up, and why it happens to the best of us.*

---

## It Happens to Everyone

You bought a book at a fair. You brought it home. You put it on a shelf. Six months later, you bought the same book at a different fair. You brought it home. You put it on a different shelf. And now you own two copies of *The Anatomy of Melancholy* and zero copies of the self-awareness required to have noticed.

This is not a character flaw. This is a collecting hazard. When your library contains more than a few hundred volumes, your memory becomes an unreliable narrator. Shelvd's duplicate detection exists because your brain will betray you, and your wallet shouldn't have to pay the price twice.

---

## How It Works

Shelvd checks for duplicates using **server-side SQL** — not a vague similarity score, but exact matching on identifiers and titles. The system runs three checks:

### ISBN-13 Match
If two books share the same ISBN-13, they are the same edition. This is the most reliable match. An ISBN-13 identifies a specific edition from a specific publisher. If you have two entries with the same one, one of them is redundant — unless you genuinely meant to catalog two physical copies.

### ISBN-10 Match
Same principle, older format. Books published before 2007 may have an ISBN-10 but no ISBN-13. Shelvd matches these separately because the conversion isn't always present.

### Exact Title Match
If two books have exactly the same title (case-sensitive), Shelvd flags them. This catches duplicates where ISBNs weren't entered — common for antiquarian books. It does produce some false positives: you might legitimately own two different editions of *Hamlet*. That's fine. The system flags; you decide.

---

## The Duplicates Page

Navigate to **Books → Duplicates** to see your grouped results.

Each group shows the matched books with their key details: title, author, year, ISBN, and condition. Books are grouped by match type, so you can see *why* Shelvd thinks they're duplicates.

### What You Can Do

- **Expand a group** to see the full details of each match
- **Select individual books** to mark for deletion
- **Select all in a group** with one click
- **Bulk delete** selected duplicates

The system never auto-deletes. It flags. You review. You decide. Because sometimes you *do* own two copies of the same book — one for reading, one for the shelf. We don't judge. Much.

---

## Preventing Duplicates

The best duplicate is the one that never happens.

- **Always enter ISBNs** when available. They're the strongest match signal.
- **Use Library Lookup** instead of manual entry — it pulls standardized data that's easier to match.
- **Search before adding** — use the global search to check if you already have a title.

If you're importing from a spreadsheet, duplicates are almost inevitable. Run the duplicate check after every import. Think of it as the bibliographic equivalent of checking your pockets before doing laundry.

---

## A Note on False Positives

The title match will flag books with identical titles that are genuinely different works — different authors, different centuries, different everything. *Metamorphoses* by Ovid and *Metamorphoses* by Kafka are not the same book. The system knows this feels obvious. But computers are literal creatures, and titles are not unique identifiers.

Review the groups. Keep what's distinct. Delete what's duplicate. Your shelves (and your budget) will thank you.

---

*See also: [Identifiers](/wiki/identifiers) · [Import & Export](/wiki/import-export) · [Your First Book](/wiki/your-first-book)*
