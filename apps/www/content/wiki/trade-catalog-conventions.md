# Trade Catalogs: How 13 Countries Describe the Same Book

Every antiquarian bookseller on earth describes books the same way. Author first, title from the title page, publication details, physical description, binding, condition. The *language* changes. The *vocabulary* changes. The subtle conventions of format, binding terminology, and condition grading shift from country to country. But the bones are the same, because the bones come from centuries of trade practice codified by ILAB and its national affiliates.

Shelvd generates Trade catalog entries in thirteen languages, each following the conventions of the relevant national trade association. This article explains what those conventions are and why the same book looks different depending on whether a London, Paris, or Stockholm dealer is describing it.

---

## Trade Mode vs. ISBD Mode

Shelvd has two catalog entry modes. Understanding the difference is the key to using them correctly.

**Trade mode** is how dealers describe books to sell them. The author comes first (surname in capitals), a period separates the major sections, binding and condition are prominent, and the language is the language of commerce. A SLAM dealer in Lyon and an ABAA dealer in New York use different words but the same structure.

**ISBD mode** is how libraries describe books to catalog them. The title comes first, areas are separated by `. — ` (period-space-em-dash-space), binding and condition are buried in the notes area, and the punctuation grammar is prescribed by IFLA to the last semicolon. See [The ISBD Entry](/wiki/the-isbd-entry) for the complete guide.

The critical differences:

| Element | Trade | ISBD |
|---------|-------|------|
| Author position | FIRST (inverted, caps) | After title, in Statement of Responsibility |
| Section separator | Period (`. `) | Period-space-em-dash-space (`. — `) |
| Binding | Prominent, inline | In Notes area |
| Condition | Prominent, inline | In Notes area |
| Format | Before dimensions | After dimensions (or omitted) |

Trade mode writes to `catalog_entry`. ISBD mode writes to `catalog_entry_isbd`. Both are stored separately and both appear on PDF catalog sheets.

---

## The 13 Languages and Their Associations

| Flag | Language | Trade Association | Institutional Standard |
|------|----------|-------------------|----------------------|
| 🇬🇧 | English | ABA (UK) / ABAA (US) | AACR2 → RDA / DCRM(B) |
| 🇫🇷 | Français | SLAM | AFNOR Z44-074 → RDA |
| 🇩🇪 | Deutsch | VDA | RAK-WB → RDA |
| 🇳🇱 | Nederlands | NVvA | ISBD/NL → RDA |
| 🇪🇸 | Español | AILA | Reglas de Catalogación → RDA |
| 🇵🇹 | Português | ALAFARQ | ISBD/PT → RDA |
| 🇮🇹 | Italiano | ALAI | RICA → REICAT → RDA |
| 🇸🇪 | Svenska | SVAF | KRS → RDA |
| 🇩🇰 | Dansk | ABF | Katalogiseringsregler → RDA |
| 🇳🇴 | Norsk | NABF | Katalogiseringsregler → RDA |
| 🇧🇪 | Belgique (FR) | CLAM/BBA | Follows France |
| 🇧🇪 | België (NL) | CLAM/BBA | Follows Netherlands |
| 🏛️ | Latina | — | Traditional incunabula convention |

The Belgian options follow France or the Netherlands respectively, with minor vocabulary preferences. The Latin option exists for incunabula and early printed books, where the great bibliographies (GW, Hain, BMC, Goff) have always written in Latin.

---

## Universal Trade Structure

Every trade entry, in every language, follows the same skeleton:

> AUTHOR. Title. Place, Publisher, Date. Format, pagination. Binding. Condition. Notes.

The details — what "8vo" is called, how binding materials are named, what "Very Good" translates to — vary by language and tradition.

---

## Per-Country Conventions

### 🇬🇧🇺🇸 English — ABA / ABAA

The baseline for the English-speaking antiquarian world. Author in CAPS. Format in bibliographic terms (8vo, 4to, folio). Pagination in `pp.` Condition grading follows the ABAA scale (As New through Poor). Dust jacket noted separately.

> DICKENS, Charles. A Tale of Two Cities. London, Chapman and Hall, 1859. 8vo. viii, 254 pp. Original red cloth, gilt spine. Dust jacket. First edition, first issue. Spine slightly faded, light foxing to prelims. A very good copy in the scarce dust jacket. Provenance: Bookplate of Sir John Smith.

