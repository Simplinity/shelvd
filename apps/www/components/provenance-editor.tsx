'use client'

import { useState } from 'react'
import { Plus, X, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CURRENCIES } from '@/lib/currencies'

// ─── Types ───────────────────────────────────────────────────────────

export type ProvenanceSource = {
  id: string
  sourceType: string
  title: string
  url: string
  reference: string
  notes: string
  isNew?: boolean
  isDeleted?: boolean
}

export type ProvenanceEntry = {
  tempId: string
  dbId?: string
  position: number
  ownerName: string
  ownerType: string
  dateFrom: string
  dateTo: string
  evidenceType: string[]
  evidenceDescription: string
  transactionType: string
  transactionDetail: string
  pricePaid: number | null
  priceCurrency: string
  associationType: string
  associationNote: string
  notes: string
  sources: ProvenanceSource[]
  isNew: boolean
  isDeleted: boolean
}

// ─── Constants ───────────────────────────────────────────────────────

const OWNER_TYPES = [
  { value: 'person', label: 'Person' },
  { value: 'institution', label: 'Institution' },
  { value: 'library', label: 'Library' },
  { value: 'monastery', label: 'Monastery / Religious house' },
  { value: 'dealer', label: 'Dealer' },
  { value: 'auction_house', label: 'Auction House' },
  { value: 'publisher', label: 'Publisher' },
  { value: 'estate', label: 'Estate' },
  { value: 'unknown', label: 'Unknown owner' },
  { value: 'self', label: 'You (current owner)' },
]

const EVIDENCE_TYPES = [
  { value: 'bookplate', label: 'Bookplate (ex libris)' },
  { value: 'inscription', label: 'Ownership inscription' },
  { value: 'stamp', label: 'Stamp' },
  { value: 'annotation', label: 'Annotation / marginalia' },
  { value: 'binding', label: 'Binding mark' },
  { value: 'shelfmark', label: 'Shelfmark' },
  { value: 'auction_record', label: 'Auction record' },
  { value: 'dealer_record', label: 'Dealer record' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'oral_history', label: 'Oral history' },
  { value: 'none', label: 'No physical evidence' },
]

const TRANSACTION_TYPES = [
  { value: 'unknown', label: 'Unknown' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'auction', label: 'Auction' },
  { value: 'dealer', label: 'Dealer' },
  { value: 'gift', label: 'Gift' },
  { value: 'presentation', label: 'Presentation (by author)' },
  { value: 'inheritance', label: 'Inheritance' },
]

const ASSOCIATION_TYPES = [
  { value: 'none', label: 'None' },
  { value: 'dedication_copy', label: 'Dedication copy' },
  { value: 'association_copy', label: 'Association copy' },
  { value: 'presentation_copy', label: 'Presentation copy' },
  { value: 'inscribed', label: 'Inscribed by author' },
  { value: 'signed', label: 'Signed by author' },
  { value: 'authors_copy', label: "Author's own copy" },
  { value: 'annotated', label: 'Annotated by notable person' },
  { value: 'from_notable_collection', label: 'From notable collection' },
  { value: 'ex_library', label: 'Ex-library' },
  { value: 'review_copy', label: 'Review copy' },
  { value: 'subscriber_copy', label: 'Subscriber copy' },
  { value: 'prize_copy', label: 'Prize / award copy' },
  { value: 'working_copy', label: 'Working copy' },
]

const SOURCE_TYPES = [
  { value: 'auction_catalog', label: 'Auction catalog' },
  { value: 'dealer_catalog', label: 'Dealer catalog' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'publication', label: 'Publication' },
  { value: 'url', label: 'URL / web link' },
  { value: 'correspondence', label: 'Correspondence' },
]

const EVIDENCE_ICONS: Record<string, string> = {
  bookplate: '🏷️',
  inscription: '✍️',
  stamp: '⬛',
  annotation: '📝',
  binding: '📕',
  shelfmark: '🔢',
  auction_record: '🔨',
  dealer_record: '🏪',
  receipt: '🧾',
  oral_history: '💬',
  none: '—',
}

