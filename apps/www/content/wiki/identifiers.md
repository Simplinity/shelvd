# ISBN, OCLC, LCCN, DDC, LCC, UDC: An Alphabet Soup That Actually Matters

Every book accumulates identifiers the way a traveler accumulates passport stamps. Each one connects the book to a different system, a different catalog, a different way of organizing human knowledge. Here's what they all mean.

## ISBN — International Standard Book Number

The big one. Introduced in 1970 (based on a British system from 1966), the ISBN uniquely identifies a specific edition of a book from a specific publisher.

- **ISBN-10**: The original format, 10 digits. Used until 2007.
- **ISBN-13**: The current format, 13 digits, starting with 978 or 979. Every ISBN-10 can be converted to ISBN-13.

Where to find it: back cover, copyright page, or barcode. Books published before 1970 don't have one — which is a significant portion of any serious collection.

Shelvd has separate fields for ISBN-13 and ISBN-10. If you enter one, the other can often be derived automatically during lookup.

## OCLC — Online Computer Library Center Number

A unique identifier assigned by WorldCat, the world's largest library catalog (500+ million records). The OCLC number connects your book to every library in the world that holds a copy.

Where to find it: you typically don't find it in the book — it comes from library catalog records. Library Lookup and Enrich Mode can pull it in automatically.

## LCCN — Library of Congress Control Number

Assigned by the Library of Congress to works they catalog. Not every book has one, but American publications generally do.

Where to find it: copyright page (often printed as "Library of Congress Catalog Card Number" or "LCCN").

## DDC — Dewey Decimal Classification

The classification system used by most public libraries worldwide. A number like "823.912" tells you the book is English fiction from the early twentieth century.

## LCC — Library of Congress Classification

An alphanumeric system used by academic and research libraries. "PR6039.O32" is the LCC for Tolkien's works. More granular than Dewey, more American than universal.

## UDC — Universal Decimal Classification

An expansion of Dewey used primarily in European libraries. More detail, more flexibility, fewer American assumptions.

## Catalog ID

Your own personal identifier — whatever numbering system you use for your physical shelves. "A-137," "Poetry-042," "The one on the third shelf behind the armchair." Shelvd doesn't judge your system.

## In Shelvd

All identifier fields are in the **Identifiers** section of the Add/Edit form. You don't need to fill them all in manually — Library Lookup and Enrich Mode can populate most of them automatically from library records.

The identifiers serve two purposes: they help you find the book in external catalogs, and they help the duplicate detection system identify books you might own twice.
