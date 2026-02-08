'use client'

import { useState } from 'react'
import { FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Language = 'en' | 'fr' | 'de' | 'nl'

type Contributor = {
  name: string
  role: string
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
  // Cover & Binding
  cover_type: string | null
  binding_name: string | null
  format_name: string | null
  format_abbreviation: string | null
  has_dust_jacket: boolean | null
  is_signed: boolean | null
  // Condition
  condition_name: string | null
  condition_notes: string | null
  // Notes
  bibliography: string | null
  illustrations_description: string | null
  signatures_description: string | null
  // Structured provenance
  provenanceEntries?: {
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
  }[]
  // Identifiers
  isbn_13: string | null
  isbn_10: string | null
  oclc_number: string | null
  lccn: string | null
  // Contributors
  contributors: Contributor[]
}

// Translations for contributor roles and labels
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Contributor role formats
    'co-author': ', co-author',
    'illustrated by': 'illustrated by',
    'translated by': 'translated by',
    'edited by': 'edited by',
    'artist': ', artist',
    'photographer': ', photographer',
    'colorist': ', colorist',
    'cover designer': 'cover design by',
    'engraver': ', engraver',
    'woodcutter': ', woodcutter',
    'etcher': ', etcher',
    'lithographer': ', lithographer',
    'calligrapher': ', calligrapher',
    'cartographer': ', cartographer',
    'foreword by': 'foreword by',
    'introduction by': 'introduction by',
    'preface by': 'preface by',
    'afterword by': 'afterword by',
    // Labels
    'printed by': 'Printed by',
    'bibliography': 'Bibliography',
    'provenance': 'Provenance',
    'illustrations': 'Illustrations',
    'signatures': 'Signatures',
    'condition': 'Condition',
    'original title': 'Original title',
    'signed': 'Signed',
    'with dust jacket': 'In dust jacket',
    'p.': 'p.',
    'ill.': 'ill.',
    'vol.': 'vol.',
  },
  fr: {
    'co-author': ', co-auteur',
    'illustrated by': 'illustré par',
    'translated by': 'traduit par',
    'edited by': 'sous la direction de',
    'artist': ', artiste',
    'photographer': ', photographe',
    'colorist': ', coloriste',
    'cover designer': 'couverture de',
    'engraver': ', graveur',
    'woodcutter': ', graveur sur bois',
    'etcher': ', aquafortiste',
    'lithographer': ', lithographe',
    'calligrapher': ', calligraphe',
    'cartographer': ', cartographe',
    'foreword by': 'préface de',
    'introduction by': 'introduction de',
    'preface by': 'avant-propos de',
    'afterword by': 'postface de',
    'printed by': 'Imprimé par',
    'bibliography': 'Bibliographie',
    'provenance': 'Provenance',
    'illustrations': 'Illustrations',
    'signatures': 'Signatures',
    'condition': 'État',
    'original title': 'Titre original',
    'signed': 'Signé',
    'with dust jacket': 'Sous jaquette',
    'p.': 'p.',
    'ill.': 'ill.',
    'vol.': 'vol.',
  },
  de: {
    'co-author': ', Mitautor',
    'illustrated by': 'illustriert von',
    'translated by': 'übersetzt von',
    'edited by': 'herausgegeben von',
    'artist': ', Künstler',
    'photographer': ', Fotograf',
    'colorist': ', Kolorist',
    'cover designer': 'Umschlaggestaltung von',
    'engraver': ', Kupferstecher',
    'woodcutter': ', Holzschneider',
    'etcher': ', Radierer',
    'lithographer': ', Lithograf',
    'calligrapher': ', Kalligraf',
    'cartographer': ', Kartograf',
    'foreword by': 'Geleitwort von',
    'introduction by': 'Einleitung von',
    'preface by': 'Vorwort von',
    'afterword by': 'Nachwort von',
    'printed by': 'Gedruckt von',
    'bibliography': 'Bibliographie',
    'provenance': 'Provenienz',
    'illustrations': 'Illustrationen',
    'signatures': 'Signaturen',
    'condition': 'Zustand',
    'original title': 'Originaltitel',
    'signed': 'Signiert',
    'with dust jacket': 'Mit Schutzumschlag',
    'p.': 'S.',
    'ill.': 'Ill.',
    'vol.': 'Bd.',
  },
  nl: {
    'co-author': ', co-auteur',
    'illustrated by': 'geïllustreerd door',
    'translated by': 'vertaald door',
    'edited by': 'onder redactie van',
    'artist': ', kunstenaar',
    'photographer': ', fotograaf',
    'colorist': ', inkleuring',
    'cover designer': 'omslagontwerp door',
    'engraver': ', graveur',
    'woodcutter': ', houtsnijder',
    'etcher': ', etser',
    'lithographer': ', lithograaf',
    'calligrapher': ', kalligraaf',
    'cartographer': ', cartograaf',
    'foreword by': 'voorwoord door',
    'introduction by': 'inleiding door',
    'preface by': 'ten geleide door',
    'afterword by': 'nawoord door',
    'printed by': 'Gedrukt door',
    'bibliography': 'Bibliografie',
    'provenance': 'Herkomst',
    'illustrations': 'Illustraties',
    'signatures': 'Signaturen',
    'condition': 'Conditie',
    'original title': 'Oorspronkelijke titel',
    'signed': 'Gesigneerd',
    'with dust jacket': 'Met stofomslag',
    'p.': 'p.',
    'ill.': 'ill.',
    'dl.': 'dl.',
  },
}

