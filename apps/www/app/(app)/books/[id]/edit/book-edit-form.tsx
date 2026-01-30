'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import BisacCombobox from '@/components/bisac-combobox'
import CatalogEntryGenerator from '@/components/catalog-entry-generator'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/lib/supabase/database.types'

type Book = Tables<'books'>
type Language = { id: string; name_en: string }
type Condition = { id: string; name: string }
type Binding = { id: string; name: string }
type BookFormat = { id: string; type: string | null; name: string; abbreviation: string | null }
type BisacCode = { code: string; subject: string }
type Contributor = { name: string; role: string }
type ContributorRole = { id: string; name: string }
type ExistingContributor = { id: string; name: string }
type BookContributor = {
  id: string
  contributorId: string
  contributorName: string
  roleId: string
  roleName: string
}

type ReferenceData = {
  languages: Language[]
  conditions: Condition[]
  bindings: Binding[]
  bookFormats: BookFormat[]
  bisacCodes: BisacCode[]
  contributors: Contributor[]
  bookContributors: BookContributor[]
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
  book: Book
  referenceData: ReferenceData
}

// Local contributor state (for tracking changes)
type LocalContributor = {
  tempId: string // Temporary ID for new contributors, or original id for existing
  contributorName: string
  roleId: string
  roleName: string
  isNew: boolean
  isDeleted: boolean
}

