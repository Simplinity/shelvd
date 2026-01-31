'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import BisacCombobox from '@/components/bisac-combobox'
import CatalogEntryGenerator from '@/components/catalog-entry-generator'
import { createClient } from '@/lib/supabase/client'

type Language = { id: string; name_en: string }
type Condition = { id: string; name: string }
type Binding = { id: string; name: string }
type BookFormat = { id: string; type: string | null; name: string; abbreviation: string | null }
type BisacCode = { code: string; subject: string }
type ContributorRole = { id: string; name: string }
type ExistingContributor = { id: string; name: string }

type ReferenceData = {
  languages: Language[]
  conditions: Condition[]
  bindings: Binding[]
  bookFormats: BookFormat[]
  bisacCodes: BisacCode[]
  contributorRoles: ContributorRole[]
  allContributors: ExistingContributor[]
  seriesList: string[]
  publisherList: string[]
  acquiredFromList: string[]
  storageLocationList: string[]
  shelfList: string[]
  shelfSectionList: string[]
  publicationPlaceList: string[]
  printingPlaceList: string[]
}

type Props = {
  referenceData: ReferenceData
}

// Form data type
type FormData = {
  title: string
  subtitle: string
  original_title: string
  language_id: string
  original_language_id: string
  series: string
  series_number: string
  status: string
  action_needed: string
  publisher_name: string
  publication_place: string
  publication_year: string
  printer: string
  printing_place: string
  edition: string
  impression: string
  issue_state: string
  edition_notes: string
  page_count: string
  pagination_description: string
  volumes: string
  height_mm: string
  width_mm: string
  depth_mm: string
  weight_grams: string
  cover_type: string
  binding_id: string
  format_id: string
  has_dust_jacket: boolean
  is_signed: boolean
  protective_enclosure: string
  condition_id: string
  dust_jacket_condition_id: string
  paper_type: string
  edge_treatment: string
  endpapers_type: string
  text_block_condition: string
  dedication_text: string
  colophon_text: string
  condition_notes: string
  isbn_13: string
  isbn_10: string
  oclc_number: string
  lccn: string
  user_catalog_id: string
  ddc: string
  lcc: string
  udc: string
  bisac_code: string
  bisac_code_2: string
  bisac_code_3: string
  topic: string
  storage_location: string
  shelf: string
  shelf_section: string
  acquired_from: string
  acquired_date: string
  acquired_price: string
  acquired_currency: string
  acquired_notes: string
  lowest_price: string
  highest_price: string
  estimated_value: string
  sales_price: string
  price_currency: string
  illustrations_description: string
  signatures_description: string
  provenance: string
  bibliography: string
  summary: string
  catalog_entry: string
  internal_notes: string
}

// Initial empty form data (all strings for simplicity)
const initialFormData: FormData = {
  title: '',
  subtitle: '',
  original_title: '',
  language_id: '',
  original_language_id: '',
  series: '',
  series_number: '',
  status: 'in_collection',
  action_needed: 'none',
  publisher_name: '',
  publication_place: '',
  publication_year: '',
  printer: '',
  printing_place: '',
  edition: '',
  impression: '',
  issue_state: '',
  edition_notes: '',
  page_count: '',
  pagination_description: '',
  volumes: '',
  height_mm: '',
  width_mm: '',
  depth_mm: '',
  weight_grams: '',
  cover_type: '',
  binding_id: '',
  format_id: '',
  has_dust_jacket: false,
  is_signed: false,
  protective_enclosure: 'none',
  condition_id: '',
  dust_jacket_condition_id: '',
  paper_type: '',
  edge_treatment: '',
  endpapers_type: '',
  text_block_condition: '',
  dedication_text: '',
  colophon_text: '',
  condition_notes: '',
  isbn_13: '',
  isbn_10: '',
  oclc_number: '',
  lccn: '',
  user_catalog_id: '',
  ddc: '',
  lcc: '',
  udc: '',
  bisac_code: '',
  bisac_code_2: '',
  bisac_code_3: '',
  topic: '',
  storage_location: '',
  shelf: '',
  shelf_section: '',
  acquired_from: '',
  acquired_date: '',
  acquired_price: '',
  acquired_currency: '',
  acquired_notes: '',
  lowest_price: '',
  highest_price: '',
  estimated_value: '',
  sales_price: '',
  price_currency: '',
  illustrations_description: '',
  signatures_description: '',
  provenance: '',
  bibliography: '',
  summary: '',
  catalog_entry: '',
  internal_notes: '',
}

