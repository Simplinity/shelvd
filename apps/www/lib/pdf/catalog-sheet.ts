import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib'
import { BookPdfData, PaperSize, PAPER_SIZES } from './types'

// Standard PDF fonts only support WinAnsiEncoding (Latin-1).
// Replace unsupported characters to prevent crashes.
function safeText(text: string): string {
  return text.replace(/[^\x00-\xFF]/g, (ch) => {
    // Common substitutions
    const map: Record<string, string> = {
      '\u2013': '-', '\u2014': '--', '\u2018': "'", '\u2019': "'",
      '\u201C': '"', '\u201D': '"', '\u2026': '...', '\u2022': '*',
      '\u2032': "'", '\u2033': '"', '\u00AB': '"', '\u00BB': '"',
      '\u2002': ' ', '\u2003': ' ', '\u2009': ' ', '\u200B': '',
      '\u00A0': ' ', '\u2192': '->', '\u2190': '<-',
    }
    return map[ch] || '?'
  })
}

interface DrawContext {
  page: PDFPage
  regular: PDFFont
  bold: PDFFont
  italic: PDFFont
  boldItalic: PDFFont
  width: number
  height: number
  margin: number
  y: number
  fontSize: number
  lineHeight: number
  labelSize: number
  sectionSize: number
  textColor: ReturnType<typeof rgb>
  labelColor: ReturnType<typeof rgb>
  ruleColor: ReturnType<typeof rgb>
  maxTextWidth: number
}

function createContext(page: PDFPage, fonts: { regular: PDFFont; bold: PDFFont; italic: PDFFont; boldItalic: PDFFont }, size: PaperSize): DrawContext {
  const { width, height } = PAPER_SIZES[size]
  const isSmall = size === 'a6'
  const margin = isSmall ? 28 : size === 'a5' || size === 'us-half-letter' ? 36 : 48
  const fontSize = isSmall ? 7 : size === 'a5' || size === 'us-half-letter' ? 8 : 9
  
  return {
    page,
    ...fonts,
    width,
    height,
    margin,
    y: height - margin,
    fontSize,
    lineHeight: fontSize * 1.55,
    labelSize: fontSize - 1.5,
    sectionSize: fontSize + 1,
    textColor: rgb(0.1, 0.1, 0.1),
    labelColor: rgb(0.45, 0.43, 0.40),
    ruleColor: rgb(0.82, 0.80, 0.78),
    maxTextWidth: width - margin * 2,
  }
}

function drawSectionHeader(ctx: DrawContext, title: string) {
  if (ctx.y < ctx.margin + 30) return false
  ctx.y -= ctx.lineHeight * 0.5
  // Rule line
  ctx.page.drawLine({
    start: { x: ctx.margin, y: ctx.y },
    end: { x: ctx.width - ctx.margin, y: ctx.y },
    thickness: 0.5,
    color: ctx.ruleColor,
  })
  ctx.y -= ctx.lineHeight * 1.1
  ctx.page.drawText(title.toUpperCase(), {
    x: ctx.margin,
    y: ctx.y,
    size: ctx.labelSize,
    font: ctx.bold,
    color: ctx.labelColor,
  })
  ctx.y -= ctx.lineHeight * 0.8
  return true
}