export default function BookEditForm({ book, referenceData }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Book>(book)
  
  // Contributors state
  const [contributors, setContributors] = useState<LocalContributor[]>(
    referenceData.bookContributors.map(bc => ({
      tempId: bc.id,
      contributorName: bc.contributorName,
      roleId: bc.roleId,
      roleName: bc.roleName,
      isNew: false,
      isDeleted: false
    }))
  )
  const [newContributorName, setNewContributorName] = useState('')
  const [newContributorRoleId, setNewContributorRoleId] = useState('')

  const handleChange = (field: keyof Book, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
      isNew: true,
      isDeleted: false
    }])
    
    setNewContributorName('')
    setNewContributorRoleId('')
  }

  // Remove a contributor (mark as deleted or remove from list if new)
  const handleRemoveContributor = (tempId: string) => {
    setContributors(prev => prev.map(c => {
      if (c.tempId === tempId) {
        if (c.isNew) {
          // New contributor - just remove from list
          return { ...c, isDeleted: true }
        }
        // Existing contributor - mark as deleted
        return { ...c, isDeleted: true }
      }
      return c
    }).filter(c => !(c.isNew && c.isDeleted))) // Remove new deleted items immediately
  }

  // Get contributors for display and catalog entry
  const activeContributors = contributors.filter(c => !c.isDeleted)
  const contributorsForCatalog = activeContributors.map(c => ({
    name: c.contributorName,
    role: c.roleName
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // 1. Update book data
      const { error: updateError } = await supabase
        .from('books')
        .update({
          title: formData.title,
          subtitle: formData.subtitle || null,
          original_title: formData.original_title || null,
          language_id: formData.language_id || null,
          original_language_id: formData.original_language_id || null,
          series: formData.series || null,
          series_number: formData.series_number || null,
          status: formData.status,
          action_needed: (formData as any).action_needed || 'none',
          publisher_name: formData.publisher_name || null,
          publication_place: formData.publication_place || null,
          publication_year: formData.publication_year || null,
          printer: formData.printer || null,
          printing_place: formData.printing_place || null,
          edition: formData.edition || null,
          impression: formData.impression || null,
          issue_state: formData.issue_state || null,
          edition_notes: formData.edition_notes || null,
          page_count: formData.page_count || null,
          pagination_description: formData.pagination_description || null,
          volumes: formData.volumes || null,
          height_mm: formData.height_mm || null,
          width_mm: formData.width_mm || null,
          depth_mm: formData.depth_mm || null,
          weight_grams: formData.weight_grams || null,
          cover_type: formData.cover_type || null,
          binding_id: formData.binding_id || null,
          format_id: formData.format_id || null,
          has_dust_jacket: formData.has_dust_jacket,
          is_signed: formData.is_signed,
          protective_enclosure: (formData as any).protective_enclosure || 'none',
          condition_id: formData.condition_id || null,
          condition_notes: formData.condition_notes || null,
          isbn_13: formData.isbn_13 || null,
          isbn_10: formData.isbn_10 || null,
          oclc_number: formData.oclc_number || null,
          lccn: formData.lccn || null,
          user_catalog_id: formData.user_catalog_id || null,
          ddc: formData.ddc || null,
          lcc: formData.lcc || null,
          udc: formData.udc || null,
          bisac_code: (formData as any).bisac_code || null,
          bisac_code_2: (formData as any).bisac_code_2 || null,
          bisac_code_3: (formData as any).bisac_code_3 || null,
          topic: formData.topic || null,
          storage_location: formData.storage_location || null,
          shelf: formData.shelf || null,
          shelf_section: formData.shelf_section || null,
          acquired_from: formData.acquired_from || null,
          acquired_date: formData.acquired_date || null,
          acquired_price: formData.acquired_price || null,
          acquired_currency: formData.acquired_currency || null,
          acquired_notes: formData.acquired_notes || null,
          lowest_price: formData.lowest_price || null,
          highest_price: formData.highest_price || null,
          estimated_value: formData.estimated_value || null,
          sales_price: formData.sales_price || null,
          price_currency: formData.price_currency || null,
          illustrations_description: formData.illustrations_description || null,
          signatures_description: formData.signatures_description || null,
          provenance: formData.provenance || null,
          bibliography: formData.bibliography || null,
          summary: formData.summary || null,
          catalog_entry: formData.catalog_entry || null,
          internal_notes: formData.internal_notes || null,
        })
        .eq('id', book.id)

      if (updateError) throw updateError

      // 2. Handle contributor deletions
      const deletedContributors = contributors.filter(c => c.isDeleted && !c.isNew)
      for (const dc of deletedContributors) {
        const { error: deleteError } = await supabase
          .from('book_contributors')
          .delete()
          .eq('id', dc.tempId)
        
        if (deleteError) throw deleteError
      }

      // 3. Handle new contributors
      const newContributors = contributors.filter(c => c.isNew && !c.isDeleted)
      for (const nc of newContributors) {
        // Check if contributor exists
        let contributorId: string
        const existing = referenceData.allContributors.find(
          c => c.name.toLowerCase() === nc.contributorName.toLowerCase()
        )
        
        if (existing) {
          contributorId = existing.id
        } else {
          // Create new contributor
          const { data: newContributor, error: createError } = await supabase
            .from('contributors')
            .insert({ 
              canonical_name: nc.contributorName,
              sort_name: nc.contributorName, // Use same name for sorting
              created_by_user_id: (await supabase.auth.getUser()).data.user?.id
            })
            .select('id')
            .single()
          
          if (createError || !newContributor) throw createError || new Error('Failed to create contributor')
          contributorId = newContributor.id
        }

        // Create book_contributor link
        const { error: linkError } = await supabase
          .from('book_contributors')
          .insert({
            book_id: book.id,
            contributor_id: contributorId,
            role_id: nc.roleId
          })
        
        if (linkError) throw linkError
      }

      router.push(`/books/${book.id}`)
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save'
      setError(message)
      setSaving(false)
    }
  }

  // Input component for text fields
  const TextInput = ({ label, field, placeholder = '' }: { label: string; field: keyof Book; placeholder?: string }) => (
    <div>
      <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">{label}</label>
      <input
        type="text"
        value={(formData[field] as string) || ''}
        onChange={e => handleChange(field, e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
      />
    </div>
  )

  // Combobox input (dropdown + free text)
  const ComboInput = ({ label, field, options, placeholder = '' }: { label: string; field: keyof Book; options: string[]; placeholder?: string }) => (
    <div>
      <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">{label}</label>
      <input
        type="text"
        list={`${field}-list`}
        value={(formData[field] as string) || ''}
        onChange={e => handleChange(field, e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
      />
      <datalist id={`${field}-list`}>
        {options.map(opt => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
    </div>
  )

  // Input for numbers
  const NumberInput = ({ label, field, placeholder = '' }: { label: string; field: keyof Book; placeholder?: string }) => (
    <div>
      <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">{label}</label>
      <input
        type="number"
        value={(formData[field] as number) ?? ''}
        onChange={e => handleChange(field, e.target.value ? parseFloat(e.target.value) : null)}
        placeholder={placeholder}
        className="w-full h-10 px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
      />
    </div>
  )

  // Textarea for longer text with auto-resize
  const TextArea = ({ label, field, rows = 3 }: { label: string; field: keyof Book; rows?: number }) => {
    const value = (formData[field] as string) || ''
    
    // Calculate minimum height based on rows (approximately 24px per row + padding)
    const minHeight = rows * 24 + 16
    
    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      handleChange(field, e.target.value)
      // Resize immediately on change
      const textarea = e.target
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.max(textarea.scrollHeight, minHeight)}px`
    }
    
    const handleTextareaMount = (textarea: HTMLTextAreaElement | null) => {
      if (textarea) {
        textarea.style.height = 'auto'
        const newHeight = Math.max(textarea.scrollHeight, minHeight)
        textarea.style.height = `${newHeight}px`
      }
    }
    
    return (
      <div>
        <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">{label}</label>
        <textarea
          ref={handleTextareaMount}
          value={value}
          onChange={handleTextareaChange}
          style={{ minHeight: `${minHeight}px` }}
          className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground resize-y overflow-hidden"
        />
      </div>
    )
  }

  // Select for dropdowns
  const Select = ({ label, field, options, allowEmpty = true }: { 
    label: string; 
    field: keyof Book; 
    options: { value: string; label: string }[];
    allowEmpty?: boolean;
  }) => (
    <div>
      <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">{label}</label>
      <select
        value={(formData[field] as string) || ''}
        onChange={e => handleChange(field, e.target.value || null)}
        className="w-full h-10 px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
      >
        {allowEmpty && <option value="">—</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )

  // Checkbox
  const Checkbox = ({ label, field }: { label: string; field: keyof Book }) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={(formData[field] as boolean) || false}
        onChange={e => handleChange(field, e.target.checked)}
        className="w-4 h-4"
      />
      <span className="text-sm">{label}</span>
    </label>
  )

  // Status options
  const statusOptions = [
    // In possession - normal
    { value: 'in_collection', label: 'In Collection' },
    // In possession - special
    { value: 'lent', label: 'Lent' },
    { value: 'borrowed', label: 'Borrowed' },
    { value: 'double', label: 'Double' },
    // Sales flow
    { value: 'to_sell', label: 'To Sell' },
    { value: 'on_sale', label: 'On Sale' },
    { value: 'reserved', label: 'Reserved' },
    { value: 'sold', label: 'Sold' },
    // Acquisition
    { value: 'ordered', label: 'Ordered' },
    // No longer in possession
    { value: 'lost', label: 'Lost' },
    { value: 'donated', label: 'Donated' },
    { value: 'destroyed', label: 'Destroyed' },
    // Other
    { value: 'unknown', label: 'Unknown' },
  ]

  // Action needed options
  const actionNeededOptions = [
    { value: 'none', label: 'None' },
    { value: 'repair', label: 'Repair' },
    { value: 'bind', label: 'Bind' },
    { value: 'replace', label: 'Replace' },
  ]

  // Cover type options
  const coverTypeOptions = [
    // Basic
    { value: 'softcover', label: 'Softcover' },
    { value: 'softcover_dj', label: 'Softcover with dust jacket' },
    { value: 'hardcover', label: 'Hardcover' },
    { value: 'hardcover_dj', label: 'Hardcover with dust jacket' },
    // Full leather
    { value: 'full_leather_hardcover', label: 'Full leather hardcover' },
    { value: 'full_leather_softcover', label: 'Full leather softcover' },
    { value: 'full_calf_hardcover', label: 'Full calf hardcover' },
    { value: 'full_calf_softcover', label: 'Full calf softcover' },
    { value: 'full_vellum_hardcover', label: 'Full vellum hardcover' },
    { value: 'full_vellum_softcover', label: 'Full vellum softcover' },
    { value: 'full_morocco_hardcover', label: 'Full morocco hardcover' },
    { value: 'full_morocco_softcover', label: 'Full morocco softcover' },
    { value: 'full_faux_leather_hardcover', label: 'Full faux leather hardcover' },
    { value: 'full_faux_leather_softcover', label: 'Full faux leather softcover' },
    // Full cloth
    { value: 'full_cloth_hardcover', label: 'Full cloth hardcover' },
    { value: 'full_cloth_softcover', label: 'Full cloth softcover' },
    { value: 'full_buckram_hardcover', label: 'Full buckram hardcover' },
    { value: 'full_buckram_softcover', label: 'Full buckram softcover' },
    { value: 'full_linen_hardcover', label: 'Full linen hardcover' },
    { value: 'full_linen_softcover', label: 'Full linen softcover' },
    { value: 'full_silk_hardcover', label: 'Full silk hardcover' },
    { value: 'full_silk_softcover', label: 'Full silk softcover' },
    { value: 'full_canvas_hardcover', label: 'Full canvas hardcover' },
    { value: 'full_canvas_softcover', label: 'Full canvas softcover' },
    { value: 'full_moire_hardcover', label: 'Full moiré hardcover' },
    { value: 'full_moire_softcover', label: 'Full moiré softcover' },
    // Quarter binding
    { value: 'quarter_leather_paper', label: 'Quarter binding (leather-paper)' },
    { value: 'quarter_leather_cloth', label: 'Quarter binding (leather-cloth)' },
    { value: 'quarter_faux_leather_paper', label: 'Quarter binding (faux leather-paper)' },
    { value: 'quarter_faux_leather_cloth', label: 'Quarter binding (faux leather-cloth)' },
    { value: 'quarter_cloth_paper', label: 'Quarter binding (cloth-paper)' },
    // Half binding
    { value: 'half_leather_paper', label: 'Half binding (leather-paper)' },
    { value: 'half_leather_cloth', label: 'Half binding (leather-cloth)' },
    { value: 'half_faux_leather_paper', label: 'Half binding (faux leather-paper)' },
    { value: 'half_faux_leather_cloth', label: 'Half binding (faux leather-cloth)' },
    { value: 'half_cloth_paper', label: 'Half binding (cloth-paper)' },
    // Three quarter binding
    { value: 'three_quarter_leather_paper', label: 'Three quarter binding (leather-paper)' },
    { value: 'three_quarter_leather_cloth', label: 'Three quarter binding (leather-cloth)' },
    { value: 'three_quarter_faux_leather_paper', label: 'Three quarter binding (faux leather-paper)' },
    { value: 'three_quarter_faux_leather_cloth', label: 'Three quarter binding (faux leather-cloth)' },
    { value: 'three_quarter_cloth_paper', label: 'Three quarter binding (cloth-paper)' },
    // Other
    { value: 'cardboard_covers', label: 'Cardboard covers' },
    { value: 'paper_boards', label: 'Paper boards' },
    { value: 'library_binding', label: 'Library binding' },
    { value: 'original_wraps', label: 'Original wraps' },
    { value: 'printed_wrappers', label: 'Printed wrappers' },
    { value: 'stiff_wraps', label: 'Stiff wraps' },
    { value: 'limp_leather', label: 'Limp leather' },
    { value: 'limp_vellum', label: 'Limp vellum' },
  ]

  // Protective enclosure options
  const protectiveEnclosureOptions = [
    { value: 'none', label: 'None' },
    { value: 'slipcase_publisher', label: "Slipcase (publisher's)" },
    { value: 'slipcase_custom', label: 'Slipcase (custom)' },
    { value: 'clamshell_box', label: 'Clamshell box' },
    { value: 'chemise', label: 'Chemise' },
    { value: 'solander_box', label: 'Solander box' },
  ]

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href={`/books/${book.id}`}
            className="p-2 hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Edit Book</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href={`/books/${book.id}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
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
              <TextInput label="Title" field="title" />
            </div>
            <div className="md:col-span-2">
              <TextInput label="Subtitle" field="subtitle" />
            </div>
            <div className="md:col-span-2">
              <TextInput label="Original Title" field="original_title" />
            </div>
            <ComboInput label="Series" field="series" options={referenceData.seriesList} />
            <TextInput label="Series Number" field="series_number" />
          </div>
        </section>

        {/* 2. Contributors */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Contributors</h2>
          
          {/* Current contributors list */}
          {activeContributors.length > 0 && (
            <div className="mb-4 space-y-2">
              {activeContributors.map(c => (
                <div 
                  key={c.tempId} 
                  className="flex items-center gap-3 p-2 bg-muted/50 border border-border"
                >
                  <div className="flex-1">
                    <span className="font-medium">{c.contributorName}</span>
                    <span className="text-muted-foreground mx-2">—</span>
                    <span className="text-muted-foreground">{c.roleName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveContributor(c.tempId)}
                    className="p-1 text-muted-foreground hover:text-red-600 transition-colors"
                    title="Remove contributor"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new contributor */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">
                Name
              </label>
              <input
                type="text"
                list="contributors-list"
                value={newContributorName}
                onChange={e => setNewContributorName(e.target.value)}
                placeholder="Type or select contributor name"
                className="w-full h-10 px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
              />
              <datalist id="contributors-list">
                {referenceData.allContributors.map(c => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </div>
            <div className="w-48">
              <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">
                Role
              </label>
              <select
                value={newContributorRoleId}
                onChange={e => setNewContributorRoleId(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
              >
                <option value="">Select role...</option>
                {referenceData.contributorRoles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddContributor}
              disabled={!newContributorName.trim() || !newContributorRoleId}
              className="h-10"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
          
          {activeContributors.length === 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              No contributors yet. Add authors, illustrators, translators, etc.
            </p>
          )}
        </section>

        {/* 3. Language */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Language</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select 
              label="Language" 
              field="language_id" 
              options={referenceData.languages.map(l => ({ value: l.id, label: l.name_en }))} 
            />
            <Select 
              label="Original Language" 
              field="original_language_id" 
              options={referenceData.languages.map(l => ({ value: l.id, label: l.name_en }))} 
            />
          </div>
        </section>

        {/* 4. Publication */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Publication</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ComboInput label="Publisher" field="publisher_name" options={referenceData.publisherList} />
            <ComboInput label="Place Published" field="publication_place" options={referenceData.publicationPlaceList} />
            <TextInput label="Year Published" field="publication_year" placeholder="1969 or MCMLXIX [1969]" />
            <TextInput label="Printer" field="printer" />
            <ComboInput label="Place Printed" field="printing_place" options={referenceData.printingPlaceList} />
          </div>
        </section>

        {/* 5. Edition */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Edition</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput label="Edition" field="edition" placeholder="First Edition" />
            <TextInput label="Impression" field="impression" placeholder="First Impression" />
            <div className="md:col-span-2">
              <TextInput label="Issue State" field="issue_state" />
            </div>
            <div className="md:col-span-2">
              <TextArea label="Edition Notes" field="edition_notes" rows={2} />
            </div>
          </div>
        </section>

        {/* 6. Physical Description */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Physical Description</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Pagination - text field, double width */}
            <div className="col-span-2">
              <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">Pagination</label>
              <input
                type="text"
                value={(formData.pagination_description as string) || ''}
                onChange={e => handleChange('pagination_description', e.target.value)}
                placeholder="xvi, [4], 352, [8] p., 24 plates"
                className="w-full h-10 px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>
            <TextInput label="Volumes" field="volumes" />
            <div /> {/* Empty cell for alignment */}
            
            {/* Height, Width, Depth, Weight on same row */}
            <NumberInput label="Height (mm)" field="height_mm" />
            <NumberInput label="Width (mm)" field="width_mm" />
            <NumberInput label="Depth (mm)" field="depth_mm" />
            <NumberInput label="Weight (g)" field="weight_grams" />
            
            {/* Cover Type - dropdown, double width */}
            <div className="col-span-2">
              <Select 
                label="Cover Type" 
                field="cover_type" 
                options={coverTypeOptions}
              />
            </div>
            
            {/* Binding - double width */}
            <div className="col-span-2">
              <Select 
                label="Binding" 
                field="binding_id" 
                options={referenceData.bindings.map(b => ({ value: b.id, label: b.name }))} 
              />
            </div>
            
            {/* Book Format - double width */}
            <div className="col-span-2">
              <Select 
                label="Book Format" 
                field="format_id" 
                options={referenceData.bookFormats.map(f => ({ value: f.id, label: f.abbreviation ? `${f.name} (${f.abbreviation})` : f.name }))} 
              />
            </div>
            
            {/* Protective Enclosure - double width */}
            <div className="col-span-2">
              <Select 
                label="Protective Enclosure" 
                field="protective_enclosure" 
                options={protectiveEnclosureOptions}
                allowEmpty={false}
              />
            </div>
            
            {/* Checkboxes */}
            <div className="col-span-2 flex items-end gap-6">
              <Checkbox label="Has Dust Jacket" field="has_dust_jacket" />
              <Checkbox label="Signed" field="is_signed" />
            </div>
          </div>
        </section>

        {/* 7. Condition & Status */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Condition & Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select 
              label="Condition" 
              field="condition_id" 
              options={referenceData.conditions.map(c => ({ value: c.id, label: c.name }))} 
            />
            <Select label="Status" field="status" options={statusOptions} allowEmpty={false} />
            <Select label="Action Needed" field="action_needed" options={actionNeededOptions} allowEmpty={false} />
            <div /> {/* Empty cell for alignment */}
            <div className="md:col-span-2">
              <TextArea label="Condition Notes" field="condition_notes" rows={4} />
            </div>
          </div>
        </section>

        {/* 8. Identifiers */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Identifiers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TextInput label="ISBN-13" field="isbn_13" placeholder="978-0-123456-78-9" />
            <TextInput label="ISBN-10" field="isbn_10" placeholder="0-123456-78-9" />
            <TextInput label="OCLC Number" field="oclc_number" placeholder="12345678" />
            <TextInput label="LCCN" field="lccn" placeholder="2020123456" />
            <TextInput label="Catalog ID" field="user_catalog_id" />
            <TextInput label="DDC" field="ddc" placeholder="823.914" />
            <TextInput label="LCC" field="lcc" placeholder="PR6068.O93" />
            <TextInput label="UDC" field="udc" placeholder="821.111" />
            <div className="col-span-2">
              <TextInput label="Topic" field="topic" />
            </div>
          </div>
        </section>

        {/* 9. BISAC Subject Codes */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">BISAC Subject Codes</h2>
          <p className="text-sm text-muted-foreground mb-4">
            BISAC (Book Industry Standards and Communications) codes categorize books by subject. 
            Select up to 3 codes, with the primary code first. Type to search by code or subject.
          </p>
          <div className="space-y-4">
            <BisacCombobox
              label="Primary BISAC"
              value={(formData as any).bisac_code || null}
              onChange={(value) => handleChange('bisac_code' as keyof Book, value)}
              options={referenceData.bisacCodes}
              placeholder="Search BISAC codes..."
            />
            <BisacCombobox
              label="Secondary BISAC"
              value={(formData as any).bisac_code_2 || null}
              onChange={(value) => handleChange('bisac_code_2' as keyof Book, value)}
              options={referenceData.bisacCodes}
              placeholder="Optional..."
            />
            <BisacCombobox
              label="Tertiary BISAC"
              value={(formData as any).bisac_code_3 || null}
              onChange={(value) => handleChange('bisac_code_3' as keyof Book, value)}
              options={referenceData.bisacCodes}
              placeholder="Optional..."
            />
          </div>
        </section>

        {/* 10. Storage */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Storage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ComboInput label="Location" field="storage_location" options={referenceData.storageLocationList} />
            <ComboInput label="Shelf" field="shelf" options={referenceData.shelfList} />
            <ComboInput label="Section" field="shelf_section" options={referenceData.shelfSectionList} />
          </div>
        </section>

        {/* 11. Acquisition */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Acquisition</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <ComboInput label="Acquired From" field="acquired_from" options={referenceData.acquiredFromList} />
            </div>
            <TextInput label="Date" field="acquired_date" placeholder="YYYY-MM-DD" />
            <div className="flex gap-2">
              <div className="flex-1">
                <NumberInput label="Price Paid" field="acquired_price" />
              </div>
              <div className="w-20">
                <TextInput label="Currency" field="acquired_currency" placeholder="EUR" />
              </div>
            </div>
            <div className="lg:col-span-4">
              <TextArea label="Acquisition Notes" field="acquired_notes" rows={2} />
            </div>
          </div>
        </section>

        {/* 12. Valuation */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Valuation</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <NumberInput label="Lowest Price" field="lowest_price" />
            <NumberInput label="Highest Price" field="highest_price" />
            <NumberInput label="Estimated Value" field="estimated_value" />
            <NumberInput label="Sales Price" field="sales_price" />
            <TextInput label="Currency" field="price_currency" placeholder="EUR" />
          </div>
        </section>

        {/* 13. Notes */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Notes</h2>
          <div className="space-y-4">
            <TextArea label="Summary" field="summary" rows={3} />
            <TextArea label="Provenance" field="provenance" rows={2} />
            <TextArea label="Bibliography" field="bibliography" rows={2} />
            <TextArea label="Illustrations Description" field="illustrations_description" rows={2} />
            <TextArea label="Signatures Description" field="signatures_description" rows={2} />
            <TextArea label="Private Notes" field="internal_notes" rows={3} />
          </div>
        </section>

        {/* 14. Catalog Entry */}
        <section>
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Catalog Entry</h2>
          <div className="mb-4">
            <CatalogEntryGenerator
              book={{
                title: formData.title,
                subtitle: formData.subtitle,
                original_title: formData.original_title,
                series: formData.series,
                series_number: formData.series_number,
                publisher_name: formData.publisher_name,
                publication_place: formData.publication_place,
                publication_year: formData.publication_year,
                printer: formData.printer,
                printing_place: formData.printing_place,
                edition: formData.edition,
                impression: formData.impression,
                issue_state: formData.issue_state,
                edition_notes: formData.edition_notes,
                pagination_description: formData.pagination_description,
                page_count: formData.page_count,
                volumes: formData.volumes,
                height_mm: formData.height_mm,
                width_mm: formData.width_mm,
                cover_type: formData.cover_type,
                binding_name: referenceData.bindings.find(b => b.id === formData.binding_id)?.name || null,
                format_name: referenceData.bookFormats.find(f => f.id === formData.format_id)?.name || null,
                format_abbreviation: referenceData.bookFormats.find(f => f.id === formData.format_id)?.abbreviation || null,
                has_dust_jacket: formData.has_dust_jacket,
                is_signed: formData.is_signed,
                condition_name: referenceData.conditions.find(c => c.id === formData.condition_id)?.name || null,
                condition_notes: formData.condition_notes,
                bibliography: formData.bibliography,
                provenance: formData.provenance,
                illustrations_description: formData.illustrations_description,
                signatures_description: formData.signatures_description,
                isbn_13: formData.isbn_13,
                isbn_10: formData.isbn_10,
                oclc_number: formData.oclc_number,
                lccn: formData.lccn,
                contributors: contributorsForCatalog,
              }}
              onGenerate={(entry) => handleChange('catalog_entry', entry)}
            />
          </div>
          <TextArea label="Full Catalog Entry" field="catalog_entry" rows={4} />
        </section>

        {/* Submit buttons at bottom */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" asChild>
            <Link href={`/books/${book.id}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
