import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'

// Column definitions for the import template
const columns: { header: string; width: number; example: string }[] = [
  // Title & Series
  { header: 'Title *', width: 35, example: 'The Name of the Rose' },
  { header: 'Subtitle', width: 30, example: "Including the Author's Postscript" },
  { header: 'Original Title', width: 30, example: 'Il nome della rosa (if translated)' },
  { header: 'Series', width: 25, example: 'Penguin Modern Classics' },
  { header: 'Series Number', width: 14, example: '3 (position in series)' },
  
  // Contributors
  { header: 'Contributors', width: 60, example: 'Eco, Umberto (Author); Weaver, William (Translator); Molinari, Jim (Cover Designer)' },
  
  // Language
  { header: 'Language', width: 20, example: "English (book's language)" },
  { header: 'Original Language', width: 20, example: 'Italian (if translated)' },
  
  // Publication
  { header: 'Publisher', width: 25, example: 'Harcourt Brace Jovanovich' },
  { header: 'Publication Place', width: 20, example: 'New York; London' },
  { header: 'Publication Year', width: 16, example: '1983 or [1983]' },
  { header: 'Printer', width: 25, example: 'Clays Ltd, St Ives plc' },
  { header: 'Printing Place', width: 20, example: 'Bungay, Suffolk' },
  
  // Edition
  { header: 'Edition', width: 25, example: 'First Edition or 2nd revised ed.' },
  { header: 'Impression', width: 20, example: 'First Printing or 3rd impression' },
  { header: 'Issue State', width: 30, example: "First issue with 'adn' typo on p.45" },
  { header: 'Edition Notes', width: 40, example: 'Limited to 500 numbered copies, signed by author' },
  
  // Physical Description
  { header: 'Pagination', width: 30, example: 'xvi, 502, [4] p., 12 plates' },
  { header: 'Page Count', width: 14, example: '502 (number only)' },
  { header: 'Volumes', width: 14, example: '3 (if multi-volume)' },
  { header: 'Height (mm)', width: 12, example: '240' },
  { header: 'Width (mm)', width: 12, example: '156' },
  { header: 'Depth (mm)', width: 12, example: '35' },
  { header: 'Weight (g)', width: 12, example: '650' },
  { header: 'Cover Type', width: 25, example: 'hardcover_dj' },
  { header: 'Binding', width: 25, example: 'Quarter leather with marbled boards' },
  { header: 'Book Format', width: 20, example: 'Octavo (8vo)' },
  { header: 'Protective Enclosure', width: 22, example: 'slipcase_publisher' },
  { header: 'Has Dust Jacket', width: 14, example: 'yes' },
  { header: 'Signed', width: 10, example: 'yes' },
  
  // Condition & Status
  { header: 'Condition', width: 15, example: 'Very Good' },
  { header: 'Condition Notes', width: 45, example: 'Dust jacket has small tear at spine head; foxing to endpapers; text block clean' },
  { header: 'Status', width: 18, example: 'in_collection' },
  { header: 'Action Needed', width: 15, example: 'repair' },
  
  // Identifiers
  { header: 'ISBN-13', width: 18, example: '978-0-15-600131-4' },
  { header: 'ISBN-10', width: 15, example: '0-15-600131-4' },
  { header: 'OCLC Number', width: 18, example: '9332925 (WorldCat ID)' },
  { header: 'LCCN', width: 18, example: '83-273 (Library of Congress)' },
  { header: 'Catalog ID', width: 18, example: 'ECO-001 (your own ID)' },
  { header: 'DDC', width: 14, example: '853.914 (Dewey)' },
  { header: 'LCC', width: 16, example: 'PQ4865.C6 (LoC class)' },
  { header: 'UDC', width: 14, example: '821.131.1 (Universal)' },
  { header: 'Topic', width: 30, example: 'Medieval monasteries; Semiotics; Murder mystery' },
  { header: 'BISAC Code 1', width: 16, example: 'FIC019000' },
  { header: 'BISAC Code 2', width: 16, example: 'FIC022000 (optional)' },
  { header: 'BISAC Code 3', width: 16, example: 'FIC014000 (optional)' },
  
  // Storage
  { header: 'Location', width: 20, example: 'Living Room Bookcase' },
  { header: 'Shelf', width: 14, example: 'A3 or Top shelf' },
  { header: 'Section', width: 14, example: 'Fiction-E' },
  
  // Acquisition
  { header: 'Acquired From', width: 25, example: 'Antiquariaat De Roo, Ghent' },
  { header: 'Acquired Date', width: 14, example: '2024-03-15' },
  { header: 'Acquired Price', width: 14, example: '45.00' },
  { header: 'Acquired Currency', width: 14, example: 'EUR' },
  { header: 'Acquisition Notes', width: 40, example: "Bought at book fair; includes seller's invoice #1234" },
  
  // Valuation
  { header: 'Lowest Price', width: 16, example: '30.00 (market low)' },
  { header: 'Highest Price', width: 16, example: '120.00 (market high)' },
  { header: 'Estimated Value', width: 16, example: '75.00 (your estimate)' },
  { header: 'Sales Price', width: 16, example: '85.00 (if selling)' },
  { header: 'Price Currency', width: 14, example: 'EUR' },
  
  // Notes
  { header: 'Summary', width: 55, example: 'Brother William investigates murders in a Benedictine monastery in 1327' },
  { header: 'Provenance', width: 45, example: 'Ex-library copy from University of Ghent; bookplate of Prof. Jan De Vries' },
  { header: 'Bibliography', width: 45, example: 'Carter A23a; First edition, first printing per Gaskell' },
  { header: 'Illustrations Description', width: 45, example: 'Frontispiece portrait; 12 b/w plates of monastery plans' },
  { header: 'Signatures Description', width: 45, example: 'A-Z⁸ Aa-Ff⁸ (collation formula for bibliographers)' },
  { header: 'Private Notes', width: 45, example: 'Gift from Maria for my 40th birthday; keep in family' },
  { header: 'Catalog Entry', width: 55, example: 'Enter your own description, or leave empty to auto-generate' },
]