// ─── Styling (matches parent form) ──────────────────────────────────

const inputClass = "w-full h-10 px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
const labelClass = "block text-xs uppercase tracking-wide text-muted-foreground mb-1"
const textareaClass = "w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground resize-y"

// ─── Component ───────────────────────────────────────────────────────

type Props = {
  entries: ProvenanceEntry[]
  onChange: (entries: ProvenanceEntry[]) => void
}

let nextTempId = 1
function genTempId() {
  return `prov_new_${Date.now()}_${nextTempId++}`
}

export default function ProvenanceEditor({ entries, onChange }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const activeEntries = entries
    .filter(e => !e.isDeleted)
    .sort((a, b) => a.position - b.position)

  const updateEntry = (tempId: string, updates: Partial<ProvenanceEntry>) => {
    onChange(entries.map(e => e.tempId === tempId ? { ...e, ...updates } : e))
  }

  const addEntry = () => {
    const maxPos = activeEntries.length > 0
      ? Math.max(...activeEntries.map(e => e.position))
      : 0
    const newEntry: ProvenanceEntry = {
      tempId: genTempId(),
      position: maxPos + 1,
      ownerName: '',
      ownerType: 'person',
      dateFrom: '',
      dateTo: '',
      evidenceType: [],
      evidenceDescription: '',
      transactionType: 'unknown',
      transactionDetail: '',
      pricePaid: null,
      priceCurrency: '',
      associationType: 'none',
      associationNote: '',
      notes: '',
      sources: [],
      isNew: true,
      isDeleted: false,
    }
    onChange([...entries, newEntry])
    setExpandedId(newEntry.tempId)
  }

  const removeEntry = (tempId: string) => {
    const entry = entries.find(e => e.tempId === tempId)
    if (!entry) return
    if (entry.isNew) {
      onChange(entries.filter(e => e.tempId !== tempId))
    } else {
      updateEntry(tempId, { isDeleted: true })
    }
    if (expandedId === tempId) setExpandedId(null)
  }

  const moveEntry = (tempId: string, direction: 'up' | 'down') => {
    const idx = activeEntries.findIndex(e => e.tempId === tempId)
    if (idx < 0) return
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === activeEntries.length - 1) return

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    const currentPos = activeEntries[idx].position
    const swapPos = activeEntries[swapIdx].position

    onChange(entries.map(e => {
      if (e.tempId === activeEntries[idx].tempId) return { ...e, position: swapPos }
      if (e.tempId === activeEntries[swapIdx].tempId) return { ...e, position: currentPos }
      return e
    }))
  }

  const toggleEvidence = (tempId: string, value: string) => {
    const entry = entries.find(e => e.tempId === tempId)
    if (!entry) return
    const current = entry.evidenceType || []
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    updateEntry(tempId, { evidenceType: next })
  }

  const addSource = (tempId: string) => {
    const entry = entries.find(e => e.tempId === tempId)
    if (!entry) return
    const newSource: ProvenanceSource = {
      id: `src_new_${Date.now()}_${nextTempId++}`,
      sourceType: 'url',
      title: '',
      url: '',
      reference: '',
      notes: '',
      isNew: true,
      isDeleted: false,
    }
    updateEntry(tempId, { sources: [...entry.sources, newSource] })
  }

  const updateSource = (tempId: string, srcId: string, updates: Partial<ProvenanceSource>) => {
    const entry = entries.find(e => e.tempId === tempId)
    if (!entry) return
    updateEntry(tempId, {
      sources: entry.sources.map(s => s.id === srcId ? { ...s, ...updates } : s)
    })
  }

  const removeSource = (tempId: string, srcId: string) => {
    const entry = entries.find(e => e.tempId === tempId)
    if (!entry) return
    const src = entry.sources.find(s => s.id === srcId)
    if (!src) return
    if (src.isNew) {
      updateEntry(tempId, { sources: entry.sources.filter(s => s.id !== srcId) })
    } else {
      updateEntry(tempId, {
        sources: entry.sources.map(s => s.id === srcId ? { ...s, isDeleted: true } : s)
      })
    }
  }

  const renderSummary = (entry: ProvenanceEntry, idx: number) => {
    const icons = (entry.evidenceType || [])
      .filter(t => t !== 'none')
      .map(t => EVIDENCE_ICONS[t] || '')
      .join(' ')
    const dates = [entry.dateFrom, entry.dateTo].filter(Boolean).join(' → ')
    const ownerLabel = OWNER_TYPES.find(o => o.value === entry.ownerType)?.label || ''

    return (
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xs text-muted-foreground font-mono w-5 text-center shrink-0">{idx + 1}</span>
        <span className="font-medium truncate">{entry.ownerName || '(unnamed)'}</span>
        {ownerLabel && entry.ownerType !== 'person' && (
          <span className="text-xs text-muted-foreground shrink-0">({ownerLabel})</span>
        )}
        {dates && <span className="text-xs text-muted-foreground shrink-0">{dates}</span>}
        {icons && <span className="shrink-0">{icons}</span>}
        {entry.associationType !== 'none' && (
          <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-800 shrink-0">
            {ASSOCIATION_TYPES.find(a => a.value === entry.associationType)?.label}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {activeEntries.map((entry, idx) => {
        const isExpanded = expandedId === entry.tempId
        return (
          <div key={entry.tempId} className="border border-border bg-background">
            {/* Collapsed header */}
            <div
              className="flex items-center gap-1 px-3 py-2 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : entry.tempId)}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
              {renderSummary(entry, idx)}
              <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => moveEntry(entry.tempId, 'up')}
                  disabled={idx === 0}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20"
                  title="Move up"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveEntry(entry.tempId, 'down')}
                  disabled={idx === activeEntries.length - 1}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20"
                  title="Move down"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeEntry(entry.tempId)}
                  className="p-1 text-muted-foreground hover:text-red-600"
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {isExpanded
                ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              }
            </div>

            {/* Expanded detail */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-2 border-t border-border space-y-4">

                {/* Row 1: Owner name, type, dates */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Owner / Institution</label>
                    <input
                      type="text"
                      value={entry.ownerName}
                      onChange={e => updateEntry(entry.tempId, { ownerName: e.target.value })}
                      placeholder="Name of person or institution"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Owner Type</label>
                    <select
                      value={entry.ownerType}
                      onChange={e => updateEntry(entry.tempId, { ownerType: e.target.value })}
                      className={inputClass}
                    >
                      {OWNER_TYPES.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className={labelClass}>From</label>
                      <input
                        type="text"
                        value={entry.dateFrom}
                        onChange={e => updateEntry(entry.tempId, { dateFrom: e.target.value })}
                        placeholder="c. 1850"
                        className={inputClass}
                      />
                    </div>
                    <div className="flex-1">
                      <label className={labelClass}>To</label>
                      <input
                        type="text"
                        value={entry.dateTo}
                        onChange={e => updateEntry(entry.tempId, { dateTo: e.target.value })}
                        placeholder="1922"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Evidence types (toggle chips) */}
                <div>
                  <label className={labelClass}>Evidence Type</label>
                  <div className="flex flex-wrap gap-1.5">
                    {EVIDENCE_TYPES.map(ev => {
                      const active = (entry.evidenceType || []).includes(ev.value)
                      return (
                        <button
                          key={ev.value}
                          type="button"
                          onClick={() => toggleEvidence(entry.tempId, ev.value)}
                          className={`text-xs px-2.5 py-1 border transition-colors ${
                            active
                              ? 'bg-foreground text-background border-foreground'
                              : 'bg-background text-muted-foreground border-border hover:border-foreground hover:text-foreground'
                          }`}
                        >
                          {EVIDENCE_ICONS[ev.value]} {ev.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Row 3: Evidence description */}
                {(entry.evidenceType || []).length > 0 && !(entry.evidenceType.length === 1 && entry.evidenceType[0] === 'none') && (
                  <div>
                    <label className={labelClass}>Evidence Description</label>
                    <textarea
                      value={entry.evidenceDescription}
                      onChange={e => updateEntry(entry.tempId, { evidenceDescription: e.target.value })}
                      placeholder="Armorial bookplate on front pastedown, pencil signature on flyleaf..."
                      rows={2}
                      className={textareaClass}
                    />
                  </div>
                )}

                {/* Row 4: Transaction */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className={labelClass}>How Acquired</label>
                    <select
                      value={entry.transactionType}
                      onChange={e => updateEntry(entry.tempId, { transactionType: e.target.value })}
                      className={inputClass}
                    >
                      {TRANSACTION_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className={labelClass}>Transaction Detail</label>
                    <input
                      type="text"
                      value={entry.transactionDetail}
                      onChange={e => updateEntry(entry.tempId, { transactionDetail: e.target.value })}
                      placeholder="Sotheby's London, lot 85, 2 Nov 1977"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Row 5: Price */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className={labelClass}>Price Paid</label>
                    <input
                      type="number"
                      step="0.01"
                      value={entry.pricePaid ?? ''}
                      onChange={e => updateEntry(entry.tempId, { pricePaid: e.target.value ? parseFloat(e.target.value) : null })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Currency</label>
                    <select
                      value={entry.priceCurrency}
                      onChange={e => updateEntry(entry.tempId, { priceCurrency: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">—</option>
                      {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 6: Association */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className={labelClass}>Association</label>
                    <select
                      value={entry.associationType}
                      onChange={e => updateEntry(entry.tempId, { associationType: e.target.value })}
                      className={inputClass}
                    >
                      {ASSOCIATION_TYPES.map(a => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                      ))}
                    </select>
                  </div>
                  {entry.associationType !== 'none' && (
                    <div className="md:col-span-3">
                      <label className={labelClass}>Association Note</label>
                      <textarea
                        value={entry.associationNote}
                        onChange={e => updateEntry(entry.tempId, { associationNote: e.target.value })}
                        placeholder="Author's personal copy"
                        rows={2}
                        className={textareaClass}
                      />
                    </div>
                  )}
                </div>

                {/* Row 7: Notes */}
                <div>
                  <label className={labelClass}>Notes</label>
                  <textarea
                    value={entry.notes}
                    onChange={e => updateEntry(entry.tempId, { notes: e.target.value })}
                    rows={2}
                    className={textareaClass}
                  />
                </div>

                {/* Row 8: Sources */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={labelClass + ' mb-0'}>Supporting Sources</label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addSource(entry.tempId)}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add source
                    </Button>
                  </div>
                  {entry.sources.filter(s => !s.isDeleted).map(src => (
                    <div key={src.id} className="mb-3 border border-border/50 p-2 space-y-2">
                      <div className="flex gap-2 items-start">
                        <select
                          value={src.sourceType}
                          onChange={e => updateSource(entry.tempId, src.id, { sourceType: e.target.value })}
                          className={inputClass + ' !w-40 shrink-0'}
                        >
                          {SOURCE_TYPES.map(st => (
                            <option key={st.value} value={st.value}>{st.label}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={src.title}
                          onChange={e => updateSource(entry.tempId, src.id, { title: e.target.value })}
                          placeholder="Title or description"
                          className={inputClass + ' flex-1'}
                        />
                        <button
                          type="button"
                          onClick={() => removeSource(entry.tempId, src.id)}
                          className="p-2 text-muted-foreground hover:text-red-600 shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={src.url}
                          onChange={e => updateSource(entry.tempId, src.id, { url: e.target.value })}
                          placeholder="URL (optional)"
                          className={inputClass + ' flex-1'}
                        />
                        <input
                          type="text"
                          value={src.reference}
                          onChange={e => updateSource(entry.tempId, src.id, { reference: e.target.value })}
                          placeholder="Ref / lot #"
                          className={inputClass + ' !w-40'}
                        />
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>
        )
      })}

      {/* Add button */}
      <Button type="button" variant="outline" onClick={addEntry} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Provenance Entry
      </Button>

      {activeEntries.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          No provenance entries yet. Add the chain of ownership for this book.
        </p>
      )}
    </div>
  )
}
