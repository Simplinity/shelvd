// Provenance timeline display for book detail page
// Vertical timeline showing chain of ownership with evidence icons

const OWNER_TYPE_LABELS: Record<string, string> = {
  person: 'Person',
  institution: 'Institution',
  library: 'Library',
  monastery: 'Monastery',
  dealer: 'Dealer',
  auction_house: 'Auction House',
  publisher: 'Publisher',
  estate: 'Estate',
  unknown: 'Unknown owner',
  self: 'You (current owner)',
}

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

const EVIDENCE_LABELS: Record<string, string> = {
  bookplate: 'Bookplate',
  inscription: 'Inscription',
  stamp: 'Stamp',
  annotation: 'Annotation',
  binding: 'Binding mark',
  shelfmark: 'Shelfmark',
  auction_record: 'Auction record',
  dealer_record: 'Dealer record',
  receipt: 'Receipt',
  oral_history: 'Oral history',
  none: 'No physical evidence',
}

const TRANSACTION_LABELS: Record<string, string> = {
  purchase: 'Purchase',
  auction: 'Auction',
  dealer: 'Dealer',
  gift: 'Gift',
  presentation: 'Presentation (by author)',
  inheritance: 'Inheritance',
  unknown: '',
}

const ASSOCIATION_LABELS: Record<string, string> = {
  none: '',
  association_copy: 'Association copy',
  presentation_copy: 'Presentation copy',
  inscribed: 'Inscribed by author',
  annotated: 'Annotated by notable person',
  from_notable_collection: 'From notable collection',
}

const SOURCE_TYPE_LABELS: Record<string, string> = {
  auction_catalog: 'Auction catalog',
  dealer_catalog: 'Dealer catalog',
  receipt: 'Receipt',
  certificate: 'Certificate',
  publication: 'Publication',
  url: 'Link',
  correspondence: 'Correspondence',
}

type ProvenanceSource = {
  id: string
  source_type: string
  title: string | null
  url: string | null
  reference: string | null
  notes: string | null
}

type ProvenanceEntryData = {
  id: string
  position: number
  owner_name: string
  owner_type: string
  date_from: string | null
  date_to: string | null
  evidence_type: string[] | null
  evidence_description: string | null
  transaction_type: string | null
  transaction_detail: string | null
  price_paid: number | null
  price_currency: string | null
  association_type: string | null
  association_note: string | null
  notes: string | null
  provenance_sources: ProvenanceSource[]
}

type Props = {
  entries: ProvenanceEntryData[]
}

export default function ProvenanceTimeline({ entries }: Props) {
  if (!entries || entries.length === 0) return null

  const sorted = [...entries].sort((a, b) => a.position - b.position)

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Provenance</h2>
      <div className="relative ml-4">
        {/* Vertical line */}
        <div className="absolute left-0 top-2 bottom-2 w-px bg-border" />

        {sorted.map((entry, idx) => {
          const evidenceTypes = (entry.evidence_type || []).filter(t => t !== 'none')
          const evidenceIcons = evidenceTypes.map(t => EVIDENCE_ICONS[t] || '').join(' ')
          const dates = [entry.date_from, entry.date_to].filter(Boolean).join(' → ')
          const transaction = TRANSACTION_LABELS[entry.transaction_type || 'unknown'] || ''
          const association = ASSOCIATION_LABELS[entry.association_type || 'none'] || ''
          const isLast = idx === sorted.length - 1
          const isSelf = entry.owner_type === 'self'

          return (
            <div key={entry.id} className="relative pl-8 pb-6 last:pb-0">
              {/* Timeline dot */}
              <div className={`absolute left-0 top-1.5 w-2.5 h-2.5 -translate-x-[5px] border-2 ${
                isSelf
                  ? 'bg-foreground border-foreground'
                  : 'bg-background border-foreground'
              }`} />

              {/* Content */}
              <div>
                {/* Owner line */}
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-medium text-sm">{entry.owner_name}</span>
                  {entry.owner_type !== 'person' && entry.owner_type !== 'self' && (
                    <span className="text-xs text-muted-foreground">
                      ({OWNER_TYPE_LABELS[entry.owner_type] || entry.owner_type})
                    </span>
                  )}
                  {isSelf && (
                    <span className="text-xs px-1.5 py-0.5 bg-foreground text-background">
                      Current owner
                    </span>
                  )}
                  {dates && (
                    <span className="text-xs text-muted-foreground">{dates}</span>
                  )}
                </div>

                {/* Association badge */}
                {association && (
                  <div className="mt-1">
                    <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-800">
                      {association}
                    </span>
                    {entry.association_note && (
                      <span className="text-xs text-muted-foreground ml-2">{entry.association_note}</span>
                    )}
                  </div>
                )}

                {/* Evidence */}
                {evidenceTypes.length > 0 && (
                  <div className="mt-1.5 text-xs text-muted-foreground">
                    {evidenceTypes.map(t => (
                      <span key={t} className="inline-flex items-center gap-1 mr-3">
                        <span>{EVIDENCE_ICONS[t]}</span>
                        <span>{EVIDENCE_LABELS[t]}</span>
                      </span>
                    ))}
                  </div>
                )}
                {entry.evidence_description && (
                  <p className="text-xs text-muted-foreground mt-1 italic">{entry.evidence_description}</p>
                )}

                {/* Transaction */}
                {(transaction || entry.transaction_detail) && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {transaction && <span className="font-medium">{transaction}</span>}
                    {transaction && entry.transaction_detail && <span> — </span>}
                    {entry.transaction_detail && <span>{entry.transaction_detail}</span>}
                  </p>
                )}

                {/* Price */}
                {entry.price_paid != null && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {entry.price_currency || ''} {Number(entry.price_paid).toFixed(2)}
                  </p>
                )}

                {/* Notes */}
                {entry.notes && (
                  <p className="text-xs text-muted-foreground mt-1.5">{entry.notes}</p>
                )}

                {/* Sources */}
                {entry.provenance_sources && entry.provenance_sources.length > 0 && (
                  <div className="mt-2 space-y-0.5">
                    {entry.provenance_sources.map(src => (
                      <div key={src.id} className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="opacity-50">↳</span>
                        <span className="font-medium">{SOURCE_TYPE_LABELS[src.source_type] || src.source_type}</span>
                        {src.title && <span>: {src.title}</span>}
                        {src.reference && <span className="opacity-60">({src.reference})</span>}
                        {src.url && (
                          <a href={src.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                            ↗
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
