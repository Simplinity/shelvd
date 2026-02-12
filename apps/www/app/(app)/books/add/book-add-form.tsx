'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Plus, X, ExternalLink as ExternalLinkIcon, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { EnrichButton, EnrichDropdown, useEnrich } from '@/components/enrich-panel'
import { Button } from '@/components/ui/button'
import BisacCombobox from '@/components/bisac-combobox'
import CatalogEntryGenerator from '@/components/catalog-entry-generator'
import { createClient } from '@/lib/supabase/client'
import { CURRENCIES } from '@/lib/currencies'
import TagInput from '@/components/tag-input'
import { toCatalogFormat, parseName, isSameAuthor } from '@/lib/name-utils'
import ProvenanceEditor, { type ProvenanceEntry } from '@/components/provenance-editor'
import ConditionHistoryEditor, { type ConditionHistoryEntry } from '@/components/condition-history-editor'
import FieldHelp from '@/components/field-help'
import { FIELD_HELP } from '@/lib/field-help-texts'
import { logActivity } from '@/lib/actions/activity-log'
import { bookLabel } from '@/lib/activity-utils'

type Language = { id: string; name_en: string }
type Condition = { id: string; name: string }
type Binding = { id: string; name: string }
type BookFormat = { id: string; type: string | null; name: string; abbreviation: string | null }
type BisacCode = { code: string; subject: string }
type ContributorRole = { id: string; name: string }
type ExistingContributor = { id: string; name: string }
type LinkType = { id: string; label: string; domain: string | null; category: string; sort_order: number | null; is_system: boolean | null }

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
  storageLocationList: string[]
  shelfList: string[]
  shelfSectionList: string[]
  publicationPlaceList: string[]
  printingPlaceList: string[]
  linkTypes: LinkType[]
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
  cover_image_url: string
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
  sales_price: string
  price_currency: string
  illustrations_description: string
  signatures_description: string
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
  cover_image_url: '',
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
  sales_price: '',
  price_currency: '',
  illustrations_description: '',
  signatures_description: '',
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
  { value: 'draft', label: 'Draft' },
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
const inputClass = "w-full h-10 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-muted/30 focus:outline-none focus:ring-1 focus:ring-foreground focus:bg-background transition-colors"
const labelClass = "flex items-center text-xs uppercase tracking-wide text-muted-foreground mb-1"
const textareaClass = "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-muted/30 focus:outline-none focus:ring-1 focus:ring-foreground focus:bg-background transition-colors resize-y"

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

  // Collections state
  type CollectionOption = { id: string; name: string; is_default: boolean }
  const [availableCollections, setAvailableCollections] = useState<CollectionOption[]>([])
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<Set<string>>(new Set())

  // Tags state
  type TagItem = { id: string; name: string; color: string }
  const [selectedTags, setSelectedTags] = useState<TagItem[]>([])

  // External links state
  type ExternalLink = { linkTypeId: string; url: string; label: string }
  const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([])
  const [provenanceEntries, setProvenanceEntries] = useState<ProvenanceEntry[]>([])
  const [conditionHistoryEntries, setConditionHistoryEntries] = useState<ConditionHistoryEntry[]>([])
  
  // Track if data came from ISBN lookup
  const [fromLookup, setFromLookup] = useState(false)
  const [lookupProvider, setLookupProvider] = useState<string | null>(null)
  const [lookupCollectionIds, setLookupCollectionIds] = useState<string[] | null>(null)

  // Load ISBN lookup data from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('isbn_lookup_result')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        sessionStorage.removeItem('isbn_lookup_result')
        
        setFromLookup(true)
        setLookupProvider(data.lookup_provider || null)
        if (data.selected_collection_ids && Array.isArray(data.selected_collection_ids)) {
          setLookupCollectionIds(data.selected_collection_ids)
        }
        
        // Map lookup data to form fields
        const updates: Partial<FormData> = {
          status: 'draft', // Always set to draft for lookup results
        }
        
        if (data.title) updates.title = data.title
        if (data.subtitle) updates.subtitle = data.subtitle
        if (data.publisher) updates.publisher_name = data.publisher
        if (data.publication_year) updates.publication_year = data.publication_year
        if (data.publication_place) updates.publication_place = data.publication_place
        if (data.pages) updates.page_count = String(data.pages)
        if (data.pagination_description) updates.pagination_description = data.pagination_description
        if (data.isbn_13) updates.isbn_13 = data.isbn_13
        if (data.isbn_10) updates.isbn_10 = data.isbn_10
        if (data.lccn) updates.lccn = data.lccn
        if (data.oclc_number) updates.oclc_number = data.oclc_number
        if (data.ddc) updates.ddc = data.ddc
        if (data.lcc) updates.lcc = data.lcc
        if (data.series) updates.series = data.series
        if (data.series_number) updates.series_number = data.series_number
        if (data.edition) updates.edition = data.edition
        if (data.description) updates.summary = data.description
        if (data.subjects && data.subjects.length > 0) updates.topic = data.subjects.join(', ')
        if (data.notes) updates.bibliography = data.notes
        if (data.cover_url) updates.cover_image_url = data.cover_url
        
        setFormData(prev => ({ ...prev, ...updates }))
        
        // Add authors as contributors
        if (data.authors && Array.isArray(data.authors) && data.authors.length > 0) {
          // Find "Author" role
          const authorRole = referenceData.contributorRoles.find(
            r => r.name.toLowerCase() === 'author'
          )
          if (authorRole) {
            const newContributors: LocalContributor[] = data.authors.map((name: string, i: number) => ({
              tempId: `lookup-${i}-${Date.now()}`,
              contributorName: toCatalogFormat(name),
              roleId: authorRole.id,
              roleName: authorRole.name,
            }))
            setContributors(newContributors)
          }
        }
        
        // Auto-add external link from lookup source
        if (data.lookup_source_url) {
          const sourceUrl = data.lookup_source_url as string
          // Find matching link type by domain
          const matchingType = referenceData.linkTypes.find(lt => 
            lt.domain && sourceUrl.includes(lt.domain)
          )
          if (matchingType) {
            setExternalLinks([{
              linkTypeId: matchingType.id,
              url: sourceUrl,
              label: '',
            }])
          } else {
            // No matching type found, add as free-form link
            setExternalLinks([{
              linkTypeId: '',
              url: sourceUrl,
              label: data.lookup_provider || 'Lookup source',
            }])
          }
        }
        
        // Don't mark as dirty yet - user hasn't made changes
        setIsDirty(false)
      } catch (e) {
        console.error('Failed to parse lookup data:', e)
      }
    }
  }, [referenceData.contributorRoles])

  // Enrich panel
  const enrichAuthorName = contributors[0]?.contributorName || ''
  const enrichContributorNames = contributors.map(c => c.contributorName)
  const enrich = useEnrich(
    formData,
    enrichAuthorName,
    enrichContributorNames,
    (updates) => {
      setFormData(prev => ({ ...prev, ...updates } as any))
    },
    (authorNames) => {
      const authorRole = referenceData.contributorRoles.find(r => r.name.toLowerCase() === 'author')
      if (!authorRole) return
      const newContribs: LocalContributor[] = authorNames.map((name, i) => ({
        tempId: `enrich-${Date.now()}-${i}`,
        contributorName: name,
        roleId: authorRole.id,
        roleName: authorRole.name,
      }))
      setContributors(prev => [...prev, ...newContribs])
    },
  )

  // Fetch collections for multi-select
  useEffect(() => {
    const fetchCollections = async () => {
      const { data } = await supabase
        .from('collections')
        .select('id, name, is_default')
        .order('sort_order', { ascending: true })
      if (data) {
        setAvailableCollections(data as CollectionOption[])
        // If coming from lookup with pre-selected collections, use those
        if (lookupCollectionIds && lookupCollectionIds.length > 0) {
          setSelectedCollectionIds(new Set(lookupCollectionIds))
        } else {
          // Default: pre-select the "Library" collection
          const defaultCol = data.find((c: any) => c.is_default)
          if (defaultCol) {
            setSelectedCollectionIds(new Set([defaultCol.id]))
          }
        }
      }
    }
    fetchCollections()
  }, [lookupCollectionIds])

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
          cover_image_url: formData.cover_image_url || null,
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
          sales_price: formData.sales_price ? parseFloat(formData.sales_price) : null,
          price_currency: formData.price_currency || null,
          illustrations_description: formData.illustrations_description || null,
          signatures_description: formData.signatures_description || null,
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
        ) || referenceData.allContributors.find(
          c => isSameAuthor(c.name, nc.contributorName)
        )
        
        if (existing) {
          contributorId = existing.id
        } else {
          const parsed = parseName(nc.contributorName)
          const { data: newContributor, error: createError } = await supabase
            .from('contributors')
            .insert({ 
              canonical_name: parsed.canonical_name,
              sort_name: parsed.sort_name,
              display_name: parsed.display_name,
              family_name: parsed.family_name || null,
              given_names: parsed.given_names || null,
              type: parsed.type,
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

      // Add external links
      if (externalLinks.length > 0) {
        const linkRows = externalLinks
          .filter(l => l.url.trim() && !/^https?:\/\/[^/]+\/?$/.test(l.url.trim()))
          .map((l, i) => ({
            book_id: newBook.id,
            user_id: user.id,
            link_type_id: l.linkTypeId || null,
            label: l.label || null,
            url: l.url.trim(),
            sort_order: i,
          }))
        if (linkRows.length > 0) {
          const { error: linkErr } = await supabase.from('book_external_links').insert(linkRows)
          if (linkErr) console.error('Failed to save external links:', linkErr)
        }
      }

      // Add to selected collections
      if (selectedCollectionIds.size > 0) {
        const colRows = Array.from(selectedCollectionIds).map(colId => ({
          book_id: newBook.id,
          collection_id: colId,
        }))
        const { error: colErr } = await supabase.from('book_collections').insert(colRows)
        if (colErr) console.error('Failed to add book to collections:', colErr)
      }

      // Add tags
      if (selectedTags.length > 0) {
        const tagRows = selectedTags.map(t => ({
          book_id: newBook.id,
          tag_id: t.id,
        }))
        const { error: tagErr } = await supabase.from('book_tags').insert(tagRows)
        if (tagErr) console.error('Failed to save tags:', tagErr)
      }

      // Add provenance entries
      const activeProvEntries = provenanceEntries.filter(e => !e.isDeleted && e.ownerName.trim())
      for (const entry of activeProvEntries) {
        const { data: inserted, error: provErr } = await supabase
          .from('provenance_entries')
          .insert({
            book_id: newBook.id,
            position: entry.position,
            owner_name: entry.ownerName,
            owner_type: entry.ownerType,
            date_from: entry.dateFrom || null,
            date_to: entry.dateTo || null,
            evidence_type: entry.evidenceType,
            evidence_description: entry.evidenceDescription || null,
            transaction_type: entry.transactionType,
            transaction_detail: entry.transactionDetail || null,
            price_paid: entry.pricePaid,
            price_currency: entry.priceCurrency || null,
            association_type: entry.associationType,
            association_note: entry.associationNote || null,
            notes: entry.notes || null,
          })
          .select('id')
          .single()

        if (provErr || !inserted) {
          console.error('Failed to insert provenance entry:', provErr)
          continue
        }

        // Insert sources for this entry
        const activeSources = entry.sources.filter(s => !s.isDeleted && (s.title || s.url))
        for (const src of activeSources) {
          await supabase.from('provenance_sources').insert({
            provenance_entry_id: inserted.id,
            source_type: src.sourceType,
            title: src.title || null,
            url: src.url || null,
            reference: src.reference || null,
            notes: src.notes || null,
          })
        }
      }

      // Add condition history entries
      const activeCondEntries = conditionHistoryEntries.filter(e => !e.isDeleted)
      for (const entry of activeCondEntries) {
        const { error: chErr } = await supabase
          .from('condition_history')
          .insert({
            book_id: newBook.id,
            position: entry.position,
            event_date: entry.eventDate || null,
            event_type: entry.eventType,
            description: entry.description || null,
            performed_by: entry.performedBy || null,
            cost: entry.cost,
            cost_currency: entry.costCurrency || null,
            before_condition_id: entry.beforeConditionId || null,
            after_condition_id: entry.afterConditionId || null,
            notes: entry.notes || null,
          })
        if (chErr) console.error('Failed to insert condition history entry:', chErr)
      }

      // Check if latest condition history entry suggests updating the book's condition
      const sortedCondEntries = activeCondEntries
        .filter(e => e.afterConditionId)
        .sort((a, b) => b.position - a.position)
      const latestWithCondition = sortedCondEntries[0]
      if (latestWithCondition && latestWithCondition.afterConditionId !== (formData.condition_id || null)) {
        const condName = referenceData.conditions.find(c => c.id === latestWithCondition.afterConditionId)?.name
        if (condName && window.confirm(`Update the book's general condition to "${condName}"?`)) {
          await supabase.from('books').update({ condition_id: latestWithCondition.afterConditionId }).eq('id', newBook.id)
        }
      }

      // Activity log (fire-and-forget)
      void logActivity({
        userId: user.id,
        action: 'book.created',
        category: 'book',
        entityType: 'book',
        entityId: newBook.id,
        entityLabel: bookLabel(formData.title, formData.publication_year),
        metadata: { status: formData.status },
        source: 'app',
      })

      router.push(`/books/${newBook.id}`)
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save'
      setError(message)
      setSaving(false)
    }
  }

  // --- Collapsible sections ---
  const SECTION_FIELDS: Record<string, string[]> = {
    'Title & Series': ['title', 'subtitle', 'original_title', 'series', 'series_number'],
    'Language': ['language_id', 'original_language_id'],
    'Publication': ['publisher_name', 'publication_place', 'publication_year', 'printer', 'printing_place'],
    'Edition': ['edition', 'impression', 'issue_state', 'edition_notes'],
    'Physical Description': ['pagination_description', 'volumes', 'height_mm', 'width_mm', 'depth_mm', 'weight_grams', 'cover_image_url', 'cover_type', 'binding_id', 'format_id', 'protective_enclosure', 'paper_type', 'edge_treatment', 'endpapers_type', 'text_block_condition', 'has_dust_jacket', 'is_signed'],
    'Condition & Status': ['condition_id', 'dust_jacket_condition_id', 'status', 'action_needed', 'condition_notes'],
    'Identifiers': ['isbn_13', 'isbn_10', 'oclc_number', 'lccn', 'user_catalog_id', 'ddc', 'lcc', 'udc', 'topic'],
    'BISAC Subject Codes': ['bisac_code', 'bisac_code_2', 'bisac_code_3'],
    'Storage': ['storage_location', 'shelf', 'shelf_section'],
    'Valuation': ['sales_price', 'price_currency'],
    'Notes': ['summary', 'dedication_text', 'colophon_text', 'bibliography', 'illustrations_description', 'signatures_description', 'internal_notes'],
  }

  const countFilled = (sectionTitle: string): [number, number] => {
    const fields = SECTION_FIELDS[sectionTitle]
    if (!fields) return [0, 0]
    const filled = fields.filter(f => {
      const v = (formData as any)[f]
      if (v === null || v === undefined || v === '' || v === 'none' || v === false) return false
      return true
    }).length
    return [filled, fields.length]
  }

  const specialCounts: Record<string, [number, number] | null> = {
    'Contributors': contributors.length > 0 ? [contributors.length, contributors.length] : null,
    'Provenance': provenanceEntries.length > 0 ? [provenanceEntries.length, provenanceEntries.length] : null,
    'Condition History': conditionHistoryEntries.length > 0 ? [conditionHistoryEntries.length, conditionHistoryEntries.length] : null,
    'External Links': externalLinks.length > 0 ? [externalLinks.length, externalLinks.length] : null,
  }

  const allSections = [
    'Title & Series', 'Contributors', 'Language', 'Publication', 'Edition',
    'Physical Description', 'Condition & Status', 'Condition History', 'Provenance',
    'Identifiers', 'BISAC Subject Codes', 'Catalog Entry',
    'Collections', 'Tags', 'Storage', 'Valuation',
    'Notes', 'External Links'
  ]

  const [openSections, setOpenSections] = useState<Set<string>>(() => new Set(['Title & Series', 'Contributors']))

  const toggleSection = (title: string) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }

  const allExpanded = openSections.size === allSections.length
  const toggleAll = () => {
    setOpenSections(allExpanded ? new Set(['Title & Series', 'Contributors']) : new Set(allSections))
  }

  const SectionHeader = ({ title }: { title: string }) => {
    const isOpen = openSections.has(title)
    const counts = specialCounts[title] !== undefined ? specialCounts[title] : (SECTION_FIELDS[title] ? countFilled(title) : null)
    const [filled, total] = counts || [0, 0]
    return (
      <button
        type="button"
        onClick={() => toggleSection(title)}
        className="w-full flex items-center justify-between pb-2 border-b group"
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          {counts && filled > 0 && (
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {filled}{total !== filled ? `/${total}` : ''}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
        </div>
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/books" onClick={handleCancel} className="p-2 hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Add Book</h1>
        </div>
        <div className="flex items-center gap-2">
          <EnrichButton isbn={enrich.isbn} loading={enrich.loading} onEnrichIsbn={enrich.handleEnrichIsbn} onOpenSearch={enrich.handleOpenSearch} />
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

      {/* Enrich dropdown panel */}
      <EnrichDropdown
        showPanel={enrich.showPanel} mode={enrich.mode} loading={enrich.loading}
        error={enrich.error} applied={enrich.applied} provider={enrich.provider}
        rows={enrich.rows} newCount={enrich.newCount} diffCount={enrich.diffCount} checkedCount={enrich.checkedCount}
        searchTitle={enrich.searchTitle} setSearchTitle={enrich.setSearchTitle}
        searchAuthor={enrich.searchAuthor} setSearchAuthor={enrich.setSearchAuthor}
        selectedProvider={enrich.selectedProvider} setSelectedProvider={enrich.setSelectedProvider}
        providers={enrich.providers}
        searching={enrich.searching} searchResults={enrich.searchResults} loadingDetail={enrich.loadingDetail}
        onClose={enrich.handleClose} onFieldSearch={enrich.handleFieldSearch}
        onPickResult={enrich.handlePickResult} onToggleRow={enrich.toggleRow}
        onSelectAllNew={enrich.selectAllNew} onApply={enrich.handleApply}
        onSwitchToSearch={enrich.handleSwitchToSearch}
      />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {fromLookup && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <span className="font-medium">Pre-filled from ISBN lookup</span>
          {lookupProvider && <span className="text-amber-600"> via {lookupProvider}</span>}
          <span className="text-amber-600 ml-1">— Please verify and complete the details. Status set to Draft.</span>
        </div>
      )}

      {formData.cover_image_url && (
        <div className="mb-6 flex items-start gap-4 p-4 border border-border bg-muted/20">
          <div className="flex-shrink-0 w-20 h-28 bg-muted rounded overflow-hidden shadow-sm">
            <img src={formData.cover_image_url} alt="Cover preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Cover image found</p>
            <p className="mt-1 truncate max-w-md">{formData.cover_image_url}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end mb-4">
        <button type="button" onClick={toggleAll} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ChevronsUpDown className="w-3.5 h-3.5" />
          {allExpanded ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      <div className="space-y-8">
{/* 1. Title & Series */}
        <section>
          <SectionHeader title="Title & Series" />
          {openSections.has('Title & Series') && <div className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2 md:col-span-4">
              <label className={labelClass}>Title <span className="text-red-500">*</span><FieldHelp text={FIELD_HELP.title} /></label>
              <input type="text" value={formData.title} onChange={e => handleChange('title', e.target.value)} required className={inputClass} />
            </div>
            <div className="col-span-2 md:col-span-4">
              <label className={labelClass}>Subtitle<FieldHelp text={FIELD_HELP.subtitle} /></label>
              <input type="text" value={formData.subtitle} onChange={e => handleChange('subtitle', e.target.value)} className={inputClass} />
            </div>
            <div className="col-span-2 md:col-span-4">
              <label className={labelClass}>Original Title<FieldHelp text={FIELD_HELP.original_title} /></label>
              <input type="text" value={formData.original_title} onChange={e => handleChange('original_title', e.target.value)} className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Series<FieldHelp text={FIELD_HELP.series} /></label>
              <input type="text" list="series-list" value={formData.series} onChange={e => handleChange('series', e.target.value)} className={inputClass} />
              <datalist id="series-list">{referenceData.seriesList.map(s => <option key={s} value={s} />)}</datalist>
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Series Number<FieldHelp text={FIELD_HELP.series_number} /></label>
              <input type="text" value={formData.series_number} onChange={e => handleChange('series_number', e.target.value)} className={inputClass} />
            </div>
          </div>
          </div>}
        </section>

        {/* 2. Contributors */}
        <section>
          <SectionHeader title="Contributors" />
          {openSections.has('Contributors') && <div className="mt-4">
          {contributors.length > 0 && (
            <div className="mb-4 space-y-2">
              {contributors.map(c => (
                <div key={c.tempId} className="flex items-center gap-3 p-2 bg-muted/50 border border-border">
                  <div className="flex-1">
                    <span className="font-medium">{c.contributorName}</span>
                    <span className="text-muted-foreground mx-2">{"\u2014"}</span>
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
              <label className={labelClass}>Name<FieldHelp text={FIELD_HELP.contributor_name} /></label>
              <input type="text" list="contributors-list" value={newContributorName} onChange={e => setNewContributorName(e.target.value)} className={inputClass} />
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
          </div>}
        </section>

        {/* 5. Language */}
        <section>
          <SectionHeader title="Language" />
          {openSections.has('Language') && <div className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Language<FieldHelp text={FIELD_HELP.language} /></label>
              <select value={formData.language_id} onChange={e => handleChange('language_id', e.target.value)} className={inputClass}>
                <option value="">Select language...</option>
                {referenceData.languages.map(l => <option key={l.id} value={l.id}>{l.name_en}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Original Language<FieldHelp text={FIELD_HELP.original_language} /></label>
              <select value={formData.original_language_id} onChange={e => handleChange('original_language_id', e.target.value)} className={inputClass}>
                <option value="">Select language...</option>
                {referenceData.languages.map(l => <option key={l.id} value={l.id}>{l.name_en}</option>)}
              </select>
            </div>
          </div>
          </div>}
        </section>

        {/* 6. Publication */}
        <section>
          <SectionHeader title="Publication" />
          {openSections.has('Publication') && <div className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Publisher<FieldHelp text={FIELD_HELP.publisher} /></label>
              <input type="text" list="publisher-list" value={formData.publisher_name} onChange={e => handleChange('publisher_name', e.target.value)} className={inputClass} />
              <datalist id="publisher-list">{referenceData.publisherList.map(p => <option key={p} value={p} />)}</datalist>
            </div>
            <div>
              <label className={labelClass}>Place Published<FieldHelp text={FIELD_HELP.publication_place} /></label>
              <input type="text" list="pubplace-list" value={formData.publication_place} onChange={e => handleChange('publication_place', e.target.value)} className={inputClass} />
              <datalist id="pubplace-list">{referenceData.publicationPlaceList.map(p => <option key={p} value={p} />)}</datalist>
            </div>
            <div>
              <label className={labelClass}>Year Published<FieldHelp text={FIELD_HELP.publication_year} /></label>
              <input type="text" value={formData.publication_year} onChange={e => handleChange('publication_year', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Printer<FieldHelp text={FIELD_HELP.printer} /></label>
              <input type="text" value={formData.printer} onChange={e => handleChange('printer', e.target.value)} className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Place Printed<FieldHelp text={FIELD_HELP.printing_place} /></label>
              <input type="text" list="printplace-list" value={formData.printing_place} onChange={e => handleChange('printing_place', e.target.value)} className={inputClass} />
              <datalist id="printplace-list">{referenceData.printingPlaceList.map(p => <option key={p} value={p} />)}</datalist>
            </div>
          </div>
          </div>}
        </section>

        {/* 7. Edition */}
        <section>
          <SectionHeader title="Edition" />
          {openSections.has('Edition') && <div className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Edition<FieldHelp text={FIELD_HELP.edition} /></label>
              <input type="text" value={formData.edition} onChange={e => handleChange('edition', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Impression<FieldHelp text={FIELD_HELP.impression} /></label>
              <input type="text" value={formData.impression} onChange={e => handleChange('impression', e.target.value)} className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Issue State<FieldHelp text={FIELD_HELP.issue_state} /></label>
              <input type="text" value={formData.issue_state} onChange={e => handleChange('issue_state', e.target.value)} className={inputClass} />
            </div>
            <div className="col-span-2 md:col-span-4">
              <label className={labelClass}>Edition Notes<FieldHelp text={FIELD_HELP.edition_notes} /></label>
              <textarea value={formData.edition_notes} onChange={e => handleChange('edition_notes', e.target.value)} rows={2} className={textareaClass} />
            </div>
          </div>
          </div>}
        </section>

        {/* 8. Physical Description */}
        <section>
          <SectionHeader title="Physical Description" />
          {openSections.has('Physical Description') && <div className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Pagination<FieldHelp text={FIELD_HELP.pagination} /></label>
              <input type="text" value={formData.pagination_description} onChange={e => handleChange('pagination_description', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Volumes<FieldHelp text={FIELD_HELP.volumes} /></label>
              <input type="text" value={formData.volumes} onChange={e => handleChange('volumes', e.target.value)} className={inputClass} />
            </div>
            <div />
            <div>
              <label className={labelClass}>Height (mm)<FieldHelp text={FIELD_HELP.height} /></label>
              <input type="number" value={formData.height_mm} onChange={e => handleChange('height_mm', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Width (mm)<FieldHelp text={FIELD_HELP.width} /></label>
              <input type="number" value={formData.width_mm} onChange={e => handleChange('width_mm', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Depth (mm)<FieldHelp text={FIELD_HELP.depth} /></label>
              <input type="number" value={formData.depth_mm} onChange={e => handleChange('depth_mm', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Weight (g)<FieldHelp text={FIELD_HELP.weight} /></label>
              <input type="number" value={formData.weight_grams} onChange={e => handleChange('weight_grams', e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-dashed border-border">
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <label className={labelClass}>Cover Image URL</label>
                <input type="url" value={formData.cover_image_url} onChange={e => handleChange('cover_image_url', e.target.value)} className={inputClass} placeholder="https://covers.openlibrary.org/..." />
                <p className="text-xs text-muted-foreground mt-1">Paste a URL to a cover image, or use Enrich to find one automatically.</p>
              </div>
              {formData.cover_image_url && (
                <div className="flex-shrink-0 w-16 h-24 bg-muted rounded overflow-hidden">
                  <img src={formData.cover_image_url} alt="Cover preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-dashed border-border">
            <div className="col-span-2">
              <label className={labelClass}>Cover Type<FieldHelp text={FIELD_HELP.cover_type} /></label>
              <select value={formData.cover_type} onChange={e => handleChange('cover_type', e.target.value)} className={inputClass}>
                <option value="">Select cover type...</option>
                {coverTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Binding<FieldHelp text={FIELD_HELP.binding} /></label>
              <select value={formData.binding_id} onChange={e => handleChange('binding_id', e.target.value)} className={inputClass}>
                <option value="">Select binding...</option>
                {referenceData.bindings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Book Format<FieldHelp text={FIELD_HELP.format} /></label>
              <select value={formData.format_id} onChange={e => handleChange('format_id', e.target.value)} className={inputClass}>
                <option value="">Select format...</option>
                {referenceData.bookFormats.map(f => <option key={f.id} value={f.id}>{f.abbreviation ? `${f.name} (${f.abbreviation})` : f.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Protective Enclosure<FieldHelp text={FIELD_HELP.protective_enclosure} /></label>
              <select value={formData.protective_enclosure} onChange={e => handleChange('protective_enclosure', e.target.value)} className={inputClass}>
                {protectiveEnclosureOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="col-span-2 flex items-end gap-6 pb-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-9 h-5 rounded-full transition-colors relative ${formData.has_dust_jacket ? 'bg-foreground' : 'bg-gray-300 dark:bg-gray-600'}`} onClick={() => handleChange('has_dust_jacket', !formData.has_dust_jacket)}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${formData.has_dust_jacket ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm">Has Dust Jacket</span>
                <FieldHelp text={FIELD_HELP.has_dust_jacket} />
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-9 h-5 rounded-full transition-colors relative ${formData.is_signed ? 'bg-foreground' : 'bg-gray-300 dark:bg-gray-600'}`} onClick={() => handleChange('is_signed', !formData.is_signed)}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${formData.is_signed ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm">Signed</span>
                <FieldHelp text={FIELD_HELP.is_signed} />
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-dashed border-border">
            <div>
              <label className={labelClass}>Paper Type<FieldHelp text={FIELD_HELP.paper_type} /></label>
              <select value={formData.paper_type} onChange={e => handleChange('paper_type', e.target.value)} className={inputClass}>
                <option value="">Select paper type...</option>
                {paperTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Edge Treatment<FieldHelp text={FIELD_HELP.edge_treatment} /></label>
              <select value={formData.edge_treatment} onChange={e => handleChange('edge_treatment', e.target.value)} className={inputClass}>
                <option value="">Select treatment...</option>
                {edgeTreatmentOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Endpapers<FieldHelp text={FIELD_HELP.endpapers} /></label>
              <select value={formData.endpapers_type} onChange={e => handleChange('endpapers_type', e.target.value)} className={inputClass}>
                <option value="">Select type...</option>
                {endpapersTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Text Block<FieldHelp text={FIELD_HELP.text_block} /></label>
              <select value={formData.text_block_condition} onChange={e => handleChange('text_block_condition', e.target.value)} className={inputClass}>
                <option value="">Select condition...</option>
                {textBlockConditionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          </div>}
        </section>

        {/* 9. Condition & Status */}
        <section>
          <SectionHeader title="Condition & Status" />
          {openSections.has('Condition & Status') && <div className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Condition<FieldHelp text={FIELD_HELP.condition} /></label>
              <select value={formData.condition_id} onChange={e => handleChange('condition_id', e.target.value)} className={inputClass}>
                <option value="">Select condition...</option>
                {referenceData.conditions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>DJ Condition<FieldHelp text={FIELD_HELP.dust_jacket_condition} /></label>
              <select value={formData.dust_jacket_condition_id} onChange={e => handleChange('dust_jacket_condition_id', e.target.value)} className={inputClass}>
                <option value="">Select condition...</option>
                {referenceData.conditions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status<FieldHelp text={FIELD_HELP.status} /></label>
              <select value={formData.status} onChange={e => handleChange('status', e.target.value)} className={inputClass}>
                {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Action Needed<FieldHelp text={FIELD_HELP.action_needed} /></label>
              <select value={formData.action_needed} onChange={e => handleChange('action_needed', e.target.value)} className={inputClass}>
                {actionNeededOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="col-span-2 md:col-span-4">
              <label className={labelClass}>Condition Notes<FieldHelp text={FIELD_HELP.condition_notes} /></label>
              <textarea value={formData.condition_notes} onChange={e => handleChange('condition_notes', e.target.value)} rows={3} className={textareaClass} />
            </div>
          </div>
          </div>}
        </section>

        {/* 14. Provenance */}
                <section>
          <SectionHeader title="Condition History" />
          {openSections.has('Condition History') && <div className="mt-4">
          <ConditionHistoryEditor
            entries={conditionHistoryEntries}
            conditions={referenceData.conditions}
            onChange={(updated: ConditionHistoryEntry[]) => {
              setConditionHistoryEntries(updated)
              setIsDirty(true)
            }}
          />
          </div>}
        </section>

<section>
          <SectionHeader title="Provenance" />
          {openSections.has('Provenance') && <div className="mt-4">
          <ProvenanceEditor
            entries={provenanceEntries}
            onChange={(updated) => {
              setProvenanceEntries(updated)
              setIsDirty(true)
            }}
          />
          </div>}
        </section>

        {/* 10. Identifiers */}
        <section>
          <SectionHeader title="Identifiers" />
          {openSections.has('Identifiers') && <div className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>ISBN-13<FieldHelp text={FIELD_HELP.isbn_13} /></label>
              <input type="text" value={formData.isbn_13} onChange={e => handleChange('isbn_13', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>ISBN-10<FieldHelp text={FIELD_HELP.isbn_10} /></label>
              <input type="text" value={formData.isbn_10} onChange={e => handleChange('isbn_10', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>OCLC Number<FieldHelp text={FIELD_HELP.oclc} /></label>
              <input type="text" value={formData.oclc_number} onChange={e => handleChange('oclc_number', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>LCCN<FieldHelp text={FIELD_HELP.lccn} /></label>
              <input type="text" value={formData.lccn} onChange={e => handleChange('lccn', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Catalog ID<FieldHelp text={FIELD_HELP.catalog_id} /></label>
              <input type="text" value={formData.user_catalog_id} onChange={e => handleChange('user_catalog_id', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>DDC<FieldHelp text={FIELD_HELP.ddc} /></label>
              <input type="text" value={formData.ddc} onChange={e => handleChange('ddc', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>LCC<FieldHelp text={FIELD_HELP.lcc} /></label>
              <input type="text" value={formData.lcc} onChange={e => handleChange('lcc', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>UDC<FieldHelp text={FIELD_HELP.udc} /></label>
              <input type="text" value={formData.udc} onChange={e => handleChange('udc', e.target.value)} className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Topic<FieldHelp text={FIELD_HELP.topic} /></label>
              <input type="text" value={formData.topic} onChange={e => handleChange('topic', e.target.value)} className={inputClass} />
            </div>
          </div>
          </div>}
        </section>

        {/* 11. BISAC Subject Codes */}
        <section>
          <SectionHeader title="BISAC Subject Codes" />
          {openSections.has('BISAC Subject Codes') && <div className="mt-4">
          <div className="space-y-4">
            <BisacCombobox label="Primary BISAC" value={formData.bisac_code || null} onChange={(value) => handleChange('bisac_code', value || '')} options={referenceData.bisacCodes} placeholder="Search BISAC codes..." />
            <BisacCombobox label="Secondary BISAC" value={formData.bisac_code_2 || null} onChange={(value) => handleChange('bisac_code_2', value || '')} options={referenceData.bisacCodes} placeholder="Optional..." />
            <BisacCombobox label="Tertiary BISAC" value={formData.bisac_code_3 || null} onChange={(value) => handleChange('bisac_code_3', value || '')} options={referenceData.bisacCodes} placeholder="Optional..." />
          </div>
          </div>}
        </section>

        {/* 15. Catalog Entry */}
        <section>
          <SectionHeader title="Catalog Entry" />
          {openSections.has('Catalog Entry') && <div className="mt-4">
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
                illustrations_description: formData.illustrations_description || null,
                signatures_description: formData.signatures_description || null,
                isbn_13: formData.isbn_13 || null,
                isbn_10: formData.isbn_10 || null,
                oclc_number: formData.oclc_number || null,
                lccn: formData.lccn || null,
                contributors: contributorsForCatalog,
                provenanceEntries: provenanceEntries.filter(e => !e.isDeleted && e.ownerName.trim()).sort((a, b) => a.position - b.position),
              }}
              onGenerate={(entry) => handleChange('catalog_entry', entry)}
            />
          </div>
          <div>
            <label className={labelClass}>Full Catalog Entry<FieldHelp text={FIELD_HELP.catalog_entry} /></label>
            <textarea value={formData.catalog_entry} onChange={e => handleChange('catalog_entry', e.target.value)} rows={4} className={textareaClass} />
          </div>
          </div>}
        </section>

        {/* 3. Collections */}
        {availableCollections.length > 0 && (
          <section>
            <SectionHeader title="Collections" />
          {openSections.has('Collections') && <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-3">Choose which collections this book belongs to.</p>
            <div className="flex flex-wrap gap-2">
              {availableCollections.map(col => (
                <label key={col.id} className={`flex items-center gap-2 px-3 py-1.5 text-sm border cursor-pointer transition-colors ${
                  selectedCollectionIds.has(col.id)
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-gray-300 dark:border-gray-600 bg-muted/30 hover:border-foreground'
                }`}>
                  <input
                    type="checkbox"
                    checked={selectedCollectionIds.has(col.id)}
                    onChange={() => {
                      setSelectedCollectionIds(prev => {
                        const next = new Set(prev)
                        if (next.has(col.id)) next.delete(col.id)
                        else next.add(col.id)
                        return next
                      })
                      setIsDirty(true)
                    }}
                    className="sr-only"
                  />
                  {col.name}
                  {col.is_default && <span className="text-xs opacity-60">(default)</span>}
                </label>
              ))}
            </div>
            </div>}
        </section>
        )}

        {/* 4. Tags */}
        <section>
          <SectionHeader title="Tags" />
          {openSections.has('Tags') && <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-3">Add tags to categorize this book. Type to search or create new tags.</p>
          <TagInput
            selectedTags={selectedTags}
            onTagsChange={(tags) => { setSelectedTags(tags); setIsDirty(true) }}
          />
          </div>}
        </section>

        {/* 12. Storage */}
        <section>
          <SectionHeader title="Storage" />
          {openSections.has('Storage') && <div className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Location<FieldHelp text={FIELD_HELP.storage_location} /></label>
              <input type="text" list="location-list" value={formData.storage_location} onChange={e => handleChange('storage_location', e.target.value)} className={inputClass} />
              <datalist id="location-list">{referenceData.storageLocationList.map(l => <option key={l} value={l} />)}</datalist>
            </div>
            <div>
              <label className={labelClass}>Shelf<FieldHelp text={FIELD_HELP.shelf} /></label>
              <input type="text" list="shelf-list" value={formData.shelf} onChange={e => handleChange('shelf', e.target.value)} className={inputClass} />
              <datalist id="shelf-list">{referenceData.shelfList.map(s => <option key={s} value={s} />)}</datalist>
            </div>
            <div>
              <label className={labelClass}>Section<FieldHelp text={FIELD_HELP.shelf_section} /></label>
              <input type="text" list="section-list" value={formData.shelf_section} onChange={e => handleChange('shelf_section', e.target.value)} className={inputClass} />
              <datalist id="section-list">{referenceData.shelfSectionList.map(s => <option key={s} value={s} />)}</datalist>
            </div>
          </div>
          </div>}
        </section>

        {/* 13. Valuation */}
        <section>
          <SectionHeader title="Valuation" />
          {openSections.has('Valuation') && <div className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Sales Price<FieldHelp text={FIELD_HELP.sales_price} /></label>
              <input type="number" step="0.01" value={formData.sales_price} onChange={e => handleChange('sales_price', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Currency<FieldHelp text={FIELD_HELP.price_currency} /></label>
              <select value={formData.price_currency} onChange={e => handleChange('price_currency', e.target.value)} className={inputClass}>
                <option value="">Select currency...</option>
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Valuations (appraisals, estimates) can be added after saving the book.</p>
          </div>}
        </section>

        {/* 16. Notes */}
        <section>
          <SectionHeader title="Notes" />
          {openSections.has('Notes') && <div className="mt-4">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Summary<FieldHelp text={FIELD_HELP.summary} /></label>
              <textarea value={formData.summary} onChange={e => handleChange('summary', e.target.value)} rows={3} className={textareaClass} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Printed Dedication<FieldHelp text={FIELD_HELP.dedication_text} /></label>
                <textarea value={formData.dedication_text} onChange={e => handleChange('dedication_text', e.target.value)} rows={2} className={textareaClass} />
              </div>
              <div>
                <label className={labelClass}>Colophon<FieldHelp text={FIELD_HELP.colophon} /></label>
                <textarea value={formData.colophon_text} onChange={e => handleChange('colophon_text', e.target.value)} rows={2} className={textareaClass} />
              </div>
              <div>
                <label className={labelClass}>Bibliography<FieldHelp text={FIELD_HELP.bibliography} /></label>
                <textarea value={formData.bibliography} onChange={e => handleChange('bibliography', e.target.value)} rows={2} className={textareaClass} />
              </div>
              <div>
                <label className={labelClass}>Illustrations<FieldHelp text={FIELD_HELP.illustrations} /></label>
                <textarea value={formData.illustrations_description} onChange={e => handleChange('illustrations_description', e.target.value)} rows={2} className={textareaClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Signatures<FieldHelp text={FIELD_HELP.signatures} /></label>
              <textarea value={formData.signatures_description} onChange={e => handleChange('signatures_description', e.target.value)} rows={2} className={textareaClass} />
            </div>
            <div>
              <label className={labelClass}>Private Notes<FieldHelp text={FIELD_HELP.internal_notes} /></label>
              <textarea value={formData.internal_notes} onChange={e => handleChange('internal_notes', e.target.value)} rows={3} className={textareaClass} />
            </div>
          </div>
          </div>}
        </section>

        {/* 14. External Links */}
        <section>
          <SectionHeader title="External Links" />
          {openSections.has('External Links') && <div className="mt-4">
          
          {externalLinks.map((link, index) => (
            <div key={index} className="flex gap-2 mb-2 items-start">
              <div className="w-1/3">
                <select
                  value={link.linkTypeId}
                  onChange={e => {
                    const updated = [...externalLinks]
                    const selected = referenceData.linkTypes.find(lt => lt.id === e.target.value)
                    const currentUrl = updated[index].url
                    // Replace URL if empty or just a domain prefix (no path added yet)
                    const isJustPrefix = !currentUrl || /^https?:\/\/[^/]+\/?$/.test(currentUrl)
                    const prefill = selected?.domain && isJustPrefix ? `https://${selected.domain}/` : currentUrl
                    updated[index] = { ...updated[index], linkTypeId: e.target.value, label: selected?.label || '', url: prefill }
                    setExternalLinks(updated)
                    setIsDirty(true)
                  }}
                  className={inputClass}
                >
                  <option value="">Select type...</option>
                  {referenceData.linkTypes.map(lt => (
                    <option key={lt.id} value={lt.id}>{lt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <input
                  type="url"
                  value={link.url}
                  onChange={e => {
                    const updated = [...externalLinks]
                    updated[index] = { ...updated[index], url: e.target.value }
                    setExternalLinks(updated)
                    setIsDirty(true)
                  }}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>
              <button
                type="button"
                onClick={() => link.url && window.open(link.url, '_blank')}
                disabled={!link.url}
                className="h-10 px-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
                title="Open in new tab"
              >
                <ExternalLinkIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setExternalLinks(externalLinks.filter((_, i) => i !== index))
                  setIsDirty(true)
                }}
                className="h-10 px-2 text-muted-foreground hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              setExternalLinks([...externalLinks, { linkTypeId: '', url: '', label: '' }])
            }}
            className="flex items-center gap-2 h-9 px-4 text-sm border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Link
          </button>
          </div>}
        </section>

        {/* Submit buttons at bottom */}
        <div className="flex justify-end gap-2 pt-4">
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
