import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
  }

  try {
    // ============================================
    // STEP 1: Fetch ALL books with pagination
    // ============================================
    let allBooks: any[] = []
    let bookOffset = 0
    while (true) {
      const { data: booksPage, error: booksError } = await supabase
        .from('books')
        .select('id, title, status, condition_id, is_signed, has_dust_jacket, language_id, publisher_name, publication_place, cover_type, shelf, estimated_value, acquired_price, sales_price, acquired_currency, price_currency, action_needed, publication_year, acquired_date, isbn_13')
        .eq('user_id', user.id)
        .range(bookOffset, bookOffset + 999)
      
      if (booksError) {
        return NextResponse.json({ error: 'Books query failed' }, { status: 500 })
      }
      
      if (!booksPage || booksPage.length === 0) break
      allBooks = [...allBooks, ...booksPage]
      if (booksPage.length < 1000) break
      bookOffset += 1000
    }

    const totalBooks = allBooks.length
    const bookIds = allBooks.map(b => b.id)

    // ============================================
    // STEP 2: Fetch lookups
    // ============================================
    const [
      { data: conditionsLookup },
      { data: languagesLookup },
      { data: contributorRolesLookup },
    ] = await Promise.all([
      supabase.from('conditions').select('id, name'),
      supabase.from('languages').select('id, name_en'),
      supabase.from('contributor_roles').select('id, name'),
    ])

    const conditionMap = new Map(conditionsLookup?.map(c => [c.id, c.name]) || [])
    const languageMap = new Map(languagesLookup?.map(l => [l.id, l.name_en]) || [])

    // ============================================
    // STEP 3: Get Author role IDs
    // ============================================
    const authorRoleIds = (contributorRolesLookup || [])
      .filter(r => r.name === 'Author')
      .map(r => r.id)

    // ============================================
    // STEP 4: Fetch book_contributors in batches
    // ============================================
    let allBookContributors: any[] = []
    const batchSize = 500
    for (let i = 0; i < bookIds.length; i += batchSize) {
      const batchIds = bookIds.slice(i, i + batchSize)
      const { data: batchContributors } = await supabase
        .from('book_contributors')
        .select('book_id, role_id, contributor_id')
        .in('book_id', batchIds)
      
      if (batchContributors) {
        allBookContributors = [...allBookContributors, ...batchContributors]
      }
    }

    // ============================================
    // STEP 5: Fetch ALL contributors with pagination
    // ============================================
    let allContributors: any[] = []
    let contribOffset = 0
    while (true) {
      const { data: contribPage } = await supabase
        .from('contributors')
        .select('id, canonical_name')
        .range(contribOffset, contribOffset + 999)
      
      if (!contribPage || contribPage.length === 0) break
      allContributors = [...allContributors, ...contribPage]
      if (contribPage.length < 1000) break
      contribOffset += 1000
    }

    const contributorMap = new Map(allContributors.map(c => [c.id, c.canonical_name]))

    // ============================================
    // STEP 6: Fetch book_images to count books with photos
    // ============================================
    let allBookImages: any[] = []
    for (let i = 0; i < bookIds.length; i += batchSize) {
      const batchIds = bookIds.slice(i, i + batchSize)
      const { data: batchImages } = await supabase
        .from('book_images')
        .select('book_id')
        .in('book_id', batchIds)
      
      if (batchImages) {
        allBookImages = [...allBookImages, ...batchImages]
      }
    }
    const booksWithImageSet = new Set(allBookImages.map(bi => bi.book_id))

    // ============================================
    // EXCHANGE RATES
    // ============================================
    const { data: profile } = await supabase.from('user_profiles').select('default_currency').eq('id', user.id).single()
    const displayCurrency = profile?.default_currency || 'EUR'

    // Fetch exchange rates from frankfurter.app (ECB rates, free, no key)
    let exchangeRates: Record<string, number> = {}
    let ratesDate = ''
    try {
      const ratesRes = await fetch('https://api.frankfurter.app/latest?from=EUR', { next: { revalidate: 86400 } })
      if (ratesRes.ok) {
        const ratesData = await ratesRes.json()
        exchangeRates = ratesData.rates || {}
        ratesDate = ratesData.date || ''
      }
    } catch {
      // If rates unavailable, skip conversion (treat everything as display currency)
    }
    exchangeRates['EUR'] = 1 // Base

    // Convert amount from sourceCurrency to displayCurrency
    const convert = (amount: number, sourceCurrency: string | null): number => {
      const src = sourceCurrency || displayCurrency
      if (src === displayCurrency) return amount
      const srcToEur = exchangeRates[src] ? 1 / exchangeRates[src] : 1
      const eurToDisplay = exchangeRates[displayCurrency] || 1
      return amount * srcToEur * eurToDisplay
    }

    // ============================================
    // CALCULATIONS
    // ============================================
    const currentYear = new Date().getFullYear().toString()

    // Key Metrics
    let totalEstimatedValue = 0
    let totalAcquiredPrice = 0
    let booksWithValue = 0
    let booksWithPrice = 0
    let actionNeededCount = 0
    let mostExpensiveBook: { title: string; value: number } | null = null
    let soldCount = 0
    let totalSoldRevenue = 0
    let booksWithISBN = 0
    let booksAddedThisYear = 0
    let booksSoldThisYear = 0
    let signedCount = 0
    let dustJacketCount = 0
    let latestAcquisitionDate: string | null = null

    const statusCounts: Record<string, number> = {}
    const conditionCounts: Record<string, number> = {}
    const languageCounts: Record<string, number> = {}
    const publisherCounts: Record<string, number> = {}
    const placeCounts: Record<string, number> = {}
    const coverTypeCounts: Record<string, number> = {}
    const shelfCounts: Record<string, number> = {}
    const acquisitionYearCounts: Record<string, number> = {}

    allBooks.forEach(book => {
      // Values
      if (book.estimated_value) {
        const value = convert(Number(book.estimated_value), book.price_currency)
        totalEstimatedValue += value
        booksWithValue++
        if (!mostExpensiveBook || value > mostExpensiveBook.value) {
          mostExpensiveBook = { title: book.title || 'Untitled', value }
        }
      }
      if (book.acquired_price) {
        totalAcquiredPrice += convert(Number(book.acquired_price), book.acquired_currency)
        booksWithPrice++
      }
      if (book.action_needed && book.action_needed !== 'none') {
        actionNeededCount++
      }
      if (book.status === 'sold') {
        soldCount++
        if (book.sales_price) totalSoldRevenue += convert(Number(book.sales_price), book.price_currency)
      }
      if (book.isbn_13) booksWithISBN++
      if (book.acquired_date?.startsWith(currentYear)) booksAddedThisYear++
      if (book.is_signed) signedCount++
      if (book.has_dust_jacket) dustJacketCount++

      // Status
      const status = book.status || 'unknown'
      statusCounts[status] = (statusCounts[status] || 0) + 1

      // Condition
      const conditionName = book.condition_id ? conditionMap.get(book.condition_id) || 'Unknown' : 'Not set'
      conditionCounts[conditionName] = (conditionCounts[conditionName] || 0) + 1

      // Language
      const langName = book.language_id ? languageMap.get(book.language_id) || 'Unknown' : 'Not set'
      languageCounts[langName] = (languageCounts[langName] || 0) + 1

      // Publisher
      if (book.publisher_name) {
        publisherCounts[book.publisher_name] = (publisherCounts[book.publisher_name] || 0) + 1
      }

      // Place
      if (book.publication_place) {
        placeCounts[book.publication_place] = (placeCounts[book.publication_place] || 0) + 1
      }

      // Cover type
      if (book.cover_type) {
        const normalized = book.cover_type.toLowerCase().split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        coverTypeCounts[normalized] = (coverTypeCounts[normalized] || 0) + 1
      }

      // Shelf
      if (book.shelf) {
        shelfCounts[book.shelf] = (shelfCounts[book.shelf] || 0) + 1
      }

      // Acquisition year
      if (book.acquired_date) {
        const year = book.acquired_date.substring(0, 4)
        acquisitionYearCounts[year] = (acquisitionYearCounts[year] || 0) + 1
        if (!latestAcquisitionDate || book.acquired_date > latestAcquisitionDate) {
          latestAcquisitionDate = book.acquired_date
        }
      }
    })

    // Top 10 Authors
    const authorCounts: Record<string, number> = {}
    allBookContributors.forEach(bc => {
      if (authorRoleIds.includes(bc.role_id)) {
        const name = contributorMap.get(bc.contributor_id) || 'Unknown'
        authorCounts[name] = (authorCounts[name] || 0) + 1
      }
    })
    const topAuthors = Object.entries(authorCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)
    const topPublishers = Object.entries(publisherCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)
    const topLanguages = Object.entries(languageCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)
    const topPlaces = Object.entries(placeCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)
    const topCoverTypes = Object.entries(coverTypeCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)
    const topShelves = Object.entries(shelfCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)
    const topAcquisitionYears = Object.entries(acquisitionYearCounts).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 10)

    // Derived values
    const profitLoss = totalEstimatedValue - totalAcquiredPrice
    const avgValuePerBook = booksWithValue > 0 ? totalEstimatedValue / booksWithValue : 0
    const avgAcquiredPrice = booksWithPrice > 0 ? totalAcquiredPrice / booksWithPrice : 0
    const booksWithPhoto = booksWithImageSet.size
    const pctWithPhoto = totalBooks > 0 ? (booksWithPhoto / totalBooks) * 100 : 0
    const pctWithISBN = totalBooks > 0 ? (booksWithISBN / totalBooks) * 100 : 0

    // Build stats object
    const stats = {
      totalBooks,
      totalEstimatedValue,
      totalAcquiredPrice,
      profitLoss,
      avgValuePerBook,
      avgAcquiredPrice,
      booksWithValue,
      booksWithPrice,
      actionNeededCount,
      mostExpensiveBook,
      soldCount,
      totalSoldRevenue,
      booksWithISBN,
      pctWithISBN,
      booksWithPhoto,
      pctWithPhoto,
      booksAddedThisYear,
      booksSoldThisYear,
      signedCount,
      dustJacketCount,
      latestAcquisitionDate,
      currentYear,
      statusCounts,
      conditionCounts,
      topAuthors,
      topPublishers,
      topLanguages,
      topPlaces,
      topCoverTypes,
      topShelves,
      topAcquisitionYears,
      displayCurrency,
      ratesDate,
    }

    // ============================================
    // UPSERT into user_stats
    // ============================================
    const { error: upsertError } = await (supabase as any)
      .from('user_stats')
      .upsert({
        user_id: user.id,
        stats,
        calculated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })

    if (upsertError) {
      return NextResponse.json({ error: 'Failed to save stats' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to calculate stats' }, { status: 500 })
  }
}
