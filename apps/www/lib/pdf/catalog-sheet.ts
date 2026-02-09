import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib'
import { BookPdfData, PaperSize, PAPER_SIZES } from './types'

// ═══ SAFE TEXT (WinAnsi encoding) ═══
function safeText(text: string): string {
  return text
    .replace(/[\n\r\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[^\x20-\xFF]/g, (ch) => {
      const map: Record<string, string> = {
        '\u2013': '-', '\u2014': '--', '\u2018': "'", '\u2019': "'",
        '\u201C': '"', '\u201D': '"', '\u2026': '...', '\u2022': '*',
        '\u2032': "'", '\u2033': '"', '\u00AB': '"', '\u00BB': '"',
        '\u2002': ' ', '\u2003': ' ', '\u2009': ' ', '\u200B': '',
        '\u00A0': ' ', '\u2192': '->', '\u2190': '<-',
      }
      return map[ch] || ''
    })
}

// ═══ SWISS DESIGN SYSTEM ═══
// Inspired by Josef Müller-Brockmann / International Typographic Style

interface Ctx {
  page: PDFPage
  regular: PDFFont
  bold: PDFFont
  light: PDFFont       // Helvetica (used as "light" vs bold)
  italic: PDFFont
  w: number
  h: number
  m: number            // margin
  col2: number         // x position of second column
  y: number
  body: number         // body font size
  label: number        // label font size  
  leading: number      // line height
  black: ReturnType<typeof rgb>
  gray60: ReturnType<typeof rgb>
  gray30: ReturnType<typeof rgb>
  gray10: ReturnType<typeof rgb>
  accent: ReturnType<typeof rgb>
  maxW: number
}

function makeCtx(page: PDFPage, fonts: any, size: PaperSize): Ctx {
  const { width: w, height: h } = PAPER_SIZES[size]
  const isSmall = size === 'a6'
  const isMed = size === 'a5' || size === 'us-half-letter'
  const m = isSmall ? 24 : isMed ? 32 : 42
  const body = isSmall ? 7 : isMed ? 7.5 : 8.5
  
  return {
    page, ...fonts, w, h, m,
    col2: m + (w - m * 2) * 0.52,
    y: h - m,
    body,
    label: body - 1,
    leading: body * 1.5,
    black: rgb(0.05, 0.05, 0.05),
    gray60: rgb(0.40, 0.40, 0.40),
    gray30: rgb(0.70, 0.70, 0.70),
    gray10: rgb(0.88, 0.88, 0.88),
    accent: rgb(0.80, 0.06, 0.06),  // Swiss red
    maxW: w - m * 2,
  }
}

// ═══ DRAWING PRIMITIVES ═══

function wrapText(font: PDFFont, text: string, maxWidth: number, fontSize: number): string[] {
  const safe = safeText(text)
  const words = safe.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const word of words) {
    const test = cur ? cur + ' ' + word : word
    if (font.widthOfTextAtSize(test, fontSize) > maxWidth && cur) {
      lines.push(cur)
      cur = word
    } else {
      cur = test
    }
  }
  if (cur) lines.push(cur)
  return lines
}

function canFit(c: Ctx, lines: number = 1): boolean {
  return c.y - lines * c.leading > c.m + 10
}

// Section divider: thin line + section title in small caps
function section(c: Ctx, title: string): boolean {
  if (!canFit(c, 2)) return false
  c.y -= c.leading * 0.4
  // Thin rule
  c.page.drawLine({
    start: { x: c.m, y: c.y },
    end: { x: c.w - c.m, y: c.y },
    thickness: 0.25,
    color: c.gray30,
  })
  c.y -= c.leading * 0.9
  // Section title — small, tracked out, accent color
  c.page.drawText(safeText(title).toUpperCase(), {
    x: c.m, y: c.y,
    size: c.label - 0.5,
    font: c.bold,
    color: c.accent,
  })
  c.y -= c.leading * 0.6
  return true
}

// Single field: label + value on same line
function field(c: Ctx, label: string, value: string | undefined | null) {
  if (!value?.trim() || !canFit(c)) return
  const v = safeText(value)
  const lbl = safeText(label)
  
  // Label in gray
  c.page.drawText(lbl, {
    x: c.m, y: c.y, size: c.label, font: c.bold, color: c.gray60,
  })
  const lblW = c.bold.widthOfTextAtSize(lbl, c.label)
  
  // Value in black, with wrapping
  const valX = c.m + lblW + 4
  const valMaxW = c.w - c.m - valX
  const lines = wrapText(c.regular, v, valMaxW, c.body)
  for (let i = 0; i < lines.length; i++) {
    if (!canFit(c)) break
    c.page.drawText(lines[i], {
      x: i === 0 ? valX : valX,
      y: c.y, size: c.body, font: c.regular, color: c.black,
    })
    if (i < lines.length - 1) c.y -= c.leading
  }
  c.y -= c.leading
}

