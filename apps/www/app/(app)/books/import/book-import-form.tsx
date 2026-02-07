'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import * as XLSX from 'xlsx'

import type { Database } from '@/lib/supabase/database.types'

type Language = { id: string; name_en: string }
type Condition = { id: string; name: string }
type Binding = { id: string; name: string }
type BookFormat = { id: string; type: string | null; name: string; abbreviation: string | null }
type ContributorRole = { id: string; name: string }
type ExistingContributor = { id: string; name: string }

type ReferenceData = {
  languages: Language[]
  conditions: Condition[]
  bindings: Binding[]
  bookFormats: BookFormat[]
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
  userId: string
}

type ParsedBook = {
  rowIndex: number
  data: Record<string, string>
  errors: string[]
  warnings: string[]
}

type ImportStatus = 'idle' | 'parsing' | 'preview' | 'importing' | 'done'

// Column name mapping from Excel to database fields
const columnMapping: Record<string, string> = {
  'Title *': 'title',
  'Subtitle': 'subtitle',
  'Original Title': 'original_title',
  'Series': 'series',
  'Series Number': 'series_number',
  'Contributors': 'contributors',
  'Language': 'language',
  'Original Language': 'original_language',
  'Publisher': 'publisher_name',
  'Publication Place': 'publication_place',
  'Publication Year': 'publication_year',
  'Printer': 'printer',
  'Printing Place': 'printing_place',
  'Edition': 'edition',
  'Impression': 'impression',
  'Issue State': 'issue_state',
  'Edition Notes': 'edition_notes',
  'Pagination': 'pagination_description',
  'Page Count': 'page_count',
  'Volumes': 'volumes',
  'Height (mm)': 'height_mm',
  'Width (mm)': 'width_mm',
  'Depth (mm)': 'depth_mm',
  'Weight (g)': 'weight_grams',
  'Cover Type': 'cover_type',
  'Binding': 'binding',
  'Book Format': 'book_format',
  'Protective Enclosure': 'protective_enclosure',
  'Has Dust Jacket': 'has_dust_jacket',
  'Signed': 'is_signed',
  'Condition': 'condition',
  'Condition Notes': 'condition_notes',
  'Status': 'status',
  'Action Needed': 'action_needed',
  'ISBN-13': 'isbn_13',
  'ISBN-10': 'isbn_10',
  'OCLC Number': 'oclc_number',
  'LCCN': 'lccn',
  'Catalog ID': 'user_catalog_id',
  'DDC': 'ddc',
  'LCC': 'lcc',
  'UDC': 'udc',
  'Topic': 'topic',
  'BISAC Code 1': 'bisac_code',
  'BISAC Code 2': 'bisac_code_2',
  'BISAC Code 3': 'bisac_code_3',
  'Location': 'storage_location',
  'Shelf': 'shelf',
  'Section': 'shelf_section',
  'Acquired From': 'acquired_from',
  'Acquired Date': 'acquired_date',
  'Acquired Price': 'acquired_price',
  'Acquired Currency': 'acquired_currency',
  'Acquisition Notes': 'acquired_notes',
  'Lowest Price': 'lowest_price',
  'Highest Price': 'highest_price',
  'Estimated Value': 'estimated_value',
  'Sales Price': 'sales_price',
  'Price Currency': 'price_currency',
  'Summary': 'summary',
  'Provenance': 'provenance',
  'Bibliography': 'bibliography',
  'Illustrations Description': 'illustrations_description',
  'Signatures Description': 'signatures_description',
  'Private Notes': 'internal_notes',
  'Catalog Entry': 'catalog_entry',
}

