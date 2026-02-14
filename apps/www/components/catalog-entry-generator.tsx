'use client'

import { useState } from 'react'
import { FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  type CatalogLanguage,
  type CatalogMode,
  CATALOG_LANGUAGES,
  LABELS,
  ABBREVIATIONS,
  CONTRIBUTOR_ROLES,
  ALL_COVER_TYPES,
  CONDITION_GRADES,
  TEXT_BLOCK_CONDITIONS,
  EVIDENCE_TYPES,
  ASSOCIATION_TYPES,
  ENCLOSURE_TYPES,
} from '@/lib/catalog-translations'

type Contributor = {
  name: string
  role: string
}

type ProvenanceEntry = {
  ownerName: string
  ownerType: string
  dateFrom: string
  dateTo: string
  evidenceType: string[]
  evidenceDescription: string
  transactionType: string
  transactionDetail: string
  associationType: string
  associationNote: string
}

type BookData = {
  // Title & Series
  title: string | null
  subtitle: string | null
  original_title: string | null
  series: string | null
  series_number: string | null
  // Publication
  publisher_name: string | null
  publication_place: string | null
  publication_year: string | null
  printer: string | null
  printing_place: string | null
  // Edition
  edition: string | null
  impression: string | null
  issue_state: string | null
  edition_notes: string | null
  // Physical
  pagination_description: string | null
  page_count: number | null
  volumes: string | null
  height_mm: number | null
  width_mm: number | null
  depth_mm: number | null
  paper_type: string | null
  edge_treatment: string | null
  endpapers_type: string | null
  text_block_condition: string | null
  // Cover & Binding
  cover_type: string | null
  binding_name: string | null
  format_name: string | null
  format_abbreviation: string | null
  has_dust_jacket: boolean | null
  is_signed: boolean | null
  signature_details: string | null
  protective_enclosure: string | null
  // Condition
  condition_name: string | null
  condition_notes: string | null
  dust_jacket_condition_name: string | null
  // Language
  language_name: string | null
  original_language_name: string | null
  // Notes
  bibliography: string | null
  illustrations_description: string | null
  signatures_description: string | null
  dedication_text: string | null
  colophon_text: string | null
  // Structured provenance
  provenanceEntries?: ProvenanceEntry[]
  // Identifiers
  isbn_13: string | null
  isbn_10: string | null
  oclc_number: string | null
  lccn: string | null
  user_catalog_id: string | null
  ddc: string | null
  lcc: string | null
  udc: string | null
  // Contributors
  contributors: Contributor[]
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/** Convert "John William Smith" → "SMITH, John William" */
function authorCaps(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 1) return name.toUpperCase()
  const family = parts[parts.length - 1]
  const given = parts.slice(0, -1).join(' ')
  return `${family.toUpperCase()}, ${given}`
}

/** Get contributors by role (case-insensitive) */
function getByRole(contributors: Contributor[], role: string): string[] {
  return contributors
    .filter(c => c.role.toLowerCase() === role.toLowerCase())
    .map(c => c.name)
}

/** Format dimensions for Trade mode (mm) */
function tradeDimensions(h: number | null, w: number | null): string {
  if (h && w) return `${h} × ${w} mm`
  if (h) return `${h} mm`
  return ''
}

/** Format dimensions for ISBD mode (cm, height only, rounded up) */
function isbdDimensions(h: number | null): string {
  if (!h) return ''
  return `${Math.ceil(h / 10)} cm`
}

/** Translate a cover type value to a given language */
function coverLabel(coverType: string | null, lang: CatalogLanguage): string {
  if (!coverType) return ''
  return ALL_COVER_TYPES[coverType]?.[lang] || coverType.replace(/_/g, ' ')
}

/** Translate a condition grade */
function conditionLabel(condName: string | null, lang: CatalogLanguage): string {
  if (!condName) return ''
  // Find by matching the English name (condition_name from DB is English)
  const key = Object.keys(CONDITION_GRADES).find(
    k => CONDITION_GRADES[k]?.en?.toLowerCase() === condName.toLowerCase()
  )
  if (key) return CONDITION_GRADES[key]![lang] || condName
  return condName
}

