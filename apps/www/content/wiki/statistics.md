# Numbers About Your Books (the Other Kind of Value)

*The statistics dashboard: what it measures, what it reveals, and why staring at charts about your own library is a perfectly normal thing to do.*

---

## Why Statistics?

Because you own hundreds (or thousands) of books and you have *no idea* what your collection actually looks like as a whole. You know individual books — that's the easy part. But what's the overall condition distribution? What's your average purchase price? Which decade are most of your books from? How much of your collection is properly cataloged?

The Statistics dashboard at `/stats` turns your library into numbers. Not because numbers are better than books, but because they reveal patterns you can't see one spine at a time.

---

## Key Metrics

At the top of the dashboard, four numbers:

- **Total Books** — how many entries in your library
- **Total Value** — the sum of all estimated values (in your display currency)
- **Total Cost** — what you've spent (sum of purchase prices)
- **Unrealized Gain/Loss** — the difference, expressed as a percentage. Green if you're up. Red if you're an optimist.

All monetary values are converted to your display currency using ECB exchange rates via the Frankfurt API. If you paid £500 for a book and your currency is EUR, the conversion happens automatically.

---

## Distributions

### By Condition
A bar chart showing how many books fall into each condition grade: Fine, Near Fine, Very Good, Good, Fair, Poor. If your "Fair" bar is taller than your "Fine" bar, you might be a dealer. Or an honest cataloger.

### By Status
How many books are in your collection vs. on sale, lent out, ordered, or in transit.

### By Acquisition Year
When did you buy your books? A timeline that reveals spending patterns, binge years, and suspicious gaps that coincide with "I was going to stop buying for a while."

### By Value Range
A histogram grouping books by estimated value: under €10, €10-50, €50-200, €200-1000, over €1000. Useful for insurance planning and for confirming that, yes, most of your collection is under €50 and that's perfectly fine.

---

## Top 10 Lists

- **Most Valuable Books** — your crown jewels, ranked by estimated value
- **Most Expensive Purchases** — where the money went
- **Best Gains** — books that appreciated the most (in absolute or percentage terms)

These lists link directly to the book detail pages, so you can click through and admire (or question) your decisions.

---

## Currency Conversion

All values are displayed in your **display currency** (set in Settings → Configuration). If your collection spans multiple purchase currencies — pounds for London auctions, euros for Belgian fairs, dollars for online purchases — Shelvd converts everything using daily ECB rates.

A "Rates as of" date is shown so you know how current the conversion is. Exchange rates update daily. Your book values update whenever you update them. The two are independent.

---

## What Statistics Don't Tell You

Statistics measure what's in the database. If you haven't entered purchase prices, the value calculations will be incomplete. If you haven't graded conditions, the distribution will be empty. The dashboard is only as good as your data.

This is, incidentally, a strong argument for running the [Collection Audit](/wiki/collection-audit). The audit tells you *what's missing*. Statistics tell you *what's there*. Together, they give you the full picture.

---

*See also: [Collection Audit](/wiki/collection-audit) · [Valuation History](/wiki/valuation-history) · [Import & Export](/wiki/import-export)*
