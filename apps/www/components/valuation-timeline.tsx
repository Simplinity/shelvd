'use client'

// Valuation history timeline display for book detail page
// Vertical timeline — matches provenance-timeline.tsx and condition-history-timeline.tsx exactly

import dynamic from 'next/dynamic'
import { formatCurrency } from '@/lib/format'

const ValueTrendChart = dynamic(() => import('./value-trend-chart'), { ssr: false })

const SOURCE_LABELS: Record<string, string> = {
  self_estimate: 'Self Estimate',
  appraisal: 'Professional Appraisal',
  auction_result: 'Auction Result',
  dealer_quote: 'Dealer Quote',
  insurance: 'Insurance Valuation',
  market_research: 'Market Research',
  provenance_purchase: 'Purchase',
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
  locale?: string
}

export default function ValuationTimeline({ entries, locale }: Props) {
  if (!entries || entries.length === 0) return null

  const fmtCurrency = (amount: number, currency: string) =>
    formatCurrency(amount, currency, locale)

  const sorted = [...entries].sort((a, b) => a.position - b.position)

  // Build chart data from entries with dates, sorted chronologically
  const chartData = sorted
    .filter(e => e.valuation_date && e.value > 0)
    .sort((a, b) => (a.valuation_date || '').localeCompare(b.valuation_date || ''))
    .map(e => ({
      date: e.valuation_date || '',
      value: Number(e.value),
      label: SOURCE_LABELS[e.source] || e.source,
      currency: e.currency,
    }))

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Valuation History</h2>
      {chartData.length >= 2 && (
        <ValueTrendChart data={chartData} locale={locale} />
      )}
      <div className="relative ml-4">
        {/* Vertical line */}
        <div className="absolute left-0 top-2 bottom-2 w-px bg-border" />

        {sorted.map((entry) => {
          const label = SOURCE_LABELS[entry.source] || entry.source
          const isFromProvenance = !!entry.provenance_entry_id

          return (
            <div key={entry.id} className="relative pl-8 pb-6 last:pb-0">
              {/* Timeline dot */}
              <div className={`absolute left-0 top-1.5 w-2.5 h-2.5 -translate-x-[5px] border-2 ${
                isFromProvenance
                  ? 'bg-foreground border-foreground'
                  : 'bg-background border-foreground'
              }`} />

              {/* Content */}
              <div>
                {/* Source + date line */}
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-medium text-sm">{label}</span>
                  {isFromProvenance && (
                    <span className="text-xs px-1.5 py-0.5 bg-foreground text-background">
                      From provenance
                    </span>
                  )}
                  {entry.valuation_date && (
                    <span className="text-xs text-muted-foreground">{entry.valuation_date}</span>
                  )}
                </div>

                {/* Value — prominent */}
                <p className="text-sm font-semibold mt-1">
                  {fmtCurrency(Number(entry.value), entry.currency)}
                </p>

                {/* Appraiser */}
                {entry.appraiser && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium">By:</span> {entry.appraiser}
                  </p>
                )}

                {/* Notes (skip migration artifacts) */}
                {entry.notes && !entry.notes.startsWith('Migrated from') && !entry.notes.startsWith('Auto-created from') && !entry.notes.startsWith('Market low') && !entry.notes.startsWith('Market high') && (
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
