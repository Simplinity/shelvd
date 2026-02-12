// Valuation history timeline display for book detail page
// Vertical timeline showing value assessments (appraisals, auction results, purchases)
// Mirrors condition-history-timeline.tsx structure and visual style exactly

const SOURCE_LABELS: Record<string, string> = {
  self_estimate: 'Self Estimate',
  appraisal: 'Appraisal',
  auction_result: 'Auction Result',
  dealer_quote: 'Dealer Quote',
  insurance: 'Insurance Valuation',
  market_research: 'Market Research',
  provenance_purchase: 'Purchase',
}

const SOURCE_ICONS: Record<string, string> = {
  self_estimate: '💭',
  appraisal: '📋',
  auction_result: '🔨',
  dealer_quote: '🏷️',
  insurance: '🛡️',
  market_research: '📊',
  provenance_purchase: '🤝',
}

type ValuationEntryData = {
  id: string
  position: number
  valuation_date: string | null
  value: number
  currency: string
  source: string
  appraiser: string | null
  provenance_entry_id: string | null
  notes: string | null
}

type Props = {
  entries: ValuationEntryData[]
  formatCurrency: (amount: number, currency: string) => string
}

export default function ValuationTimeline({ entries, formatCurrency }: Props) {
  if (!entries || entries.length === 0) return null

  const sorted = [...entries].sort((a, b) => a.position - b.position)

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Valuation History</h2>
      <div className="relative ml-4">
        {/* Vertical line */}
        <div className="absolute left-0 top-2 bottom-2 w-px bg-border" />

        {sorted.map((entry) => {
          const icon = SOURCE_ICONS[entry.source] || '📋'
          const label = SOURCE_LABELS[entry.source] || entry.source
          const isFromProvenance = entry.source === 'provenance_purchase'

          return (
            <div key={entry.id} className="relative pl-8 pb-6 last:pb-0">
              {/* Timeline dot */}
              <div className={`absolute left-0 top-1.5 w-2.5 h-2.5 -translate-x-[5px] border-2 ${
                isFromProvenance
                  ? 'bg-blue-500 border-blue-500'
                  : 'bg-background border-foreground'
              }`} />

              {/* Content */}
              <div>
                {/* Source + date line */}
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-sm">{icon}</span>
                  <span className="font-medium text-sm">{label}</span>
                  {isFromProvenance && (
                    <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700">
                      From provenance
                    </span>
                  )}
                  {entry.valuation_date && (
                    <span className="text-xs text-muted-foreground">{entry.valuation_date}</span>
                  )}
                </div>

                {/* Value — prominent */}
                <p className="text-base font-semibold mt-1">
                  {formatCurrency(Number(entry.value), entry.currency)}
                </p>

                {/* Appraiser */}
                {entry.appraiser && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium">By:</span> {entry.appraiser}
                  </p>
                )}

                {/* Notes */}
                {entry.notes && !entry.notes.startsWith('Migrated from') && !entry.notes.startsWith('From provenance:') && (
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
