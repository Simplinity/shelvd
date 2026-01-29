# Book Conditions

Standard condition grades used for describing the physical state of books. Ordered from best to worst.

| Grade | Name | Description |
|-------|------|-------------|
| **M** | Mint | As new. The book will be in the state one would expect to find on the shelf of a bookshop selling new books, behind the books already fingered by browsers. |
| **F+** | Fine Plus | Indicates better than Fine without reaching the Mint level. |
| **F** | Fine | Almost as new. No major blemishes but the book has signs of being previously owned. The page edges will be clean, the contents sound, no major faults and any minor faults will be specified. |
| **VG+** | Very Good Plus | Indicates better than Very Good without reaching the Fine level. |
| **VG** | Very Good | Showing signs of previous ownership. Corners may be a little bumped and/or the cloth rubbed, page edges may be dusty or browned, there may some writing on the flyleaf (ffep) and in the case of the dustwrapper, rubbing, clipping of price from the flap, short edge tears and/or minor chipping. Too many of these faults will take the book into the next category. |
| **G+** | Good Plus | Indicates better than Good without reaching the Very Good level. |
| **G** | Good | Showing major signs of previous ownership. Likely to have bumped corners and/or spine ends, marked page edges and bear signs of reading on a number of previous occasions with ownership label/inscription etc. Dustwrapper probably well rubbed, some tears and/or chipping, overall soiling, etc. Again, too many of these faults will take the book into the next category. |
| **G-** | Good Minus | G- means that it is not of the expected standard for that category but that it is better than a reading copy. If of a dustwrapper then it is better than in pieces but not really of a standard that could be called Good. |
| **P** | Poor | This is a reading or reference copy only. The text will be complete but illustrations may be missing and the cloth may be very worn marked and/or torn. It is probable that only the major faults will be mentioned as the minor ones will be too numerous. The book may even be disbound but if so this will be specifically mentioned. Any dustwrapper, if present, is likely to be in pieces or with major portions missing. |

## Usage Notes

- Conditions apply to both the book itself and any dustwrapper (dust jacket)
- When describing a book with dustwrapper, both conditions should be noted separately if they differ
- The "+" and "-" modifiers provide nuance between main grades
- Always specify specific defects rather than relying solely on the grade

## Database Reference

Table: `conditions`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| abbreviation | VARCHAR(10) | Short code (M, F, VG, etc.) |
| name | VARCHAR(50) | Full name |
| description | TEXT | Detailed explanation |
| sort_order | INT | Display order (1 = best) |