// Two fields side by side
function fieldPair(c: Ctx, l1: string, v1: string | undefined | null, l2: string, v2: string | undefined | null) {
  if (!v1?.trim() && !v2?.trim()) return
  if (!canFit(c)) return
  
  if (v1?.trim()) {
    const lbl = safeText(l1)
    const val = safeText(v1)
    c.page.drawText(lbl, { x: c.m, y: c.y, size: c.label, font: c.bold, color: c.gray60 })
    const lblW = c.bold.widthOfTextAtSize(lbl, c.label)
    c.page.drawText(val, { x: c.m + lblW + 4, y: c.y, size: c.body, font: c.regular, color: c.black })
  }
  if (v2?.trim()) {
    const lbl = safeText(l2)
    const val = safeText(v2)
    c.page.drawText(lbl, { x: c.col2, y: c.y, size: c.label, font: c.bold, color: c.gray60 })
    const lblW = c.bold.widthOfTextAtSize(lbl, c.label)
    c.page.drawText(val, { x: c.col2 + lblW + 4, y: c.y, size: c.body, font: c.regular, color: c.black })
  }
  c.y -= c.leading
}

// Multiline text block (for notes, summaries)
function textBlock(c: Ctx, label: string, value: string | undefined | null) {
  if (!value?.trim() || !canFit(c, 2)) return
  c.page.drawText(safeText(label), { x: c.m, y: c.y, size: c.label, font: c.bold, color: c.gray60 })
  c.y -= c.leading
  const lines = wrapText(c.italic, safeText(value), c.maxW, c.body)
  for (const line of lines) {
    if (!canFit(c)) break
    c.page.drawText(line, { x: c.m, y: c.y, size: c.body, font: c.italic, color: c.black })
    c.y -= c.leading
  }
}

function formatCurrency(amount: number | undefined | null, currency: string | undefined | null): string | null {
  if (amount == null || amount === 0) return null
  return `${currency || 'EUR'} ${amount.toFixed(2)}`
}

// ═══ MAIN GENERATOR ═══

