import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib'
import { BookPdfData } from './types'

// 3×5 inch catalog card = 216 × 360 points
const CARD_WIDTH = 360
const CARD_HEIGHT = 216

const MARGIN_LEFT = 18
const MARGIN_RIGHT = 18
const MARGIN_TOP = 14
const MARGIN_BOTTOM = 14
const LINE_HEIGHT = 13
const INDENT_1 = 12   // First indent (hanging indent for author)
const INDENT_2 = 40   // Second indent (title continuation)

// Ruled lines
const RULE_START_Y = CARD_HEIGHT - MARGIN_TOP - 20
const RULE_SPACING = LINE_HEIGHT

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.substring(0, maxLen - 3) + '...'
}

// The signature red line on classic library cards
const RED_LINE_INDEX = 2  // Third ruled line from top (where title starts)

function drawRuledLines(page: PDFPage) {
  const lineColor = rgb(0.75, 0.72, 0.68)  // Warm gray, vintage feel
  const redColor = rgb(0.75, 0.12, 0.12)   // Classic catalog card red
  let y = RULE_START_Y
  let lineNum = 0
  while (y > MARGIN_BOTTOM) {
    const isRedLine = lineNum === RED_LINE_INDEX
    page.drawLine({
      start: { x: MARGIN_LEFT, y },
      end: { x: CARD_WIDTH - MARGIN_RIGHT, y },
      thickness: isRedLine ? 0.75 : 0.25,
      color: isRedLine ? redColor : lineColor,
    })
    y -= RULE_SPACING
    lineNum++
  }
}

function drawCardBorder(page: PDFPage) {
  const borderColor = rgb(0.55, 0.52, 0.48)
  // Outer border
  page.drawRectangle({
    x: 3,
    y: 3,
    width: CARD_WIDTH - 6,
    height: CARD_HEIGHT - 6,
    borderColor,
    borderWidth: 0.75,
    color: undefined,
  })
  // "Punch hole" circle at bottom center
  page.drawCircle({
    x: CARD_WIDTH / 2,
    y: 12,
    size: 4,
    borderColor,
    borderWidth: 0.5,
    color: undefined,
  })
}

function drawTypewriterText(
  page: PDFPage,
  font: PDFFont,
  text: string,
  x: number,
  y: number,
  size: number = 7.5,
  color = rgb(0.12, 0.10, 0.08)
) {
  page.drawText(text, { x, y, size, font, color })
}

// Snap y to nearest ruled line
function snapToLine(startY: number, lineIndex: number): number {
  return startY - (lineIndex * RULE_SPACING)
}

