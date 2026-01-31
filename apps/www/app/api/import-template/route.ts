import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

// Column definitions for the import template
const columns = [
  // Title & Series
  { header: 'Title *', example: 'The Name of the Rose' },
  { header: 'Subtitle', example: "Including the Author's Postscript" },
  { header: 'Original Title', example: 'Il nome della rosa (if translated)' },
  { header: 'Series', example: 'Penguin Modern Classics' },
  { header: 'Series Number', example: '3 (position in series)' },
  
  // Contributors
  { header: 'Contributors', example: 'Eco, Umberto (Author); Weaver, William (Translator); Molinari, Jim (Cover Designer)' },
  
  // Language
  { header: 'Language', example: "English (book's language)" },
  { header: 'Original Language', example: 'Italian (if translated)' },
  
  // Publication
  { header: 'Publisher', example: 'Harcourt Brace Jovanovich' },
  { header: 'Publication Place', example: 'New York; London' },
  { header: 'Publication Year', example: '1983 or [1983]' },
  { header: 'Printer', example: 'Clays Ltd, St Ives plc' },
  { header: 'Printing Place', example: 'Bungay, Suffolk' },
  
  // Edition
  { header: 'Edition', example: 'First Edition or 2nd revised ed.' },
  { header: 'Impression', example: 'First Printing or 3rd impression' },
  { header: 'Issue State', example: "First issue with 'adn' typo on p.45" },
  { header: 'Edition Notes', example: 'Limited to 500 numbered copies, signed by author' },
  
  // Physical Description
  { header: 'Pagination', example: 'xvi, 502, [4] p., 12 plates' },
  { header: 'Page Count', example: '502 (number only)' },
  { header: 'Volumes', example: '3 (if multi-volume)' },
  { header: 'Height (mm)', example: '240' },
  { header: 'Width (mm)', example: '156' },
  { header: 'Depth (mm)', example: '35' },
  { header: 'Weight (g)', example: '650' },
  { header: 'Cover Type', example: 'hardcover_dj' },
  { header: 'Binding', example: 'Quarter leather with marbled boards' },
  { header: 'Book Format', example: 'Octavo (8vo)' },
  { header: 'Protective Enclosure', example: 'slipcase_publisher' },
  { header: 'Has Dust Jacket', example: 'yes' },
  { header: 'Signed', example: 'yes' },
  
  // Condition & Status
  { header: 'Condition', example: 'Very Good' },
  { header: 'Condition Notes', example: 'Dust jacket has small tear at spine head; foxing to endpapers; text block clean' },
  { header: 'Status', example: 'in_collection' },
  { header: 'Action Needed', example: 'repair' },
  
  // Identifiers
  { header: 'ISBN-13', example: '978-0-15-600131-4' },
  { header: 'ISBN-10', example: '0-15-600131-4' },
  { header: 'OCLC Number', example: '9332925 (WorldCat ID)' },
  { header: 'LCCN', example: '83-273 (Library of Congress)' },
  { header: 'Catalog ID', example: 'ECO-001 (your own ID)' },
  { header: 'DDC', example: '853.914 (Dewey)' },
  { header: 'LCC', example: 'PQ4865.C6 (LoC class)' },
  { header: 'UDC', example: '821.131.1 (Universal)' },
  { header: 'Topic', example: 'Medieval monasteries; Semiotics; Murder mystery' },
  { header: 'BISAC Code 1', example: 'FIC019000' },
  { header: 'BISAC Code 2', example: 'FIC022000 (optional)' },
  { header: 'BISAC Code 3', example: 'FIC014000 (optional)' },
  
  // Storage
  { header: 'Location', example: 'Living Room Bookcase' },
  { header: 'Shelf', example: 'A3 or Top shelf' },
  { header: 'Section', example: 'Fiction-E' },
  
  // Acquisition
  { header: 'Acquired From', example: 'Antiquariaat De Roo, Ghent' },
  { header: 'Acquired Date', example: '2024-03-15' },
  { header: 'Acquired Price', example: '45.00' },
  { header: 'Acquired Currency', example: 'EUR' },
  { header: 'Acquisition Notes', example: "Bought at book fair; includes seller's invoice #1234" },
  
  // Valuation
  { header: 'Lowest Price', example: '30.00 (market low)' },
  { header: 'Highest Price', example: '120.00 (market high)' },
  { header: 'Estimated Value', example: '75.00 (your estimate)' },
  { header: 'Sales Price', example: '85.00 (if selling)' },
  { header: 'Price Currency', example: 'EUR' },
  
  // Notes
  { header: 'Summary', example: 'Brother William investigates murders in a Benedictine monastery in 1327' },
  { header: 'Provenance', example: 'Ex-library copy from University of Ghent; bookplate of Prof. Jan De Vries' },
  { header: 'Bibliography', example: 'Carter A23a; First edition, first printing per Gaskell' },
  { header: 'Illustrations Description', example: 'Frontispiece portrait; 12 b/w plates of monastery plans' },
  { header: 'Signatures Description', example: 'A-Z⁸ Aa-Ff⁸ (collation formula for bibliographers)' },
  { header: 'Private Notes', example: 'Gift from Maria for my 40th birthday; keep in family' },
  { header: 'Catalog Entry', example: 'Enter your own description, or leave empty to auto-generate' },
]

