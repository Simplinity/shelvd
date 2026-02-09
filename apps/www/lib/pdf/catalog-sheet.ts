import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib'
import { BookPdfData, PaperSize, PAPER_SIZES } from './types'

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

interface Ctx {
  page: PDFPage
  regular: PDFFont
  bold: PDFFont
  italic: PDFFont
  w: number; h: number; m: number
  col2: number
  y: number
  body: number
  label: number
  leading: number
  black: ReturnType<typeof rgb>
  gray: ReturnType<typeof rgb>
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
    leading: body * 1.45,
    black: rgb(0.05, 0.05, 0.05),
    gray: rgb(0.42, 0.42, 0.42),
    accent: rgb(0.78, 0.05, 0.05),
    maxW: w - m * 2,
  }
}

function wrapText(font: PDFFont, text: string, maxW: number, size: number): string[] {
  const safe = safeText(text)
  const words = safe.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const word of words) {
    const test = cur ? cur + ' ' + word : word
    if (font.widthOfTextAtSize(test, size) > maxW && cur) { lines.push(cur); cur = word }
    else cur = test
  }
  if (cur) lines.push(cur)
  return lines
}

function ok(c: Ctx, n = 1): boolean { return c.y - n * c.leading > c.m + 8 }

// Section header: just red text, tiny gap above
function sec(c: Ctx, title: string): boolean {
  if (!ok(c, 2)) return false
  c.y -= c.leading * 0.6
  c.page.drawText(safeText(title).toUpperCase(), {
    x: c.m, y: c.y, size: c.label - 0.5, font: c.bold, color: c.accent,
  })
  c.y -= c.leading * 0.5
  return true
}

// Label + value, single line
function fld(c: Ctx, label: string, value: string | undefined | null) {
  if (!value?.trim() || !ok(c)) return
  const lbl = safeText(label)
  const v = safeText(value)
  c.page.drawText(lbl, { x: c.m, y: c.y, size: c.label, font: c.bold, color: c.gray })
  const lblW = c.bold.widthOfTextAtSize(lbl, c.label)
  const valX = c.m + lblW + 4
  const lines = wrapText(c.regular, v, c.w - c.m - valX, c.body)
  for (let i = 0; i < lines.length; i++) {
    if (!ok(c)) break
    c.page.drawText(lines[i], { x: valX, y: c.y, size: c.body, font: c.regular, color: c.black })
    if (i < lines.length - 1) c.y -= c.leading
  }
  c.y -= c.leading
}

// Two fields side by side
function fld2(c: Ctx, l1: string, v1: string | undefined | null, l2: string, v2: string | undefined | null) {
  if (!v1?.trim() && !v2?.trim()) return
  if (!ok(c)) return
  if (v1?.trim()) {
    const lbl = safeText(l1); const val = safeText(v1)
    c.page.drawText(lbl, { x: c.m, y: c.y, size: c.label, font: c.bold, color: c.gray })
    c.page.drawText(val, { x: c.m + c.bold.widthOfTextAtSize(lbl, c.label) + 4, y: c.y, size: c.body, font: c.regular, color: c.black })
  }
  if (v2?.trim()) {
    const lbl = safeText(l2); const val = safeText(v2)
    c.page.drawText(lbl, { x: c.col2, y: c.y, size: c.label, font: c.bold, color: c.gray })
    c.page.drawText(val, { x: c.col2 + c.bold.widthOfTextAtSize(lbl, c.label) + 4, y: c.y, size: c.body, font: c.regular, color: c.black })
  }
  c.y -= c.leading
}

// Multiline text
function txt(c: Ctx, label: string, value: string | undefined | null) {
  if (!value?.trim() || !ok(c, 2)) return
  c.page.drawText(safeText(label), { x: c.m, y: c.y, size: c.label, font: c.bold, color: c.gray })
  c.y -= c.leading
  for (const line of wrapText(c.italic, safeText(value), c.maxW, c.body)) {
    if (!ok(c)) break
    c.page.drawText(line, { x: c.m, y: c.y, size: c.body, font: c.italic, color: c.black })
    c.y -= c.leading
  }
}

function fmtCur(a: number | undefined | null, cur: string | undefined | null): string | null {
  if (a == null || a === 0) return null
  return `${cur || 'EUR'} ${a.toFixed(2)}`
}

