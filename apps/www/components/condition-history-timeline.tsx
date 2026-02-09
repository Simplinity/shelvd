// Condition history timeline display for book detail page
// Vertical timeline showing condition events (restorations, repairs, damage, assessments)
// Mirrors provenance-timeline.tsx structure and visual style exactly

const EVENT_TYPE_LABELS: Record<string, string> = {
  assessment: 'Assessment',
  restoration: 'Restoration',
  repair: 'Repair',
  cleaning: 'Cleaning',
  rebinding: 'Rebinding',
  damage: 'Damage',
  conservation: 'Conservation',
  other: 'Other',
}

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

type ConditionHistoryEntryData = {
  id: string
  position: number
  event_date: string | null
  event_type: string
  description: string | null
  performed_by: string | null
  cost: number | null
  cost_currency: string | null
  before_condition: { name: string } | null
  after_condition: { name: string } | null
  notes: string | null
}

type Props = {
  entries: ConditionHistoryEntryData[]
}

export default function ConditionHistoryTimeline({ entries }: Props) {
  if (!entries || entries.length === 0) return null

  const sorted = [...entries].sort((a, b) => a.position - b.position)

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Condition History</h2>
      <div className="relative ml-4">
        {/* Vertical line */}
        <div className="absolute left-0 top-2 bottom-2 w-px bg-border" />

        {sorted.map((entry, idx) => {
          const icon = EVENT_TYPE_ICONS[entry.event_type] || '📋'
          const label = EVENT_TYPE_LABELS[entry.event_type] || entry.event_type
          const isDamage = entry.event_type === 'damage'
          const hasConditionChange = entry.before_condition || entry.after_condition

          return (
            <div key={entry.id} className="relative pl-8 pb-6 last:pb-0">
              {/* Timeline dot */}
              <div className={`absolute left-0 top-1.5 w-2.5 h-2.5 -translate-x-[5px] border-2 ${
                isDamage
                  ? 'bg-red-500 border-red-500'
                  : 'bg-background border-foreground'
              }`} />

              {/* Content */}
              <div>
                {/* Event type + date line */}
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-sm">{icon}</span>
                  <span className="font-medium text-sm">{label}</span>
                  {isDamage && (
                    <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-800">
                      Damage event
                    </span>
                  )}
                  {entry.event_date && (
                    <span className="text-xs text-muted-foreground">{entry.event_date}</span>
                  )}
                </div>

                {/* Description */}
                {entry.description && (
                  <p className="text-xs text-muted-foreground mt-1">{entry.description}</p>
                )}

                {/* Condition change */}
                {hasConditionChange && (
                  <div className="mt-1.5 text-xs text-muted-foreground">
                    {entry.before_condition && (
                      <span>{entry.before_condition.name}</span>
                    )}
                    {entry.before_condition && entry.after_condition && (
                      <span> → </span>
                    )}
                    {entry.after_condition && (
                      <span className="font-medium text-foreground">{entry.after_condition.name}</span>
                    )}
                  </div>
                )}

                {/* Performed by */}
                {entry.performed_by && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium">By:</span> {entry.performed_by}
                  </p>
                )}

                {/* Cost */}
                {entry.cost != null && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {entry.cost_currency || ''} {Number(entry.cost).toFixed(2)}
                  </p>
                )}

                {/* Notes */}
                {entry.notes && (
                  <p className="text-xs text-muted-foreground mt-1.5">{entry.notes}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
