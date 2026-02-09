import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib'
import { BookPdfData } from './types'

// Standard library catalog card: 3×5 inches = 216 × 360 points
const CARD_W = 360
const CARD_H = 216

// Margins
const M_LEFT = 14
const M_RIGHT = 14
const M_TOP = 14
const M_BOTTOM = 22  // Extra space for hole

// The iconic red vertical line position
const RED_LINE_X = M_LEFT + 42

// Indentation levels (AACR standard)
const INDENT_1 = RED_LINE_X + 6    // Author starts here
const INDENT_2 = INDENT_1 + 28     // Title, imprint, collation
const INDENT_3 = INDENT_2 + 8      // Continuation

// Typography — tighter for more content
const RULE_SPACING = 12.5
const FONT_MAIN = 7
const FONT_SMALL = 6
const FONT_CALL = 6.5

// Colors
const INK = rgb(0.08, 0.06, 0.04)
const INK_FADED = rgb(0.32, 0.28, 0.24)
const RULE_COLOR = rgb(0.78, 0.76, 0.73)
const RED = rgb(0.72, 0.08, 0.08)
const CARD_BG = rgb(0.97, 0.95, 0.91)
const BORDER = rgb(0.60, 0.57, 0.53)

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

interface CardFonts {
  regular: PDFFont
  bold: PDFFont
  oblique: PDFFont
}