// Instructions for the second sheet
const instructions: [string, boolean, number][] = [
  ['Shelvd Import Template', true, 16],
  ['', false, 11],
  ['HOW TO USE', true, 12],
  ['• Row 1 contains column headers — do not modify', false, 11],
  ['• Row 2 shows examples with explanations — delete this row before importing', false, 11],
  ["• Only 'Title' is required (marked with *), all other fields are optional", false, 11],
  ["• Leave cells empty if you don't have the data", false, 11],
  ['', false, 11],
  ['─'.repeat(80), false, 11],
  ['', false, 11],
  ['CONTRIBUTORS', true, 12],
  ['Format: Lastname, Firstname (Role); Lastname2, Firstname2 (Role2)', false, 11],
  ['', false, 11],
  ['Examples:', false, 11],
  ['  • Single author: Eco, Umberto (Author)', false, 11],
  ['  • With translator: Eco, Umberto (Author); Weaver, William (Translator)', false, 11],
  ['  • Multiple roles: Tolkien, J.R.R. (Author); Lee, Alan (Illustrator); Howe, John (Illustrator)', false, 11],
  ['', false, 11],
  ['Available roles: Author, Co-author, Editor, Translator, Illustrator, Photographer,', false, 11],
  ['                 Introduction by, Foreword by, Afterword by, Cover Designer, Contributor', false, 11],
  ['', false, 11],
  ['─'.repeat(80), false, 11],
  ['', false, 11],
  ['STATUS VALUES', true, 12],
  ['  in_collection — Book is in your collection (default)', false, 11],
  ['  lent — Lent to someone', false, 11],
  ['  borrowed — Borrowed from someone', false, 11],
  ['  double — Duplicate copy', false, 11],
  ['  to_sell — Marked for selling', false, 11],
  ['  on_sale — Currently listed for sale', false, 11],
  ['  reserved — Reserved for someone', false, 11],
  ['  sold — Has been sold', false, 11],
  ['  ordered — On order, not yet received', false, 11],
  ['  lost, donated, destroyed, unknown', false, 11],
  ['', false, 11],
  ['─'.repeat(80), false, 11],
  ['', false, 11],
  ['ACTION NEEDED VALUES', true, 12],
  ['  none — No action needed (default)', false, 11],
  ['  repair — Needs repair', false, 11],
  ['  bind — Needs binding/rebinding', false, 11],
  ['  replace — Should be replaced', false, 11],
  ['', false, 11],
  ['─'.repeat(80), false, 11],
  ['', false, 11],
  ['COVER TYPE VALUES', true, 12],
  ['  softcover — Paperback', false, 11],
  ['  hardcover — Hardcover without dust jacket', false, 11],
  ['  softcover_dj — Paperback with dust jacket (rare)', false, 11],
  ['  hardcover_dj — Hardcover with dust jacket', false, 11],
  ['  full_leather_hardcover, full_cloth_hardcover — Bound in leather/cloth', false, 11],
  ['  quarter_leather_paper — Leather spine, paper sides', false, 11],
  ['  half_leather_paper — Leather spine and corners, paper sides', false, 11],
  ['  library_binding — Reinforced library binding', false, 11],
  ['  original_wraps — Original paper wrappers (antiquarian)', false, 11],
  ['', false, 11],
  ['─'.repeat(80), false, 11],
  ['', false, 11],
  ['PROTECTIVE ENCLOSURE VALUES', true, 12],
  ['  none — No protective enclosure (default)', false, 11],
  ["  slipcase_publisher — Publisher's slipcase", false, 11],
  ['  slipcase_custom — Custom-made slipcase', false, 11],
  ['  clamshell_box — Clamshell box', false, 11],
  ['  chemise — Protective chemise', false, 11],
  ['  solander_box — Solander box', false, 11],
  ['', false, 11],
  ['─'.repeat(80), false, 11],
  ['', false, 11],
  ['CONDITION VALUES (standard book trade terms)', true, 12],
  ['  As New — Perfect, unread condition', false, 11],
  ['  Fine — Nearly perfect, minimal signs of handling', false, 11],
  ['  Very Good — Shows some wear but no major defects', false, 11],
  ['  Good — Average used condition, all pages intact', false, 11],
  ['  Fair — Worn but complete and readable', false, 11],
  ['  Poor — Heavily worn, may have defects', false, 11],
  ['', false, 11],
  ['─'.repeat(80), false, 11],
  ['', false, 11],
  ['YES/NO FIELDS (Has Dust Jacket, Signed)', true, 12],
  ['  Accepted values: yes, no, true, false, 1, 0', false, 11],
  ['', false, 11],
  ['DATE FORMAT', true, 12],
  ['  Use YYYY-MM-DD format (e.g., 2024-03-15)', false, 11],
  ['  Partial dates OK: 2024-03 or just 2024', false, 11],
  ['', false, 11],
  ['LANGUAGE', true, 12],
  ['  Use full English names: English, Dutch, French, German, Italian, Spanish,', false, 11],
  ['  Portuguese, Russian, Japanese, Chinese, Arabic, Latin, Greek, etc.', false, 11],
  ['', false, 11],
  ['PAGINATION', true, 12],
  ['  Use bibliographic notation: xvi, 502, [4] p., 12 plates', false, 11],
  ['  Roman numerals for front matter, Arabic for main text, brackets for unnumbered', false, 11],
  ['', false, 11],
  ['BISAC CODES', true, 12],
  ['  Optional subject classification codes (e.g., FIC019000 for Literary Fiction)', false, 11],
  ['  Find codes at: bisg.org/page/BISACSubjectCodes', false, 11],
]