export async function generateCatalogCard(data: BookPdfData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const courier = await pdfDoc.embedFont(StandardFonts.Courier)
  const courierBold = await pdfDoc.embedFont(StandardFonts.CourierBold)
  
  const page = pdfDoc.addPage([CARD_WIDTH, CARD_HEIGHT])
  
  // Draw ruled lines first (background)
  drawRuledLines(page)
  drawCardBorder(page)
  
  const maxChars = 48 // Approximate chars per line at 7.5pt Courier
  const textColor = rgb(0.12, 0.10, 0.08)
  
  let line = 0
  const x0 = MARGIN_LEFT
  const x1 = MARGIN_LEFT + INDENT_1
  const x2 = MARGIN_LEFT + INDENT_2
  
  // === Call number (top-left, small) ===
  const callNumber = data.ddc || data.lcc || data.user_catalog_id || ''
  if (callNumber) {
    drawTypewriterText(page, courier, callNumber, x0, CARD_HEIGHT - MARGIN_TOP - 2, 6.5, rgb(0.35, 0.32, 0.28))
  }
  
  // === Main entry: Author (line 0) ===
  const primaryAuthor = data.contributors.find(c => c.role === 'Author')?.name || data.contributors[0]?.name || ''
  if (primaryAuthor) {
    drawTypewriterText(page, courierBold, truncate(primaryAuthor, maxChars), x1, snapToLine(RULE_START_Y, line) - 3, 7.5)
    line++
  }
  
  // === Title (line 1-2, indented) ===
  let titleLine = data.title
  if (data.subtitle) titleLine += ' : ' + data.subtitle
  titleLine += ' /'
  if (primaryAuthor) titleLine += ' ' + primaryAuthor
  
  // Wrap title across lines
  const titleCharsPerLine = maxChars - 5 // Account for indent
  if (titleLine.length > titleCharsPerLine) {
    drawTypewriterText(page, courier, truncate(titleLine.substring(0, titleCharsPerLine), titleCharsPerLine), x2, snapToLine(RULE_START_Y, line) - 3, 7.5)
    line++
    const remainder = titleLine.substring(titleCharsPerLine)
    drawTypewriterText(page, courier, truncate(remainder, titleCharsPerLine), x2, snapToLine(RULE_START_Y, line) - 3, 7.5)
    line++
  } else {
    drawTypewriterText(page, courier, titleLine, x2, snapToLine(RULE_START_Y, line) - 3, 7.5)
    line++
  }
  
  // === Edition (if present) ===
  if (data.edition || data.impression) {
    const edLine = [data.edition, data.impression ? `${data.impression} impression` : ''].filter(Boolean).join(', ')
    drawTypewriterText(page, courier, truncate('-- ' + edLine, maxChars), x2, snapToLine(RULE_START_Y, line) - 3, 7)
    line++
  }
  
  // === Imprint: Publisher, Place, Year (line 3) ===
  const imprintParts = [
    data.publication_place,
    data.publisher ? `: ${data.publisher}` : '',
    data.publication_year ? `, ${data.publication_year}` : '',
  ].filter(Boolean).join('')
  
  if (imprintParts) {
    drawTypewriterText(page, courier, truncate('-- ' + imprintParts + '.', maxChars), x2, snapToLine(RULE_START_Y, line) - 3, 7)
    line++
  }
  
  // === Collation: pages, size ===
  const collParts = [
    data.pagination,
    data.height_mm ? `${data.height_mm}mm` : '',
  ].filter(Boolean).join(' ; ')
  
  if (collParts) {
    drawTypewriterText(page, courier, truncate('-- ' + collParts + '.', maxChars), x2, snapToLine(RULE_START_Y, line) - 3, 7)
    line++
  }
  
  // === Binding / Format ===
  const physParts = [data.binding, data.format, data.cover_type].filter(Boolean).join(', ')
  if (physParts) {
    drawTypewriterText(page, courier, truncate('-- ' + physParts + '.', maxChars), x2, snapToLine(RULE_START_Y, line) - 3, 7)
    line++
  }
  
  // Skip a line
  line++
  
  // === Notes (condition, signed, etc.) ===
  const noteParts: string[] = []
  if (data.is_signed) noteParts.push('SIGNED')
  if (data.has_dust_jacket) noteParts.push('In dust jacket')
  if (data.condition) noteParts.push(`Condition: ${data.condition}`)
  if (noteParts.length > 0) {
    drawTypewriterText(page, courier, truncate(noteParts.join('. ') + '.', maxChars), x2, snapToLine(RULE_START_Y, line) - 3, 6.5)
    line++
  }
  
  // === ISBN ===
  const isbn = data.isbn_13 || data.isbn_10
  if (isbn) {
    drawTypewriterText(page, courier, `ISBN ${isbn}`, x2, snapToLine(RULE_START_Y, line) - 3, 6.5)
    line++
  }
  
  // === Bottom area: Subject tracings ===
  const bottomY = MARGIN_BOTTOM + 8
  if (data.bisac_subjects && data.bisac_subjects.length > 0) {
    const subjects = data.bisac_subjects.map((s, i) => `${i + 1}. ${s}`).join('  ')
    drawTypewriterText(page, courier, truncate(subjects, maxChars + 6), x0, bottomY, 6, rgb(0.35, 0.32, 0.28))
  }
  
  // === Storage location (bottom right, small) ===
  if (data.storage_location || data.shelf) {
    const loc = [data.storage_location, data.shelf, data.shelf_section].filter(Boolean).join(' / ')
    const locWidth = courier.widthOfTextAtSize(loc, 5.5)
    drawTypewriterText(page, courier, loc, CARD_WIDTH - MARGIN_RIGHT - locWidth, bottomY + LINE_HEIGHT, 5.5, rgb(0.45, 0.42, 0.38))
  }
  
  return pdfDoc.save()
}
