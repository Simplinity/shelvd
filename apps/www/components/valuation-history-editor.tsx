'use client'

import { useState } from 'react'
import { Plus, X, ChevronDown, ChevronUp, GripVertical, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CURRENCIES } from '@/lib/currencies'

// ─── Types ───────────────────────────────────────────────────────────

export type ValuationHistoryEntry = {
  tempId: string
  dbId?: string
  position: number
  valuationDate: string
  value: number | null
  currency: string
  source: string
  appraiser: string
  provenanceEntryId: string | null
  notes: string
  isNew: boolean
  isDeleted: boolean
}

// ─── Constants ───────────────────────────────────────────────────────

const SOURCES = [
  { value: 'self_estimate', label: 'Self Estimate' },
  { value: 'appraisal', label: 'Professional Appraisal' },
  { value: 'auction_result', label: 'Auction Result' },
  { value: 'dealer_quote', label: 'Dealer Quote' },
  { value: 'insurance', label: 'Insurance Valuation' },
  { value: 'market_research', label: 'Market Research' },
  { value: 'provenance_purchase', label: 'From Provenance' },
]

const SOURCE_ICONS: Record<string, string> = {
  self_estimate: '💭',
  appraisal: '🏷️',
  auction_result: '🔨',
  dealer_quote: '🏪',
  insurance: '🛡️',
  market_research: '📊',
  provenance_purchase: '🔗',
}

// ─── Styling ─────────────────────────────────────────────────────────

const inputClass = "w-full h-10 px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
const labelClass = "block text-xs uppercase tracking-wide text-muted-foreground mb-1"
const textareaClass = "w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground resize-y"

// ─── Component ───────────────────────────────────────────────────────

type Props = {
  entries: ValuationHistoryEntry[]
  onChange: (entries: ValuationHistoryEntry[]) => void
}

let nextTempId = 1
function genTempId() {
  return `vh_new_${Date.now()}_${nextTempId++}`
}