/** Translate text block condition */
function textBlockLabel(cond: string | null, lang: CatalogLanguage): string {
  if (!cond) return ''
  return TEXT_BLOCK_CONDITIONS[cond]?.[lang] || cond.replace(/_/g, ' ')
}

/** Translate enclosure type */
function enclosureLabel(enc: string | null, lang: CatalogLanguage): string {
  if (!enc || enc === 'none') return ''
  return ENCLOSURE_TYPES[enc]?.[lang] || enc.replace(/_/g, ' ')
}

/** Build provenance text */
function provenanceText(entries: ProvenanceEntry[], lang: CatalogLanguage): string {
  if (!entries || entries.length === 0) return ''

  const chain = entries.map(entry => {
    const parts: string[] = []

    // Evidence
    const evTypes = (entry.evidenceType || []).filter(t => t !== 'none')
    const evLabel = evTypes.length > 0
      ? evTypes.map(t => EVIDENCE_TYPES[t]?.[lang] || t).join(', ')
      : null

    // Owner
    if (evLabel && entry.ownerType !== 'self') {
      parts.push(`${evLabel}: ${entry.ownerName}`)
    } else {
      parts.push(entry.ownerName)
    }

    // Dates
    const dates = [entry.dateFrom, entry.dateTo].filter(Boolean)
    if (dates.length > 0) parts.push(`(${dates.join('–')})`)

    // Transaction
    if (entry.transactionDetail) {
      parts.push(entry.transactionDetail)
    }

    // Association
    if (entry.associationType && entry.associationType !== 'none') {
      const aLabel = ASSOCIATION_TYPES[entry.associationType]?.[lang] || ''
      if (entry.associationNote) {
        parts.push(`[${aLabel}: ${entry.associationNote}]`)
      } else if (aLabel) {
        parts.push(`[${aLabel}]`)
      }
    }

    return parts.filter(Boolean).join(' ')
  })

  return chain.join(' — ')
}

/** Build contributor SoR string for Trade mode */
function tradeContributors(contributors: Contributor[], lang: CatalogLanguage): string {
  const roles = CONTRIBUTOR_ROLES[lang]
  const parts: string[] = []

  // Authors (already shown as main author, skip in SoR)
  const coAuthors = getByRole(contributors, 'Co-author')
  if (coAuthors.length > 0) parts.push(coAuthors.map(n => n + (roles?.co_author || '')).join(', '))

  // Role-based contributors
  const roleMappings: [string, keyof typeof roles][] = [
    ['Editor', 'editor'],
    ['Translator', 'translator'],
    ['Illustrator', 'illustrator'],
    ['Photographer', 'photographer'],
    ['Cover designer', 'cover_designer'],
    ['Engraver', 'engraver'],
    ['Woodcutter', 'woodcutter'],
    ['Etcher', 'etcher'],
    ['Lithographer', 'lithographer'],
    ['Calligrapher', 'calligrapher'],
    ['Cartographer', 'cartographer'],
    ['Writer of foreword', 'foreword'],
    ['Writer of introduction', 'introduction'],
    ['Writer of preface', 'preface'],
    ['Writer of afterword', 'afterword'],
  ]

  for (const [dbRole, transKey] of roleMappings) {
    const names = getByRole(contributors, dbRole)
    if (names.length > 0) {
      const phrase = roles?.[transKey as keyof typeof roles] || dbRole.toLowerCase()
      parts.push(`${phrase} ${names.join(', ')}`)
    }
  }

  return parts.join('. ')
}

// ═══════════════════════════════════════════════════════════════════════════
// TRADE CATALOG MODE
// ═══════════════════════════════════════════════════════════════════════════