function wrapText(font: PDFFont, text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  
  for (const word of words) {
    const test = current ? current + ' ' + word : word
    if (font.widthOfTextAtSize(test, fontSize) > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

function drawField(ctx: DrawContext, label: string, value: string | undefined | null, options?: { inline?: boolean }) {
  if (!value || !value.trim()) return
  if (ctx.y < ctx.margin + 15) return
  value = safeText(value)
  
  const labelText = label + ':  '
  const labelWidth = ctx.bold.widthOfTextAtSize(labelText, ctx.labelSize)
  
  // Label
  ctx.page.drawText(labelText, {
    x: ctx.margin,
    y: ctx.y,
    size: ctx.labelSize,
    font: ctx.bold,
    color: ctx.labelColor,
  })
  
  // Value — wrap if needed
  const valueMaxWidth = ctx.maxTextWidth - labelWidth
  const lines = wrapText(ctx.regular, value, valueMaxWidth, ctx.fontSize)
  
  for (let i = 0; i < lines.length; i++) {
    ctx.page.drawText(lines[i], {
      x: ctx.margin + (i === 0 ? labelWidth : labelWidth),
      y: ctx.y,
      size: ctx.fontSize,
      font: ctx.regular,
      color: ctx.textColor,
    })
    if (i < lines.length - 1) ctx.y -= ctx.lineHeight
  }
  ctx.y -= ctx.lineHeight
}

function drawFieldPair(ctx: DrawContext, label1: string, value1: string | undefined | null, label2: string, value2: string | undefined | null) {
  if ((!value1 || !value1.trim()) && (!value2 || !value2.trim())) return
  if (ctx.y < ctx.margin + 15) return
  
  const halfWidth = ctx.maxTextWidth / 2
  
  if (value1 && value1.trim()) {
    const labelText = label1 + ':  '
    const labelWidth = ctx.bold.widthOfTextAtSize(labelText, ctx.labelSize)
    ctx.page.drawText(labelText, { x: ctx.margin, y: ctx.y, size: ctx.labelSize, font: ctx.bold, color: ctx.labelColor })
    ctx.page.drawText(value1, { x: ctx.margin + labelWidth, y: ctx.y, size: ctx.fontSize, font: ctx.regular, color: ctx.textColor })
  }
  
  if (value2 && value2.trim()) {
    const x2 = ctx.margin + halfWidth
    const labelText = label2 + ':  '
    const labelWidth = ctx.bold.widthOfTextAtSize(labelText, ctx.labelSize)
    ctx.page.drawText(labelText, { x: x2, y: ctx.y, size: ctx.labelSize, font: ctx.bold, color: ctx.labelColor })
    ctx.page.drawText(value2, { x: x2 + labelWidth, y: ctx.y, size: ctx.fontSize, font: ctx.regular, color: ctx.textColor })
  }
  
  ctx.y -= ctx.lineHeight
}

function drawMultilineField(ctx: DrawContext, label: string, value: string | undefined | null) {
  if (!value || !value.trim()) return
  if (ctx.y < ctx.margin + 15) return
  
  const labelText = label + ':'
  ctx.page.drawText(labelText, {
    x: ctx.margin,
    y: ctx.y,
    size: ctx.labelSize,
    font: ctx.bold,
    color: ctx.labelColor,
  })
  ctx.y -= ctx.lineHeight
  
  const lines = wrapText(ctx.regular, value, ctx.maxTextWidth, ctx.fontSize)
  for (const line of lines) {
    if (ctx.y < ctx.margin + 10) break
    ctx.page.drawText(line, {
      x: ctx.margin,
      y: ctx.y,
      size: ctx.fontSize,
      font: ctx.italic,
      color: ctx.textColor,
    })
    ctx.y -= ctx.lineHeight
  }
}

function formatCurrency(amount: number | undefined | null, currency: string | undefined | null): string | null {
  if (amount == null || amount === 0) return null
  const sym = currency || 'EUR'
  return `${sym} ${amount.toFixed(2)}`
}

export async function generateCatalogSheet(data: BookPdfData, paperSize: PaperSize): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)
  const boldItalic = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique)
  
  const { width, height } = PAPER_SIZES[paperSize]
  const page = pdfDoc.addPage([width, height])
  const ctx = createContext(page, { regular, bold, italic, boldItalic }, paperSize)
  
  const isSmall = paperSize === 'a6'
  const titleSize = isSmall ? 12 : paperSize === 'a5' || paperSize === 'us-half-letter' ? 15 : 18
  const subtitleSize = isSmall ? 8 : paperSize === 'a5' || paperSize === 'us-half-letter' ? 10 : 11
  
  // ═══ HEADER: Title ═══
  // Title
  const titleLines = wrapText(bold, data.title, ctx.maxTextWidth, titleSize)
  for (const line of titleLines) {
    ctx.page.drawText(line, { x: ctx.margin, y: ctx.y, size: titleSize, font: bold, color: ctx.textColor })
    ctx.y -= titleSize * 1.3
  }
  
  // Subtitle
  if (data.subtitle) {
    ctx.page.drawText(data.subtitle, { x: ctx.margin, y: ctx.y, size: subtitleSize, font: italic, color: ctx.labelColor })
    ctx.y -= subtitleSize * 1.5
  }
  
  // Contributors line
  if (data.contributors.length > 0) {
    const contribLine = data.contributors.map(c => `${c.name} (${c.role})`).join(', ')
    const contribLines = wrapText(regular, contribLine, ctx.maxTextWidth, ctx.fontSize + 0.5)
    for (const line of contribLines) {
      ctx.page.drawText(line, { x: ctx.margin, y: ctx.y, size: ctx.fontSize + 0.5, font: regular, color: ctx.textColor })
      ctx.y -= ctx.lineHeight
    }
  }
  
  ctx.y -= ctx.lineHeight * 0.3
  
  // ═══ Series ═══
  if (data.series) {
    const seriesText = data.series + (data.series_number ? `, ${data.series_number}` : '')
    drawField(ctx, 'Series', seriesText)
  }
  if (data.original_title) drawField(ctx, 'Original Title', data.original_title)
  
  // ═══ PUBLICATION ═══
  const hasPub = data.publisher || data.publication_place || data.publication_year
  if (hasPub) {
    drawSectionHeader(ctx, 'Publication')
    drawFieldPair(ctx, 'Publisher', data.publisher, 'Year', data.publication_year)
    drawFieldPair(ctx, 'Place', data.publication_place, 'Printer', data.printer)
    if (data.printing_place) drawField(ctx, 'Printing Place', data.printing_place)
  }
  
  // ═══ EDITION ═══
  const hasEd = data.edition || data.impression || data.issue_state
  if (hasEd) {
    drawSectionHeader(ctx, 'Edition')
    drawFieldPair(ctx, 'Edition', data.edition, 'Impression', data.impression)
    if (data.issue_state) drawField(ctx, 'Issue/State', data.issue_state)
    if (data.edition_notes) drawMultilineField(ctx, 'Edition Notes', data.edition_notes)
  }
  
  // ═══ LANGUAGE ═══
  if (data.language || data.original_language) {
    drawSectionHeader(ctx, 'Language')
    drawFieldPair(ctx, 'Language', data.language, 'Original', data.original_language)
  }
  
  // ═══ PHYSICAL DESCRIPTION ═══
  const hasPhys = data.pagination || data.height_mm || data.binding || data.format || data.cover_type || data.paper_type
  if (hasPhys) {
    drawSectionHeader(ctx, 'Physical Description')
    drawFieldPair(ctx, 'Pagination', data.pagination, 'Volumes', data.volumes)
    
    // Dimensions
    const dims: string[] = []
    if (data.height_mm) dims.push(`${data.height_mm}H`)
    if (data.width_mm) dims.push(`${data.width_mm}W`)
    if (data.depth_mm) dims.push(`${data.depth_mm}D`)
    const dimStr = dims.length > 0 ? dims.join(' × ') + ' mm' : null
    drawFieldPair(ctx, 'Dimensions', dimStr, 'Weight', data.weight_grams ? `${data.weight_grams}g` : null)
    
    drawFieldPair(ctx, 'Binding', data.binding, 'Format', data.format)
    drawFieldPair(ctx, 'Cover Type', data.cover_type, 'Enclosure', data.protective_enclosure)
    drawFieldPair(ctx, 'Paper', data.paper_type, 'Edge Treatment', data.edge_treatment)
    drawFieldPair(ctx, 'Endpapers', data.endpapers, 'Text Block', data.text_block_condition)
    
    const flags: string[] = []
    if (data.has_dust_jacket) flags.push('Dust jacket present')
    if (data.is_signed) flags.push('Signed')
    if (flags.length > 0) drawField(ctx, 'Notes', flags.join(', '))
  }
  
  // ═══ CONDITION ═══
  const hasCond = data.condition || data.status
  if (hasCond) {
    drawSectionHeader(ctx, 'Condition & Status')
    drawFieldPair(ctx, 'Condition', data.condition, 'DJ Condition', data.dust_jacket_condition)
    drawFieldPair(ctx, 'Status', data.status, 'Action', data.action_needed)
    if (data.condition_notes) drawMultilineField(ctx, 'Notes', data.condition_notes)
  }
  
  // ═══ CONDITION HISTORY ═══
  if (data.condition_history.length > 0) {
    drawSectionHeader(ctx, 'Condition History')
    for (const ch of data.condition_history) {
      if (ctx.y < ctx.margin + 15) break
      const parts = [
        ch.event_date,
        ch.event_type,
        ch.before_condition && ch.after_condition ? `${ch.before_condition} → ${ch.after_condition}` : null,
        ch.performed_by ? `by ${ch.performed_by}` : null,
      ].filter(Boolean).join(' · ')
      drawField(ctx, parts || 'Event', ch.description || ch.notes || '')
    }
  }
  
  // ═══ PROVENANCE ═══
  if (data.provenance.length > 0) {
    drawSectionHeader(ctx, 'Provenance')
    for (const p of data.provenance) {
      if (ctx.y < ctx.margin + 15) break
      const period = [p.date_from, p.date_to].filter(Boolean).join('–') || ''
      const line = [
        p.owner_name,
        p.owner_type !== 'individual' ? `(${p.owner_type})` : '',
        period ? `[${period}]` : '',
        p.transaction_type ? `· ${p.transaction_type}` : '',
      ].filter(Boolean).join(' ')
      ctx.page.drawText(line, { x: ctx.margin, y: ctx.y, size: ctx.fontSize, font: ctx.regular, color: ctx.textColor })
      ctx.y -= ctx.lineHeight
      if (p.notes) {
        ctx.page.drawText(p.notes, { x: ctx.margin + 10, y: ctx.y, size: ctx.fontSize - 1, font: ctx.italic, color: ctx.labelColor })
        ctx.y -= ctx.lineHeight
      }
    }
  }
  
  // ═══ IDENTIFIERS ═══
  const hasId = data.isbn_13 || data.isbn_10 || data.oclc_number || data.lccn || data.user_catalog_id || data.ddc || data.lcc
  if (hasId) {
    drawSectionHeader(ctx, 'Identifiers')
    drawFieldPair(ctx, 'ISBN-13', data.isbn_13, 'ISBN-10', data.isbn_10)
    drawFieldPair(ctx, 'OCLC', data.oclc_number, 'LCCN', data.lccn)
    drawFieldPair(ctx, 'DDC', data.ddc, 'LCC', data.lcc)
    drawFieldPair(ctx, 'UDC', data.udc, 'Catalog ID', data.user_catalog_id)
    if (data.topic) drawField(ctx, 'Topic', data.topic)
  }
  
  // ═══ BISAC ═══
  if (data.bisac_subjects && data.bisac_subjects.length > 0) {
    drawSectionHeader(ctx, 'Subject Classification')
    for (const s of data.bisac_subjects) {
      drawField(ctx, 'BISAC', s)
    }
  }
  
  // ═══ STORAGE & VALUATION ═══
  const hasStorage = data.storage_location || data.shelf || data.estimated_value || data.lowest_price
  if (hasStorage) {
    drawSectionHeader(ctx, 'Storage & Valuation')
    const location = [data.storage_location, data.shelf, data.shelf_section].filter(Boolean).join(' / ')
    if (location) drawField(ctx, 'Location', location)
    
    const valParts: string[] = []
    const ev = formatCurrency(data.estimated_value, data.price_currency)
    const lo = formatCurrency(data.lowest_price, data.price_currency)
    const hi = formatCurrency(data.highest_price, data.price_currency)
    const sp = formatCurrency(data.sales_price, data.price_currency)
    if (ev) valParts.push(`Est: ${ev}`)
    if (lo && hi) valParts.push(`Range: ${lo}–${hi}`)
    else if (lo) valParts.push(`Low: ${lo}`)
    if (sp) valParts.push(`Sale: ${sp}`)
    if (valParts.length > 0) drawField(ctx, 'Valuation', valParts.join(' · '))
  }
  
  // ═══ COLLECTIONS & TAGS ═══
  if (data.collections.length > 0 || data.tags.length > 0) {
    drawSectionHeader(ctx, 'Collections & Tags')
    if (data.collections.length > 0) drawField(ctx, 'Collections', data.collections.join(', '))
    if (data.tags.length > 0) drawField(ctx, 'Tags', data.tags.join(', '))
  }
  
  // ═══ NOTES ═══
  const hasNotes = data.summary || data.dedication_text || data.colophon_text || data.bibliography || data.illustrations_description || data.signatures_description
  if (hasNotes) {
    drawSectionHeader(ctx, 'Notes')
    if (data.summary) drawMultilineField(ctx, 'Summary', data.summary)
    if (data.dedication_text) drawField(ctx, 'Dedication', data.dedication_text)
    if (data.colophon_text) drawField(ctx, 'Colophon', data.colophon_text)
    if (data.bibliography) drawField(ctx, 'Bibliography', data.bibliography)
    if (data.illustrations_description) drawField(ctx, 'Illustrations', data.illustrations_description)
    if (data.signatures_description) drawField(ctx, 'Signatures', data.signatures_description)
  }
  
  // ═══ CATALOG ENTRY ═══
  if (data.catalog_entry) {
    drawSectionHeader(ctx, 'Catalog Entry')
    const entryLines = wrapText(italic, data.catalog_entry, ctx.maxTextWidth, ctx.fontSize)
    for (const line of entryLines) {
      if (ctx.y < ctx.margin + 10) break
      ctx.page.drawText(line, { x: ctx.margin, y: ctx.y, size: ctx.fontSize, font: italic, color: ctx.textColor })
      ctx.y -= ctx.lineHeight
    }
  }
  
  // ═══ EXTERNAL LINKS ═══
  if (data.external_links.length > 0) {
    drawSectionHeader(ctx, 'References')
    for (const link of data.external_links) {
      if (ctx.y < ctx.margin + 10) break
      drawField(ctx, link.label || 'Link', link.url)
    }
  }
  
  // ═══ FOOTER ═══
  const footerY = ctx.margin - 12
  if (footerY > 8) {
    ctx.page.drawLine({
      start: { x: ctx.margin, y: footerY + 8 },
      end: { x: ctx.width - ctx.margin, y: footerY + 8 },
      thickness: 0.25,
      color: ctx.ruleColor,
    })
    const footerText = `Generated by Shelvd · ${new Date().toISOString().split('T')[0]}`
    ctx.page.drawText(footerText, {
      x: ctx.margin,
      y: footerY,
      size: ctx.labelSize - 1,
      font: regular,
      color: ctx.labelColor,
    })
    if (data.owner_name) {
      const ownerWidth = regular.widthOfTextAtSize(data.owner_name, ctx.labelSize - 1)
      ctx.page.drawText(data.owner_name, {
        x: ctx.width - ctx.margin - ownerWidth,
        y: footerY,
        size: ctx.labelSize - 1,
        font: regular,
        color: ctx.labelColor,
      })
    }
  }
  
  return pdfDoc.save()
}