export default function BookImportForm({ referenceData, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()
  
  const [status, setStatus] = useState<ImportStatus>('idle')
  const [fileName, setFileName] = useState<string | null>(null)
  const [parsedBooks, setParsedBooks] = useState<ParsedBook[]>([])
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 })
  const [importResults, setImportResults] = useState({ success: 0, failed: 0 })
  const [error, setError] = useState<string | null>(null)

  // Collections
  const [importCollections, setImportCollections] = useState<{ id: string; name: string; is_default: boolean }[]>([])
  const [selectedImportCollections, setSelectedImportCollections] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function loadCollections() {
      const { data } = await supabase
        .from('collections')
        .select('id, name, is_default, sort_order')
        .order('sort_order', { ascending: true })
      if (data) {
        setImportCollections(data as any)
        const defaultCol = data.find((c: any) => c.is_default)
        if (defaultCol) setSelectedImportCollections(new Set([(defaultCol as any).id]))
      }
    }
    loadCollections()
  }, [])

  // Parse boolean values
  const parseBoolean = (value: string | undefined): boolean | null => {
    if (!value) return null
    const lower = value.toLowerCase().trim()
    if (['yes', 'true', '1', 'ja'].includes(lower)) return true
    if (['no', 'false', '0', 'nee'].includes(lower)) return false
    return null
  }

  // Parse number values
  const parseNumber = (value: string | undefined): number | null => {
    if (!value) return null
    const cleaned = value.replace(/[^\d.-]/g, '')
    const num = parseFloat(cleaned)
    return isNaN(num) ? null : num
  }

  // Find language ID by name
  const findLanguageId = (name: string): string | null => {
    if (!name) return null
    const lower = name.toLowerCase().trim()
    const found = referenceData.languages.find(l => 
      l.name_en.toLowerCase() === lower
    )
    return found?.id || null
  }

  // Find condition ID by name
  const findConditionId = (name: string): string | null => {
    if (!name) return null
    const lower = name.toLowerCase().trim()
    const found = referenceData.conditions.find(c => 
      c.name.toLowerCase() === lower
    )
    return found?.id || null
  }

  // Find binding ID by name
  const findBindingId = (name: string): string | null => {
    if (!name) return null
    const lower = name.toLowerCase().trim()
    const found = referenceData.bindings.find(b => 
      b.name.toLowerCase() === lower ||
      b.name.toLowerCase().includes(lower) ||
      lower.includes(b.name.toLowerCase())
    )
    return found?.id || null
  }

  // Find format ID by name
  const findFormatId = (name: string): string | null => {
    if (!name) return null
    const lower = name.toLowerCase().trim()
    const found = referenceData.bookFormats.find(f => 
      f.name.toLowerCase() === lower ||
      (f.abbreviation && f.abbreviation.toLowerCase() === lower) ||
      f.name.toLowerCase().includes(lower)
    )
    return found?.id || null
  }

  // Parse contributors string: "Eco, Umberto (Author); Weaver, William (Translator)"
  const parseContributors = (value: string): { name: string; role: string }[] => {
    if (!value) return []
    
    const contributors: { name: string; role: string }[] = []
    const parts = value.split(';')
    
    for (const part of parts) {
      const trimmed = part.trim()
      // Match: "Lastname, Firstname (Role)" or "Name (Role)"
      const match = trimmed.match(/^(.+?)\s*\(([^)]+)\)\s*$/)
      if (match) {
        contributors.push({
          name: match[1].trim(),
          role: match[2].trim()
        })
      } else if (trimmed) {
        // No role specified, assume Author
        contributors.push({
          name: trimmed,
          role: 'Author'
        })
      }
    }
    
    return contributors
  }

  // Validate a single book row
  const validateBook = (data: Record<string, string>, rowIndex: number): ParsedBook => {
    const errors: string[] = []
    const warnings: string[] = []

    // Required field
    if (!data.title?.trim()) {
      errors.push('Title is required')
    }

    // Validate status
    const validStatuses = ['draft', 'in_collection', 'lent', 'borrowed', 'double', 'to_sell', 'on_sale', 'reserved', 'sold', 'ordered', 'lost', 'donated', 'destroyed', 'unknown']
    if (data.status && !validStatuses.includes(data.status.toLowerCase())) {
      warnings.push(`Unknown status "${data.status}", will default to "in_collection"`)
    }

    // Validate action_needed
    const validActions = ['none', 'repair', 'bind', 'replace']
    if (data.action_needed && !validActions.includes(data.action_needed.toLowerCase())) {
      warnings.push(`Unknown action "${data.action_needed}", will default to "none"`)
    }

    // Validate language
    if (data.language && !findLanguageId(data.language)) {
      warnings.push(`Language "${data.language}" not found in database`)
    }

    // Validate condition
    if (data.condition && !findConditionId(data.condition)) {
      warnings.push(`Condition "${data.condition}" not found in database`)
    }

    return { rowIndex, data, errors, warnings }
  }

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    setError(null)
    setStatus('parsing')
    setFileName(file.name)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      
      // Get first sheet (Books)
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      
      // Convert to JSON with headers
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' })
      
      // Skip the example row (row 2) if it looks like our template
      let dataRows = rows
      if (rows.length > 0 && rows[0]['Title *'] === 'The Name of the Rose') {
        dataRows = rows.slice(1)
      }

      // Filter out empty rows
      dataRows = dataRows.filter(row => {
        const title = row['Title *'] || row['Title']
        return title && title.trim()
      })

      if (dataRows.length === 0) {
        setError('No data found in the Excel file. Make sure you have books in the "Books" sheet.')
        setStatus('idle')
        return
      }

      // Map Excel columns to our field names and validate
      const parsed: ParsedBook[] = dataRows.map((row, index) => {
        const mappedData: Record<string, string> = {}
        
        for (const [excelCol, dbField] of Object.entries(columnMapping)) {
          const value = row[excelCol]
          if (value !== undefined && value !== '') {
            mappedData[dbField] = String(value).trim()
          }
        }

        // Handle "Title *" vs "Title" column name
        if (!mappedData.title && row['Title']) {
          mappedData.title = String(row['Title']).trim()
        }

        return validateBook(mappedData, index + 2) // +2 because Excel row 1 is header, row 2 might be example
      })

      setParsedBooks(parsed)
      setStatus('preview')
    } catch (err) {
      console.error('Parse error:', err)
      setError('Failed to parse Excel file. Make sure it\'s a valid .xlsx file.')
      setStatus('idle')
    }
  }, [])

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      handleFileSelect(file)
    } else {
      setError('Please upload an Excel file (.xlsx or .xls)')
    }
  }, [handleFileSelect])

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Import books to database
  const handleImport = async () => {
    const validBooks = parsedBooks.filter(b => b.errors.length === 0)
    if (validBooks.length === 0) {
      setError('No valid books to import')
      return
    }

    setStatus('importing')
    setImportProgress({ current: 0, total: validBooks.length })
    setImportResults({ success: 0, failed: 0 })

    let success = 0
    let failed = 0

    for (let i = 0; i < validBooks.length; i++) {
      const book = validBooks[i]
      setImportProgress({ current: i + 1, total: validBooks.length })

      try {
        // Prepare book data
        type BookInsert = Database['public']['Tables']['books']['Insert']
        const bookData: BookInsert = {
          title: book.data.title,
          user_id: userId,
          status: book.data.status?.toLowerCase() || 'in_collection',
          subtitle: book.data.subtitle || null,
          original_title: book.data.original_title || null,
          series: book.data.series || null,
          series_number: book.data.series_number || null,
          language_id: findLanguageId(book.data.language || '') || null,
          original_language_id: findLanguageId(book.data.original_language || '') || null,
          publisher_name: book.data.publisher_name || null,
          publication_place: book.data.publication_place || null,
          publication_year: book.data.publication_year || null,
          printer: book.data.printer || null,
          printing_place: book.data.printing_place || null,
          edition: book.data.edition || null,
          impression: book.data.impression || null,
          issue_state: book.data.issue_state || null,
          edition_notes: book.data.edition_notes || null,
          pagination_description: book.data.pagination_description || null,
          page_count: parseNumber(book.data.page_count),
          volumes: book.data.volumes || null,
          height_mm: parseNumber(book.data.height_mm),
          width_mm: parseNumber(book.data.width_mm),
          depth_mm: parseNumber(book.data.depth_mm),
          weight_grams: parseNumber(book.data.weight_grams),
          cover_type: book.data.cover_type || null,
          binding_id: findBindingId(book.data.binding || '') || null,
          format_id: findFormatId(book.data.book_format || '') || null,
          protective_enclosure: book.data.protective_enclosure || 'none',
          has_dust_jacket: parseBoolean(book.data.has_dust_jacket) || false,
          is_signed: parseBoolean(book.data.is_signed) || false,
          condition_id: findConditionId(book.data.condition || '') || null,
          condition_notes: book.data.condition_notes || null,
          action_needed: book.data.action_needed?.toLowerCase() || 'none',
          isbn_13: book.data.isbn_13 || null,
          isbn_10: book.data.isbn_10 || null,
          oclc_number: book.data.oclc_number || null,
          lccn: book.data.lccn || null,
          user_catalog_id: book.data.user_catalog_id || null,
          ddc: book.data.ddc || null,
          lcc: book.data.lcc || null,
          udc: book.data.udc || null,
          topic: book.data.topic || null,
          bisac_code: book.data.bisac_code || null,
          bisac_code_2: book.data.bisac_code_2 || null,
          bisac_code_3: book.data.bisac_code_3 || null,
          storage_location: book.data.storage_location || null,
          shelf: book.data.shelf || null,
          shelf_section: book.data.shelf_section || null,
          acquired_from: book.data.acquired_from || null,
          acquired_date: book.data.acquired_date || null,
          acquired_price: parseNumber(book.data.acquired_price),
          acquired_currency: book.data.acquired_currency || null,
          acquired_notes: book.data.acquired_notes || null,
          lowest_price: parseNumber(book.data.lowest_price),
          highest_price: parseNumber(book.data.highest_price),
          estimated_value: parseNumber(book.data.estimated_value),
          sales_price: parseNumber(book.data.sales_price),
          price_currency: book.data.price_currency || null,
          summary: book.data.summary || null,
          provenance: book.data.provenance || null,
          bibliography: book.data.bibliography || null,
          illustrations_description: book.data.illustrations_description || null,
          signatures_description: book.data.signatures_description || null,
          internal_notes: book.data.internal_notes || null,
          catalog_entry: book.data.catalog_entry || null,
        }

        // Insert book
        const { data: newBook, error: insertError } = await supabase
          .from('books')
          .insert(bookData)
          .select('id')
          .single()

        if (insertError) throw insertError

        // Handle contributors
        const contributors = parseContributors(book.data.contributors || '')
        for (const contrib of contributors) {
          // Find or create contributor
          let contributorId: string

          const existing = referenceData.allContributors.find(
            c => c.name.toLowerCase() === contrib.name.toLowerCase()
          )

          if (existing) {
            contributorId = existing.id
          } else {
            const { data: newContrib, error: contribError } = await supabase
              .from('contributors')
              .insert({
                canonical_name: contrib.name,
                sort_name: contrib.name,
              })
              .select('id')
              .single()

            if (contribError) {
              console.error('Failed to create contributor:', contribError)
              continue
            }
            contributorId = newContrib.id
            // Add to reference data for future lookups
            referenceData.allContributors.push({ id: contributorId, name: contrib.name })
          }

          // Find role ID
          const role = referenceData.contributorRoles.find(
            r => r.name.toLowerCase() === contrib.role.toLowerCase()
          )

          if (role) {
            await supabase.from('book_contributors').insert({
              book_id: newBook.id,
              contributor_id: contributorId,
              role_id: role.id
            })
          }
        }

        success++
      } catch (err) {
        console.error('Import error for row', book.rowIndex, err)
        failed++
      }

      setImportResults({ success, failed })
    }

    setStatus('done')
  }

  // Reset to start over
  const handleReset = () => {
    setStatus('idle')
    setFileName(null)
    setParsedBooks([])
    setError(null)
    setImportProgress({ current: 0, total: 0 })
    setImportResults({ success: 0, failed: 0 })
  }

  const validCount = parsedBooks.filter(b => b.errors.length === 0).length
  const errorCount = parsedBooks.filter(b => b.errors.length > 0).length
  const warningCount = parsedBooks.filter(b => b.warnings.length > 0).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/books" className="p-2 hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Import Books from Excel</h1>
        </div>
      </div>

      {/* Step 1: Download Template */}
      <section className="mb-8 p-6 border border-border bg-muted/30">
        <h2 className="text-lg font-semibold mb-2">Step 1: Download Template</h2>
        <p className="text-muted-foreground mb-4">
          Download the Excel template, fill in your book data, then upload it below.
        </p>
        <Button asChild variant="outline">
          <a href="/api/import-template" download>
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </a>
        </Button>
      </section>

      {/* Step 2: Upload File */}
      {status === 'idle' && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Step 2: Upload Your Excel File</h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-border p-12 text-center hover:border-foreground/50 transition-colors cursor-pointer"
          >
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg mb-2">Drop your Excel file here</p>
              <p className="text-muted-foreground">or click to browse</p>
            </label>
          </div>
        </section>
      )}

      {/* Parsing state */}
      {status === 'parsing' && (
        <section className="mb-8 p-12 border border-border text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-muted-foreground" />
          <p className="text-lg">Parsing {fileName}...</p>
        </section>
      )}

      {/* Step 3: Preview */}
      {status === 'preview' && (
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Step 3: Review & Import</h2>
            <Button variant="outline" onClick={handleReset}>
              <X className="w-4 h-4 mr-2" />
              Start Over
            </Button>
          </div>

          {/* Summary */}
          <div className="mb-6 p-4 border border-border bg-muted/30 flex gap-6">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              <span className="font-medium">{fileName}</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span>{validCount} valid</span>
            </div>
            {errorCount > 0 && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span>{errorCount} with errors</span>
              </div>
            )}
            {warningCount > 0 && (
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertCircle className="w-5 h-5" />
                <span>{warningCount} with warnings</span>
              </div>
            )}
          </div>

          {/* Preview table */}
          <div className="border border-border overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-2 text-left font-medium">Row</th>
                  <th className="px-4 py-2 text-left font-medium">Title</th>
                  <th className="px-4 py-2 text-left font-medium">Contributors</th>
                  <th className="px-4 py-2 text-left font-medium">Publisher</th>
                  <th className="px-4 py-2 text-left font-medium">Year</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {parsedBooks.slice(0, 100).map((book) => (
                  <tr 
                    key={book.rowIndex} 
                    className={`border-t border-border ${book.errors.length > 0 ? 'bg-red-50' : book.warnings.length > 0 ? 'bg-yellow-50' : ''}`}
                  >
                    <td className="px-4 py-2">{book.rowIndex}</td>
                    <td className="px-4 py-2">
                      {book.data.title || <span className="text-red-600 italic">Missing</span>}
                    </td>
                    <td className="px-4 py-2 max-w-xs truncate">{book.data.contributors}</td>
                    <td className="px-4 py-2">{book.data.publisher_name}</td>
                    <td className="px-4 py-2">{book.data.publication_year}</td>
                    <td className="px-4 py-2">
                      {book.errors.length > 0 ? (
                        <span className="text-red-600" title={book.errors.join(', ')}>
                          {book.errors[0]}
                        </span>
                      ) : book.warnings.length > 0 ? (
                        <span className="text-yellow-600" title={book.warnings.join(', ')}>
                          ⚠ {book.warnings.length} warning(s)
                        </span>
                      ) : (
                        <span className="text-green-600">✓ Valid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedBooks.length > 100 && (
              <div className="p-4 text-center text-muted-foreground border-t border-border">
                Showing first 100 of {parsedBooks.length} books
              </div>
            )}
          </div>

          {/* Import button */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleReset}>Cancel</Button>
            <Button onClick={handleImport} disabled={validCount === 0}>
              <Upload className="w-4 h-4 mr-2" />
              Import {validCount} Book{validCount !== 1 ? 's' : ''}
            </Button>
          </div>
        </section>
      )}

      {/* Importing state */}
      {status === 'importing' && (
        <section className="mb-8 p-12 border border-border text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-muted-foreground" />
          <p className="text-lg mb-2">
            Importing book {importProgress.current} of {importProgress.total}...
          </p>
          <div className="w-64 mx-auto h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-foreground transition-all duration-300"
              style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
            />
          </div>
          <p className="mt-4 text-muted-foreground">
            {importResults.success} imported, {importResults.failed} failed
          </p>
        </section>
      )}

      {/* Done state */}
      {status === 'done' && (
        <section className="mb-8 p-12 border border-border text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
          <p className="text-lg mb-2">Import Complete!</p>
          <p className="text-muted-foreground mb-6">
            Successfully imported {importResults.success} book{importResults.success !== 1 ? 's' : ''}.
            {importResults.failed > 0 && ` ${importResults.failed} failed.`}
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleReset}>
              Import More
            </Button>
            <Button onClick={() => router.push('/books')}>
              View Library
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}
