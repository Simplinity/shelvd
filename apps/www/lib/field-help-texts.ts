/**
 * Field help texts for the book edit/add forms.
 * Each entry provides concise guidance for collectors —
 * what to enter, in what format, and why it matters.
 */

export const FIELD_HELP: Record<string, string> = {
  // Title & Series
  title: 'The title as it appears on the title page, not the cover or spine. Include any subtitles after a colon.',
  subtitle: 'Secondary title, usually printed below the main title on the title page.',
  original_title: 'If this is a translation, enter the title in the original language of publication.',
  series: 'Named series this book belongs to, e.g. "Bibliothèque de la Pléiade", "Penguin Classics".',
  series_number: 'The book\'s number or volume within the series, e.g. "12", "III", "Vol. 2".',

  // Contributors
  contributor_name: 'Enter as "Last, First" (e.g. "Tolkien, J.R.R."). For institutions, use the full name.',
  contributor_role: 'Select the contributor\'s role: author, editor, translator, illustrator, etc.',

  // Language
  language: 'The language of this particular edition — the language the text is printed in.',
  original_language: 'The language in which the work was first published, if different from this edition.',

  // Publication
  publisher: 'Publisher name as printed on the title page. Use the imprint name if different from parent company.',
  publication_place: 'City of publication as given on the title page, e.g. "London", "Paris & Leipzig".',
  publication_year: 'Year of publication. Use "c.1920" for circa dates, "[1920]" for estimated dates, "n.d." if undated.',
  printer: 'The firm that physically printed the book, if identified (often found in the colophon).',
  printing_place: 'City where the book was printed, if different from publication place.',

  // Edition
  edition: 'Edition statement, e.g. "First edition", "3rd revised edition", "Limited edition of 500 copies".',
  impression: 'Printing or impression number, e.g. "First impression", "2nd printing". Often indicated on copyright page.',
  issue_state: 'Bibliographic issue or state points that identify a specific variant, e.g. "First issue with errata slip".',
  edition_notes: 'Any additional notes about this edition: limitation details, variant bindings, issue points, bibliographic references.',

  // Physical Description
  pagination: 'Collation in standard form: preliminary pages in roman, text in arabic, e.g. "xvi, 352 p., [4] leaves of plates".',
  volumes: 'Number of physical volumes if a multi-volume work, e.g. "2", "3 vols.".',
  height: 'Height in millimeters. Measure the binding, not the text block. Standard bibliographic measurement.',
  width: 'Width in millimeters. Measure the binding at its widest point.',
  depth: 'Depth (thickness) of the book in millimeters, spine to fore-edge.',
  weight: 'Weight in grams. Useful for shipping calculations and identifying variant editions.',
  cover_type: 'The outer covering material and construction of the binding.',
  binding: 'The binding style or technique used to hold the book together.',
  format: 'Bibliographic format based on how sheets were folded: folio (2°), quarto (4°), octavo (8°), etc.',
  protective_enclosure: 'Any housing that protects the book: slipcase, clamshell box, chemise, solander box.',
  paper_type: 'The type of paper used for the text block. Important for assessing longevity and identifying editions.',
  edge_treatment: 'How the edges of the text block are finished — gilt, painted, marbled, deckle, etc.',
  endpapers: 'The leaves at front and back that connect text block to covers. Can be decorative or plain.',
  text_block: 'The structural condition of how pages are held together — tight, solid, shaken, loose, etc.',
  has_dust_jacket: 'Whether a dust jacket (removable paper wrapper) is present. Critical for modern first editions.',
  is_signed: 'Whether the book contains a signature, inscription, or autograph by the author or other notable figure.',

  // Condition & Status
  condition: 'Overall condition grade following standard antiquarian terms: Fine, Near Fine, Very Good, Good, Fair, Poor.',
  dust_jacket_condition: 'Condition of the dust jacket specifically, graded separately from the book itself.',
  status: 'Current status in your collection: in collection, on sale, lent, ordered, etc.',
  action_needed: 'Flag for maintenance needed: repair, rebinding, replacement, or none.',
  condition_notes: 'Detailed description of any flaws, repairs, or notable condition features. Be specific: "foxing to prelims, minor rubbing to corners, previous owner bookplate on front pastedown".',

  // Identifiers
  isbn_13: '13-digit ISBN (International Standard Book Number), usually found on back cover or copyright page.',
  isbn_10: '10-digit ISBN, used for books published before 2007. Found on copyright page or back cover.',
  oclc: 'OCLC WorldCat number — unique identifier in the world\'s largest library catalog.',
  lccn: 'Library of Congress Control Number, assigned to works cataloged by the Library of Congress.',
  catalog_id: 'Your own personal catalog or inventory number for this book.',
  ddc: 'Dewey Decimal Classification number, e.g. "823.912".',
  lcc: 'Library of Congress Classification, e.g. "PR6039.O32".',
  udc: 'Universal Decimal Classification number.',
  topic: 'Subject or topic keywords, e.g. "English literature, Modernism, World War I".',

  // BISAC
  bisac_primary: 'Primary BISAC subject code — the main category this book falls into.',
  bisac_secondary: 'Optional secondary BISAC code for a cross-listed subject.',
  bisac_tertiary: 'Optional tertiary BISAC code for additional classification.',

  // Storage
  storage_location: 'Physical location where the book is stored, e.g. "Office", "Living room", "Vault".',
  shelf: 'Specific shelf or bookcase, e.g. "Bookcase A", "Shelf 3".',
  shelf_section: 'Section within the shelf, e.g. "Left", "Top row", "Bay 2".',

  // Valuation
  sales_price: 'The price you are asking if selling, or the price at which it was sold.',
  price_currency: 'Currency for the sales price.',

  // Notes
  summary: 'Brief description of the book\'s content, significance, or your personal notes about the work.',
  dedication_text: 'The printed dedication as it appears in the book (not a personal inscription — that belongs in Provenance).',
  colophon: 'Transcription of the colophon: production details printed at the end, often listing printer, typeface, paper, limitation.',
  bibliography: 'Bibliographic references for this edition, e.g. "Connolly 78", "Carter A12", "PMM 321".',
  illustrations: 'Description of illustrations: technique (woodcut, engraving, lithograph, photograph), quantity, and any notable artists.',
  signatures: 'The collation formula describing how gatherings are signed, e.g. "A–Z⁸, Aa–Cc⁸". For advanced bibliographic description.',
  internal_notes: 'Private notes visible only to you — purchase history, authentication details, insurance notes, restoration plans.',

  // Catalog Entry
  catalog_entry: 'Auto-generated or manually written ISBD-format catalog description. Used for professional cataloging and export.',

  // External Links
  external_link_type: 'The type of external resource: marketplace listing, WorldCat record, publisher page, etc.',
  external_link_url: 'Full URL to the external resource.',
}