American (ABAA) practice is virtually identical to British (ABA), with minor preferences: "dust jacket" over "dust wrapper," and a tendency toward more verbose condition notes.

### 🇫🇷 Français — SLAM

French format notation uses the `in-` prefix: in-folio, in-4, in-8, in-12, in-16. Multi-volume works lead with volume count: `3 vol. in-8`. Binding vocabulary is rich and specific — `dos à nerfs` (raised bands), `couvertures conservées` (wrappers preserved), `reliure de l'époque` (contemporary binding). Condition is `État`, with grades from `Parfait état` to `Médiocre`.

> HUGO, Victor. Les Misérables. Paris, Pagnerre, 1862. 10 vol. in-8. Demi-maroquin rouge à coins, dos à nerfs orné de caissons dorés, tête dorée, couvertures et dos conservés (reliure de l'époque). Édition originale. Quelques rousseurs éparses, petite restauration au dos du tome III. Très bel exemplaire.

The word `rousseurs` (foxing) appears in French descriptions the way "some wear" appears in English ones — constantly.

### 🇩🇪 Deutsch — VDA

German uses `S.` for pages (Seiten), `Bl.` for leaves (Blatt), `Bd.` for volumes (Bände), `Taf.` for plates (Tafeln). Binding terms are compounds — `Halblederband` (half leather), `Originalbroschur` (original wrappers), `Schutzumschlag` (dust jacket), `Rückenvergoldung` (gilt spine). Condition is `Zustand`: `Sehr gut` (Very Good), `Gut` (Good), `Befriedigend` (Fair). Common defect terms: `stockfleckig` (foxed), `gebräunt` (browned), `berieben` (rubbed).

> GOETHE, Johann Wolfgang von. Faust. Der Tragödie erster Theil. Leipzig, Georg Joachim Göschen, 1790. 8vo. 168 S. Halblederband der Zeit mit Rückenschild und Rückenvergoldung. Erste Ausgabe in Buchform. Leicht gebräunt, vereinzelt stockfleckig, insgesamt ein sehr gutes Exemplar.

German dealers reference VD16, VD17, VD18 for early German prints — the national bibliographic databases.

### 🇳🇱 Nederlands — NVvA

Dutch uses `p.` for pages, `bl.` for leaves (bladen), `dl.` for volumes (delen), `pl.` for plates (platen). Binding: `Ingenaaid` or `Gebrocheerd` (wrappers), `Half leer` (half leather), `Linnen band` (cloth), `Stofomslag` (dust jacket). Condition: `Conditie` — `Uitstekend` (Fine), `Zeer goed` (Very Good), `Goed` (Good), `Redelijk` (Fair).

> MULTATULI. Max Havelaar, of De koffij-veilingen der Nederlandsche Handel-Maatschappij. Amsterdam, J. de Ruyter, 1860. 8vo. [iv], 358, [2] p. Originele uitgeversbanden. Eerste druk. Lichte vochtvlekken in de marge, verder een goed exemplaar.

`Eerste druk` means first edition. `Eerste uitgave` means the same thing. Dutch dealers use both.

### 🇪🇸 Español — AILA

Spanish uses `p.` for pages, `h.` for leaves (hojas), `vol.` for volumes, `láms.` for plates (láminas). Format notation uses the degree symbol: `4º`, `8º`, `12º`. Binding: `Rústica` (wrappers), `Pergamino` (vellum), `Tela` (cloth), `Sobrecubierta` (dust jacket). Condition: `Estado` — `Perfecto` (Fine), `Muy bueno` (Very Good), `Bueno` (Good), `Aceptable` (Fair). Nearly every Spanish dealer references Palau — the monumental Spanish bibliography.

> CERVANTES SAAVEDRA, Miguel de. El ingenioso hidalgo Don Quixote de la Mancha. Madrid, Juan de la Cuesta, 1605. 4to. [viii], 316, [2] ff. Pergamino de la época con título manuscrito en el lomo. Primera edición. Bibliografía: Palau 51543.

### 🇵🇹 Português — ALAFARQ

Very similar to Spanish. Pagination: `p.` (páginas), `ff.` (fólios), `vol.`, `ests.` (estampas = plates). Binding: `Brochura` (wrappers), `Pergaminho` (vellum), `Tela` (cloth), `Sobrecapa` (dust jacket). Condition: `Estado` — `Óptimo` (Fine), `Muito bom` (Very Good), `Bom` (Good), `Regular` (Fair). The Anselmo bibliography is to Portuguese books what Palau is to Spanish ones.

> CAMÕES, Luís de. Os Lusíadas. Lisboa, António Gonçalves, 1572. 4to. [iv], 183 ff. Encadernação inteira em pele da época. Primeira edição. Bibliografia: Anselmo 744.

### 🇮🇹 Italiano — ALAI

Italian uses `pp.` for pages, `cc.` for leaves (carte), `vol.` for volumes, `tavv.` for plates (tavole). Format notation uses both English terms and the French `in-` prefix: `in-8°`, `in-4to`. Binding: `Brossura` (wrappers), `Pergamena` (vellum), `Tela` (cloth), `Sovraccoperta` (dust jacket), `Legatura coeva` (contemporary binding). Condition: `Condizioni` — `Ottimo` (Fine), `Molto buono` (Very Good), `Buono` (Good), `Discreto` (Fair). `Fioriture` is the Italian word for foxing, and it appears in nearly every description of a book printed before 1900.

> DANTE ALIGHIERI. La Divina Commedia. Venezia, Aldus Manutius, 1502. 8vo. 232 cc. Legatura coeva in pergamena rigida con titolo manoscritto al dorso. Prima edizione aldina. Lievi fioriture sparse.

Italian dealers reference EDIT16, ICCU, and SBN — the Italian bibliographic databases.

### 🇸🇪 Svenska — SVAF

Swedish uses `s.` for pages (sidor), `bl.` for leaves (blad), `bd.` for volumes (band), `pl.` for plates (plancher). Binding: `Häftad` (wrappers), `Halvfranskt band` (half morocco), `Klotband` (cloth), `Skyddsomslag` (dust jacket). Condition: `Skick` — `Fint` (Fine), `Mycket gott` (Very Good), `Gott` (Good), `Acceptabelt` (Fair).

> STRINDBERG, August. Röda rummet. Stockholm, Jos. Seligmann, 1879. 8vo. [iv], 374, [2] s. Halvfranskt band med guldpräglad rygg. Första upplagan. Något foxing, i övrigt ett gott exemplar.

`Första upplagan` — first edition. Even in Swedish, "foxing" sometimes stays in English.

### 🇩🇰 Dansk — ABF

Very similar to Swedish (the languages are closely related). Pagination: `s.` (sider), `bl.` (blade), `bd.` (bind), `pl.` (plancer). Binding: `Hæftet` (wrappers), `Halvlæderbind` (half leather), `Smudsomslag` (dust jacket). Condition: `Tilstand` — `Fint` (Fine), `Meget godt` (Very Good), `Godt` (Good), `Acceptabelt` (Fair).

> KIERKEGAARD, Søren. Enten – Eller. København, C. A. Reitzel, 1843. 8vo. 2 bd. (xii, 454; viii, 368 s.). Originale halvlæderbind. Første udgave. Lidt foxing, ellers et godt eksemplar.

### 🇳🇴 Norsk — NABF

Almost identical to Danish. Binding: `Heftet` (wrappers), `Halvskinnbind` (half leather), `Smussomslag` (dust jacket). Condition: `Tilstand`. Edition: `Første utgave` (vs. Danish `Første udgave`).

> IBSEN, Henrik. Et dukkehjem. København, Gyldendalske Boghandels Forlag, 1879. 8vo. 136 s. Originalt forlagsbind. Første utgave. Noe foxing, ellers et godt eksemplar.

Yes, Ibsen's *A Doll's House* was published in Copenhagen. Norwegian literature and Danish publishing have a complicated relationship.

### 🇧🇪 Belgique / België — CLAM/BBA

Belgian entries follow the conventions of France (for `be-fr`) or the Netherlands (for `be-nl`). The CLAM/BBA does not impose a distinct format beyond ILAB ethics. Minor vocabulary preferences: Belgian Dutch dealers tend to prefer `Stofomslag` for dust jacket, and may reference Belgian institutional catalogs (KBR — the Royal Library of Belgium).

### 🏛️ Latina — Traditional Convention

For incunabula and early printed books, Latin is the scholarly lingua franca. Place names appear in Latin (Venetiis, Parisiis, Moguntiae, Lugduni Batavorum). Everything is abbreviated. The great bibliographies — GW, Hain, BMC, Goff, ISTC, Polain, Proctor — are referenced by their standard short forms.

> CICERO, Marcus Tullius. De officiis. Moguntiae [Mainz], Johannes Fust et Petrus Schoeffer, 1465. Fol. [88] ff. Lit. goth. Typ. 2:114G. Rub. Lig. saec. XV in corio supra asseres. Exemplar pulchrum, paucis maculis. Prov.: Inscriptio saec. XVI in f. 1r. GW 6921; HC 5238*; BMC I, 22; Goff C-571.

If you're cataloging a book printed before 1501, this is the mode to reach for.

---

## Condition Grading Across Languages

The ABAA scale is the international baseline. Here's how each language renders the same grades:

| English | French | German | Dutch | Spanish | Portuguese | Italian | Swedish | Danish | Norwegian |
|---------|--------|--------|-------|---------|------------|---------|---------|--------|-----------|
| As New | Comme neuf | Wie neu | Als nieuw | Como nuevo | Como novo | Come nuovo | Som ny | Som ny | Som ny |
| Fine | Parfait état | Sehr gut | Uitstekend | Perfecto | Óptimo | Ottimo | Fint | Fint | Fint |
| Very Good | Très bon | Sehr gut erhalten | Zeer goed | Muy bueno | Muito bom | Molto buono | Mycket gott | Meget godt | Meget godt |
| Good | Bon | Gut | Goed | Bueno | Bom | Buono | Gott | Godt | Godt |
| Fair | État correct | Befriedigend | Redelijk | Aceptable | Regular | Discreto | Acceptabelt | Acceptabelt | Akseptabelt |
| Poor | Médiocre | Mangelhaft | Matig | Deficiente | Mau | Mediocre | Dåligt | Dårligt | Dårlig |

Shelvd translates the condition grade automatically when generating a trade entry. "Fine" in English becomes "Parfait état" in French becomes "Sehr gut" in German. The condition *notes* stay as you wrote them — Shelvd doesn't translate prose, only labels and grades.

---

## Binding Vocabulary: The Same Object, Different Words

One of the most striking differences between countries is how they name bindings. The same half-leather binding:

| Language | Term |
|----------|------|
| English | Half leather |
| French | Demi-cuir |
| German | Halbleder |
| Dutch | Half leer |
| Spanish | Media piel |
| Portuguese | Meia encadernação |
| Italian | Mezza pelle |
| Swedish | Halvskinnband |
| Latin | — (described in prose) |

Shelvd translates all 49 cover types into all thirteen languages. When you select "half_leather_paper" as your cover type and generate a French trade entry, it appears as "Demi-cuir." In German, "Halbleder." In Swedish, "Halvskinnband." You choose the cover type once; the language does the rest.

---

## Format Notation: in-8 vs. 8vo vs. 8°

Most countries use the same Latin-derived format abbreviations (8vo, 4to, Fol.), but French and Italian add their own twist:

| Country | Notation | Example |
|---------|----------|---------|
| English, German, Dutch, Scandinavian | 8vo, 4to, Fol. | `8vo. xvi, 448 pp.` |
| French | in-8, in-4, in-folio | `3 vol. in-8.` |
| Italian | in-8° or 8vo | `in-8°. 232 cc.` |
| Spanish | 8º, 4º, fol. | `4º. [viii], 316 h.` |

In French trade descriptions, multi-volume works lead with the volume count before the format: `10 vol. in-8.` This is specific to French convention and confuses anyone reading it for the first time.

---

## Generating a Trade Entry in Shelvd

1. Open a book, click **Edit**
2. In the Catalog Entry section, click the **Trade** button (left)
3. The language modal shows thirteen options with flags and association names
4. Click your language
5. The entry generates, pulling from all fields you've filled in — title, contributors, edition, physical description, binding, condition, provenance, bibliography, identifiers — all formatted according to that country's conventions
6. Review, edit if needed, save

The richer your data, the better the entry. A book with only a title and author produces a thin description. A fully cataloged book with condition notes, provenance, and bibliography references produces something you could paste directly into a professional dealer catalog.

---

*See also: [The ISBD Entry](/wiki/the-isbd-entry) · [Cataloging for Dealers](/wiki/cataloging-for-dealers) · [Condition Grading](/wiki/condition-grading) · [49 Ways to Dress a Book](/wiki/bindings-and-covers)*