// Local contributor state
type LocalContributor = {
  tempId: string
  contributorName: string
  roleId: string
  roleName: string
}

// Status options
const statusOptions = [
  { value: 'in_collection', label: 'In Collection' },
  { value: 'lent', label: 'Lent' },
  { value: 'borrowed', label: 'Borrowed' },
  { value: 'double', label: 'Double' },
  { value: 'to_sell', label: 'To Sell' },
  { value: 'on_sale', label: 'On Sale' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'sold', label: 'Sold' },
  { value: 'ordered', label: 'Ordered' },
  { value: 'lost', label: 'Lost' },
  { value: 'donated', label: 'Donated' },
  { value: 'destroyed', label: 'Destroyed' },
  { value: 'unknown', label: 'Unknown' },
]

const actionNeededOptions = [
  { value: 'none', label: 'None' },
  { value: 'repair', label: 'Repair' },
  { value: 'bind', label: 'Bind' },
  { value: 'replace', label: 'Replace' },
]

const coverTypeOptions = [
  { value: 'softcover', label: 'Softcover' },
  { value: 'softcover_dj', label: 'Softcover with dust jacket' },
  { value: 'hardcover', label: 'Hardcover' },
  { value: 'hardcover_dj', label: 'Hardcover with dust jacket' },
  { value: 'full_leather_hardcover', label: 'Full leather hardcover' },
  { value: 'full_cloth_hardcover', label: 'Full cloth hardcover' },
  { value: 'quarter_leather_paper', label: 'Quarter binding (leather-paper)' },
  { value: 'half_leather_paper', label: 'Half binding (leather-paper)' },
  { value: 'library_binding', label: 'Library binding' },
  { value: 'original_wraps', label: 'Original wraps' },
  { value: 'printed_wrappers', label: 'Printed wrappers' },
]

const protectiveEnclosureOptions = [
  { value: 'none', label: 'None' },
  { value: 'slipcase_publisher', label: "Slipcase (publisher's)" },
  { value: 'slipcase_custom', label: 'Slipcase (custom)' },
  { value: 'clamshell_box', label: 'Clamshell box' },
  { value: 'chemise', label: 'Chemise' },
  { value: 'solander_box', label: 'Solander box' },
]

const paperTypeOptions = [
  { value: 'wove', label: 'Wove paper' },
  { value: 'laid', label: 'Laid paper' },
  { value: 'rag', label: 'Rag paper' },
  { value: 'wood_pulp', label: 'Wood pulp paper' },
  { value: 'acid_free', label: 'Acid-free paper' },
  { value: 'vellum', label: 'Vellum' },
  { value: 'parchment', label: 'Parchment' },
  { value: 'japan', label: 'Japan paper' },
  { value: 'india', label: 'India paper' },
  { value: 'handmade', label: 'Handmade paper' },
  { value: 'machine_made', label: 'Machine-made paper' },
  { value: 'coated', label: 'Coated paper' },
  { value: 'uncoated', label: 'Uncoated paper' },
  { value: 'calendered', label: 'Calendered paper' },
  { value: 'rice', label: 'Rice paper' },
  { value: 'tapa', label: 'Tapa/bark cloth' },
]

const edgeTreatmentOptions = [
  { value: 'untrimmed', label: 'Untrimmed' },
  { value: 'uncut', label: 'Uncut' },
  { value: 'rough_cut', label: 'Rough cut' },
  { value: 'trimmed', label: 'Trimmed' },
  { value: 'gilt_all', label: 'Gilt (all edges)' },
  { value: 'gilt_top', label: 'Gilt (top edge only)' },
  { value: 'gilt_fore', label: 'Gilt (fore-edge)' },
  { value: 'silver', label: 'Silver edges' },
  { value: 'gauffered', label: 'Gauffered' },
  { value: 'painted', label: 'Painted edges' },
  { value: 'fore_edge_painting', label: 'Fore-edge painting' },
  { value: 'sprinkled', label: 'Sprinkled' },
  { value: 'stained', label: 'Stained' },
  { value: 'marbled', label: 'Marbled edges' },
  { value: 'deckle', label: 'Deckle edges' },
  { value: 'red_edges', label: 'Red stained' },
  { value: 'blue_edges', label: 'Blue stained' },
  { value: 'yellow_edges', label: 'Yellow stained' },
]