function drawCardContent(
  page: PDFPage,
  data: BookPdfData,
  fonts: CardFonts,
  decorative: boolean
) {
  const { regular, bold, oblique } = fonts
  
  // ═══ BACKGROUND ═══
  if (decorative) {
    page.drawRectangle({ x: 0, y: 0, width: CARD_W, height: CARD_H, color: CARD_BG })
  }
  
  // ═══ RULED HORIZONTAL LINES (decorative only) ═══
  const firstLineY = CARD_H - M_TOP
  const totalLines = Math.floor((firstLineY - M_BOTTOM) / RULE_SPACING)
  
  if (decorative) {
    for (let i = 0; i <= totalLines; i++) {
      const y = firstLineY - i * RULE_SPACING
      page.drawLine({
        start: { x: M_LEFT, y },
        end: { x: CARD_W - M_RIGHT, y },
        thickness: 0.25,
        color: RULE_COLOR,
      })
    }
    
    // Red vertical line
    page.drawLine({
      start: { x: RED_LINE_X, y: CARD_H - 4 },
      end: { x: RED_LINE_X, y: 4 },
      thickness: 0.75,
      color: RED,
    })
    
    // Card border
    page.drawRectangle({
      x: 2, y: 2, width: CARD_W - 4, height: CARD_H - 4,
      borderColor: BORDER, borderWidth: 0.75, color: undefined,
    })
    // Punch hole
    page.drawCircle({
      x: CARD_W / 2, y: 10,
      size: 4.5, borderColor: BORDER, borderWidth: 0.5,
      color: rgb(1, 1, 1),
    })
  }
  
  // ═══ TEXT PLACEMENT ═══
  // Text sits ON each ruled line (baseline on line)
  const textRise = 2.5 // Baseline sits just above the rule
  
  function yForLine(idx: number): number {
    return firstLineY - idx * RULE_SPACING + textRise
  }
  
  const contentRight = CARD_W - M_RIGHT
  let line = 1  // Start 1 line down from top
  
  // ═══ CALL NUMBER (left of red line, stacked) ═══
  const callParts: string[] = []
  if (data.ddc) callParts.push(data.ddc)
  else if (data.lcc) callParts.push(data.lcc)
  if (data.user_catalog_id) callParts.push(data.user_catalog_id)
  
  // Cutter number from author surname
  const primaryAuthor = data.contributors.find(c => c.role === 'Author')?.name || data.contributors[0]?.name
  if (primaryAuthor) {
    const surname = safeText(primaryAuthor.split(',')[0].trim())
    const cutter = surname.substring(0, 1).toUpperCase() + surname.substring(1, 4).toLowerCase()
    callParts.push(cutter)
  }
  
  const callMaxW = RED_LINE_X - M_LEFT - 6
  for (let i = 0; i < Math.min(callParts.length, 4); i++) {
    const t = truncate(callParts[i], regular, callMaxW, FONT_CALL)
    page.drawText(t, { x: M_LEFT + 2, y: yForLine(i + 1), size: FONT_CALL, font: bold, color: INK_FADED })
  }
  
  // ═══ AUTHOR (indent 1, line 0) ═══
  if (primaryAuthor) {
    const maxW = contentRight - INDENT_1
    const authorText = truncate(primaryAuthor, bold, maxW, FONT_MAIN)
    page.drawText(authorText, { x: INDENT_1, y: yForLine(line), size: FONT_MAIN, font: bold, color: INK })
    line++
  }
  
  // ═══ TITLE PARAGRAPH (indent 2) ═══
  let titleBlock = data.title
  if (data.subtitle) titleBlock += ' : ' + data.subtitle
  titleBlock += ' / '
  if (primaryAuthor) titleBlock += primaryAuthor
  const otherContribs = data.contributors.filter(c => c.name !== primaryAuthor)
  if (otherContribs.length > 0) {
    titleBlock += ' ; ' + otherContribs.map(c => c.name).join(', ')
  }
  titleBlock += '.'
  
  const titleMaxW = contentRight - INDENT_2
  const titleLines = wrapLines(titleBlock, regular, titleMaxW, FONT_MAIN)
  for (let i = 0; i < Math.min(titleLines.length, 3); i++) {
    page.drawText(titleLines[i], { x: INDENT_2, y: yForLine(line), size: FONT_MAIN, font: regular, color: INK })
    line++
  }
  
  // ═══ EDITION ═══
  if (data.edition || data.impression) {
    const edParts = [data.edition]
    if (data.impression) edParts.push(data.impression + ' impr.')
    const edLine = '-- ' + edParts.filter(Boolean).join(', ') + '.'
    page.drawText(truncate(edLine, regular, titleMaxW, FONT_MAIN), { x: INDENT_2, y: yForLine(line), size: FONT_MAIN, font: regular, color: INK })
    line++
  }
  
  // ═══ IMPRINT ═══
  const imprintParts: string[] = []
  if (data.publication_place) imprintParts.push(data.publication_place)
  if (data.publisher) imprintParts.push(': ' + data.publisher)
  if (data.publication_year) imprintParts.push(', ' + data.publication_year)
  if (imprintParts.length > 0) {
    const imprint = '-- ' + imprintParts.join('') + '.'
    page.drawText(truncate(imprint, regular, titleMaxW, FONT_MAIN), { x: INDENT_2, y: yForLine(line), size: FONT_MAIN, font: regular, color: INK })
    line++
  }
  
  // ═══ COLLATION ═══
  const collParts: string[] = []
  if (data.pagination) collParts.push(data.pagination)
  if (data.height_mm) collParts.push(data.height_mm + ' mm')
  if (data.binding) collParts.push(data.binding)
  if (collParts.length > 0) {
    const coll = '-- ' + collParts.join(' ; ') + '.'
    page.drawText(truncate(coll, regular, titleMaxW, FONT_MAIN), { x: INDENT_2, y: yForLine(line), size: FONT_MAIN, font: regular, color: INK })
    line++
  }
  
  // ═══ NOTES ═══
  const notes: string[] = []
  if (data.is_signed) notes.push('Signed copy')
  if (data.has_dust_jacket) notes.push('In dust jacket')
  if (data.condition) notes.push('Cond.: ' + data.condition)
  if (data.dust_jacket_condition) notes.push('DJ: ' + data.dust_jacket_condition)
  if (data.format) notes.push(data.format)
  
  if (notes.length > 0) {
    line++ // Skip a line (AACR convention before notes)
    const noteLine = notes.join('. ') + '.'
    const noteLines = wrapLines(noteLine, regular, titleMaxW, FONT_SMALL)
    for (let i = 0; i < Math.min(noteLines.length, 2); i++) {
      page.drawText(noteLines[i], { x: INDENT_2, y: yForLine(line), size: FONT_SMALL, font: regular, color: INK })
      line++
    }
  }
  
  // ═══ ISBN ═══
  const isbn = data.isbn_13 || data.isbn_10
  if (isbn) {
    page.drawText('ISBN ' + safeText(isbn), { x: INDENT_2, y: yForLine(line), size: FONT_SMALL, font: regular, color: INK })
    line++
  }
  
  // ═══ SERIES ═══
  if (data.series) {
    const seriesText = '(' + data.series + (data.series_number ? ' ; ' + data.series_number : '') + ')'
    page.drawText(truncate(seriesText, regular, titleMaxW, FONT_SMALL), { x: INDENT_2, y: yForLine(line), size: FONT_SMALL, font: regular, color: INK })
    line++
  }
  
  // ═══ TRACINGS (bottom area) ═══
  const tracingLine = Math.max(line + 1, totalLines - 2)
  
  if (data.bisac_subjects && data.bisac_subjects.length > 0) {
    const subjects = data.bisac_subjects.map((s, i) => `${i + 1}. ${(s.split(' — ')[1] || s).substring(0, 30)}`)
    const tracingText = subjects.join('  ')
    const tMaxW = contentRight - INDENT_1
    const tLines = wrapLines(tracingText, regular, tMaxW, 5)
    for (let i = 0; i < Math.min(tLines.length, 2); i++) {
      if (tracingLine + i < totalLines) {
        page.drawText(tLines[i], { x: INDENT_1, y: yForLine(tracingLine + i), size: 5, font: regular, color: INK_FADED })
      }
    }
  }
  
  // ═══ STORAGE (bottom-right, tiny) ═══
  if (data.storage_location || data.shelf) {
    const loc = safeText([data.storage_location, data.shelf].filter(Boolean).join(' / '))
    const locW = regular.widthOfTextAtSize(loc, 4.5)
    page.drawText(loc, { x: contentRight - locW, y: M_BOTTOM + 2, size: 4.5, font: regular, color: INK_FADED })
  }
}

export async function generateCatalogCard(data: BookPdfData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const fonts: CardFonts = {
    regular: await pdfDoc.embedFont(StandardFonts.Courier),
    bold: await pdfDoc.embedFont(StandardFonts.CourierBold),
    oblique: await pdfDoc.embedFont(StandardFonts.CourierOblique),
  }
  
  // Page 1: Decorative version (screen / display)
  const page1 = pdfDoc.addPage([CARD_W, CARD_H])
  drawCardContent(page1, data, fonts, true)
  
  // Page 2: Clean print version (for actual card stock)
  const page2 = pdfDoc.addPage([CARD_W, CARD_H])
  drawCardContent(page2, data, fonts, false)
  
  return pdfDoc.save()
}