function generateTradeEntry(book: BookData, lang: CatalogLanguage): string {
  const t = LABELS[lang]
  const abbr = ABBREVIATIONS[lang]
  const parts: string[] = []

  // ── Author ──
  const authors = getByRole(book.contributors, 'Author')
  if (authors.length > 0) {
    parts.push(authors.map(authorCaps).join(' ; '))
  }

  // ── Title ──
  let titleBlock = ''
  if (book.title) {
    titleBlock = book.title
    if (book.subtitle) titleBlock += ' : ' + book.subtitle
  }
  if (titleBlock) parts.push(titleBlock)

  // ── Publication ──
  const pubParts: string[] = []
  if (book.publication_place) pubParts.push(book.publication_place)
  if (book.publisher_name) pubParts.push(book.publisher_name)
  if (book.publication_year) pubParts.push(book.publication_year)
  if (pubParts.length > 0) parts.push(pubParts.join(', '))

  // ── Edition ──
  const edParts: string[] = []
  if (book.edition) edParts.push(book.edition)
  if (book.impression) edParts.push(book.impression)
  if (edParts.length > 0) parts.push(edParts.join(', '))

  // ── Physical: Format BEFORE dimensions (trade convention) ──
  let physical = ''

  // Format first
  if (book.format_abbreviation) {
    physical += book.format_abbreviation
  } else if (book.format_name) {
    physical += book.format_name
  }

  // Pagination
  const pagination = book.pagination_description
    || (book.page_count ? `${book.page_count} ${abbr.pages}` : '')
  if (pagination) {
    if (physical) physical += '. '
    physical += pagination
  }

  // Volumes
  if (book.volumes) {
    if (physical) physical += ', '
    physical += book.volumes
  }

  // Illustrations (brief, in physical line)
  if (book.illustrations_description) {
    if (physical) physical += ', '
    physical += book.illustrations_description
  }

  // Dimensions (mm for trade)
  const dims = tradeDimensions(book.height_mm, book.width_mm)
  if (dims) {
    if (physical) physical += '. '
    physical += dims
  }

  if (physical) parts.push(physical)

  // ── Cover / Binding ──
  const coverParts: string[] = []
  const cv = coverLabel(book.cover_type, lang)
  if (cv) coverParts.push(cv)
  if (book.binding_name && !book.cover_type) coverParts.push(book.binding_name)
  if (book.has_dust_jacket && book.cover_type && !book.cover_type.includes('_dj')) {
    coverParts.push(t.dust_jacket)
  }
  if (coverParts.length > 0) parts.push(coverParts.join('. '))

  // ── Issue/State + Edition notes ──
  if (book.issue_state) parts.push(book.issue_state)
  if (book.edition_notes) parts.push(book.edition_notes)

  // ── Condition ──
  let condText = ''
  const condGrade = conditionLabel(book.condition_name, lang)
  if (condGrade) {
    condText = condGrade
    if (book.condition_notes) condText += '. ' + book.condition_notes
  } else if (book.condition_notes) {
    condText = book.condition_notes
  }
  // DJ condition
  if (book.dust_jacket_condition_name) {
    const djGrade = conditionLabel(book.dust_jacket_condition_name, lang)
    if (djGrade) condText += `. ${t.dust_jacket}: ${djGrade}`
  }
  // Text block
  const tbLabel = textBlockLabel(book.text_block_condition, lang)
  if (tbLabel) condText += `. ${t.text_block}: ${tbLabel}`
  if (condText) parts.push(condText)

  // ── Notes block ──
  const notes: string[] = []

  // Signed
  if (book.is_signed) {
    const sigText = book.signature_details
      ? `${t.signed}: ${book.signature_details}`
      : t.signed
    notes.push(sigText)
  }

  // Original title
  if (book.original_title) {
    notes.push(`${t.original_title}: ${book.original_title}`)
  }

  // Dedication
  if (book.dedication_text) notes.push(`${t.dedication}: ${book.dedication_text}`)

  // Colophon
  if (book.colophon_text) notes.push(`${t.colophon}: ${book.colophon_text}`)

  // Paper type
  if (book.paper_type && book.paper_type !== 'wove') {
    notes.push(`${t.paper}: ${book.paper_type.replace(/_/g, ' ')}`)
  }

  // Edge treatment
  if (book.edge_treatment && book.edge_treatment !== 'trimmed') {
    notes.push(`${t.edges}: ${book.edge_treatment.replace(/_/g, ' ')}`)
  }

  // Endpapers
  if (book.endpapers_type && !['plain_white', 'none'].includes(book.endpapers_type)) {
    notes.push(`${t.endpapers}: ${book.endpapers_type.replace(/_/g, ' ')}`)
  }

  // Protective enclosure
  const encLabel = enclosureLabel(book.protective_enclosure, lang)
  if (encLabel) notes.push(`${t.enclosure}: ${encLabel}`)

  // Signatures/collation
  if (book.signatures_description) notes.push(`${t.signatures}: ${book.signatures_description}`)

  // Printer
  if (book.printer) {
    let printerText = `${t.printed_by} ${book.printer}`
    if (book.printing_place) printerText += `, ${book.printing_place}`
    notes.push(printerText)
  }

  // Provenance
  const prov = provenanceText(book.provenanceEntries || [], lang)
  if (prov) notes.push(`${t.provenance}: ${prov}`)

  // Bibliography
  if (book.bibliography) notes.push(`${t.bibliography}: ${book.bibliography}`)

  // Contributors (non-author)
  const contribText = tradeContributors(book.contributors, lang)
  if (contribText) notes.push(contribText)

  if (notes.length > 0) parts.push(notes.join('. '))

  // ── Series ──
  if (book.series) {
    let seriesText = `(${book.series}`
    if (book.series_number) seriesText += ` ; ${book.series_number}`
    seriesText += ')'
    parts.push(seriesText)
  }

  // ── Identifiers (trade: usually ISBN only) ──
  if (book.isbn_13) parts.push('ISBN ' + book.isbn_13)
  else if (book.isbn_10) parts.push('ISBN ' + book.isbn_10)

  return parts.join('. ')
}

