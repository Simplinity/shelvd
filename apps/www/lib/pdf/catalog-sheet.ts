import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib'
import { BookPdfData, PaperSize, PAPER_SIZES } from './types'

function safe(text: string): string {
  return text
    .replace(/[\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim()
    .replace(/[^\x20-\xFF]/g, (ch) => {
      const m: Record<string, string> = {
        '\u2013':'-','\u2014':'--','\u2018':"'",'\u2019':"'",
        '\u201C':'"','\u201D':'"','\u2026':'...','\u2022':'*',
        '\u2032':"'",'\u2033':'"','\u00AB':'"','\u00BB':'"',
        '\u2002':' ','\u2003':' ','\u2009':' ','\u200B':'',
        '\u00A0':' ','\u2192':'->','\u2190':'<-',
      }
      return m[ch] || ''
    })
}

interface Ctx {
  p: PDFPage; r: PDFFont; b: PDFFont; i: PDFFont
  w: number; h: number; mg: number; y: number
  fs: number; ls: number; lb: number; mxW: number
  col2: number
  black: ReturnType<typeof rgb>
  gray: ReturnType<typeof rgb>
  red: ReturnType<typeof rgb>
}

function mkCtx(p: PDFPage, fonts: any, sz: PaperSize): Ctx {
  const { width: w, height: h } = PAPER_SIZES[sz]
  const sm = sz === 'a6'
  const md = sz === 'a5' || sz === 'us-half-letter'
  const mg = sm ? 24 : md ? 32 : 42
  const fs = sm ? 7 : md ? 7.5 : 8.5
  return {
    p, ...fonts, w, h, mg, y: h - mg,
    fs, ls: fs * 1.55, lb: fs - 1, mxW: w - mg * 2,
    col2: mg + (w - mg * 2) * 0.5,
    black: rgb(0.05, 0.05, 0.05),
    gray: rgb(0.40, 0.40, 0.40),
    red: rgb(0.78, 0.05, 0.05),
  }
}

function wrap(font: PDFFont, text: string, maxW: number, sz: number): string[] {
  const s = safe(text), words = s.split(' '), lines: string[] = []
  let cur = ''
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w
    if (font.widthOfTextAtSize(t, sz) > maxW && cur) { lines.push(cur); cur = w }
    else cur = t
  }
  if (cur) lines.push(cur)
  return lines
}

function fits(c: Ctx, n = 1) { return c.y - n * c.ls > c.mg + 10 }

// ── Section: red label with proper gap after ──
function sec(c: Ctx, title: string) {
  if (!fits(c, 3)) return false
  c.y -= c.ls * 0.8                  // gap before section
  c.p.drawText(safe(title).toUpperCase(), {
    x: c.mg, y: c.y, size: c.lb - 0.5, font: c.b, color: c.red,
  })
  c.y -= c.ls * 0.9                  // gap after section header
  return true
}

// ── Label-value field, left-aligned ──
// Uses a FIXED label column width so values align vertically
function fld(c: Ctx, label: string, value: string | undefined | null, startX?: number, maxWidth?: number) {
  if (!value?.trim() || !fits(c)) return
  const x0 = startX ?? c.mg
  const mw = maxWidth ?? c.mxW
  const lbl = safe(label)
  const v = safe(value)
  
  // Fixed label width: 20% of available width, minimum viable
  const labelColW = Math.min(c.b.widthOfTextAtSize(lbl, c.lb) + 5, mw * 0.25)
  
  c.p.drawText(lbl, { x: x0, y: c.y, size: c.lb, font: c.b, color: c.gray })
  
  const valX = x0 + labelColW
  const valW = mw - labelColW
  const lines = wrap(c.r, v, valW, c.fs)
  for (let i = 0; i < lines.length; i++) {
    if (!fits(c)) break
    c.p.drawText(lines[i], { x: valX, y: c.y, size: c.fs, font: c.r, color: c.black })
    if (i < lines.length - 1) c.y -= c.ls
  }
  c.y -= c.ls
}

// ── Two fields on one line — inline, no fixed columns ──
// If only one has value, render as single field
function fld2(c: Ctx, l1: string, v1: string | undefined | null, l2: string, v2: string | undefined | null) {
  const has1 = !!v1?.trim(), has2 = !!v2?.trim()
  if (!has1 && !has2) return
  if (!fits(c)) return
  
  if (has1 && !has2) { fld(c, l1, v1); return }
  if (!has1 && has2) { fld(c, l2, v2); return }
  
  // Both: render inline — field1 then field2 with gap
  const lbl1 = safe(l1), val1 = safe(v1!)
  const lbl2 = safe(l2), val2 = safe(v2!)
  const lw1 = c.b.widthOfTextAtSize(lbl1, c.lb)
  const vw1 = c.r.widthOfTextAtSize(val1, c.fs)
  const lw2 = c.b.widthOfTextAtSize(lbl2, c.lb)
  
  // Left field
  c.p.drawText(lbl1, { x: c.mg, y: c.y, size: c.lb, font: c.b, color: c.gray })
  c.p.drawText(val1, { x: c.mg + lw1 + 4, y: c.y, size: c.fs, font: c.r, color: c.black })
  
  // Right field follows with 20pt gap
  const x2 = c.mg + lw1 + 4 + vw1 + 20
  // Only place it if it fits on the same line
  if (x2 + lw2 + 4 + c.r.widthOfTextAtSize(val2, c.fs) < c.w - c.mg) {
    c.p.drawText(lbl2, { x: x2, y: c.y, size: c.lb, font: c.b, color: c.gray })
    c.p.drawText(val2, { x: x2 + lw2 + 4, y: c.y, size: c.fs, font: c.r, color: c.black })
    c.y -= c.ls
  } else {
    // Doesn't fit: put on next line
    c.y -= c.ls
    c.p.drawText(lbl2, { x: c.mg, y: c.y, size: c.lb, font: c.b, color: c.gray })
    c.p.drawText(val2, { x: c.mg + lw2 + 4, y: c.y, size: c.fs, font: c.r, color: c.black })
    c.y -= c.ls
  }
}

// ── Multiline text block ──
function txt(c: Ctx, label: string, value: string | undefined | null) {
  if (!value?.trim() || !fits(c, 2)) return
  c.p.drawText(safe(label), { x: c.mg, y: c.y, size: c.lb, font: c.b, color: c.gray })
  c.y -= c.ls
  for (const line of wrap(c.i, safe(value), c.mxW, c.fs)) {
    if (!fits(c)) break
    c.p.drawText(line, { x: c.mg, y: c.y, size: c.fs, font: c.i, color: c.black })
    c.y -= c.ls
  }
}

function cur(a: number | undefined | null, c: string | undefined | null): string | null {
  if (a == null || a === 0) return null
  return `${c || 'EUR'} ${a.toFixed(2)}`
}

export async function generateCatalogSheet(data: BookPdfData, paperSize: PaperSize): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const r = await pdf.embedFont(StandardFonts.Helvetica)
  const b = await pdf.embedFont(StandardFonts.HelveticaBold)
  const i = await pdf.embedFont(StandardFonts.HelveticaOblique)
  const { width, height } = PAPER_SIZES[paperSize]
  const pg = pdf.addPage([width, height])
  const c = mkCtx(pg, { r, b, i }, paperSize)
  const sm = paperSize === 'a6'
  const md = paperSize === 'a5' || paperSize === 'us-half-letter'
  const ts = sm ? 14 : md ? 17 : 22
  const ss = sm ? 8.5 : md ? 10 : 12

  // ── Red bar ──
  const bh = sm ? 2.5 : 3.5
  pg.drawRectangle({ x: c.mg, y: c.y, width: c.mxW, height: bh, color: c.red })
  c.y -= bh + ts * 1.2  // enough room for title descenders

  // ── Title ──
  for (const ln of wrap(b, safe(data.title), c.mxW, ts)) {
    pg.drawText(ln, { x: c.mg, y: c.y, size: ts, font: b, color: c.black })
    c.y -= ts * 1.15
  }
  if (data.subtitle) {
    pg.drawText(safe(data.subtitle), { x: c.mg, y: c.y, size: ss, font: i, color: c.gray })
    c.y -= ss * 1.3
  }

  // Contributors
  if (data.contributors.length > 0) {
    const ct = data.contributors.map(x => safe(`${x.name} (${x.role})`)).join('  /  ')
    for (const ln of wrap(r, ct, c.mxW, c.fs + 0.5)) {
      pg.drawText(ln, { x: c.mg, y: c.y, size: c.fs + 0.5, font: r, color: c.black })
      c.y -= c.ls
    }
  }
  if (data.series) fld(c, 'Series', data.series + (data.series_number ? `, ${data.series_number}` : ''))
  if (data.original_title) fld(c, 'Original title', data.original_title)

  // ── Publication & Edition ──
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

  // ── Physical ──
  if (data.pagination || data.height_mm || data.binding || data.format || data.cover_type) {
    sec(c, 'Physical')
    const dims: string[] = []
    if (data.height_mm) dims.push(`${data.height_mm}H`)
    if (data.width_mm) dims.push(`${data.width_mm}W`)
    if (data.depth_mm) dims.push(`${data.depth_mm}D`)
    const dimStr = dims.length ? dims.join(' \u00D7 ') + ' mm' : null
    fld2(c, 'Pagination', data.pagination, 'Dimensions', dimStr)
    fld2(c, 'Volumes', data.volumes, 'Weight', data.weight_grams ? `${data.weight_grams}g` : null)
    fld2(c, 'Binding', data.binding, 'Format', data.format)
    fld2(c, 'Cover', data.cover_type, 'Enclosure', data.protective_enclosure)
    fld2(c, 'Paper', data.paper_type, 'Edges', data.edge_treatment)
    fld2(c, 'Endpapers', data.endpapers, 'Text block', data.text_block_condition)
    const fl: string[] = []
    if (data.has_dust_jacket) fl.push('Dust jacket')
    if (data.is_signed) fl.push('Signed')
    if (fl.length) fld(c, 'Features', fl.join(', '))
  }

  // ── Condition ──
  if (data.condition || data.status) {
    sec(c, 'Condition')
    fld2(c, 'Book', data.condition, 'Dust jacket', data.dust_jacket_condition)
    fld2(c, 'Status', data.status, 'Action', data.action_needed)
    if (data.condition_notes) txt(c, 'Notes', data.condition_notes)
  }

  // ── Condition History ──
  if (data.condition_history.length > 0) {
    sec(c, 'Condition History')
    for (const ch of data.condition_history) {
      if (!fits(c)) break
      const pts = [ch.event_date, ch.event_type,
        ch.before_condition && ch.after_condition ? `${ch.before_condition} -> ${ch.after_condition}` : null,
        ch.performed_by ? `by ${ch.performed_by}` : null].filter(Boolean).join(' \u00B7 ')
      fld(c, pts || 'Event', ch.description || ch.notes || '')
    }
  }

  // ── Provenance ──
  if (data.provenance.length > 0) {
    sec(c, 'Provenance')
    for (const p of data.provenance) {
      if (!fits(c)) break
      const period = [p.date_from, p.date_to].filter(Boolean).join(' - ')
      const line = [p.owner_name, p.owner_type !== 'individual' ? `(${p.owner_type})` : '',
        period ? `[${period}]` : '', p.transaction_type ? `\u00B7 ${p.transaction_type}` : ''].filter(Boolean).join(' ')
      pg.drawText(safe(line), { x: c.mg, y: c.y, size: c.fs, font: r, color: c.black })
      c.y -= c.ls
      if (p.notes) { pg.drawText(safe(p.notes), { x: c.mg + 8, y: c.y, size: c.fs - 1, font: i, color: c.gray }); c.y -= c.ls }
    }
  }

  // ── Identifiers ──
  if (data.isbn_13 || data.isbn_10 || data.oclc_number || data.lccn || data.user_catalog_id || data.ddc || data.lcc) {
    sec(c, 'Identifiers')
    fld2(c, 'ISBN-13', data.isbn_13, 'ISBN-10', data.isbn_10)
    fld2(c, 'OCLC', data.oclc_number, 'LCCN', data.lccn)
    fld2(c, 'DDC', data.ddc, 'LCC', data.lcc)
    fld2(c, 'UDC', data.udc, 'Catalog ID', data.user_catalog_id)
    if (data.topic) fld(c, 'Topic', data.topic)
  }
  if (data.bisac_subjects?.length) fld(c, 'BISAC', data.bisac_subjects.join('  |  '))

  // ── Storage & Valuation ──
  if (data.storage_location || data.shelf || data.estimated_value) {
    sec(c, 'Storage & Valuation')
    const loc = [data.storage_location, data.shelf, data.shelf_section].filter(Boolean).join(' / ')
    if (loc) fld(c, 'Location', loc)
    const vp: string[] = []
    const ev = cur(data.estimated_value, data.price_currency)
    const lo = cur(data.lowest_price, data.price_currency)
    const hi = cur(data.highest_price, data.price_currency)
    const sp = cur(data.sales_price, data.price_currency)
    if (ev) vp.push(`Est. ${ev}`)
    if (lo && hi) vp.push(`Range ${lo} - ${hi}`)
    if (sp) vp.push(`Sale ${sp}`)
    if (vp.length) fld(c, 'Valuation', vp.join('  |  '))
  }
  if (data.collections.length) fld(c, 'Collections', data.collections.join(', '))
  if (data.tags.length) fld(c, 'Tags', data.tags.join(', '))

  // ── Notes ──
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
    sec(c, 'Trade Catalog Entry')
    for (const ln of wrap(i, safe(data.catalog_entry), c.mxW, c.fs)) {
      if (!fits(c)) break
      pg.drawText(ln, { x: c.mg, y: c.y, size: c.fs, font: i, color: c.black }); c.y -= c.ls
    }
  }

  if (data.catalog_entry_isbd) {
    sec(c, 'ISBD Catalog Entry')
    for (const ln of wrap(i, safe(data.catalog_entry_isbd), c.mxW, c.fs)) {
      if (!fits(c)) break
      pg.drawText(ln, { x: c.mg, y: c.y, size: c.fs, font: i, color: c.black }); c.y -= c.ls
    }
  }

  if (data.external_links.length) {
    sec(c, 'References')
    for (const lk of data.external_links) { if (!fits(c)) break; fld(c, lk.label || 'Link', lk.url) }
  }

  // ── Footer ──
  const fy = c.mg - 8
  if (fy > 6) {
    const fz = c.lb - 1.5
    pg.drawRectangle({ x: c.mg, y: fy - 1, width: 3, height: 3, color: c.red })
    pg.drawText(safe(`Shelvd  \u00B7  ${new Date().toISOString().split('T')[0]}`), { x: c.mg + 6, y: fy, size: fz, font: r, color: c.gray })
    if (data.owner_name) {
      const ot = safe(data.owner_name)
      pg.drawText(ot, { x: c.w - c.mg - r.widthOfTextAtSize(ot, fz), y: fy, size: fz, font: r, color: c.gray })
    }
  }

  return pdf.save()
}