// Cover type translations (simplified - only most common ones)
const coverTypeLabels: Record<string, Record<Language, string>> = {
  'softcover': { en: 'Softcover', fr: 'Broché', de: 'Broschur', nl: 'Softcover' },
  'softcover_dj': { en: 'Softcover in dust jacket', fr: 'Broché sous jaquette', de: 'Broschur mit Schutzumschlag', nl: 'Softcover met stofomslag' },
  'hardcover': { en: 'Hardcover', fr: 'Relié', de: 'Gebunden', nl: 'Hardcover' },
  'hardcover_dj': { en: 'Hardcover in dust jacket', fr: 'Relié sous jaquette', de: 'Gebunden mit Schutzumschlag', nl: 'Hardcover met stofomslag' },
  'full_leather_hardcover': { en: 'Full leather', fr: 'Plein cuir', de: 'Ganzleder', nl: 'Volledig leer' },
  'full_leather_softcover': { en: 'Full leather (limp)', fr: 'Plein cuir souple', de: 'Ganzleder (flexibel)', nl: 'Volledig leer (slap)' },
  'full_calf_hardcover': { en: 'Full calf', fr: 'Plein veau', de: 'Ganzkalbleder', nl: 'Volledig kalfsleer' },
  'full_vellum_hardcover': { en: 'Full vellum', fr: 'Plein vélin', de: 'Ganzpergament', nl: 'Volledig perkament' },
  'full_morocco_hardcover': { en: 'Full morocco', fr: 'Plein maroquin', de: 'Ganzmaroquin', nl: 'Volledig marokijn' },
  'full_cloth_hardcover': { en: 'Cloth', fr: 'Toile', de: 'Leinen', nl: 'Linnen' },
  'half_leather_paper': { en: 'Half leather', fr: 'Demi-cuir', de: 'Halbleder', nl: 'Half leer' },
  'half_leather_cloth': { en: 'Half leather, cloth sides', fr: 'Demi-cuir, plats toile', de: 'Halbleder mit Leinenbezug', nl: 'Half leer, linnen platten' },
  'quarter_leather_paper': { en: 'Quarter leather', fr: 'Quart de cuir', de: 'Viertelleder', nl: 'Kwart leer' },
  'original_wraps': { en: 'Original wrappers', fr: 'Couverture d\'éditeur', de: 'Originalbroschur', nl: 'Originele omslag' },
  'printed_wrappers': { en: 'Printed wrappers', fr: 'Couverture imprimée', de: 'Bedruckter Umschlag', nl: 'Bedrukte omslag' },
  'limp_vellum': { en: 'Limp vellum', fr: 'Vélin souple', de: 'Pergamenteinband', nl: 'Slap perkament' },
  'limp_leather': { en: 'Limp leather', fr: 'Cuir souple', de: 'Flexibler Ledereinband', nl: 'Slap leer' },
}

