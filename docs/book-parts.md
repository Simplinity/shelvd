# Book Parts

Components and sections of a book, organized by their location and function.

## Front Matter

Elements that appear before the main text of the book.

| Part | Description |
|------|-------------|
| **Half title** | Single line with title only, precedes title page, blank verso. |
| **Title page** | Repeats title and author as printed on cover or spine. |
| **Colophon (front)** | Edition dates, copyrights, typefaces, printer info. Also called Edition notice or Copyright page. |
| **Frontispiece** | Decorative illustration facing title page, often author portrait or subject-related image. |
| **Dedication** | Author names person(s) for whom book was written. |
| **Epigraph** | Phrase, quotation, or poem serving as preface, summary, or literary context. |
| **Contents** | List of chapter headings and subheadings with page numbers. |
| **Foreword** | Written by someone other than author, tells of interaction with work or author. |
| **Preface** | Author's account of how book came into being, often with acknowledgments. |
| **Acknowledgment** | Recognition of contributors, often part of Preface. |
| **Introduction** | States purpose and goals of the work. |
| **Prologue** | Opening that establishes setting and background details. |

## Body

The main content of the book.

| Part | Description |
|------|-------------|
| **Volume Page** | Indicates division into volumes (set of bound leaves). |
| **Chapter Page** | Chapter or section divider within the work. |
| **First Page** | Opening page of actual text, often with special design features like drop caps. |

## Back Matter

Elements that appear after the main text.

| Part | Description |
|------|-------------|
| **Epilogue** | Concluding piece bringing closure to the work. |
| **Extro / Outro** | Conclusion, opposite of intro (term more common in music). |
| **Afterword** | Covers how book came into being or idea developed. |
| **Conclusion** | Summarizes main points, restates thesis, provides final thoughts. |
| **Postscript** | Additional note added after main text, supplementary information or corrections. |
| **Appendix / Addendum** | Supplemental material correcting errors or adding detail. |
| **Glossary** | Alphabetized definitions of important terms. |
| **Bibliography** | Works consulted, common in non-fiction. |
| **Index** | Alphabetized list of terms with page references. |
| **Colophon (back)** | Production notes at book's end, may include printer's mark. |
| **Postface** | Brief concluding note by author reflecting on the work. |

## Physical Parts

The physical components of a book.

| Part | Description |
|------|-------------|
| **Front Cover** | Front of book with title, author, possibly illustration. |
| **Front endpaper (FEP)** | Inside front cover extending to facing page. Free half is flyleaf. |
| **Spine** | Vertical edge when shelved. Contains author, title, publisher. |
| **Endpaper** | Inside back cover, design matches front endpaper. |
| **Back Cover** | Often contains author bio, quotes, summary. |
| **Dust Jacket - Front** | Front of removable paper cover. |
| **Dust Jacket - Back** | Back of removable paper cover. |
| **Dust Jacket - Complete** | Full unfolded dust jacket. |

## Illustration Types

Printing techniques used to create book illustrations.

| Type | Description |
|------|-------------|
| **Wood Engraved** | Cut on end grain of wood with burin, allows fine detail. More precise than woodcuts. |
| **Etched** | Copper plate covered with acid-resistant ground, image drawn with needle, acid bites exposed areas. |
| **Metal Engraved** | Intaglio technique, design incised directly into metal with burin. Fine detailed lines. |
| **Lithograph** | Image drawn with greasy medium on limestone, ink adheres to image, repelled by wet stone. |
| **Halftoned** | Continuous tone simulated through dots of varying size/spacing. Used for photographs. |
| **Hand Colored** | Color applied by hand after printing, typically watercolors. Labor-intensive, for luxury editions. |
| **Woodcut** | Oldest technique. Image carved with grain into wooden planks, non-image areas cut away. |
| **Copper Engraved** | Intaglio process, design incised into copper plate with burin. Crosshatching for tones. |
| **Photogravure** | Photomechanical intaglio process reproducing continuous tones of photographs. |
| **B&W (generic)** | Black and white illustration, technique unknown. |
| **Color (generic)** | Color illustration, technique unknown. |
| **Tinted Lithograph** | Lithograph with second tint stone for background color, requires two press runs. |

---

## Database Reference

Table: `book_parts`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| matter | VARCHAR(20) | Category (Front, Body, Back, Physical, Illustration) |
| purpose | VARCHAR(100) | Part name |
| description | TEXT | Detailed explanation |
| sort_order | INT | Display order |
