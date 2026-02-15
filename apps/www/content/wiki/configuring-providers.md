# Choosing Your Libraries

*Enable, disable, and prioritize the 27 library providers that power Book Lookup. Because not everyone needs the National Diet Library of Japan. (But you might.)*

---

## Where to Find It

**Settings → Book Lookup** (or `/settings?tab=book-lookup`).

You'll see a list of all 27 available providers, each with a toggle and a drag handle for ordering. Providers are grouped by country and type.

---

## What "Active" Means

An **active** provider appears in the Book Lookup dropdown when you search. An inactive provider doesn't. That's it. No data is deleted, no preferences are lost — you're just controlling which libraries appear in your search interface.

By default, all providers are active. This is generous but noisy. If you only collect French and Belgian books, you probably don't need the National Diet Library of Japan, Trove Australia, or the Library of Congress cluttering your dropdown.

---

## Priority Order

The order of providers in Settings determines the order in the Lookup dropdown. Drag providers to reorder them. Put your most-used library at the top.

**Recommended approach:**
1. Your country's national library (e.g., KBR for Belgium, BnF for France, LoC for the US)
2. Open Library (broad coverage, good for modern books)
3. WorldCat (if you want OCLC numbers)
4. Regional specialties (CERL HPB for pre-1830, HathiTrust for digital availability)
5. Everything else

---

## Which Providers Support What

Not all providers offer the same search capabilities:

### Full Field Search
Most providers support searching by title, author, publisher, year, and ISBN. These appear with all search fields in the Lookup form.

### ISBN-Only Lookup
**HathiTrust** only supports identifier-based lookup (ISBN, OCLC, LCCN). You can't search by title or author — you need to know the ISBN. This is by design: HathiTrust is a digital archive, not a discovery tool.

### Enrich Mode
Only providers that support field search can be used in Enrich mode (the "Search other providers" option on the edit page). ISBN-only providers can still be used for direct ISBN enrichment.

---

## A Sensible Starting Configuration

**For collectors of modern books (post-1900):**
Open Library → your national library → Google Books

**For antiquarian collectors (pre-1900):**
Your national library → CERL HPB → WorldCat → relevant European libraries

**For Belgian collectors specifically:**
KBR → Unicat → BnF → DNB → Open Library

**For Scandinavian collections:**
Your national library (Libris/BIBSYS/Finna/DanBib) → Open Library → WorldCat

**For maximum coverage (the completist approach):**
Leave everything on. Accept the long dropdown. Embrace the chaos.

---

## Changes Take Effect Immediately

Toggle a provider off, and it disappears from the Lookup dropdown on your next search. No save button, no page reload needed. The setting is per-user — it doesn't affect other users.

---

*See also: [The 27 Providers](/wiki/the-22-providers) · [Library Lookup](/wiki/library-lookup) · [Settings Guide](/wiki/settings-guide)*