const endpapersTypeOptions = [
  { value: 'plain_white', label: 'Plain white' },
  { value: 'plain_colored', label: 'Plain colored' },
  { value: 'marbled', label: 'Marbled' },
  { value: 'combed_marbled', label: 'Combed marbled' },
  { value: 'paste_paper', label: 'Paste paper' },
  { value: 'printed', label: 'Printed' },
  { value: 'illustrated', label: 'Illustrated' },
  { value: 'maps', label: 'Maps' },
  { value: 'photographic', label: 'Photographic' },
  { value: 'decorative', label: 'Decorative pattern' },
  { value: 'self_ends', label: 'Self-ends' },
  { value: 'cloth', label: 'Cloth' },
  { value: 'leather', label: 'Leather doublures' },
  { value: 'silk', label: 'Silk' },
  { value: 'vellum', label: 'Vellum' },
  { value: 'none', label: 'None' },
]

const textBlockConditionOptions = [
  { value: 'tight', label: 'Tight' },
  { value: 'solid', label: 'Solid' },
  { value: 'sound', label: 'Sound' },
  { value: 'tender', label: 'Tender' },
  { value: 'shaken', label: 'Shaken' },
  { value: 'loose', label: 'Loose' },
  { value: 'detached', label: 'Detached' },
  { value: 'broken', label: 'Broken' },
  { value: 'recased', label: 'Recased' },
  { value: 'rebacked', label: 'Rebacked' },
  { value: 'rebound', label: 'Rebound' },
]

// Input class for consistent styling
const inputClass = "w-full h-10 px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
const labelClass = "block text-xs uppercase tracking-wide text-muted-foreground mb-1"