export async function GET() {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Shelvd'
  workbook.created = new Date()
  
  // ===== BOOKS SHEET =====
  const wsBooks = workbook.addWorksheet('Books', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
  })
  
  // Set up columns with widths
  wsBooks.columns = columns.map((col, index) => ({
    key: `col${index}`,
    width: col.width
  }))
  
  // Header row (row 1)
  const headerRow = wsBooks.getRow(1)
  columns.forEach((col, index) => {
    const cell = headerRow.getCell(index + 1)
    cell.value = col.header
    cell.font = {
      name: 'Arial',
      size: 10,
      bold: true,
      color: { argb: 'FFFFFFFF' }
    }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A1A1A' }
    }
    cell.alignment = {
      horizontal: 'left',
      vertical: 'middle',
      wrapText: true
    }
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } }
    }
  })
  headerRow.height = 30
  
  // Example row (row 2)
  const exampleRow = wsBooks.getRow(2)
  columns.forEach((col, index) => {
    const cell = exampleRow.getCell(index + 1)
    cell.value = col.example
    cell.font = {
      name: 'Arial',
      size: 10,
      italic: true,
      color: { argb: 'FF666666' }
    }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF5F5F5' }
    }
    cell.alignment = {
      horizontal: 'left',
      vertical: 'middle'
    }
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } }
    }
  })
  exampleRow.height = 22
  
  // ===== INSTRUCTIONS SHEET =====
  const wsInstructions = workbook.addWorksheet('Instructions')
  wsInstructions.getColumn(1).width = 90
  
  instructions.forEach(([text, isBold, size], index) => {
    const row = wsInstructions.getRow(index + 1)
    const cell = row.getCell(1)
    cell.value = text
    cell.font = {
      name: 'Arial',
      size: size,
      bold: isBold
    }
    cell.alignment = {
      horizontal: 'left',
      vertical: 'middle'
    }
  })
  
  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer()
  
  // Return as downloadable file
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="shelvd_import_template.xlsx"',
    },
  })
}