// Instructions for the second sheet
const instructions = [
  ['Shelvd Import Template'],
  [''],
  ['HOW TO USE'],
  ['• Row 1 contains column headers — do not modify'],
  ['• Row 2 shows examples with explanations — delete this row before importing'],
  ["• Only 'Title' is required (marked with *), all other fields are optional"],
  ["• Leave cells empty if you don't have the data"],
  [''],
  ['─'.repeat(80)],
  [''],
  ['CONTRIBUTORS'],
  ['Format: Lastname, Firstname (Role); Lastname2, Firstname2 (Role2)'],
  [''],
  ['Examples:'],
  ['  • Single author: Eco, Umberto (Author)'],
  ['  • With translator: Eco, Umberto (Author); Weaver, William (Translator)'],
  ['  • Multiple roles: Tolkien, J.R.R. (Author); Lee, Alan (Illustrator); Howe, John (Illustrator)'],
  [''],
  ['Available roles: Author, Co-author, Editor, Translator, Illustrator, Photographer,'],
  ['                 Introduction by, Foreword by, Afterword by, Cover Designer, Contributor'],
  [''],
  ['─'.repeat(80)],
  [''],
  ['STATUS VALUES'],
  ['  in_collection — Book is in your collection (default)'],
  ['  lent — Lent to someone'],
  ['  borrowed — Borrowed from someone'],
  ['  double — Duplicate copy'],
  ['  to_sell — Marked for selling'],
  ['  on_sale — Currently listed for sale'],
  ['  reserved — Reserved for someone'],
  ['  sold — Has been sold'],
  ['  ordered — On order, not yet received'],
  ['  lost, donated, destroyed, unknown'],
  [''],
  ['─'.repeat(80)],
  [''],
  ['ACTION NEEDED VALUES'],
  ['  none — No action needed (default)'],
  ['  repair — Needs repair'],
  ['  bind — Needs binding/rebinding'],
  ['  replace — Should be replaced'],
  [''],
  ['─'.repeat(80)],
  [''],
  ['COVER TYPE VALUES'],
  ['  softcover — Paperback'],
  ['  hardcover — Hardcover without dust jacket'],
  ['  softcover_dj — Paperback with dust jacket (rare)'],
  ['  hardcover_dj — Hardcover with dust jacket'],
  ['  full_leather_hardcover, full_cloth_hardcover — Bound in leather/cloth'],
  ['  quarter_leather_paper — Leather spine, paper sides'],
  ['  half_leather_paper — Leather spine and corners, paper sides'],
  ['  library_binding — Reinforced library binding'],
  ['  original_wraps — Original paper wrappers (antiquarian)'],
  [''],
  ['─'.repeat(80)],
  [''],
  ['PROTECTIVE ENCLOSURE VALUES'],
  ['  none — No protective enclosure (default)'],
  ["  slipcase_publisher — Publisher's slipcase"],
  ['  slipcase_custom — Custom-made slipcase'],
  ['  clamshell_box — Clamshell box'],
  ['  chemise — Protective chemise'],
  ['  solander_box — Solander box'],
  [''],
  ['─'.repeat(80)],
  [''],
  ['CONDITION VALUES (standard book trade terms)'],
  ['  As New — Perfect, unread condition'],
  ['  Fine — Nearly perfect, minimal signs of handling'],
  ['  Very Good — Shows some wear but no major defects'],
  ['  Good — Average used condition, all pages intact'],
  ['  Fair — Worn but complete and readable'],
  ['  Poor — Heavily worn, may have defects'],
  [''],
  ['─'.repeat(80)],
  [''],
  ['YES/NO FIELDS (Has Dust Jacket, Signed)'],
  ['  Accepted values: yes, no, true, false, 1, 0'],
  [''],
  ['DATE FORMAT'],
  ['  Use YYYY-MM-DD format (e.g., 2024-03-15)'],
  ['  Partial dates OK: 2024-03 or just 2024'],
  [''],
  ['LANGUAGE'],
  ['  Use full English names: English, Dutch, French, German, Italian, Spanish,'],
  ['  Portuguese, Russian, Japanese, Chinese, Arabic, Latin, Greek, etc.'],
  [''],
  ['PAGINATION'],
  ['  Use bibliographic notation: xvi, 502, [4] p., 12 plates'],
  ['  Roman numerals for front matter, Arabic for main text, brackets for unnumbered'],
  [''],
  ['BISAC CODES'],
  ['  Optional subject classification codes (e.g., FIC019000 for Literary Fiction)'],
  ['  Find codes at: bisg.org/page/BISACSubjectCodes'],
]

export async function GET() {
  // Create workbook
  const wb = XLSX.utils.book_new()
  
  // Create Books sheet data
  const headers = columns.map(c => c.header)
  const examples = columns.map(c => c.example)
  const booksData = [headers, examples]
  
  const wsBooks = XLSX.utils.aoa_to_sheet(booksData)
  
  // Set column widths
  wsBooks['!cols'] = columns.map(() => ({ wch: 25 }))
  
  // Add Books sheet
  XLSX.utils.book_append_sheet(wb, wsBooks, 'Books')
  
  // Create Instructions sheet
  const wsInstructions = XLSX.utils.aoa_to_sheet(instructions)
  wsInstructions['!cols'] = [{ wch: 90 }]
  
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions')
  
  // Generate buffer
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  
  // Return as downloadable file
  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="shelvd_import_template.xlsx"',
    },
  })
}