export default function BookAddForm({ referenceData }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isDirty, setIsDirty] = useState(false)
  
  // Contributors state
  const [contributors, setContributors] = useState<LocalContributor[]>([])
  const [newContributorName, setNewContributorName] = useState('')
  const [newContributorRoleId, setNewContributorRoleId] = useState('')

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }

  // Add a new contributor
  const handleAddContributor = () => {
    if (!newContributorName.trim() || !newContributorRoleId) return
    
    const role = referenceData.contributorRoles.find(r => r.id === newContributorRoleId)
    if (!role) return

    setContributors(prev => [...prev, {
      tempId: `new-${Date.now()}`,
      contributorName: newContributorName.trim(),
      roleId: newContributorRoleId,
      roleName: role.name,
    }])
    
    setNewContributorName('')
    setNewContributorRoleId('')
    setIsDirty(true)
  }

  // Remove a contributor
  const handleRemoveContributor = (tempId: string) => {
    setContributors(prev => prev.filter(c => c.tempId !== tempId))
    setIsDirty(true)
  }

  // Handle cancel with unsaved changes warning
  const handleCancel = (e: React.MouseEvent) => {
    if (isDirty) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        e.preventDefault()
      }
    }
  }

  // Contributors for catalog entry
  const contributorsForCatalog = contributors.map(c => ({
    name: c.contributorName,
    role: c.roleName
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }
    
    setSaving(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Convert string values to proper types for database
      const { data: newBook, error: insertError } = await supabase
        .from('books')
        .insert({
          user_id: user.id,
          title: formData.title.trim(),
          subtitle: formData.subtitle || null,
          original_title: formData.original_title || null,
          language_id: formData.language_id || null,
          original_language_id: formData.original_language_id || null,
          series: formData.series || null,
          series_number: formData.series_number || null,
          status: formData.status,
          action_needed: formData.action_needed,
          publisher_name: formData.publisher_name || null,
          publication_place: formData.publication_place || null,
          publication_year: formData.publication_year || null,
          printer: formData.printer || null,
          printing_place: formData.printing_place || null,
          edition: formData.edition || null,
          impression: formData.impression || null,
          issue_state: formData.issue_state || null,
          edition_notes: formData.edition_notes || null,
          page_count: formData.page_count ? parseInt(formData.page_count) : null,
          pagination_description: formData.pagination_description || null,
          volumes: formData.volumes || null,
          height_mm: formData.height_mm ? parseFloat(formData.height_mm) : null,
          width_mm: formData.width_mm ? parseFloat(formData.width_mm) : null,
          depth_mm: formData.depth_mm ? parseFloat(formData.depth_mm) : null,
          weight_grams: formData.weight_grams ? parseFloat(formData.weight_grams) : null,
          cover_type: formData.cover_type || null,
          binding_id: formData.binding_id || null,
          format_id: formData.format_id || null,
          has_dust_jacket: formData.has_dust_jacket,
          is_signed: formData.is_signed,
          protective_enclosure: formData.protective_enclosure,
          condition_id: formData.condition_id || null,
          dust_jacket_condition_id: formData.dust_jacket_condition_id || null,
          paper_type: formData.paper_type || null,
          edge_treatment: formData.edge_treatment || null,
          endpapers_type: formData.endpapers_type || null,
          text_block_condition: formData.text_block_condition || null,
          dedication_text: formData.dedication_text || null,
          colophon_text: formData.colophon_text || null,
          condition_notes: formData.condition_notes || null,
          isbn_13: formData.isbn_13 || null,
          isbn_10: formData.isbn_10 || null,
          oclc_number: formData.oclc_number || null,
          lccn: formData.lccn || null,
          user_catalog_id: formData.user_catalog_id || null,
          ddc: formData.ddc || null,
          lcc: formData.lcc || null,
          udc: formData.udc || null,
          bisac_code: formData.bisac_code || null,
          bisac_code_2: formData.bisac_code_2 || null,
          bisac_code_3: formData.bisac_code_3 || null,
          topic: formData.topic || null,
          storage_location: formData.storage_location || null,
          shelf: formData.shelf || null,
          shelf_section: formData.shelf_section || null,
          acquired_from: formData.acquired_from || null,
          acquired_date: formData.acquired_date || null,
          acquired_price: formData.acquired_price ? parseFloat(formData.acquired_price) : null,
          acquired_currency: formData.acquired_currency || null,
          acquired_notes: formData.acquired_notes || null,
          lowest_price: formData.lowest_price ? parseFloat(formData.lowest_price) : null,
          highest_price: formData.highest_price ? parseFloat(formData.highest_price) : null,
          estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
          sales_price: formData.sales_price ? parseFloat(formData.sales_price) : null,
          price_currency: formData.price_currency || null,
          illustrations_description: formData.illustrations_description || null,
          signatures_description: formData.signatures_description || null,
          provenance: formData.provenance || null,
          bibliography: formData.bibliography || null,
          summary: formData.summary || null,
          catalog_entry: formData.catalog_entry || null,
          internal_notes: formData.internal_notes || null,
        })
        .select('id')
        .single()

      if (insertError || !newBook) throw insertError || new Error('Failed to create book')

      // Add contributors
      for (const nc of contributors) {
        let contributorId: string
        const existing = referenceData.allContributors.find(
          c => c.name.toLowerCase() === nc.contributorName.toLowerCase()
        )
        
        if (existing) {
          contributorId = existing.id
        } else {
          const { data: newContributor, error: createError } = await supabase
            .from('contributors')
            .insert({ 
              canonical_name: nc.contributorName,
              sort_name: nc.contributorName,
              created_by_user_id: user.id
            })
            .select('id')
            .single()
          
          if (createError || !newContributor) throw createError || new Error('Failed to create contributor')
          contributorId = newContributor.id
        }

        const { error: linkError } = await supabase
          .from('book_contributors')
          .insert({
            book_id: newBook.id,
            contributor_id: contributorId,
            role_id: nc.roleId
          })
        
        if (linkError) throw linkError
      }

      router.push(`/books/${newBook.id}`)
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save'
      setError(message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/books" onClick={handleCancel} className="p-2 hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Add Book</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/books" onClick={handleCancel}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" />Save</>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-8">
        {/* 1. Title & Series */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Title & Series</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Title <span className="text-red-500">*</span></label>
              <input type="text" value={formData.title} onChange={e => handleChange('title', e.target.value)} required className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Subtitle</label>
              <input type="text" value={formData.subtitle} onChange={e => handleChange('subtitle', e.target.value)} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Original Title</label>
              <input type="text" value={formData.original_title} onChange={e => handleChange('original_title', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Series</label>
              <input type="text" list="series-list" value={formData.series} onChange={e => handleChange('series', e.target.value)} className={inputClass} />
              <datalist id="series-list">{referenceData.seriesList.map(s => <option key={s} value={s} />)}</datalist>
            </div>
            <div>
              <label className={labelClass}>Series Number</label>
              <input type="text" value={formData.series_number} onChange={e => handleChange('series_number', e.target.value)} className={inputClass} />
            </div>
          </div>
        </section>

        {/* 2. Contributors */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Contributors</h2>
          
          {contributors.length > 0 && (
            <div className="mb-4 space-y-2">
              {contributors.map(c => (
                <div key={c.tempId} className="flex items-center gap-3 p-2 bg-muted/50 border border-border">
                  <div className="flex-1">
                    <span className="font-medium">{c.contributorName}</span>
                    <span className="text-muted-foreground mx-2">—</span>
                    <span className="text-muted-foreground">{c.roleName}</span>
                  </div>
                  <button type="button" onClick={() => handleRemoveContributor(c.tempId)} className="p-1 text-muted-foreground hover:text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className={labelClass}>Name</label>
              <input type="text" list="contributors-list" value={newContributorName} onChange={e => setNewContributorName(e.target.value)} placeholder="Type or select name" className={inputClass} />
              <datalist id="contributors-list">{referenceData.allContributors.map(c => <option key={c.id} value={c.name} />)}</datalist>
            </div>
            <div className="w-48">
              <label className={labelClass}>Role</label>
              <select value={newContributorRoleId} onChange={e => setNewContributorRoleId(e.target.value)} className={inputClass}>
                <option value="">Select role...</option>
                {referenceData.contributorRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <Button type="button" variant="outline" onClick={handleAddContributor} disabled={!newContributorName.trim() || !newContributorRoleId} className="h-10">
              <Plus className="w-4 h-4 mr-1" />Add
            </Button>
          </div>
        </section>

        {/* 3. Language */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Language</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Language</label>
              <select value={formData.language_id} onChange={e => handleChange('language_id', e.target.value)} className={inputClass}>
                <option value="">—</option>
                {referenceData.languages.map(l => <option key={l.id} value={l.id}>{l.name_en}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Original Language</label>
              <select value={formData.original_language_id} onChange={e => handleChange('original_language_id', e.target.value)} className={inputClass}>
                <option value="">—</option>
                {referenceData.languages.map(l => <option key={l.id} value={l.id}>{l.name_en}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* 4. Publication */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Publication</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Publisher</label>
              <input type="text" list="publisher-list" value={formData.publisher_name} onChange={e => handleChange('publisher_name', e.target.value)} className={inputClass} />
              <datalist id="publisher-list">{referenceData.publisherList.map(p => <option key={p} value={p} />)}</datalist>
            </div>
            <div>
              <label className={labelClass}>Place Published</label>
              <input type="text" list="pubplace-list" value={formData.publication_place} onChange={e => handleChange('publication_place', e.target.value)} className={inputClass} />
              <datalist id="pubplace-list">{referenceData.publicationPlaceList.map(p => <option key={p} value={p} />)}</datalist>
            </div>
            <div>
              <label className={labelClass}>Year Published</label>
              <input type="text" value={formData.publication_year} onChange={e => handleChange('publication_year', e.target.value)} placeholder="1969" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Printer</label>
              <input type="text" value={formData.printer} onChange={e => handleChange('printer', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Place Printed</label>
              <input type="text" list="printplace-list" value={formData.printing_place} onChange={e => handleChange('printing_place', e.target.value)} className={inputClass} />
              <datalist id="printplace-list">{referenceData.printingPlaceList.map(p => <option key={p} value={p} />)}</datalist>
            </div>
          </div>
        </section>

        {/* 5. Edition */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Edition</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Edition</label>
              <input type="text" value={formData.edition} onChange={e => handleChange('edition', e.target.value)} placeholder="First Edition" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Impression</label>
              <input type="text" value={formData.impression} onChange={e => handleChange('impression', e.target.value)} placeholder="First Impression" className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Issue State</label>
              <input type="text" value={formData.issue_state} onChange={e => handleChange('issue_state', e.target.value)} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Edition Notes</label>
              <textarea value={formData.edition_notes} onChange={e => handleChange('edition_notes', e.target.value)} rows={2} className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground resize-y" />
            </div>
          </div>
        </section>

        {/* 6. Physical Description */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Physical Description</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Pagination</label>
              <input type="text" value={formData.pagination_description} onChange={e => handleChange('pagination_description', e.target.value)} placeholder="xvi, 352 p." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Volumes</label>
              <input type="text" value={formData.volumes} onChange={e => handleChange('volumes', e.target.value)} className={inputClass} />
            </div>
            <div />
            <div>
              <label className={labelClass}>Height (mm)</label>
              <input type="number" value={formData.height_mm} onChange={e => handleChange('height_mm', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Width (mm)</label>
              <input type="number" value={formData.width_mm} onChange={e => handleChange('width_mm', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Depth (mm)</label>
              <input type="number" value={formData.depth_mm} onChange={e => handleChange('depth_mm', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Weight (g)</label>
              <input type="number" value={formData.weight_grams} onChange={e => handleChange('weight_grams', e.target.value)} className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Cover Type</label>
              <select value={formData.cover_type} onChange={e => handleChange('cover_type', e.target.value)} className={inputClass}>
                <option value="">—</option>
                {coverTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Binding</label>
              <select value={formData.binding_id} onChange={e => handleChange('binding_id', e.target.value)} className={inputClass}>
                <option value="">—</option>
                {referenceData.bindings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Book Format</label>
              <select value={formData.format_id} onChange={e => handleChange('format_id', e.target.value)} className={inputClass}>
                <option value="">—</option>
                {referenceData.bookFormats.map(f => <option key={f.id} value={f.id}>{f.abbreviation ? `${f.name} (${f.abbreviation})` : f.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Protective Enclosure</label>
              <select value={formData.protective_enclosure} onChange={e => handleChange('protective_enclosure', e.target.value)} className={inputClass}>
                {protectiveEnclosureOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Paper Type</label>
              <select value={formData.paper_type} onChange={e => handleChange('paper_type', e.target.value)} className={inputClass}>
                <option value="">—</option>
                {paperTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Edge Treatment</label>
              <select value={formData.edge_treatment} onChange={e => handleChange('edge_treatment', e.target.value)} className={inputClass}>
                <option value="">—</option>
                {edgeTreatmentOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Endpapers</label>
              <select value={formData.endpapers_type} onChange={e => handleChange('endpapers_type', e.target.value)} className={inputClass}>
                <option value="">—</option>
                {endpapersTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Text Block</label>
              <select value={formData.text_block_condition} onChange={e => handleChange('text_block_condition', e.target.value)} className={inputClass}>
                <option value="">—</option>
                {textBlockConditionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="col-span-2 flex items-end gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.has_dust_jacket} onChange={e => handleChange('has_dust_jacket', e.target.checked)} className="w-4 h-4" />
                <span className="text-sm">Has Dust Jacket</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.is_signed} onChange={e => handleChange('is_signed', e.target.checked)} className="w-4 h-4" />
                <span className="text-sm">Signed</span>
              </label>
            </div>
          </div>
        </section>

        {/* 7. Condition & Status */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Condition & Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Condition</label>
              <select value={formData.condition_id} onChange={e => handleChange('condition_id', e.target.value)} className={inputClass}>
                <option value="">—</option>
                {referenceData.conditions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Dust Jacket Condition</label>
              <select value={formData.dust_jacket_condition_id} onChange={e => handleChange('dust_jacket_condition_id', e.target.value)} className={inputClass}>
                <option value="">—</option>
                {referenceData.conditions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={formData.status} onChange={e => handleChange('status', e.target.value)} className={inputClass}>
                {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Action Needed</label>
              <select value={formData.action_needed} onChange={e => handleChange('action_needed', e.target.value)} className={inputClass}>
                {actionNeededOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div />
            <div className="md:col-span-2">
              <label className={labelClass}>Condition Notes</label>
              <textarea value={formData.condition_notes} onChange={e => handleChange('condition_notes', e.target.value)} rows={3} className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground resize-y" />
            </div>
          </div>
        </section>

        {/* 8. Identifiers */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Identifiers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>ISBN-13</label>
              <input type="text" value={formData.isbn_13} onChange={e => handleChange('isbn_13', e.target.value)} placeholder="978-0-123456-78-9" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>ISBN-10</label>
              <input type="text" value={formData.isbn_10} onChange={e => handleChange('isbn_10', e.target.value)} placeholder="0-123456-78-9" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>OCLC Number</label>
              <input type="text" value={formData.oclc_number} onChange={e => handleChange('oclc_number', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>LCCN</label>
              <input type="text" value={formData.lccn} onChange={e => handleChange('lccn', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Catalog ID</label>
              <input type="text" value={formData.user_catalog_id} onChange={e => handleChange('user_catalog_id', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>DDC</label>
              <input type="text" value={formData.ddc} onChange={e => handleChange('ddc', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>LCC</label>
              <input type="text" value={formData.lcc} onChange={e => handleChange('lcc', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>UDC</label>
              <input type="text" value={formData.udc} onChange={e => handleChange('udc', e.target.value)} className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Topic</label>
              <input type="text" value={formData.topic} onChange={e => handleChange('topic', e.target.value)} className={inputClass} />
            </div>
          </div>
        </section>

        {/* 9. BISAC Subject Codes */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">BISAC Subject Codes</h2>
          <div className="space-y-4">
            <BisacCombobox label="Primary BISAC" value={formData.bisac_code || null} onChange={(value) => handleChange('bisac_code', value || '')} options={referenceData.bisacCodes} placeholder="Search BISAC codes..." />
            <BisacCombobox label="Secondary BISAC" value={formData.bisac_code_2 || null} onChange={(value) => handleChange('bisac_code_2', value || '')} options={referenceData.bisacCodes} placeholder="Optional..." />
            <BisacCombobox label="Tertiary BISAC" value={formData.bisac_code_3 || null} onChange={(value) => handleChange('bisac_code_3', value || '')} options={referenceData.bisacCodes} placeholder="Optional..." />
          </div>
        </section>

        {/* 10. Storage */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Storage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Location</label>
              <input type="text" list="location-list" value={formData.storage_location} onChange={e => handleChange('storage_location', e.target.value)} className={inputClass} />
              <datalist id="location-list">{referenceData.storageLocationList.map(l => <option key={l} value={l} />)}</datalist>
            </div>
            <div>
              <label className={labelClass}>Shelf</label>
              <input type="text" list="shelf-list" value={formData.shelf} onChange={e => handleChange('shelf', e.target.value)} className={inputClass} />
              <datalist id="shelf-list">{referenceData.shelfList.map(s => <option key={s} value={s} />)}</datalist>
            </div>
            <div>
              <label className={labelClass}>Section</label>
              <input type="text" list="section-list" value={formData.shelf_section} onChange={e => handleChange('shelf_section', e.target.value)} className={inputClass} />
              <datalist id="section-list">{referenceData.shelfSectionList.map(s => <option key={s} value={s} />)}</datalist>
            </div>
          </div>
        </section>

        {/* 11. Acquisition */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Acquisition</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className={labelClass}>Acquired From</label>
              <input type="text" list="acquired-list" value={formData.acquired_from} onChange={e => handleChange('acquired_from', e.target.value)} className={inputClass} />
              <datalist id="acquired-list">{referenceData.acquiredFromList.map(a => <option key={a} value={a} />)}</datalist>
            </div>
            <div>
              <label className={labelClass}>Date</label>
              <input type="text" value={formData.acquired_date} onChange={e => handleChange('acquired_date', e.target.value)} placeholder="YYYY-MM-DD" className={inputClass} />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className={labelClass}>Price Paid</label>
                <input type="number" step="0.01" value={formData.acquired_price} onChange={e => handleChange('acquired_price', e.target.value)} className={inputClass} />
              </div>
              <div className="w-20">
                <label className={labelClass}>Currency</label>
                <input type="text" value={formData.acquired_currency} onChange={e => handleChange('acquired_currency', e.target.value)} placeholder="EUR" className={inputClass} />
              </div>
            </div>
            <div className="lg:col-span-4">
              <label className={labelClass}>Acquisition Notes</label>
              <textarea value={formData.acquired_notes} onChange={e => handleChange('acquired_notes', e.target.value)} rows={2} className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground resize-y" />
            </div>
          </div>
        </section>

        {/* 12. Valuation */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Valuation</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className={labelClass}>Lowest Price</label>
              <input type="number" step="0.01" value={formData.lowest_price} onChange={e => handleChange('lowest_price', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Highest Price</label>
              <input type="number" step="0.01" value={formData.highest_price} onChange={e => handleChange('highest_price', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Estimated Value</label>
              <input type="number" step="0.01" value={formData.estimated_value} onChange={e => handleChange('estimated_value', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Sales Price</label>
              <input type="number" step="0.01" value={formData.sales_price} onChange={e => handleChange('sales_price', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Currency</label>
              <input type="text" value={formData.price_currency} onChange={e => handleChange('price_currency', e.target.value)} placeholder="EUR" className={inputClass} />
            </div>
          </div>
        </section>

        {/* 13. Notes */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Notes</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Summary</label>
              <textarea value={formData.summary} onChange={e => handleChange('summary', e.target.value)} rows={3} className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground resize-y" />
            </div>
            <div>
              <label className={labelClass}>Provenance</label>
              <textarea value={formData.provenance} onChange={e => handleChange('provenance', e.target.value)} rows={2} className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground resize-y" />
            </div>
            <div>
              <label className={labelClass}>Dedication / Inscription</label>
              <textarea value={formData.dedication_text} onChange={e => handleChange('dedication_text', e.target.value)} rows={2} placeholder="Transcription of dedication or inscription" className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground resize-y" />
            </div>
            <div>
              <label className={labelClass}>Colophon</label>
              <textarea value={formData.colophon_text} onChange={e => handleChange('colophon_text', e.target.value)} rows={2} placeholder="Transcription of colophon" className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground resize-y" />
            </div>
            <div>
              <label className={labelClass}>Bibliography</label>
              <textarea value={formData.bibliography} onChange={e => handleChange('bibliography', e.target.value)} rows={2} className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground resize-y" />
            </div>
            <div>
              <label className={labelClass}>Illustrations Description</label>
              <textarea value={formData.illustrations_description} onChange={e => handleChange('illustrations_description', e.target.value)} rows={2} className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground resize-y" />
            </div>
            <div>
              <label className={labelClass}>Signatures Description</label>
              <textarea value={formData.signatures_description} onChange={e => handleChange('signatures_description', e.target.value)} rows={2} className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground resize-y" />
            </div>
            <div>
              <label className={labelClass}>Private Notes</label>
              <textarea value={formData.internal_notes} onChange={e => handleChange('internal_notes', e.target.value)} rows={3} className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground resize-y" />
            </div>
          </div>
        </section>

        {/* 14. Catalog Entry */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Catalog Entry</h2>
          <div className="mb-4">
            <CatalogEntryGenerator
              book={{
                title: formData.title,
                subtitle: formData.subtitle || null,
                original_title: formData.original_title || null,
                series: formData.series || null,
                series_number: formData.series_number || null,
                publisher_name: formData.publisher_name || null,
                publication_place: formData.publication_place || null,
                publication_year: formData.publication_year || null,
                printer: formData.printer || null,
                printing_place: formData.printing_place || null,
                edition: formData.edition || null,
                impression: formData.impression || null,
                issue_state: formData.issue_state || null,
                edition_notes: formData.edition_notes || null,
                pagination_description: formData.pagination_description || null,
                page_count: formData.page_count ? parseInt(formData.page_count) : null,
                volumes: formData.volumes || null,
                height_mm: formData.height_mm ? parseFloat(formData.height_mm) : null,
                width_mm: formData.width_mm ? parseFloat(formData.width_mm) : null,
                cover_type: formData.cover_type || null,
                binding_name: referenceData.bindings.find(b => b.id === formData.binding_id)?.name || null,
                format_name: referenceData.bookFormats.find(f => f.id === formData.format_id)?.name || null,
                format_abbreviation: referenceData.bookFormats.find(f => f.id === formData.format_id)?.abbreviation || null,
                has_dust_jacket: formData.has_dust_jacket,
                is_signed: formData.is_signed,
                condition_name: referenceData.conditions.find(c => c.id === formData.condition_id)?.name || null,
                condition_notes: formData.condition_notes || null,
                bibliography: formData.bibliography || null,
                provenance: formData.provenance || null,
                illustrations_description: formData.illustrations_description || null,
                signatures_description: formData.signatures_description || null,
                isbn_13: formData.isbn_13 || null,
                isbn_10: formData.isbn_10 || null,
                oclc_number: formData.oclc_number || null,
                lccn: formData.lccn || null,
                contributors: contributorsForCatalog,
              }}
              onGenerate={(entry) => handleChange('catalog_entry', entry)}
            />
          </div>
          <div>
            <label className={labelClass}>Full Catalog Entry</label>
            <textarea value={formData.catalog_entry} onChange={e => handleChange('catalog_entry', e.target.value)} rows={4} className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground resize-y" />
          </div>
        </section>

        {/* Submit buttons at bottom */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" asChild>
            <Link href="/books" onClick={handleCancel}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" />Save Book</>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
