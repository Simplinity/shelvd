import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib'
import { BookPdfData } from './types'

// Standard library catalog card: 3×5 inches = 216 × 360 points
const CARD_W = 360
const CARD_H = 216

// Margins
const M_LEFT = 14
const M_RIGHT = 14
const M_TOP = 16
const M_BOTTOM = 18

// The iconic red vertical line position (first indentation)
const RED_LINE_X = M_LEFT + 42

// Indentation levels (AACR standard)
const INDENT_1 = RED_LINE_X + 6    // Author starts here (just right of red line)
const INDENT_2 = INDENT_1 + 36     // Title, imprint, collation
const INDENT_3 = INDENT_2 + 12     // Continuation / notes

// Typography
const RULE_SPACING = 13.5
const FONT_MAIN = 7.5
const FONT_SMALL = 6.5
const FONT_CALL = 7

// Colors
const INK = rgb(0.08, 0.06, 0.04)          // Near-black typewriter ink
const INK_FADED = rgb(0.28, 0.25, 0.22)    // Faded ink for secondary text
const RULE_COLOR = rgb(0.78, 0.76, 0.73)   // Light warm gray ruled lines
const RED = rgb(0.72, 0.08, 0.08)          // Classic library card red
const CARD_BG = rgb(0.98, 0.96, 0.93)      // Off-white / cream card stock
const BORDER = rgb(0.60, 0.57, 0.53)       // Card edge

function safeText(text: string): string {
  return text.replace(/[^\x00-\xFF]/g, (ch) => {
    const map: Record<string, string> = {
      '\u2013': '-', '\u2014': '--', '\u2018': "'", '\u2019': "'",
      '\u201C': '"', '\u201D': '"', '\u2026': '...', '\u2022': '*',
      '\u00A0': ' ', '\u2192': '->', '\u200B': '',
    }
    return map[ch] || '?'
  })
}

function truncate(text: string, font: PDFFont, maxWidth: number, size: number): string {
  const safe = safeText(text)
  if (font.widthOfTextAtSize(safe, size) <= maxWidth) return safe
  let t = safe
  while (t.length > 0 && font.widthOfTextAtSize(t + '...', size) > maxWidth) {
    t = t.slice(0, -1)
  }
  return t + '...'
}