function generateCatalogEntry(book: BookData, lang: Language): string {
  const t = translations[lang]
  const parts: string[] = []
  
  // ═══════════════════════════════════════════════════════════════════════════
  // AREA 1: TITLE AND STATEMENT OF RESPONSIBILITY
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Helper to get contributors by role (case-insensitive)
  const getContributorsByRole = (role: string): string[] => {
    return book.contributors
      .filter(c => c.role.toLowerCase() === role.toLowerCase())
      .map(c => c.name)
  }
  
  // Get all contributor types
  const authors = getContributorsByRole('Author')
  const coAuthors = getContributorsByRole('Co-author')
  const editors = getContributorsByRole('Editor')
  const translators = getContributorsByRole('Translator')
  const illustrators = getContributorsByRole('Illustrator')
  const artists = getContributorsByRole('Artist')
  const photographers = getContributorsByRole('Photographer')
  const colorists = getContributorsByRole('Colorist')
  const coverDesigners = getContributorsByRole('Cover designer')
  const engravers = getContributorsByRole('Engraver')
  const woodcutters = getContributorsByRole('Woodcutter')
  const etchers = getContributorsByRole('Etcher')
  const lithographers = getContributorsByRole('Lithographer')
  const calligraphers = getContributorsByRole('Calligrapher')
  const cartographers = getContributorsByRole('Cartographer')
  const forewordWriters = getContributorsByRole('Writer of foreword')
  const introWriters = getContributorsByRole('Writer of introduction')
  const prefaceWriters = getContributorsByRole('Writer of preface')
  const afterwordWriters = getContributorsByRole('Writer of afterword')
  
  let area1 = ''
  
  // Main author(s) at the start
  if (authors.length > 0) {
    area1 += authors.join(' ; ') + '. '
  }
  
  // Title
  if (book.title) {
    area1 += book.title
    
    // Subtitle (preceded by " : ")
    if (book.subtitle) {
      area1 += ' : ' + book.subtitle
    }
    
    // Statement of responsibility (preceded by " / ")
    const responsibilities: string[] = []
    
    // Authors again in responsibility (if present)
    if (authors.length > 0) {
      if (lang === 'en') {
        responsibilities.push('by ' + authors.join(', '))
      } else if (lang === 'fr') {
        responsibilities.push('par ' + authors.join(', '))
      } else if (lang === 'de') {
        responsibilities.push('von ' + authors.join(', '))
      } else {
        responsibilities.push('door ' + authors.join(', '))
      }
    }
    
    // Co-authors
    if (coAuthors.length > 0) {
      responsibilities.push(coAuthors.map(n => n + t['co-author']).join(' ; '))
    }
    
    // Editors
    if (editors.length > 0) {
      responsibilities.push(t['edited by'] + ' ' + editors.join(', '))
    }
    
    // Translators
    if (translators.length > 0) {
      responsibilities.push(t['translated by'] + ' ' + translators.join(', '))
    }
    
    // Illustrators
    if (illustrators.length > 0) {
      responsibilities.push(t['illustrated by'] + ' ' + illustrators.join(', '))
    }
    
    // Artists
    if (artists.length > 0) {
      responsibilities.push(artists.map(n => n + t['artist']).join(' ; '))
    }
    
    // Photographers
    if (photographers.length > 0) {
      responsibilities.push(photographers.map(n => n + t['photographer']).join(' ; '))
    }
    
    // Colorists
    if (colorists.length > 0) {
      responsibilities.push(colorists.map(n => n + t['colorist']).join(' ; '))
    }
    
    // Cover designers
    if (coverDesigners.length > 0) {
      responsibilities.push(t['cover designer'] + ' ' + coverDesigners.join(', '))
    }
    
    // Engravers
    if (engravers.length > 0) {
      responsibilities.push(engravers.map(n => n + t['engraver']).join(' ; '))
    }
    
    // Woodcutters
    if (woodcutters.length > 0) {
      responsibilities.push(woodcutters.map(n => n + t['woodcutter']).join(' ; '))
    }
    
    // Etchers
    if (etchers.length > 0) {
      responsibilities.push(etchers.map(n => n + t['etcher']).join(' ; '))
    }
    
    // Lithographers
    if (lithographers.length > 0) {
      responsibilities.push(lithographers.map(n => n + t['lithographer']).join(' ; '))
    }
    
    // Calligraphers
    if (calligraphers.length > 0) {
      responsibilities.push(calligraphers.map(n => n + t['calligrapher']).join(' ; '))
    }
    
    // Cartographers
    if (cartographers.length > 0) {
      responsibilities.push(cartographers.map(n => n + t['cartographer']).join(' ; '))
    }
    
    // Foreword writers
    if (forewordWriters.length > 0) {
      responsibilities.push(t['foreword by'] + ' ' + forewordWriters.join(', '))
    }
    
    // Introduction writers
    if (introWriters.length > 0) {
      responsibilities.push(t['introduction by'] + ' ' + introWriters.join(', '))
    }
    
    // Preface writers
    if (prefaceWriters.length > 0) {
      responsibilities.push(t['preface by'] + ' ' + prefaceWriters.join(', '))
    }
    
    // Afterword writers
    if (afterwordWriters.length > 0) {
      responsibilities.push(t['afterword by'] + ' ' + afterwordWriters.join(', '))
    }
    
    if (responsibilities.length > 0) {
      area1 += ' / ' + responsibilities.join(' ; ')
    }
  }
  
  if (area1.trim()) {
    parts.push(area1.trim())
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // AREA 2: EDITION
  // ═══════════════════════════════════════════════════════════════════════════
  
  const editionParts: string[] = []
  if (book.edition) editionParts.push(book.edition)
  if (book.impression) editionParts.push(book.impression)
  
  if (editionParts.length > 0) {
    parts.push(editionParts.join(', '))
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // AREA 4: PUBLICATION, DISTRIBUTION
  // ═══════════════════════════════════════════════════════════════════════════
  
  let area4 = ''
  
  if (book.publication_place) {
    area4 += book.publication_place
  }
  
  if (book.publisher_name) {
    if (area4) area4 += ' : '
    area4 += book.publisher_name
  }
  
  if (book.publication_year) {
    if (area4) area4 += ', '
    area4 += book.publication_year
  }
  
  // Printer info (optional, after main publication)
  if (book.printer) {
    if (area4) area4 += '. '
    area4 += t['printed by'] + ' ' + book.printer
    if (book.printing_place) {
      area4 += ', ' + book.printing_place
    }
  }
  
  if (area4) {
    parts.push(area4)
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // AREA 5: PHYSICAL DESCRIPTION
  // ═══════════════════════════════════════════════════════════════════════════
  
  let area5 = ''
  
  // Pagination (collation)
  if (book.pagination_description) {
    area5 += book.pagination_description
  } else if (book.page_count) {
    area5 += book.page_count + ' ' + t['p.']
  }
  
  // Volumes
  if (book.volumes) {
    if (area5) area5 += ', '
    area5 += book.volumes
  }
  
  // Dimensions (height × width in mm)
  if (book.height_mm || book.width_mm) {
    if (area5) area5 += ' ; '
    if (book.height_mm && book.width_mm) {
      area5 += book.height_mm + ' × ' + book.width_mm + ' mm'
    } else if (book.height_mm) {
      area5 += book.height_mm + ' mm'
    }
  }
  
  // Book format (8vo, 4to, folio, etc.)
  if (book.format_abbreviation) {
    if (area5) area5 += ' '
    area5 += book.format_abbreviation
  } else if (book.format_name) {
    if (area5) area5 += ' '
    area5 += book.format_name
  }
  
  // Cover type
  if (book.cover_type) {
    const coverLabel = coverTypeLabels[book.cover_type]?.[lang] || 
                       book.cover_type.replace(/_/g, ' ')
    if (area5) area5 += '. '
    area5 += coverLabel
  }
  
  // Binding (if different from cover type)
  if (book.binding_name && !book.cover_type) {
    if (area5) area5 += '. '
    area5 += book.binding_name
  }
  
  // Dust jacket (only if not already indicated in cover_type)
  if (book.has_dust_jacket && book.cover_type && !book.cover_type.includes('_dj')) {
    if (area5) area5 += '. '
    area5 += t['with dust jacket']
  }
  
  // Signed
  if (book.is_signed) {
    if (area5) area5 += '. '
    area5 += t['signed']
  }
  
  if (area5) {
    parts.push(area5)
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // AREA 6: SERIES
  // ═══════════════════════════════════════════════════════════════════════════
  
  if (book.series) {
    let area6 = '(' + book.series
    if (book.series_number) {
      area6 += ' ; ' + book.series_number
    }
    area6 += ')'
    parts.push(area6)
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // AREA 7: NOTES
  // ═══════════════════════════════════════════════════════════════════════════
  
  const notes: string[] = []
  
  // Original title
  if (book.original_title) {
    notes.push(t['original title'] + ': ' + book.original_title)
  }
  
  // Edition notes
  if (book.edition_notes) {
    notes.push(book.edition_notes)
  }
  
  // Issue/state
  if (book.issue_state) {
    notes.push(book.issue_state)
  }
  
  // Bibliography
  if (book.bibliography) {
    notes.push(t['bibliography'] + ': ' + book.bibliography)
  }
  
  // Provenance (structured entries take priority over free-text field)
  if (book.provenanceEntries && book.provenanceEntries.length > 0) {
    const chain = book.provenanceEntries.map(entry => {
      const parts: string[] = []

      // Evidence prefix (e.g. "Bookplate of", "Inscription:")
      const evidenceTypes = (entry.evidenceType || []).filter(t => t !== 'none')
      const evidenceLabel = evidenceTypes.length > 0
        ? evidenceTypes.map(t => {
            const labels: Record<string, string> = {
              bookplate: 'Bookplate', inscription: 'Inscription', stamp: 'Stamp',
              annotation: 'Annotations', binding: 'Binding mark', shelfmark: 'Shelfmark',
              auction_record: 'Auction record', dealer_record: 'Dealer record',
              receipt: 'Receipt', oral_history: 'Oral history',
            }
            return labels[t] || t
          }).join(', ')
        : null

      // Owner name with optional evidence prefix
      if (evidenceLabel && entry.ownerType !== 'self') {
        parts.push(`${evidenceLabel} of ${entry.ownerName}`)
      } else if (entry.ownerType === 'self') {
        parts.push(entry.ownerName)
      } else {
        parts.push(entry.ownerName)
      }

      // Dates
      const dates = [entry.dateFrom, entry.dateTo].filter(Boolean)
      if (dates.length > 0) {
        parts.push(`(${dates.join('–')})`)
      }

      // Transaction detail (e.g. "Sotheby's London, lot 85, 2 Nov 1977")
      if (entry.transactionDetail) {
        parts.push(entry.transactionDetail)
      } else if (entry.transactionType && entry.transactionType !== 'unknown') {
        const txLabels: Record<string, string> = {
          purchase: 'Purchased', auction: 'Sold at auction', dealer: 'Acquired from dealer',
          gift: 'Gift', presentation: 'Presentation by author', inheritance: 'Inherited',
        }
        parts.push(txLabels[entry.transactionType] || '')
      }

      // Association note
      if (entry.associationType && entry.associationType !== 'none') {
        const assocLabels: Record<string, string> = {
          dedication_copy: 'dedication copy', association_copy: 'association copy',
          presentation_copy: 'presentation copy', inscribed: 'inscribed by author',
          signed: 'signed by author', authors_copy: "author's own copy",
          annotated: 'annotated by notable person', from_notable_collection: 'from notable collection',
          ex_library: 'ex-library', review_copy: 'review copy',
          subscriber_copy: 'subscriber copy', prize_copy: 'prize/award copy',
          working_copy: 'working copy',
        }
        const label = assocLabels[entry.associationType] || ''
        if (entry.associationNote) {
          parts.push(`[${label}: ${entry.associationNote}]`)
        } else if (label) {
          parts.push(`[${label}]`)
        }
      }

      return parts.filter(Boolean).join(' ')
    })
    notes.push(t['provenance'] + ': ' + chain.join(' — '))
  }
  
  // Illustrations description (detailed)
  if (book.illustrations_description) {
    notes.push(t['illustrations'] + ': ' + book.illustrations_description)
  }
  
  // Signatures/collation formula
  if (book.signatures_description) {
    notes.push(t['signatures'] + ': ' + book.signatures_description)
  }
  
  // Condition (always show grade, notes only if present)
  if (book.condition_name) {
    let conditionText = t['condition'] + ': ' + book.condition_name
    if (book.condition_notes) {
      conditionText += '. ' + book.condition_notes
    }
    notes.push(conditionText)
  }
  
  if (notes.length > 0) {
    parts.push(notes.join('. '))
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // AREA 8: STANDARD NUMBER AND TERMS OF AVAILABILITY
  // ═══════════════════════════════════════════════════════════════════════════
  
  const identifiers: string[] = []
  
  if (book.isbn_13) {
    identifiers.push('ISBN ' + book.isbn_13)
  } else if (book.isbn_10) {
    identifiers.push('ISBN ' + book.isbn_10)
  }
  
  if (book.oclc_number) {
    identifiers.push('OCLC: ' + book.oclc_number)
  }
  
  if (book.lccn) {
    identifiers.push('LCCN: ' + book.lccn)
  }
  
  if (identifiers.length > 0) {
    parts.push(identifiers.join('. '))
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // COMBINE ALL AREAS WITH ISBD PUNCTUATION (". — ")
  // ═══════════════════════════════════════════════════════════════════════════
  
  return parts.join('. — ')
}

type CatalogEntryGeneratorProps = {
  book: BookData
  onGenerate: (entry: string) => void
}

export default function CatalogEntryGenerator({ book, onGenerate }: CatalogEntryGeneratorProps) {
  const [showModal, setShowModal] = useState(false)
  
  const handleGenerate = (lang: Language) => {
    const entry = generateCatalogEntry(book, lang)
    onGenerate(entry)
    setShowModal(false)
  }
  
  const languageOptions: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  ]
  
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
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-background border border-border shadow-lg p-6 w-full max-w-sm">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-semibold mb-4">Generate Catalog Entry</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Select language for labels:
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {languageOptions.map(opt => (
                <button
                  key={opt.code}
                  onClick={() => handleGenerate(opt.code)}
                  className="flex items-center gap-3 px-4 py-3 border border-border hover:bg-muted transition-colors text-left"
                >
                  <span className="text-2xl">{opt.flag}</span>
                  <span className="text-sm font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Export types and function for external use
export type { BookData, Contributor, Language }
export { generateCatalogEntry }
