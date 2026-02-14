/**
 * Field help texts for the book edit/add forms.
 * Written from the perspective of the antiquarian book trade and
 * serious collectors — following ABAA/ABA/ILAB/SLAM conventions.
 */

export const FIELD_HELP: Record<string, string> = {
  // ── Title & Series ──────────────────────────────────────────────
  title:
    'Transcribe the title exactly as it appears on the title page — not the cover, spine, or dust jacket. ' +
    'Preserve the original capitalisation and spelling. If the title page reads "MOBY-DICK; or, The Whale", enter it as "Moby-Dick; or, The Whale". ' +
    'For pre-1800 books, transcribe long titles faithfully but you may silently modernise long-s (ſ→s).',

  subtitle:
    'The secondary title as printed on the title page, below or after the main title. ' +
    'Examples: "A Novel in Three Parts", "Being a True Account of the Voyage". ' +
    'Leave empty if none is printed; do not invent subtitles from jacket copy.',

  original_title:
    'For translations only. The title of the work in the language in which it was first published. ' +
    'Example: for a Dutch translation of Proust, enter "À la recherche du temps perdu". ' +
    'This appears in the catalog entry as a note (e.g. "Original title: Du côté de chez Swann").',

  series:
    'A named series the book was published in. Examples: "Bibliothèque de la Pléiade", ' +
    '"Penguin Modern Classics", "The Loeb Classical Library", "Collection Blanche". ' +
    'Not to be confused with a multi-volume work (use Volumes for that). ' +
    'In the catalog entry this appears in parentheses: (Penguin Modern Classics ; 42).',

  series_number:
    'The book\'s number within the series. Enter as printed: "12", "III", "Vol. 2", "n° 156". ' +
    'Leave empty if unnumbered.',

  // ── Contributors ────────────────────────────────────────────────
  contributor_name:
    'Enter the name in "Family, Given" form for Western names: "Tolkien, J.R.R.", "García Márquez, Gabriel". ' +
    'For East Asian names in traditional order, enter as given: "Murasaki Shikibu". ' +
    'For institutions (corporate authors), use full name: "Royal Geographical Society".',

  contributor_role:
    'Select the most specific role. Key distinctions: ' +
    '"Author" = wrote the text. "Editor" = compiled or annotated another\'s work. ' +
    '"Writer of foreword" is distinct from "Writer of introduction" — the foreword is typically by someone other than the author; the introduction often discusses the text. ' +
    '"Illustrator" = created images inside the book. "Cover designer" = designed only the cover/jacket art.',

  // ── Language ────────────────────────────────────────────────────
  language:
    'The language this edition is printed in. For bilingual or parallel-text editions, ' +
    'select the primary language. The catalog entry uses this for ISBD language notes.',

  original_language:
    'The language in which the work was first published, if this edition is a translation. ' +
    'Generates a note like "Translated from the French" in the ISBD entry. ' +
    'Leave empty if the book is in its original language.',

  // ── Publication ─────────────────────────────────────────────────
  publisher:
    'The publisher or imprint name as printed on the title page. ' +
    'Use the imprint name, not the parent corporation: "Gallimard" not "Groupe Madrigall". ' +
    'For pre-1800 books, give the bookseller/printer as named: "Printed for J. Tonson". ' +
    'If no publisher is named, the ISBD entry will show "[s.n.]" (sine nomine).',

  publication_place:
    'City of publication as given on the title page. Use the form printed: "London", ' +
    '"Paris & Leipzig", "Antverpiae" (for Latin imprints). Multiple cities separated by " ; ". ' +
    'If no place is given, the ISBD entry will show "[S.l.]" (sine loco). ' +
    'Do not guess or add country names.',

  publication_year:
    'Year of publication as printed. For undated books use these conventions: ' +
    '"[1920]" = date established from external evidence. ' +
    '"[ca. 1920]" or "c.1920" = approximate date. ' +
    '"[between 1918 and 1923]" = date range. ' +
    '"n.d." = no date determinable. ' +
    'For pre-1582 books with Roman numerals: convert to Arabic but note original in Edition Notes.',

  printer:
    'The firm that physically printed the book, if distinct from the publisher and if identified. ' +
    'Often found in the colophon (end of book) or on the copyright page. ' +
    'Examples: "Imprimerie Nationale", "Joh. Enschedé en Zonen". ' +
    'Important for fine press and private press editions.',

  printing_place:
    'City where the book was printed, if different from the publication place. ' +
    'Common in 18th–19th century books where publisher and printer were in different cities.',

  // ── Edition ─────────────────────────────────────────────────────
  edition:
    'The edition statement as given in the book, or as established by bibliography. ' +
    'Examples: "First edition", "Second edition, revised and enlarged", ' +
    '"First English edition", "Limited edition of 350 copies". ' +
    'For modern firsts: if no edition statement is present and the number line starts with 1, this is typically a first edition. ' +
    'For antiquarian books: consult the relevant bibliography (e.g. "Wing S2926", "Gaskell 45").',

  impression:
    'The printing or impression within an edition. Modern books often show a number line on the copyright page: ' +
    '"10 9 8 7 6 5 4 3 2 1" indicates a first impression. ' +
    'Enter as: "First impression", "2nd printing", "3rd impression (corrected)". ' +
    'Leave empty if only one impression is known.',

  issue_state:
    'Bibliographic issue or state points that distinguish variants within the same impression. ' +
    'These are specific textual or physical differences that collectors care about. ' +
    'Examples: "First issue, with \'transposed\' on p.vi line 3", ' +
    '"Second state, with corrected date on title page", ' +
    '"Issue with errata slip tipped in at p.224". ' +
    'Consult the standard bibliography for the author or period.',

  edition_notes:
    'Additional details about this edition that don\'t fit elsewhere. ' +
    'Limitation statements: "Copy 47 of 350 on Arches paper, signed by the author". ' +
    'Number line transcription: "Number line reads 1 3 5 7 9 10 8 6 4 2". ' +
    'Variant bindings: "Also issued simultaneously in cloth and paper wrappers; this is the cloth issue". ' +
    'Bibliographic references: consult standard reference works for the field.',

  // ── Physical Description ────────────────────────────────────────
  pagination:
    'Describe the collation exactly using standard bibliographic notation. ' +
    'Preliminary pages in lowercase Roman numerals, text in Arabic, plates counted separately: ' +
    '"xvi, 352 p., [8] leaves of plates". ' +
    'Unpaginated leaves in square brackets: "[4], 128, [2] p.". ' +
    'Folded plates or maps noted: "xii, 248 p., 12 folding maps". ' +
    'For multi-volume: leave this per-volume and use Volumes for the count.',

  volumes:
    'For multi-volume works: enter the number of physical volumes, e.g. "3 vols." or "2 vols. in 1". ' +
    'Note: in antiquarian terms, a "volume" is the bibliographic unit; a "tome" is the physical book. ' +
    'A 3-volume novel bound in 2 books is "3 vols. in 2".',

  height:
    'Height of the binding in millimeters, measured vertically from head to tail. ' +
    'Measure the book standing upright, covers closed. ' +
    'The ISBD catalog entry converts this to centimetres (rounded up). ' +
    'The Trade entry shows mm. For unbound/loose sheets, measure the sheet.',

  width:
    'Width of the binding in millimeters, measured horizontally from spine to fore-edge. ' +
    'Only needed if the book is an unusual format (very narrow, very wide, oblong/landscape). ' +
    'In standard cataloging, width is given only when it exceeds the height or is less than half the height.',

  depth:
    'Thickness of the closed book in millimeters, measured from front board to back board. ' +
    'Useful for shelf planning and identifying binding variants (rebinds are often thicker).',

  weight:
    'Weight of the complete book in grams. Useful for shipping calculations and insurance. ' +
    'Can help identify edition variants (different paper stocks weigh differently).',

  cover_type:
    'The material and construction of the outer covering. This describes what you see and feel. ' +
    'Key trade terms: ' +
    '"Full" = entire surface covered in one material (full leather, full cloth). ' +
    '"Half" = spine and corners in one material, sides in another. ' +
    '"Quarter" = spine only in the primary material. ' +
    '"Three-quarter" = spine + wide corners. ' +
    'Material matters: "Morocco" = goatskin (finest). "Calf" = calfskin (smooth). "Vellum" = prepared animal skin (stiff or limp). ' +
    '"Cloth" = publisher\'s cloth (buckram, linen, etc.). "Wrappers" = paper covers (printed or plain).',

  binding:
    'The binding technique — how the book is physically held together. ' +
    'Distinct from Cover Type (which is the material). ' +
    'Examples: "Case binding" (modern standard), "Coptic" (exposed chain stitch, no spine), ' +
    '"French binding" (rounded spine, laced-in cords), "Perfect binding" (glued, no sewing). ' +
    'Important for assessing structural integrity and dating.',

  format:
    'Bibliographic format describes how the original printed sheets were folded. ' +
    'Each fold doubles the number of leaves: ' +
    'Folio (fo.) = 1 fold → 2 leaves. ' +
    'Quarto (4to) = 2 folds → 4 leaves. ' +
    'Octavo (8vo) = 3 folds → 8 leaves. ' +
    'Duodecimo (12mo) = 12 leaves. ' +
    'For modern books, format is often nominal — a "Crown 8vo" indicates approximate size (190×125mm). ' +
    'Select the closest match; for exact measurements, use Height/Width.',

  protective_enclosure:
    'Any housing that protects the book beyond its own binding. ' +
    '"Slipcase (publisher)" = original, issued with the book. ' +
    '"Slipcase (custom)" = made after purchase, often for valuable items. ' +
    '"Clamshell box" = hinged box, opens flat — the gold standard for rare books. ' +
    '"Chemise" = wraparound jacket, often combined with a slipcase. ' +
    '"Solander box" = drop-back box, usually for flat items or very large books.',

  paper_type:
    'The type of paper used for the text block. ' +
    '"Laid" = shows chain lines and wire marks (pre-industrial and fine press). ' +
    '"Wove" = smooth, no visible pattern (standard from c.1800). ' +
    '"Rag" = made from cotton/linen (pre-1850; acid-free, durable). ' +
    '"Wood pulp" = standard post-1850; acidifies over time. ' +
    '"Japan/Japon" = thin, strong, silky — used for deluxe copies and proofs. ' +
    '"India paper" = very thin opaque paper, used for Oxford Bibles and similar. ' +
    '"Vellum" = prepared animal skin, not paper — for luxury manuscripts and some printed books.',

  edge_treatment:
    'How the edges of the text block (top, fore-edge, bottom) are finished. ' +
    '"Untrimmed" / "Uncut" = sheets not opened or trimmed after folding — shows the book is in original state. ' +
    'Note: "uncut" (folds intact) and "untrimmed" (rough edges) are technically different. ' +
    '"Gilt top" (t.e.g.) = top edge gilded, the most common decorative treatment. ' +
    '"Gilt all edges" (a.e.g.) = all three edges gilded. ' +
    '"Fore-edge painting" = hidden painting visible when pages are fanned. ' +
    '"Marbled" = swirled colour pattern. "Sprinkled/Stained" = speckled colour.',

  endpapers:
    'The leaves at front and back connecting the text block to the covers (also: pastedowns and free endpapers). ' +
    '"Marbled" = classic swirled pattern, common in 18th–19th century leather bindings. ' +
    '"Paste paper" = hand-decorated with paste and pigment. ' +
    '"Illustrated/Printed" = maps, patterns, or text printed on endpapers (common in modern illustrated books). ' +
    '"Self-ends" = first and last leaves of the text block serve as endpapers (common in paperbacks). ' +
    'Important for provenance: bookplates and ownership inscriptions are usually on the front pastedown or free endpaper.',

  text_block:
    'Structural condition of the text block — how firmly the pages are held in the binding. ' +
    '"Tight" = pages firmly bound, doesn\'t open easily flat — often a new or little-read book. ' +
    '"Solid" = firm but opens comfortably. ' +
    '"Sound" = good structure despite signs of use. ' +
    '"Tender" = beginning to weaken; caution needed. ' +
    '"Shaken" = text block moves in covers; sewing weakened. ' +
    '"Loose" = pages detaching from binding. ' +
    '"Broken" = binding cracked, book in pieces. ' +
    '"Recased/Rebacked/Rebound" = has been repaired or re-bound.',

  has_dust_jacket:
    'Whether a dust jacket (the removable printed paper wrapper) is present. ' +
    'For modern first editions (post-1920), the presence of the dust jacket can represent ' +
    '50–90% of the book\'s value. Always grade the jacket separately. ' +
    'Note: not all books were issued with jackets — many pre-1900 and most leather-bound books were not.',

  is_signed:
    'Whether the book bears an autograph, signature, inscription, or dedication by the author or another notable figure. ' +
    'Signed = just the signature. Inscribed = signature with a message. ' +
    'A presentation copy (author\'s gift) is more desirable than a flat signature. ' +
    'Note the location (title page, half-title, front free endpaper) and date if present in Signature Details.',

  // ── Condition & Status ──────────────────────────────────────────
  condition:
    'Overall condition grade following ABAA/ABA/ILAB standard terminology: ' +
    '"As New" = indistinguishable from a new copy. ' +
    '"Near Fine" = approaching Fine with minor imperfections. ' +
    '"Fine" = no defects, tight, clean, unmarked; a perfect used copy. ' +
    '"Very Good" = some wear but no serious defects; fully intact and readable. ' +
    '"Good" = average used copy showing wear; complete, no pages missing. ' +
    '"Fair" = worn, possibly with defects, but complete and readable. ' +
    '"Poor" = text complete and readable but heavily worn, damaged, or defective. ' +
    'Always describe specific defects in Condition Notes — the grade alone is never sufficient for a professional catalog entry.',

  dust_jacket_condition:
    'Condition of the dust jacket, graded separately from the book. ' +
    'Common issues: "price-clipped" (corner of front flap cut), "sunned spine" (faded), ' +
    '"edge wear", "short tears", "chips at extremities". ' +
    'If the jacket has been price-clipped, always note this in Condition Notes.',

  condition_notes:
    'Describe every defect and notable feature. Be specific and honest — this is what buyers rely on. ' +
    'Use standard trade terminology: ' +
    '"Foxing" = brown spots from mould/oxidation. "Browning/Toning" = uniform darkening. ' +
    '"Rubbing" = surface wear on boards or spine. "Bumped corners" = dented board corners. ' +
    '"Cocked" = spine leaning. "Ex-library" = institutional markings. ' +
    '"Dampstain" = water mark. "Worming" = insect damage (tiny holes or tunnels). ' +
    'Example: "Light foxing to prelims, minor rubbing to corners, previous owner bookplate on front pastedown, spine slightly sunned. A very good copy overall."',

  status:
    'Current status: "In Collection" = on your shelf. "On Sale" = listed for sale. ' +
    '"Lent" = temporarily with someone. "Ordered" = purchased but not received. ' +
    '"Sold" = sold, kept for records. "Wishlist" = want to acquire.',

  action_needed:
    'Flag if the book needs attention: repair, cleaning, rebinding, conservation, reboxing, digitisation, or none.',

  // ── Identifiers ─────────────────────────────────────────────────
  isbn_13:
    '13-digit ISBN starting with 978 or 979. Found on the back cover (barcode) or copyright page. ' +
    'Enter without hyphens. Books before 1970 have no ISBN.',

  isbn_10:
    '10-digit ISBN, used for books published between 1970 and 2006. ' +
    'Found on the copyright page. Enter without hyphens.',

  oclc:
    'OCLC number from WorldCat (worldcat.org) — the world\'s largest shared library catalog. ' +
    'Useful for identifying exact editions and finding institutional holdings. ' +
    'Found on WorldCat record pages, prefixed "OCLC:" or "OCN:".',

  lccn:
    'Library of Congress Control Number — a unique identifier assigned by the Library of Congress. ' +
    'Found on the copyright page (e.g. "LCCN 2024012345" or "Library of Congress Catalog Card Number"). ' +
    'Useful for unambiguous edition identification.',

  catalog_id:
    'Your own private catalog, inventory, or stock number for this book. ' +
    'Dealers: your stock number. Collectors: your personal numbering system. ' +
    'This does not appear in catalog entries but helps you track items.',

  ddc:
    'Dewey Decimal Classification — the system used by most public libraries worldwide. ' +
    'Example: "823.912" = English fiction, early 20th century (Joyce, Woolf). ' +
    'Found on the copyright page or in library records.',

  lcc:
    'Library of Congress Classification — used by academic and research libraries. ' +
    'Example: "PR6039.O32" = Tolkien in English literature. ' +
    'More granular than Dewey; found in LoC records.',

  udc:
    'Universal Decimal Classification — used primarily in European and Asian libraries. ' +
    'More common in scientific/technical cataloging. Found in library records.',

  topic:
    'Subject keywords or headings for your own cataloging. ' +
    'Use consistent terms: "English literature", "Botany — Illustrations", "Incunabula", ' +
    '"Private press — Kelmscott". Helps with searching and filtering your collection.',

  // ── BISAC ───────────────────────────────────────────────────────
  bisac_primary:
    'Primary BISAC (Book Industry Standards Advisory Committee) subject code — the US/UK trade standard for bookshop categorisation. ' +
    'Example: "FIC019000" = Fiction / Literary. "ANT006000" = Antiques & Collectibles / Books. ' +
    'Found on the copyright page of recent books or via bisg.org.',

  bisac_secondary:
    'Second BISAC subject code for cross-listing. Many books fall into two categories: ' +
    'a novel set during WWI might be FIC019000 (Literary Fiction) and FIC014000 (Historical Fiction).',

  bisac_tertiary:
    'Third BISAC code if needed. Most books need at most two.',

  // ── Storage ─────────────────────────────────────────────────────
  storage_location:
    'Where the book is physically kept. Examples: "Office", "Living room", "Climate-controlled vault", "Bank safe deposit box". ' +
    'Essential for insurance documentation and finding your books.',

  shelf:
    'The specific bookcase or shelving unit. Examples: "Bookcase A", "Billy left", "Glass cabinet". ' +
    'Use consistent names so you can filter and sort.',

  shelf_section:
    'Position within the shelf. Examples: "Top shelf", "Bay 2, shelf 3", "Left section". ' +
    'As granular as you find useful for locating books quickly.',

  // ── Valuation ───────────────────────────────────────────────────
  sales_price:
    'Your asking price if selling, or the price at which the book was sold. ' +
    'For insurance/valuation purposes, use the Valuation section instead.',

  price_currency:
    'Currency for the sales price. Standard ISO codes: EUR, GBP, USD, CHF, etc.',

  // ── Notes ───────────────────────────────────────────────────────
  summary:
    'A brief description of the book\'s content, significance, or your personal notes. ' +
    'For a catalog: focus on what makes this edition notable. ' +
    'For your own reference: why you bought it, what it means to your collection.',

  dedication_text:
    'The printed dedication by the author as it appears in the book — typically on the verso of the half-title or a separate leaf. ' +
    'Example: "For Celia" or "To the Memory of Joseph Conrad". ' +
    'This is the author\'s published dedication, not a personal inscription (which belongs in Provenance as an "inscribed" association).',

  colophon:
    'Transcribe the colophon — the production statement usually printed at the end of the book. ' +
    'Common in fine press and limited editions, it records: printer, typeface, paper, pressrun, and completion date. ' +
    'Example: "This edition was printed by hand at the Officina Bodoni, Verona, in 12pt Bembo on Magnani paper. ' +
    'The edition consists of 160 copies, of which this is number 47. Completed March 1953."',

  bibliography:
    'References to standard bibliographies that describe this edition. Essential for antiquarian cataloging. ' +
    'Format: "Short-title reference code". Examples: ' +
    '"Connolly, Modern Movement, 78" (The Modern Movement). ' +
    '"Carter & Pollard A12" (An Enquiry). ' +
    '"PMM 321" (Printing and the Mind of Man). ' +
    '"Wing S2926" (Short Title Catalogue, 1641–1700). ' +
    '"Brunet III, 1245" (Manuel du libraire). ' +
    'Multiple references separated by ". ".',

  illustrations:
    'Describe the illustrations present in the book. Note: ' +
    'Technique: woodcut, wood-engraving, engraving, etching, lithograph, photograph, colour plate. ' +
    'Quantity: "12 full-page plates", "numerous text illustrations", "frontispiece portrait". ' +
    'Colouring: "hand-coloured plates", "colour-printed lithographs", "b/w photographs". ' +
    'Notable artists: "illustrations by Arthur Rackham", "with 20 original lithographs by Picasso". ' +
    'In the catalog entry this appears as part of the physical description or as a note.',

  signatures:
    'The collation formula — a technical description of how the printed sheets (gatherings) are assembled. ' +
    'Standard notation: "A–Z⁸, Aa–Cc⁴" means gatherings A through Z of 8 leaves, then Aa through Cc of 4 leaves. ' +
    'For incunabula and early printed books, this is essential for confirming completeness. ' +
    'For modern books, usually not needed unless you are doing detailed bibliographic work. ' +
    'Consult Gaskell\'s "New Introduction to Bibliography" for notation conventions.',

  internal_notes:
    'Private notes visible only to you — never included in catalog entries or shared. ' +
    'Use for: purchase details ("Bought at Drouot, lot 245, 14 Nov 2023, €850"). ' +
    'Authentication notes ("Compared with BL copy, confirmed first issue"). ' +
    'Insurance references. Restoration history. Conservation priorities. Wish-list notes.',

  // ── Catalog Entry ───────────────────────────────────────────────
  catalog_entry:
    'Auto-generated Trade catalog description following ILAB / national trade association conventions. ' +
    'Author-first format, periods between sections. The standard format for dealer catalogs, book fair listings, and auction lots. ' +
    'Click "Generate Catalog Entry" to create from all fields, or write/edit manually.',

  catalog_entry_isbd:
    'Auto-generated ISBD (International Standard Bibliographic Description) formal entry. ' +
    'Title-first format with prescribed punctuation (". — " between areas). ' +
    'The standard for library catalogs, institutional bibliographies, and scholarly references. ' +
    'Uses "[S.l.]" and "[s.n.]" for unknown place/publisher, dimensions in cm.',

  // ── External Links ──────────────────────────────────────────────
  external_link_type:
    'Type of external resource you\'re linking to: marketplace listing (AbeBooks, ZVAB), ' +
    'library catalog record (WorldCat, LoC), publisher page, digital copy (HathiTrust, Gallica), etc.',

  external_link_url:
    'Full URL to the external resource, including https://.',

  // ── Signature Details ───────────────────────────────────────────
  signature_details:
    'Describe the signature, inscription, or autograph in detail. ' +
    'Location: "Signed on half-title", "Inscribed on front free endpaper". ' +
    'Date if present: "dated Christmas 1924". ' +
    'Content if inscribed: "Inscribed to Cyril Connolly: \'For Cyril, with admiration — E.W.\'". ' +
    'Authentication notes: "Signature verified against known exemplars". ' +
    'A presentation copy (author\'s deliberate gift) is the most desirable form.',
}