function wrapLines(text: string, font: PDFFont, maxWidth: number, size: number): string[] {
  const safe = safeText(text)
  const words = safe.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? current + ' ' + word : word
    if (font.widthOfTextAtSize(test, size) > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

export async function generateCatalogCard(data: BookPdfData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const courier = await pdfDoc.embedFont(StandardFonts.Courier)
  const courierBold = await pdfDoc.embedFont(StandardFonts.CourierBold)
  const courierOblique = await pdfDoc.embedFont(StandardFonts.CourierOblique)
  
  const page = pdfDoc.addPage([CARD_W, CARD_H])
  
  // ═══ CARD STOCK BACKGROUND ═══
  page.drawRectangle({
    x: 0, y: 0,
    width: CARD_W, height: CARD_H,
    color: CARD_BG,
  })
  
  // ═══ RULED HORIZONTAL LINES ═══
  const firstRuleY = CARD_H - M_TOP - 2
  let ruleY = firstRuleY
  while (ruleY > M_BOTTOM) {
    page.drawLine({
      start: { x: M_LEFT, y: ruleY },
      end: { x: CARD_W - M_RIGHT, y: ruleY },
      thickness: 0.3,
      color: RULE_COLOR,
    })
    ruleY -= RULE_SPACING
  }
  
  // ═══ RED VERTICAL LINE ═══
  page.drawLine({
    start: { x: RED_LINE_X, y: CARD_H - 6 },
    end: { x: RED_LINE_X, y: 6 },
    thickness: 0.75,
    color: RED,
  })
  
  // ═══ CARD BORDER (double line, outer) ═══
  page.drawRectangle({
    x: 2, y: 2,
    width: CARD_W - 4, height: CARD_H - 4,
    borderColor: BORDER,
    borderWidth: 0.75,
    color: undefined,
  })
  
  // ═══ HOLE AT BOTTOM CENTER ═══
  page.drawCircle({
    x: CARD_W / 2,
    y: M_BOTTOM - 6,
    size: 4.5,
    borderColor: BORDER,
    borderWidth: 0.5,
    color: rgb(1, 1, 1), // white hole
  })
  
  // ═══ TEXT PLACEMENT ═══
  // We place text just above each ruled line
  const textOffsetAboveLine = 3.5
  let lineIdx = 0
  
  function lineY(idx: number): number {
    return firstRuleY - (idx * RULE_SPACING) + textOffsetAboveLine + RULE_SPACING
  }
  
  function drawText(text: string, x: number, line: number, font: PDFFont, size: number = FONT_MAIN, color = INK) {
    page.drawText(text, { x, y: lineY(line), size, font, color })
  }
  
  const contentWidth = CARD_W - M_RIGHT  // right boundary
  
  // ═══ CALL NUMBER (left of red line, stacked) ═══
  const callParts: string[] = []
  if (data.ddc) {
    // Split DDC into class + subdivision for stacking
    const ddc = data.ddc
    if (ddc.includes('/') || ddc.includes('.')) {
      callParts.push(ddc)
    } else {
      callParts.push(ddc)
    }
  } else if (data.lcc) {
    callParts.push(data.lcc)
  }
  if (data.user_catalog_id) {
    callParts.push(data.user_catalog_id)
  }
  
  // Author's cutter number (first 4 chars of surname)
  const primaryAuthor = data.contributors.find(c => c.role === 'Author')?.name || data.contributors[0]?.name
  if (primaryAuthor) {
    const surname = primaryAuthor.split(',')[0].trim()
    const cutter = surname.substring(0, 1).toUpperCase() + surname.substring(1, 4).toLowerCase()
    if (!callParts.some(p => p.toLowerCase().startsWith(cutter.toLowerCase()))) {
      callParts.push(cutter)
    }
  }
  
  for (let i = 0; i < Math.min(callParts.length, 4); i++) {
    const callText = truncate(callParts[i], courier, RED_LINE_X - M_LEFT - 4, FONT_CALL)
    drawText(callText, M_LEFT + 2, i, courierBold, FONT_CALL, INK_FADED)
  }
  
  // ═══ MAIN ENTRY: AUTHOR (at indent 1, line 0) ═══
  lineIdx = 0
  if (primaryAuthor) {
    // AACR: surname, forename(s)
    const authorText = truncate(primaryAuthor, courierBold, contentWidth - INDENT_1, FONT_MAIN)
    drawText(authorText, INDENT_1, lineIdx, courierBold, FONT_MAIN)
    lineIdx++
  }
  
  // ═══ TITLE PARAGRAPH (at indent 2) ═══
  // Title proper / statement of responsibility
  let titleBlock = data.title
  if (data.subtitle) titleBlock += ' : ' + data.subtitle
  titleBlock += ' / '
  if (primaryAuthor) titleBlock += primaryAuthor
  // Add other contributors
  const otherContribs = data.contributors.filter(c => c.name !== primaryAuthor)
  if (otherContribs.length > 0) {
    titleBlock += ' ; ' + otherContribs.map(c => c.name).join(', ')
  }
  titleBlock += '.'
  
  const titleMaxW = contentWidth - INDENT_2
  const titleLines = wrapLines(titleBlock, courier, titleMaxW, FONT_MAIN)
  for (let i = 0; i < Math.min(titleLines.length, 3); i++) {
    drawText(titleLines[i], INDENT_2, lineIdx, courier, FONT_MAIN)
    lineIdx++
  }
  
  // ═══ EDITION STATEMENT ═══
  if (data.edition || data.impression) {
    const edParts = [data.edition]
    if (data.impression) edParts.push(data.impression + ' impr.')
    const edLine = '-- ' + edParts.filter(Boolean).join(', ') + '.'
    drawText(truncate(edLine, courier, titleMaxW, FONT_MAIN), INDENT_2, lineIdx, courier, FONT_MAIN)
    lineIdx++
  }
  
  // ═══ IMPRINT: place : publisher, year ═══
  const imprintParts: string[] = []
  if (data.publication_place) imprintParts.push(data.publication_place)
  if (data.publisher) imprintParts.push(': ' + data.publisher)
  if (data.publication_year) imprintParts.push(', ' + data.publication_year)
  if (imprintParts.length > 0) {
    const imprint = '-- ' + imprintParts.join('') + '.'
    drawText(truncate(imprint, courier, titleMaxW, FONT_MAIN), INDENT_2, lineIdx, courier, FONT_MAIN)
    lineIdx++
  }
  
  // ═══ COLLATION: pages ; dimensions ═══
  const collParts: string[] = []
  if (data.pagination) collParts.push(data.pagination)
  if (data.height_mm) collParts.push(data.height_mm + ' mm')
  if (collParts.length > 0) {
    const coll = '-- ' + collParts.join(' ; ') + '.'
    drawText(truncate(coll, courier, titleMaxW, FONT_MAIN), INDENT_2, lineIdx, courier, FONT_MAIN)
    lineIdx++
  }
  
  // ═══ PHYSICAL / NOTES ═══
  const notes: string[] = []
  if (data.binding) notes.push(data.binding)
  if (data.is_signed) notes.push('Signed copy')
  if (data.has_dust_jacket) notes.push('In dust jacket')
  if (data.condition) notes.push('Condition: ' + data.condition)
  
  if (notes.length > 0) {
    lineIdx++ // Skip a line before notes (AACR convention)
    const noteLine = notes.join('. ') + '.'
    const noteLines = wrapLines(noteLine, courier, titleMaxW, FONT_SMALL)
    for (let i = 0; i < Math.min(noteLines.length, 2); i++) {
      drawText(noteLines[i], INDENT_2, lineIdx, courier, FONT_SMALL, INK)
      lineIdx++
    }
  }
  
  // ═══ ISBN ═══
  const isbn = data.isbn_13 || data.isbn_10
  if (isbn) {
    drawText('ISBN ' + isbn, INDENT_2, lineIdx, courier, FONT_SMALL)
    lineIdx++
  }
  
  // ═══ TRACINGS (bottom of card, subjects numbered, added entries Roman) ═══
  // Calculate available lines from bottom
  const maxLines = Math.floor((firstRuleY - M_BOTTOM) / RULE_SPACING)
  const tracingStartLine = Math.max(lineIdx + 1, maxLines - 2) // At least 2 lines from bottom
  
  if (data.bisac_subjects && data.bisac_subjects.length > 0) {
    const subjects = data.bisac_subjects.map((s, i) => `${i + 1}. ${s.split(' — ')[1] || s}`)
    const tracingText = subjects.join('  ')
    const tracingMaxW = contentWidth - INDENT_1
    const tLines = wrapLines(tracingText, courier, tracingMaxW, 5.5)
    for (let i = 0; i < Math.min(tLines.length, 2); i++) {
      drawText(tLines[i], INDENT_1, tracingStartLine + i, courier, 5.5, INK_FADED)
    }
  }
  
  // ═══ STORAGE LOCATION (bottom-right corner, tiny) ═══
  if (data.storage_location || data.shelf) {
    const loc = [data.storage_location, data.shelf].filter(Boolean).join(' / ')
    const locSafe = safeText(loc)
    const locW = courier.widthOfTextAtSize(locSafe, 5)
    page.drawText(locSafe, {
      x: CARD_W - M_RIGHT - locW,
      y: M_BOTTOM - 2,
      size: 5,
      font: courier,
      color: INK_FADED,
    })
  }
  
  return pdfDoc.save()
}
