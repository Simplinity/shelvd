'use client'

import { useState } from 'react'
import { Plus, X, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CURRENCIES } from '@/lib/currencies'

// ─── Types ───────────────────────────────────────────────────────────

export type ConditionHistoryEntry = {
  tempId: string
  dbId?: string
  position: number
  eventDate: string
  eventType: string
  description: string
  performedBy: string
  cost: number | null
  costCurrency: string
  beforeConditionId: string
  afterConditionId: string
  notes: string
  isNew: boolean
  isDeleted: boolean
}

// ─── Constants ───────────────────────────────────────────────────────

const EVENT_TYPES = [
  { value: 'assessment', label: 'Assessment' },
  { value: 'restoration', label: 'Restoration' },
  { value: 'repair', label: 'Repair' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'rebinding', label: 'Rebinding' },
  { value: 'damage', label: 'Damage' },
  { value: 'conservation', label: 'Conservation' },
  { value: 'other', label: 'Other' },
]

const EVENT_TYPE_ICONS: Record<string, string> = {
  assessment: '🔍',
  restoration: '🔧',
  repair: '🛠️',
  cleaning: '🧹',
  rebinding: '📕',
  damage: '⚠️',
  conservation: '🏛️',
  other: '📋',
}

// ─── Styling (matches parent form + provenance-editor) ──────────────

const inputClass = "w-full h-10 px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
const labelClass = "block text-xs uppercase tracking-wide text-muted-foreground mb-1"
const textareaClass = "w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground resize-y"

// ─── Component ───────────────────────────────────────────────────────

type Condition = {
  id: string
  name: string
}

type Props = {
  entries: ConditionHistoryEntry[]
  conditions: Condition[]
  onChange: (entries: ConditionHistoryEntry[]) => void
}

let nextTempId = 1
function genTempId() {
  return `ch_new_${Date.now()}_${nextTempId++}`
}

export default function ConditionHistoryEditor({ entries, conditions, onChange }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const activeEntries = entries
    .filter(e => !e.isDeleted)
    .sort((a, b) => a.position - b.position)

  const updateEntry = (tempId: string, updates: Partial<ConditionHistoryEntry>) => {
    onChange(entries.map(e => e.tempId === tempId ? { ...e, ...updates } : e))
  }

  const addEntry = () => {
    const maxPos = activeEntries.length > 0
      ? Math.max(...activeEntries.map(e => e.position))
      : 0
    const newEntry: ConditionHistoryEntry = {
      tempId: genTempId(),
      position: maxPos + 1,
      eventDate: '',
      eventType: 'assessment',
      description: '',
      performedBy: '',
      cost: null,
      costCurrency: '',
      beforeConditionId: '',
      afterConditionId: '',
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

  const renderSummary = (entry: ConditionHistoryEntry, idx: number) => {
    const icon = EVENT_TYPE_ICONS[entry.eventType] || '📋'
    const typeLabel = EVENT_TYPES.find(t => t.value === entry.eventType)?.label || ''
    const beforeName = conditions.find(c => c.id === entry.beforeConditionId)?.name
    const afterName = conditions.find(c => c.id === entry.afterConditionId)?.name
    const conditionChange = beforeName && afterName ? `${beforeName} → ${afterName}` : afterName ? `→ ${afterName}` : beforeName ? `${beforeName} →` : ''

    return (
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xs text-muted-foreground font-mono w-5 text-center shrink-0">{idx + 1}</span>
        <span className="shrink-0">{icon}</span>
        <span className="font-medium truncate">{typeLabel}</span>
        {entry.eventDate && <span className="text-xs text-muted-foreground shrink-0">{entry.eventDate}</span>}
        {entry.description && (
          <span className="text-xs text-muted-foreground truncate">{entry.description}</span>
        )}
        {conditionChange && (
          <span className="text-xs px-1.5 py-0.5 bg-muted text-muted-foreground shrink-0">
            {conditionChange}
          </span>
        )}
        {entry.eventType === 'damage' && (
          <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-800 shrink-0">
            Damage
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

                {/* Row 1: Event type + date */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className={labelClass}>Event Type</label>
                    <select
                      value={entry.eventType}
                      onChange={e => updateEntry(entry.tempId, { eventType: e.target.value })}
                      className={inputClass}
                    >
                      {EVENT_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Date</label>
                    <input
                      type="text"
                      value={entry.eventDate}
                      onChange={e => updateEntry(entry.tempId, { eventDate: e.target.value })}
                      placeholder="2024, March 2023, c. 1960"
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Performed By</label>
                    <input
                      type="text"
                      value={entry.performedBy}
                      onChange={e => updateEntry(entry.tempId, { performedBy: e.target.value })}
                      placeholder="Restorer name, workshop, self"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Row 2: Description */}
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    value={entry.description}
                    onChange={e => updateEntry(entry.tempId, { description: e.target.value })}
                    placeholder="Spine rebacked with period-appropriate leather, original boards retained..."
                    rows={2}
                    className={textareaClass}
                  />
                </div>

                {/* Row 3: Condition change (before → after) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Condition Before</label>
                    <select
                      value={entry.beforeConditionId}
                      onChange={e => updateEntry(entry.tempId, { beforeConditionId: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">—</option>
                      {conditions.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Condition After</label>
                    <select
                      value={entry.afterConditionId}
                      onChange={e => updateEntry(entry.tempId, { afterConditionId: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">—</option>
                      {conditions.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 4: Cost */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className={labelClass}>Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      value={entry.cost ?? ''}
                      onChange={e => updateEntry(entry.tempId, { cost: e.target.value ? parseFloat(e.target.value) : null })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Currency</label>
                    <select
                      value={entry.costCurrency}
                      onChange={e => updateEntry(entry.tempId, { costCurrency: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">—</option>
                      {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 5: Notes */}
                <div>
                  <label className={labelClass}>Notes</label>
                  <textarea
                    value={entry.notes}
                    onChange={e => updateEntry(entry.tempId, { notes: e.target.value })}
                    rows={2}
                    className={textareaClass}
                  />
                </div>

              </div>
            )}
          </div>
        )
      })}

      {/* Add button */}
      <Button type="button" variant="outline" onClick={addEntry} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Condition History Entry
      </Button>

      {activeEntries.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          No condition history entries yet. Track restorations, repairs, and damage over time.
        </p>
      )}
    </div>
  )
}