export default function ValuationHistoryEditor({ entries, onChange }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const activeEntries = entries
    .filter(e => !e.isDeleted)
    .sort((a, b) => a.position - b.position)

  const updateEntry = (tempId: string, updates: Partial<ValuationHistoryEntry>) => {
    onChange(entries.map(e => e.tempId === tempId ? { ...e, ...updates } : e))
  }

  const addEntry = () => {
    const maxPos = activeEntries.length > 0
      ? Math.max(...activeEntries.map(e => e.position))
      : 0
    const newEntry: ValuationHistoryEntry = {
      tempId: genTempId(),
      position: maxPos + 1,
      valuationDate: '',
      value: null,
      currency: 'EUR',
      source: 'self_estimate',
      appraiser: '',
      provenanceEntryId: null,
      notes: '',
      isNew: true,
      isDeleted: false,
    }
    onChange([...entries, newEntry])
    setExpandedId(newEntry.tempId)
  }

  const removeEntry = (tempId: string) => {
    const entry = entries.find(e => e.tempId === tempId)
    if (!entry) return
    // Don't allow deleting provenance-linked entries here
    if (entry.provenanceEntryId) return
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

  const formatValue = (val: number | null, curr: string) => {
    if (val === null || val === 0) return ''
    try {
      return new Intl.NumberFormat('en', { style: 'currency', currency: curr || 'EUR' }).format(val)
    } catch {
      return `${curr} ${val}`
    }
  }

  const renderSummary = (entry: ValuationHistoryEntry, idx: number) => {
    const icon = SOURCE_ICONS[entry.source] || '📋'
    const sourceLabel = SOURCES.find(s => s.value === entry.source)?.label || ''

    return (
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xs text-muted-foreground font-mono w-5 text-center shrink-0">{idx + 1}</span>
        <span className="shrink-0">{icon}</span>
        <span className="font-medium truncate">{sourceLabel}</span>
        {entry.value && (
          <span className="text-sm font-semibold shrink-0">{formatValue(entry.value, entry.currency)}</span>
        )}
        {entry.valuationDate && <span className="text-xs text-muted-foreground shrink-0">{entry.valuationDate}</span>}
        {entry.appraiser && (
          <span className="text-xs text-muted-foreground truncate">by {entry.appraiser}</span>
        )}
        {entry.provenanceEntryId && (
          <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 shrink-0 flex items-center gap-0.5">
            <Link2 className="w-3 h-3" /> Provenance
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {activeEntries.map((entry, idx) => {
        const isExpanded = expandedId === entry.tempId
        const isProvenance = !!entry.provenanceEntryId

        return (
          <div key={entry.tempId} className={`border ${entry.isNew ? 'border-green-300 bg-green-50/30' : 'border-border'}`}>
            {/* Summary row */}
            <div
              className="flex items-center gap-1 px-3 py-2 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : entry.tempId)}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground/50 shrink-0" />
              {renderSummary(entry, idx)}
              <div className="flex items-center gap-0.5 shrink-0">
                <button type="button" onClick={e => { e.stopPropagation(); moveEntry(entry.tempId, 'up') }} disabled={idx === 0}
                  className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20">
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button type="button" onClick={e => { e.stopPropagation(); moveEntry(entry.tempId, 'down') }} disabled={idx === activeEntries.length - 1}
                  className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20">
                  <ChevronDown className="w-3 h-3" />
                </button>
                {!isProvenance && (
                  <button type="button" onClick={e => { e.stopPropagation(); removeEntry(entry.tempId) }}
                    className="p-0.5 text-muted-foreground hover:text-red-500 ml-1">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Expanded form */}
            {isExpanded && (
              <div className="px-3 pb-3 pt-1 border-t border-border/50 space-y-3">
                {isProvenance && (
                  <p className="text-xs text-blue-700 bg-blue-50 px-2 py-1.5">
                    Auto-created from provenance. Edit the price in the Provenance section to update this entry.
                  </p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className={labelClass}>Value</label>
                    <input type="number" step="0.01" value={entry.value ?? ''} disabled={isProvenance}
                      onChange={e => updateEntry(entry.tempId, { value: e.target.value ? parseFloat(e.target.value) : null })}
                      className={`${inputClass} ${isProvenance ? 'opacity-60' : ''}`} />
                  </div>
                  <div>
                    <label className={labelClass}>Currency</label>
                    <select value={entry.currency} disabled={isProvenance}
                      onChange={e => updateEntry(entry.tempId, { currency: e.target.value })}
                      className={`${inputClass} ${isProvenance ? 'opacity-60' : ''}`}>
                      {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Source</label>
                    <select value={entry.source} disabled={isProvenance}
                      onChange={e => updateEntry(entry.tempId, { source: e.target.value })}
                      className={`${inputClass} ${isProvenance ? 'opacity-60' : ''}`}>
                      {SOURCES.filter(s => isProvenance || s.value !== 'provenance_purchase').map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Date</label>
                    <input type="text" value={entry.valuationDate} disabled={isProvenance}
                      onChange={e => updateEntry(entry.tempId, { valuationDate: e.target.value })}
                      placeholder="e.g. 2024-03"
                      className={`${inputClass} ${isProvenance ? 'opacity-60' : ''}`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Appraiser / Source</label>
                  <input type="text" value={entry.appraiser} disabled={isProvenance}
                    onChange={e => updateEntry(entry.tempId, { appraiser: e.target.value })}
                    placeholder="e.g. Christie's, Sotheby's, self"
                    className={`${inputClass} ${isProvenance ? 'opacity-60' : ''}`} />
                </div>
                <div>
                  <label className={labelClass}>Notes</label>
                  <textarea value={entry.notes} rows={2}
                    onChange={e => updateEntry(entry.tempId, { notes: e.target.value })}
                    placeholder="Context, reference, catalog number..."
                    className={textareaClass} />
                </div>
              </div>
            )}
          </div>
        )
      })}

      <Button type="button" variant="outline" size="sm" onClick={addEntry} className="gap-1.5">
        <Plus className="w-3.5 h-3.5" />
        Add Valuation
      </Button>

      {activeEntries.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No valuations yet. Add one manually, or add a price to a provenance entry.
        </p>
      )}
    </div>
  )
}
