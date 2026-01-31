import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import ExcelJS from 'exceljs'

// Column definitions matching the import template
const columns: { header: string; key: string; width: number }[] = [
  // Title & Series
  { header: 'Title', key: 'title', width: 35 },
  { header: 'Subtitle', key: 'subtitle', width: 30 },
  { header: 'Original Title', key: 'original_title', width: 30 },
  { header: 'Series', key: 'series', width: 25 },
  { header: 'Series Number', key: 'series_number', width: 14 },
  
  // Contributors
  { header: 'Contributors', key: 'contributors', width: 60 },
  
  // Language
  { header: 'Language', key: 'language', width: 20 },
  { header: 'Original Language', key: 'original_language', width: 20 },
  
  // Publication
  { header: 'Publisher', key: 'publisher_name', width: 25 },
  { header: 'Publication Place', key: 'publication_place', width: 20 },
  { header: 'Publication Year', key: 'publication_year', width: 16 },
  { header: 'Printer', key: 'printer', width: 25 },
  { header: 'Printing Place', key: 'printing_place', width: 20 },
  
  // Edition
  { header: 'Edition', key: 'edition', width: 25 },
  { header: 'Impression', key: 'impression', width: 20 },
  { header: 'Issue State', key: 'issue_state', width: 30 },
  { header: 'Edition Notes', key: 'edition_notes', width: 40 },
  
  // Physical Description
  { header: 'Pagination', key: 'pagination_description', width: 30 },
  { header: 'Page Count', key: 'page_count', width: 14 },
  { header: 'Volumes', key: 'volumes', width: 14 },
  { header: 'Height (mm)', key: 'height_mm', width: 12 },
  { header: 'Width (mm)', key: 'width_mm', width: 12 },
  { header: 'Depth (mm)', key: 'depth_mm', width: 12 },
  { header: 'Weight (g)', key: 'weight_grams', width: 12 },
  { header: 'Cover Type', key: 'cover_type', width: 25 },
  { header: 'Binding', key: 'binding', width: 25 },
  { header: 'Book Format', key: 'format', width: 20 },
  { header: 'Protective Enclosure', key: 'protective_enclosure', width: 22 },
  { header: 'Paper Type', key: 'paper_type', width: 20 },
  { header: 'Edge Treatment', key: 'edge_treatment', width: 20 },
  { header: 'Endpapers', key: 'endpapers_type', width: 20 },
  { header: 'Text Block', key: 'text_block_condition', width: 20 },
  { header: 'Has Dust Jacket', key: 'has_dust_jacket', width: 14 },
  { header: 'Signed', key: 'is_signed', width: 10 },
  
  // Condition & Status
  { header: 'Condition', key: 'condition', width: 15 },
  { header: 'Dust Jacket Condition', key: 'dust_jacket_condition', width: 20 },
  { header: 'Condition Notes', key: 'condition_notes', width: 45 },
  { header: 'Status', key: 'status', width: 18 },
  { header: 'Action Needed', key: 'action_needed', width: 15 },
  
  // Identifiers
  { header: 'ISBN-13', key: 'isbn_13', width: 18 },
  { header: 'ISBN-10', key: 'isbn_10', width: 15 },
  { header: 'OCLC Number', key: 'oclc_number', width: 18 },
  { header: 'LCCN', key: 'lccn', width: 18 },
  { header: 'Catalog ID', key: 'user_catalog_id', width: 18 },
  { header: 'DDC', key: 'ddc', width: 14 },
  { header: 'LCC', key: 'lcc', width: 16 },
  { header: 'UDC', key: 'udc', width: 14 },
  { header: 'Topic', key: 'topic', width: 30 },
  { header: 'BISAC Code', key: 'bisac_code', width: 16 },
  
  // Storage
  { header: 'Location', key: 'location', width: 20 },
  { header: 'Shelf', key: 'shelf', width: 14 },
  { header: 'Section', key: 'shelf_section', width: 14 },
  
  // Acquisition
  { header: 'Acquired From', key: 'acquired_from', width: 25 },
  { header: 'Acquired Date', key: 'acquired_date', width: 14 },
  { header: 'Acquired Price', key: 'acquired_price', width: 14 },
  { header: 'Acquired Currency', key: 'acquired_currency', width: 14 },
  { header: 'Acquisition Notes', key: 'acquired_notes', width: 40 },
  
  // Valuation
  { header: 'Lowest Price', key: 'lowest_price', width: 16 },
  { header: 'Highest Price', key: 'highest_price', width: 16 },
  { header: 'Estimated Value', key: 'estimated_value', width: 16 },
  { header: 'Sales Price', key: 'sales_price', width: 16 },
  { header: 'Price Currency', key: 'price_currency', width: 14 },
  { header: 'Valuation Date', key: 'valuation_date', width: 14 },
  
  // Notes
  { header: 'Summary', key: 'summary', width: 55 },
  { header: 'Provenance', key: 'provenance', width: 45 },
  { header: 'Bibliography', key: 'bibliography', width: 45 },
  { header: 'Illustrations Description', key: 'illustrations_description', width: 45 },
  { header: 'Signatures Description', key: 'signatures_description', width: 45 },
  { header: 'Dedication / Inscription', key: 'dedication_text', width: 45 },
  { header: 'Colophon', key: 'colophon_text', width: 45 },
  { header: 'Private Notes', key: 'internal_notes', width: 45 },
  { header: 'Catalog Entry', key: 'catalog_entry', width: 55 },
]