// ═══════════════════════════════════════════════════════════════════════════
// ISBD FORMAL MODE
// ═══════════════════════════════════════════════════════════════════════════

function generateISBDEntry(book: BookData, lang: CatalogLanguage): string {
  const t = LABELS[lang]
  const abbr = ABBREVIATIONS[lang]
  const areas: string[] = []

  // ── AREA 1: Title and Statement of Responsibility ──
  // ISBD: title first, NO author before title
  let area1 = ''
  if (book.title) {
    area1 = book.title
    if (book.subtitle) area1 += ' : ' + book.subtitle

    // Statement of Responsibility — transcribe from title page, use " / " separator
    const sorParts: string[] = []
    const authors = getByRole(book.contributors, 'Author')
    if (authors.length > 0) sorParts.push(authors.join(', '))

    const coAuthors = getByRole(book.contributors, 'Co-author')
    if (coAuthors.length > 0) sorParts.push(...coAuthors)

    const editors = getByRole(book.contributors, 'Editor')
    if (editors.length > 0) {
      const edPhrase = CONTRIBUTOR_ROLES[lang]?.editor || 'edited by'
      sorParts.push(`${edPhrase} ${editors.join(', ')}`)
    }

    const translators = getByRole(book.contributors, 'Translator')
    if (translators.length > 0) {
      const trPhrase = CONTRIBUTOR_ROLES[lang]?.translator || 'translated by'
      sorParts.push(`${trPhrase} ${translators.join(', ')}`)
    }

    const illustrators = getByRole(book.contributors, 'Illustrator')
    if (illustrators.length > 0) {
      const ilPhrase = CONTRIBUTOR_ROLES[lang]?.illustrator || 'illustrated by'
      sorParts.push(`${ilPhrase} ${illustrators.join(', ')}`)
    }

    if (sorParts.length > 0) {
      area1 += ' / ' + sorParts.join(' ; ')
    }
  }
  if (area1) areas.push(area1)

  // ── AREA 2: Edition ──
  const edParts: string[] = []
  if (book.edition) edParts.push(book.edition)
  if (book.impression) edParts.push(book.impression)
  if (edParts.length > 0) areas.push(edParts.join(', '))

  // ── AREA 4: Publication ──
  let area4 = ''
  if (book.publication_place) area4 += book.publication_place
  else area4 += '[S.l.]'

  if (book.publisher_name) {
    area4 += ' : ' + book.publisher_name
  } else {
    area4 += ' : [s.n.]'
  }

  if (book.publication_year) {
    area4 += ', ' + book.publication_year
  }
  areas.push(area4)

  // ── AREA 5: Physical Description ──
  let area5 = ''

  // Extent (pagination)
  if (book.pagination_description) {
    area5 = book.pagination_description
  } else if (book.page_count) {
    area5 = `${book.page_count} ${abbr.pages}`
  }

  // Volumes
  if (book.volumes) {
    if (area5) area5 += ', '
    area5 += book.volumes
  }

  // Illustrations (ISBD: ": ill." in Area 5)
  if (book.illustrations_description) {
    if (area5) area5 += ' : '
    area5 += book.illustrations_description
  }

  // Dimensions (ISBD: cm, height only, rounded up)
  const dims = isbdDimensions(book.height_mm)
  if (dims) {
    if (area5) area5 += ' ; '
    area5 += dims
  }

  if (area5) areas.push(area5)

  // ── AREA 6: Series ──
  if (book.series) {
    let area6 = '(' + book.series
    if (book.series_number) area6 += ' ; ' + book.series_number
    area6 += ')'
    areas.push(area6)
  }

  // ── AREA 7: Notes (free-form, each separated) ──
  const notes: string[] = []

  // Original title (for translations)
  if (book.original_title) notes.push(`${t.original_title}: ${book.original_title}`)

  // Language note
  if (book.original_language_name && book.language_name) {
    notes.push(`Translated from ${book.original_language_name}`)
  }

  // Edition notes
  if (book.edition_notes) notes.push(book.edition_notes)

  // Issue/state
  if (book.issue_state) notes.push(book.issue_state)

  // Signatures/collation formula
  if (book.signatures_description) notes.push(`${t.signatures}: ${book.signatures_description}`)

  // Dedication
  if (book.dedication_text) notes.push(`${t.dedication}: ${book.dedication_text}`)

  // Colophon
  if (book.colophon_text) notes.push(`${t.colophon}: ${book.colophon_text}`)

  // Paper, edges, endpapers
  if (book.paper_type && book.paper_type !== 'wove') {
    notes.push(`${t.paper}: ${book.paper_type.replace(/_/g, ' ')}`)
  }
  if (book.edge_treatment && book.edge_treatment !== 'trimmed') {
    notes.push(`${t.edges}: ${book.edge_treatment.replace(/_/g, ' ')}`)
  }
  if (book.endpapers_type && !['plain_white', 'none'].includes(book.endpapers_type)) {
    notes.push(`${t.endpapers}: ${book.endpapers_type.replace(/_/g, ' ')}`)
  }

  // Bibliography
  if (book.bibliography) notes.push(`${t.bibliography}: ${book.bibliography}`)

  // Provenance
  const prov = provenanceText(book.provenanceEntries || [], lang)
  if (prov) notes.push(`${t.provenance}: ${prov}`)

  // Binding (ISBD: in Area 7, NOT Area 5)
  const cv = coverLabel(book.cover_type, lang)
  if (cv) notes.push(`${t.binding}: ${cv}`)
  if (book.binding_name && !book.cover_type) notes.push(`${t.binding}: ${book.binding_name}`)
  if (book.has_dust_jacket && book.cover_type && !book.cover_type.includes('_dj')) {
    notes.push(t.dust_jacket)
  }

  // Enclosure
  const encLabel = enclosureLabel(book.protective_enclosure, lang)
  if (encLabel) notes.push(`${t.enclosure}: ${encLabel}`)

  // Signed
  if (book.is_signed) {
    notes.push(book.signature_details ? `${t.signed}: ${book.signature_details}` : t.signed)
  }

  // Condition (ISBD: in Area 7)
  const condGrade = conditionLabel(book.condition_name, lang)
  if (condGrade) {
    let condText = `${t.condition}: ${condGrade}`
    if (book.condition_notes) condText += '. ' + book.condition_notes
    if (book.dust_jacket_condition_name) {
      condText += `. ${t.dust_jacket}: ${conditionLabel(book.dust_jacket_condition_name, lang)}`
    }
    const tbLabel = textBlockLabel(book.text_block_condition, lang)
    if (tbLabel) condText += `. ${t.text_block}: ${tbLabel}`
    notes.push(condText)
  }

  // Printer
  if (book.printer) {
    let pText = `${t.printed_by} ${book.printer}`
    if (book.printing_place) pText += `, ${book.printing_place}`
    notes.push(pText)
  }

  if (notes.length > 0) areas.push(notes.join('. — '))

  // ── AREA 8: Identifiers ──
  const ids: string[] = []
  if (book.isbn_13) ids.push('ISBN ' + book.isbn_13)
  else if (book.isbn_10) ids.push('ISBN ' + book.isbn_10)
  if (book.oclc_number) ids.push('OCLC: ' + book.oclc_number)
  if (book.lccn) ids.push('LCCN: ' + book.lccn)
  if (book.ddc) ids.push('DDC: ' + book.ddc)
  if (book.lcc) ids.push('LCC: ' + book.lcc)
  if (book.udc) ids.push('UDC: ' + book.udc)
  if (ids.length > 0) areas.push(ids.join('. '))

  // ── Combine with ISBD prescribed punctuation ──
  return areas.join('. — ')
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

type CatalogEntryGeneratorProps = {
  book: BookData
  onGenerate: (entry: string, field: 'catalog_entry' | 'catalog_entry_isbd') => void
}

export default function CatalogEntryGenerator({ book, onGenerate }: CatalogEntryGeneratorProps) {
  const [showModal, setShowModal] = useState(false)

  const handleGenerate = (lang: CatalogLanguage, mode: CatalogMode) => {
    const entry = mode === 'trade'
      ? generateTradeEntry(book, lang)
      : generateISBDEntry(book, lang)
    const field = mode === 'trade' ? 'catalog_entry' : 'catalog_entry_isbd'
    onGenerate(entry, field)
    setShowModal(false)
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowModal(true)}
        className="gap-2"
      >
        <FileText className="w-4 h-4" />
        Generate Catalog Entry
      </Button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />

          <div className="relative bg-background border border-border shadow-lg p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold mb-1">Generate Catalog Entry</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select language and mode. Trade writes to <span className="font-mono text-xs">catalog_entry</span>, ISBD to <span className="font-mono text-xs">catalog_entry_isbd</span>.
            </p>

            {/* Header row */}
            <div className="grid grid-cols-[1fr_80px_80px] gap-2 mb-2 px-1">
              <div />
              <div className="text-xs font-semibold text-center text-muted-foreground uppercase tracking-wide">Trade</div>
              <div className="text-xs font-semibold text-center text-muted-foreground uppercase tracking-wide">ISBD</div>
            </div>

            {/* Language rows */}
            <div className="space-y-1">
              {CATALOG_LANGUAGES.map(opt => (
                <div key={opt.code} className="grid grid-cols-[1fr_80px_80px] gap-2 items-center">
                  <div className="flex items-center gap-2 pl-1">
                    <span className="text-lg">{opt.flag}</span>
                    <span className="text-sm font-medium">{opt.label}</span>
                    <span className="text-xs text-muted-foreground">{opt.association}</span>
                  </div>
                  <button
                    onClick={() => handleGenerate(opt.code, 'trade')}
                    className="px-2 py-1.5 border border-border hover:bg-muted transition-colors text-xs font-medium text-center"
                  >
                    Trade
                  </button>
                  <button
                    onClick={() => handleGenerate(opt.code, 'isbd')}
                    className="px-2 py-1.5 border border-border hover:bg-muted transition-colors text-xs font-medium text-center"
                  >
                    ISBD
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Export types and functions for external use
export type { BookData, Contributor, ProvenanceEntry }
export { generateTradeEntry, generateISBDEntry }