export async function generateCatalogSheet(data: BookPdfData, paperSize: PaperSize): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)
  const light = regular  // StandardFonts doesn't have Light; reuse regular
  
  const { width, height } = PAPER_SIZES[paperSize]
  const page = pdfDoc.addPage([width, height])
  const c = makeCtx(page, { regular, bold, light, italic }, paperSize)
  
  const isSmall = paperSize === 'a6'
  const titleSize = isSmall ? 14 : paperSize === 'a5' || paperSize === 'us-half-letter' ? 17 : 22
  const subtitleSize = isSmall ? 8.5 : paperSize === 'a5' || paperSize === 'us-half-letter' ? 10 : 12
  
  // ═══ RED TOP BAR (Swiss design signature element) ═══
  const barH = isSmall ? 3 : 4
  page.drawRectangle({
    x: c.m, y: c.y, width: c.maxW, height: barH,
    color: c.accent,
  })
  c.y -= barH + c.leading * 0.8
  
  // ═══ TITLE ═══
  const titleLines = wrapText(bold, safeText(data.title), c.maxW, titleSize)
  for (const line of titleLines) {
    page.drawText(line, { x: c.m, y: c.y, size: titleSize, font: bold, color: c.black })
    c.y -= titleSize * 1.15
  }
  
  // Subtitle
  if (data.subtitle) {
    page.drawText(safeText(data.subtitle), { x: c.m, y: c.y, size: subtitleSize, font: italic, color: c.gray60 })
    c.y -= subtitleSize * 1.4
  }
  
  // Contributors — compact inline
  if (data.contributors.length > 0) {
    const contribText = data.contributors.map(c => safeText(`${c.name} (${c.role})`)).join('  /  ')
    const contribLines = wrapText(regular, contribText, c.maxW, c.body + 0.5)
    for (const line of contribLines) {
      page.drawText(line, { x: c.m, y: c.y, size: c.body + 0.5, font: regular, color: c.black })
      c.y -= c.leading
    }
  }
  
  // Series inline
  if (data.series) {
    const seriesText = data.series + (data.series_number ? `, ${data.series_number}` : '')
    field(c, 'Series', seriesText)
  }
  if (data.original_title) field(c, 'Original title', data.original_title)
  
  // ═══ PUBLICATION + EDITION (combined if both small) ═══
  const hasPub = data.publisher || data.publication_year
  const hasEd = data.edition || data.impression || data.issue_state
  
  if (hasPub || hasEd) {
    section(c, 'Publication & Edition')
    fieldPair(c, 'Publisher', data.publisher, 'Year', data.publication_year)
    fieldPair(c, 'Place', data.publication_place, 'Printer', data.printer)
    if (data.printing_place) field(c, 'Printing place', data.printing_place)
    fieldPair(c, 'Edition', data.edition, 'Impression', data.impression)
    if (data.issue_state) field(c, 'Issue / State', data.issue_state)
    if (data.edition_notes) field(c, 'Edition notes', data.edition_notes)
  }
  
  // ═══ LANGUAGE (only if interesting — skip if same) ═══
  if (data.language) {
    if (data.original_language && data.original_language !== data.language) {
      section(c, 'Language')
      fieldPair(c, 'Language', data.language, 'Original', data.original_language)
    } else {
      // Just a field, no section header needed
      field(c, 'Language', data.language)
    }
  }
  
  // ═══ PHYSICAL ═══
  const hasPhys = data.pagination || data.height_mm || data.binding || data.format || data.cover_type
  if (hasPhys) {
    section(c, 'Physical Description')
    
    // Dimensions as one clean line
    const dims: string[] = []
    if (data.height_mm) dims.push(`${data.height_mm}H`)
    if (data.width_mm) dims.push(`${data.width_mm}W`)
    if (data.depth_mm) dims.push(`${data.depth_mm}D`)
    const dimStr = dims.length > 0 ? dims.join(' \u00D7 ') + ' mm' : null
    
    fieldPair(c, 'Pagination', data.pagination, 'Dimensions', dimStr)
    fieldPair(c, 'Volumes', data.volumes, 'Weight', data.weight_grams ? `${data.weight_grams}g` : null)
    fieldPair(c, 'Binding', data.binding, 'Format', data.format)
    fieldPair(c, 'Cover', data.cover_type, 'Enclosure', data.protective_enclosure)
    fieldPair(c, 'Paper', data.paper_type, 'Edges', data.edge_treatment)
    fieldPair(c, 'Endpapers', data.endpapers, 'Text block', data.text_block_condition)
    
    // Flags compact
    const flags: string[] = []
    if (data.has_dust_jacket) flags.push('Dust jacket')
    if (data.is_signed) flags.push('Signed')
    if (flags.length > 0) field(c, 'Features', flags.join(', '))
  }
  
  // ═══ CONDITION ═══
  if (data.condition || data.status) {
    section(c, 'Condition')
    fieldPair(c, 'Book', data.condition, 'Dust jacket', data.dust_jacket_condition)
    fieldPair(c, 'Status', data.status, 'Action', data.action_needed)
    if (data.condition_notes) textBlock(c, 'Notes', data.condition_notes)
  }
  
  // ═══ CONDITION HISTORY ═══
  if (data.condition_history.length > 0) {
    section(c, 'Condition History')
    for (const ch of data.condition_history) {
      if (!canFit(c)) break
      const parts = [
        ch.event_date,
        ch.event_type,
        ch.before_condition && ch.after_condition ? `${ch.before_condition} -> ${ch.after_condition}` : null,
        ch.performed_by ? `by ${ch.performed_by}` : null,
      ].filter(Boolean).join(' \u00B7 ')
      field(c, parts || 'Event', ch.description || ch.notes || '')
    }
  }
  
  // ═══ PROVENANCE ═══
  if (data.provenance.length > 0) {
    section(c, 'Provenance')
    for (const p of data.provenance) {
      if (!canFit(c)) break
      const period = [p.date_from, p.date_to].filter(Boolean).join(' - ')
      const line = [
        p.owner_name,
        p.owner_type !== 'individual' ? `(${p.owner_type})` : '',
        period ? `[${period}]` : '',
        p.transaction_type ? `\u00B7 ${p.transaction_type}` : '',
      ].filter(Boolean).join(' ')
      page.drawText(safeText(line), { x: c.m, y: c.y, size: c.body, font: regular, color: c.black })
      c.y -= c.leading
      if (p.notes) {
        page.drawText(safeText(p.notes), { x: c.m + 8, y: c.y, size: c.body - 1, font: italic, color: c.gray60 })
        c.y -= c.leading
      }
    }
  }
  
  // ═══ IDENTIFIERS ═══
  const hasId = data.isbn_13 || data.isbn_10 || data.oclc_number || data.lccn || data.user_catalog_id || data.ddc || data.lcc
  if (hasId) {
    section(c, 'Identifiers & Classification')
    fieldPair(c, 'ISBN-13', data.isbn_13, 'ISBN-10', data.isbn_10)
    fieldPair(c, 'OCLC', data.oclc_number, 'LCCN', data.lccn)
    fieldPair(c, 'DDC', data.ddc, 'LCC', data.lcc)
    fieldPair(c, 'UDC', data.udc, 'Catalog ID', data.user_catalog_id)
    if (data.topic) field(c, 'Topic', data.topic)
  }
  
  // ═══ BISAC ═══
  if (data.bisac_subjects && data.bisac_subjects.length > 0) {
    field(c, 'BISAC', data.bisac_subjects.join('  |  '))
  }
  
  // ═══ STORAGE & VALUATION (combined) ═══
  const hasStorage = data.storage_location || data.shelf || data.estimated_value
  if (hasStorage) {
    section(c, 'Storage & Valuation')
    const location = [data.storage_location, data.shelf, data.shelf_section].filter(Boolean).join(' / ')
    if (location) field(c, 'Location', location)
    
    const valParts: string[] = []
    const ev = formatCurrency(data.estimated_value, data.price_currency)
    const lo = formatCurrency(data.lowest_price, data.price_currency)
    const hi = formatCurrency(data.highest_price, data.price_currency)
    const sp = formatCurrency(data.sales_price, data.price_currency)
    if (ev) valParts.push(`Est. ${ev}`)
    if (lo && hi) valParts.push(`Range ${lo} - ${hi}`)
    if (sp) valParts.push(`Sale ${sp}`)
    if (valParts.length > 0) field(c, 'Valuation', valParts.join('  |  '))
  }
  
  // ═══ COLLECTIONS & TAGS ═══
  if (data.collections.length > 0 || data.tags.length > 0) {
    if (data.collections.length > 0) field(c, 'Collections', data.collections.join(', '))
    if (data.tags.length > 0) field(c, 'Tags', data.tags.join(', '))
  }
  
  // ═══ NOTES ═══
  const hasNotes = data.summary || data.dedication_text || data.colophon_text || data.bibliography || data.illustrations_description
  if (hasNotes) {
    section(c, 'Notes')
    if (data.summary) textBlock(c, 'Summary', data.summary)
    if (data.dedication_text) field(c, 'Dedication', data.dedication_text)
    if (data.colophon_text) field(c, 'Colophon', data.colophon_text)
    if (data.bibliography) field(c, 'Bibliography', data.bibliography)
    if (data.illustrations_description) field(c, 'Illustrations', data.illustrations_description)
    if (data.signatures_description) field(c, 'Signatures', data.signatures_description)
  }
  
  // ═══ CATALOG ENTRY ═══
  if (data.catalog_entry) {
    section(c, 'Catalog Entry')
    const entryLines = wrapText(italic, safeText(data.catalog_entry), c.maxW, c.body)
    for (const line of entryLines) {
      if (!canFit(c)) break
      page.drawText(line, { x: c.m, y: c.y, size: c.body, font: italic, color: c.black })
      c.y -= c.leading
    }
  }
  
  // ═══ EXTERNAL LINKS ═══
  if (data.external_links.length > 0) {
    section(c, 'References')
    for (const link of data.external_links) {
      if (!canFit(c)) break
      field(c, link.label || 'Link', link.url)
    }
  }
  
  // ═══ FOOTER ═══
  const footerY = c.m - 8
  if (footerY > 6) {
    // Footer rule
    page.drawLine({
      start: { x: c.m, y: footerY + 5 },
      end: { x: c.w - c.m, y: footerY + 5 },
      thickness: 0.25,
      color: c.gray30,
    })
    // Small red square as branding mark
    page.drawRectangle({
      x: c.m, y: footerY - 1, width: 3, height: 3, color: c.accent,
    })
    const footerSize = c.label - 1.5
    page.drawText(safeText(`Shelvd  \u00B7  ${new Date().toISOString().split('T')[0]}`), {
      x: c.m + 6, y: footerY, size: footerSize, font: regular, color: c.gray60,
    })
    if (data.owner_name) {
      const ownerText = safeText(data.owner_name)
      const ownerW = regular.widthOfTextAtSize(ownerText, footerSize)
      page.drawText(ownerText, {
        x: c.w - c.m - ownerW, y: footerY, size: footerSize, font: regular, color: c.gray60,
      })
    }
  }
  
  return pdfDoc.save()
}
