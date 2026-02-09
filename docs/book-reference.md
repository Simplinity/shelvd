# Book Reference

Domain knowledge for Shelvd: bindings, conditions, book parts, and illustration types.

---

## Conditions

Standard condition grades for describing the physical state of books. Ordered from best to worst.

| Grade | Name | Description |
|-------|------|-------------|
| **M** | Mint | As new. The book will be in the state one would expect to find on the shelf of a bookshop selling new books, behind the books already fingered by browsers. |
| **F+** | Fine Plus | Indicates better than Fine without reaching the Mint level. |
| **F** | Fine | Almost as new. No major blemishes but the book has signs of being previously owned. The page edges will be clean, the contents sound, no major faults and any minor faults will be specified. |
| **VG+** | Very Good Plus | Indicates better than Very Good without reaching the Fine level. |
| **VG** | Very Good | Showing signs of previous ownership. Corners may be a little bumped and/or the cloth rubbed, page edges may be dusty or browned, there may some writing on the flyleaf (ffep) and in the case of the dustwrapper, rubbing, clipping of price from the flap, short edge tears and/or minor chipping. Too many of these faults will take the book into the next category. |
| **G+** | Good Plus | Indicates better than Good without reaching the Very Good level. |
| **G** | Good | Showing major signs of previous ownership. Likely to have bumped corners and/or spine ends, marked page edges and bear signs of reading on a number of previous occasions with ownership label/inscription etc. Dustwrapper probably well rubbed, some tears and/or chipping, overall soiling, etc. Again, too many of these faults will take the book into the next category. |
| **G-** | Good Minus | Not of the expected standard for that category but better than a reading copy. If of a dustwrapper then it is better than in pieces but not really of a standard that could be called Good. |
| **P** | Poor | Reading or reference copy only. The text will be complete but illustrations may be missing and the cloth may be very worn marked and/or torn. Any dustwrapper, if present, is likely to be in pieces or with major portions missing. |

**Usage:** Conditions apply to both the book and any dustwrapper separately. The "+" and "-" modifiers provide nuance. Always specify specific defects rather than relying solely on the grade.

**DB table:** `conditions` — id (UUID), abbreviation (VARCHAR 10), name (VARCHAR 50), description (TEXT), sort_order (INT)

---

## Bindings

Types of book bindings, grouped by method.

### Non-adhesive

| Name | Alias | Description |
|------|-------|-------------|
| **Pamphlet stitch bound** | - | Single signatures sewn through 3, 5, or 7 holes in the fold. |
| **Stab-binding** | Japanese binding | Single sheets bound by sewing through holes near the spine edge. Four major Japanese patterns. Books won't lay flat. |
| **Long stitch bound** | Medieval limp binding | Signatures and cover bound together with a single thread going in and out of slotted or pierced cover. |
| **Coptic binding** | - | Exposed spine sewing where thread loops around previous signature's thread. |
| **Piano hinge binding** | Skewer binding | Sculptural method using pins in alternating slots. Creates dovetail hinge when opened. |
| **Compound binding** | - | Two or more binding types combined. Includes dos-à-dos, French doors, and concertina formats. |
| **Secret Belgian binding** | - | Creates hardcover illusion with separate front, back, and spine boards. |
| **Spiral binding** | Wire binding | Holes punched near edge, held by wire or plastic coils. |
| **Screw-post binding** | - | Pages held between boards using screws. |

### Adhesive

| Name | Alias | Description |
|------|-------|-------------|
| **Perfect binding** | Paperback binding | Pages hot-glued at spine, cover folded around. Standard for paperbacks. |
| **Bound on boards** | - | Cardboard covers without cardboard spine. Needs endpapers to attach boards. |
| **Case binding** | Case wrapped book | Book block and cover made separately, then combined. Most common for professional hardcovers. |
| **German binding** | Bradel binding | Distinctive deep grooves at hinges. Always sewn on cords with rounded spine. |
| **French binding** | - | Hinge visible on outside. Boards tight against shoulder. Bound on ropes, covered in leather or parchment. |
| **English binding** | Classic binding | Real ribs from thick sewing ropes visible on spine. Very sturdy. |
| **Springback binding** | Ledger binding | Spine springs up when opened. Lays perfectly flat. |
| **Overcast block sewed** | Whip stitch | Glued spine with drilled holes, then whip-stitched. |
| **Sewn binding** | - | Signatures sewn through fold, glued at spine. Most durable method. |