// Helper to transform book data
function transformBookData(book: any, contributorsByBook: Record<string, string[]>): Record<string, any> {
  return {
    title: book.title,
    subtitle: book.subtitle,
    original_title: book.original_title,
    series: book.series,
    series_number: book.series_number,
    contributors: contributorsByBook[book.id]?.join('; ') || '',
    language: (book.language as any)?.name || '',
    original_language: (book.original_language as any)?.name || '',
    publisher_name: book.publisher_name,
    publication_place: book.publication_place,
    publication_year: book.publication_year,
    printer: book.printer,
    printing_place: book.printing_place,
    edition: book.edition,
    impression: book.impression,
    issue_state: book.issue_state,
    edition_notes: book.edition_notes,
    pagination_description: book.pagination_description,
    page_count: book.page_count,
    volumes: book.volumes,
    height_mm: book.height_mm,
    width_mm: book.width_mm,
    depth_mm: book.depth_mm,
    weight_grams: book.weight_grams,
    cover_type: book.cover_type,
    binding: (book.binding as any)?.name || '',
    format: (book.format as any)?.name || '',
    protective_enclosure: book.protective_enclosure,
    paper_type: book.paper_type,
    edge_treatment: book.edge_treatment,
    endpapers_type: book.endpapers_type,
    text_block_condition: book.text_block_condition,
    has_dust_jacket: book.has_dust_jacket ? 'yes' : (book.has_dust_jacket === false ? 'no' : ''),
    is_signed: book.is_signed ? 'yes' : (book.is_signed === false ? 'no' : ''),
    condition: (book.condition as any)?.name || '',
    dust_jacket_condition: (book.dust_jacket_condition as any)?.name || '',
    condition_notes: book.condition_notes,
    status: book.status,
    action_needed: book.action_needed,
    isbn_13: book.isbn_13,
    isbn_10: book.isbn_10,
    oclc_number: book.oclc_number,
    lccn: book.lccn,
    user_catalog_id: book.user_catalog_id,
    ddc: book.ddc,
    lcc: book.lcc,
    udc: book.udc,
    topic: book.topic,
    bisac_code: book.bisac_code,
    location: (book.location as any)?.name || '',
    shelf: book.shelf,
    shelf_section: book.shelf_section,
    acquired_from: book.acquired_from,
    acquired_date: book.acquired_date,
    acquired_price: book.acquired_price,
    acquired_currency: book.acquired_currency,
    acquired_notes: book.acquired_notes,
    lowest_price: book.lowest_price,
    highest_price: book.highest_price,
    estimated_value: book.estimated_value,
    sales_price: book.sales_price,
    price_currency: book.price_currency,
    valuation_date: book.valuation_date,
    summary: book.summary,
    provenance: book.provenance,
    bibliography: book.bibliography,
    illustrations_description: book.illustrations_description,
    signatures_description: book.signatures_description,
    dedication_text: book.dedication_text,
    colophon_text: book.colophon_text,
    internal_notes: book.internal_notes,
    catalog_entry: book.catalog_entry,
  }
}