export async function generateCatalogSheet(data: BookPdfData, paperSize: PaperSize): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)
  const { width, height } = PAPER_SIZES[paperSize]
  const page = pdfDoc.addPage([width, height])
  const c = makeCtx(page, { regular, bold, italic }, paperSize)
  const isSmall = paperSize === 'a6'
  const isMed = paperSize === 'a5' || paperSize === 'us-half-letter'
  const titleSize = isSmall ? 14 : isMed ? 17 : 22
  const subSize = isSmall ? 8.5 : isMed ? 10 : 12

  // ── RED TOP BAR ──
  const barH = isSmall ? 2.5 : 3.5
  page.drawRectangle({ x: c.m, y: c.y, width: c.maxW, height: barH, color: c.accent })
  c.y -= barH + c.leading * 0.5

  // ── TITLE ──
  for (const line of wrapText(bold, safeText(data.title), c.maxW, titleSize)) {
    page.drawText(line, { x: c.m, y: c.y, size: titleSize, font: bold, color: c.black })
    c.y -= titleSize * 1.1
  }
  if (data.subtitle) {
    page.drawText(safeText(data.subtitle), { x: c.m, y: c.y, size: subSize, font: italic, color: c.gray })
    c.y -= subSize * 1.3
  }

  // Contributors inline
  if (data.contributors.length > 0) {
    const ct = data.contributors.map(x => safeText(`${x.name} (${x.role})`)).join('  /  ')
    for (const line of wrapText(regular, ct, c.maxW, c.body + 0.5)) {
      page.drawText(line, { x: c.m, y: c.y, size: c.body + 0.5, font: regular, color: c.black })
      c.y -= c.leading
    }
  }

  if (data.series) fld(c, 'Series', data.series + (data.series_number ? `, ${data.series_number}` : ''))
  if (data.original_title) fld(c, 'Original title', data.original_title)

  // ── PUBLICATION & EDITION ──
  if (data.publisher || data.publication_year || data.edition) {
    sec(c, 'Publication & Edition')
    fld2(c, 'Publisher', data.publisher, 'Year', data.publication_year)
    fld2(c, 'Place', data.publication_place, 'Printer', data.printer)
    if (data.printing_place) fld(c, 'Printing place', data.printing_place)
    fld2(c, 'Edition', data.edition, 'Impression', data.impression)
    if (data.issue_state) fld(c, 'Issue / State', data.issue_state)
    if (data.edition_notes) fld(c, 'Edition notes', data.edition_notes)
    if (data.language) {
      if (data.original_language && data.original_language !== data.language)
        fld2(c, 'Language', data.language, 'Original', data.original_language)
      else fld(c, 'Language', data.language)
    }
  }

  // ── PHYSICAL ──
  if (data.pagination || data.height_mm || data.binding || data.format || data.cover_type) {
    sec(c, 'Physical')
    const dims: string[] = []
    if (data.height_mm) dims.push(`${data.height_mm}H`)
    if (data.width_mm) dims.push(`${data.width_mm}W`)
    if (data.depth_mm) dims.push(`${data.depth_mm}D`)
    const dimStr = dims.length > 0 ? dims.join(' \u00D7 ') + ' mm' : null
    fld2(c, 'Pagination', data.pagination, 'Dimensions', dimStr)
    fld2(c, 'Volumes', data.volumes, 'Weight', data.weight_grams ? `${data.weight_grams}g` : null)
    fld2(c, 'Binding', data.binding, 'Format', data.format)
    fld2(c, 'Cover', data.cover_type, 'Enclosure', data.protective_enclosure)
    fld2(c, 'Paper', data.paper_type, 'Edges', data.edge_treatment)
    fld2(c, 'Endpapers', data.endpapers, 'Text block', data.text_block_condition)
    const flags: string[] = []
    if (data.has_dust_jacket) flags.push('Dust jacket')
    if (data.is_signed) flags.push('Signed')
    if (flags.length > 0) fld(c, 'Features', flags.join(', '))
  }

  // ── CONDITION ──
  if (data.condition || data.status) {
    sec(c, 'Condition')
    fld2(c, 'Book', data.condition, 'Dust jacket', data.dust_jacket_condition)
    fld2(c, 'Status', data.status, 'Action', data.action_needed)
    if (data.condition_notes) txt(c, 'Notes', data.condition_notes)
  }

  // ── CONDITION HISTORY ──
  if (data.condition_history.length > 0) {
    sec(c, 'Condition History')
    for (const ch of data.condition_history) {
      if (!ok(c)) break
      const parts = [ch.event_date, ch.event_type,
        ch.before_condition && ch.after_condition ? `${ch.before_condition} -> ${ch.after_condition}` : null,
        ch.performed_by ? `by ${ch.performed_by}` : null].filter(Boolean).join(' \u00B7 ')
      fld(c, parts || 'Event', ch.description || ch.notes || '')
    }
  }

  // ── PROVENANCE ──
  if (data.provenance.length > 0) {
    sec(c, 'Provenance')
    for (const p of data.provenance) {
      if (!ok(c)) break
      const period = [p.date_from, p.date_to].filter(Boolean).join(' - ')
      const line = [p.owner_name, p.owner_type !== 'individual' ? `(${p.owner_type})` : '',
        period ? `[${period}]` : '', p.transaction_type ? `\u00B7 ${p.transaction_type}` : ''].filter(Boolean).join(' ')
      page.drawText(safeText(line), { x: c.m, y: c.y, size: c.body, font: regular, color: c.black })
      c.y -= c.leading
      if (p.notes) {
        page.drawText(safeText(p.notes), { x: c.m + 8, y: c.y, size: c.body - 1, font: italic, color: c.gray })
        c.y -= c.leading
      }
    }
  }

  // ── IDENTIFIERS ──
  if (data.isbn_13 || data.isbn_10 || data.oclc_number || data.lccn || data.user_catalog_id || data.ddc || data.lcc) {
    sec(c, 'Identifiers')
    fld2(c, 'ISBN-13', data.isbn_13, 'ISBN-10', data.isbn_10)
    fld2(c, 'OCLC', data.oclc_number, 'LCCN', data.lccn)
    fld2(c, 'DDC', data.ddc, 'LCC', data.lcc)
    fld2(c, 'UDC', data.udc, 'Catalog ID', data.user_catalog_id)
    if (data.topic) fld(c, 'Topic', data.topic)
  }
  if (data.bisac_subjects && data.bisac_subjects.length > 0)
    fld(c, 'BISAC', data.bisac_subjects.join('  |  '))

  // ── STORAGE & VALUATION ──
  if (data.storage_location || data.shelf || data.estimated_value) {
    sec(c, 'Storage & Valuation')
    const loc = [data.storage_location, data.shelf, data.shelf_section].filter(Boolean).join(' / ')
    if (loc) fld(c, 'Location', loc)
    const vp: string[] = []
    const ev = fmtCur(data.estimated_value, data.price_currency)
    const lo = fmtCur(data.lowest_price, data.price_currency)
    const hi = fmtCur(data.highest_price, data.price_currency)
    const sp = fmtCur(data.sales_price, data.price_currency)
    if (ev) vp.push(`Est. ${ev}`)
    if (lo && hi) vp.push(`Range ${lo} - ${hi}`)
    if (sp) vp.push(`Sale ${sp}`)
    if (vp.length > 0) fld(c, 'Valuation', vp.join('  |  '))
  }

  if (data.collections.length > 0) fld(c, 'Collections', data.collections.join(', '))
  if (data.tags.length > 0) fld(c, 'Tags', data.tags.join(', '))

  // ── NOTES ──
  if (data.summary || data.dedication_text || data.colophon_text || data.bibliography || data.illustrations_description) {
    sec(c, 'Notes')
    if (data.summary) txt(c, 'Summary', data.summary)
    if (data.dedication_text) fld(c, 'Dedication', data.dedication_text)
    if (data.colophon_text) fld(c, 'Colophon', data.colophon_text)
    if (data.bibliography) fld(c, 'Bibliography', data.bibliography)
    if (data.illustrations_description) fld(c, 'Illustrations', data.illustrations_description)
    if (data.signatures_description) fld(c, 'Signatures', data.signatures_description)
  }

  if (data.catalog_entry) {
    sec(c, 'Catalog Entry')
    for (const line of wrapText(italic, safeText(data.catalog_entry), c.maxW, c.body)) {
      if (!ok(c)) break
      page.drawText(line, { x: c.m, y: c.y, size: c.body, font: italic, color: c.black })
      c.y -= c.leading
    }
  }

  if (data.external_links.length > 0) {
    sec(c, 'References')
    for (const link of data.external_links) { if (!ok(c)) break; fld(c, link.label || 'Link', link.url) }
  }

  // ── FOOTER: just tiny text, no line ──
  const fy = c.m - 8
  if (fy > 6) {
    const fs = c.label - 1.5
    page.drawRectangle({ x: c.m, y: fy - 1, width: 3, height: 3, color: c.accent })
    page.drawText(safeText(`Shelvd  \u00B7  ${new Date().toISOString().split('T')[0]}`), {
      x: c.m + 6, y: fy, size: fs, font: regular, color: c.gray,
    })
    if (data.owner_name) {
      const ot = safeText(data.owner_name)
      page.drawText(ot, { x: c.w - c.m - regular.widthOfTextAtSize(ot, fs), y: fy, size: fs, font: regular, color: c.gray })
    }
  }

  return pdfDoc.save()
}