### Mechanical

| Name | Alias | Description |
|------|-------|-------------|
| **Saddle stitching** | - | Folded pages stapled through spine fold. Used for booklets and magazines. |
| **Staple bound** | - | Stacked sheets stapled through edge. Quick but less durable. |

### Unbound

| Name | Description |
|------|-------------|
| **Loose leaves** | Unbound sheets kept in portfolio, box, or folder. Common for prints, maps, music. |

**DB table:** `bindings` — id (UUID), name (VARCHAR 100), alias (VARCHAR 100), group_name (VARCHAR 50), description (TEXT), image_url (TEXT), sort_order (INT)

---

## Book Parts

### Front Matter

| Part | Description |
|------|-------------|
| **Half title** | Single line with title only, precedes title page, blank verso. |
| **Title page** | Repeats title and author as printed on cover or spine. |
| **Colophon (front)** | Edition dates, copyrights, typefaces, printer info. Also called Edition notice or Copyright page. |
| **Frontispiece** | Decorative illustration facing title page, often author portrait. |
| **Dedication** | Author names person(s) for whom book was written. |
| **Epigraph** | Phrase, quotation, or poem serving as preface or literary context. |
| **Contents** | List of chapter headings with page numbers. |
| **Foreword** | Written by someone other than author. |
| **Preface** | Author's account of how book came into being, often with acknowledgments. |
| **Acknowledgment** | Recognition of contributors, often part of Preface. |
| **Introduction** | States purpose and goals of the work. |
| **Prologue** | Opening that establishes setting and background details. |

### Body

| Part | Description |
|------|-------------|
| **Volume Page** | Indicates division into volumes. |
| **Chapter Page** | Chapter or section divider. |
| **First Page** | Opening page of text, often with special design features like drop caps. |

### Back Matter

| Part | Description |
|------|-------------|
| **Epilogue** | Concluding piece bringing closure. |
| **Extro / Outro** | Conclusion, opposite of intro. |
| **Afterword** | Covers how book came into being or idea developed. |
| **Conclusion** | Summarizes main points, restates thesis. |
| **Postscript** | Additional note added after main text. |
| **Appendix / Addendum** | Supplemental material correcting errors or adding detail. |
| **Glossary** | Alphabetized definitions of important terms. |
| **Bibliography** | Works consulted, common in non-fiction. |
| **Index** | Alphabetized list of terms with page references. |
| **Colophon (back)** | Production notes at book's end, may include printer's mark. |
| **Postface** | Brief concluding note by author reflecting on the work. |

### Physical Parts

| Part | Description |
|------|-------------|
| **Front Cover** | Front of book with title, author, possibly illustration. |
| **Front endpaper (FEP)** | Inside front cover extending to facing page. Free half is flyleaf. |
| **Spine** | Vertical edge when shelved. Contains author, title, publisher. |
| **Endpaper** | Inside back cover, design matches front endpaper. |
| **Back Cover** | Often contains author bio, quotes, summary. |
| **Dust Jacket - Front/Back/Complete** | Removable paper cover. |

**DB table:** `book_parts` — id (UUID), matter (VARCHAR 20), purpose (VARCHAR 100), description (TEXT), sort_order (INT)

---

## Illustration Types

| Type | Description |
|------|-------------|
| **Wood Engraved** | Cut on end grain with burin, allows fine detail. |
| **Etched** | Copper plate with acid-resistant ground, image drawn with needle, acid bites exposed areas. |
| **Metal Engraved** | Intaglio, design incised directly into metal with burin. |
| **Lithograph** | Image drawn with greasy medium on limestone. |
| **Halftoned** | Continuous tone simulated through dots of varying size/spacing. Used for photographs. |
| **Hand Colored** | Color applied by hand after printing, typically watercolors. |
| **Woodcut** | Oldest technique. Image carved with grain into wooden planks. |
| **Copper Engraved** | Intaglio, design incised into copper plate. Crosshatching for tones. |
| **Photogravure** | Photomechanical intaglio reproducing continuous tones of photographs. |
| **Tinted Lithograph** | Lithograph with second tint stone for background color. |
| **B&W / Color (generic)** | Technique unknown. |