// Generate Excel file
async function generateExcel(rows: Record<string, any>[]) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Shelvd'
  workbook.created = new Date()

  const worksheet = workbook.addWorksheet('Books', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
  })

  worksheet.columns = columns.map(col => ({
    header: col.header,
    key: col.key,
    width: col.width
  }))

  // Style header row
  const headerRow = worksheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1A1A1A' }
  }
  headerRow.alignment = { horizontal: 'left', vertical: 'middle' }
  headerRow.height = 25

  // Add data rows
  rows.forEach(row => worksheet.addRow(row))

  // Style data rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.eachCell(cell => {
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
        if (rowNumber % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9F9F9' }
          }
        }
      })
    }
  })

  return await workbook.xlsx.writeBuffer()
}

// Generate CSV file
function generateCSV(rows: Record<string, any>[]): string {
  const headers = columns.map(col => col.header)
  const keys = columns.map(col => col.key)
  
  const csvRows = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => 
      keys.map(key => {
        const value = row[key]
        if (value === null || value === undefined) return ''
        const str = String(value).replace(/"/g, '""')
        return `"${str}"`
      }).join(',')
    )
  ]
  
  return csvRows.join('\n')
}

// Generate JSON file
function generateJSON(rows: Record<string, any>[]): string {
  return JSON.stringify(rows, null, 2)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'xlsx'
  
  if (!['xlsx', 'csv', 'json'].includes(format)) {
    return NextResponse.json({ error: 'Invalid format. Use xlsx, csv, or json.' }, { status: 400 })
  }

  const supabase = await createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch all books with relations
  const { data: books, error } = await supabase
    .from('books')
    .select(`
      *,
      language:languages!books_language_id_fkey(name),
      original_language:languages!books_original_language_id_fkey(name),
      binding:bindings(name),
      format:book_formats(name),
      condition:conditions!books_condition_id_fkey(name),
      dust_jacket_condition:conditions!books_dust_jacket_condition_id_fkey(name),
      location:user_locations(name)
    `)
    .eq('user_id', user.id)
    .order('title')

  if (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
  }

  // Fetch contributors for all books
  const bookIds = books?.map(b => b.id) || []
  const { data: bookContributors } = await supabase
    .from('book_contributors')
    .select(`
      book_id,
      role,
      contributor:contributors(canonical_name, sort_name)
    `)
    .in('book_id', bookIds)

  // Group contributors by book
  const contributorsByBook: Record<string, string[]> = {}
  bookContributors?.forEach((bc: any) => {
    if (!contributorsByBook[bc.book_id]) {
      contributorsByBook[bc.book_id] = []
    }
    const name = bc.contributor?.sort_name || bc.contributor?.canonical_name || 'Unknown'
    const role = bc.role || 'Contributor'
    const formattedRole = role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, ' ')
    contributorsByBook[bc.book_id].push(`${name} (${formattedRole})`)
  })

  // Transform all books
  const rows = books?.map(book => transformBookData(book, contributorsByBook)) || []

  // Generate filename with date
  const date = new Date().toISOString().split('T')[0]
  
  // Return appropriate format
  if (format === 'xlsx') {
    const buffer = await generateExcel(rows)
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="shelvd_export_${date}.xlsx"`,
      },
    })
  }
  
  if (format === 'csv') {
    const csv = generateCSV(rows)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="shelvd_export_${date}.csv"`,
      },
    })
  }
  
  // JSON
  const json = generateJSON(rows)
  return new NextResponse(json, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="shelvd_export_${date}.json"`,
    },
  })
}
