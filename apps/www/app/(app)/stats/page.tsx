import { createClient } from '@/lib/supabase/server'
import { BookOpen, Euro, TrendingUp, TrendingDown, AlertTriangle, PenTool, BookMarked, Users, Building2, Globe, MapPin, BookCopy, Layers, Calendar, History } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not authorized</div>
  }

  // ============================================
  // STEP 1: Fetch ALL books with pagination (same as export)
  // ============================================
  let allBooks: any[] = []
  let bookOffset = 0
  while (true) {
    const { data: booksPage } = await supabase
      .from('books')
      .select('id, status, condition_id, is_signed, has_dust_jacket, language_id, publisher_name, publication_place, cover_type, shelf, estimated_value, acquired_price, action_needed, publication_year, acquired_date')
      .eq('user_id', user.id)
      .range(bookOffset, bookOffset + 999)
    
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
  // STEP 3: Get Author role IDs (all of them!)
  // ============================================
  const authorRoleIds = (contributorRolesLookup || [])
    .filter(r => r.name === 'Author')
    .map(r => r.id)

  // ============================================
  // STEP 4: Fetch book_contributors in batches (SAME AS EXPORT!)
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
  // STEP 5: Fetch ALL contributors with pagination (SAME AS EXPORT!)
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
  // CALCULATIONS
  // ============================================

  // Tier 1: Key Metrics
  let totalEstimatedValue = 0
  let totalAcquiredPrice = 0
  let booksWithValue = 0
  let booksWithPrice = 0
  let actionNeededCount = 0

  allBooks.forEach(book => {
    if (book.estimated_value) {
      totalEstimatedValue += Number(book.estimated_value)
      booksWithValue++
    }
    if (book.acquired_price) {
      totalAcquiredPrice += Number(book.acquired_price)
      booksWithPrice++
    }
    if (book.action_needed && book.action_needed !== 'none') {
      actionNeededCount++
    }
  })

  const profitLoss = totalEstimatedValue - totalAcquiredPrice

  // Tier 2: Status counts
  const statusCounts: Record<string, number> = {}
  allBooks.forEach(book => {
    const status = book.status || 'unknown'
    statusCounts[status] = (statusCounts[status] || 0) + 1
  })

  // Tier 2: Condition counts
  const conditionCounts: Record<string, number> = {}
  allBooks.forEach(book => {
    const conditionName = book.condition_id ? conditionMap.get(book.condition_id) || 'Unknown' : 'Not set'
    conditionCounts[conditionName] = (conditionCounts[conditionName] || 0) + 1
  })

  // Tier 2: Special counts
  let signedCount = 0
  let dustJacketCount = 0
  allBooks.forEach(book => {
    if (book.is_signed) signedCount++
    if (book.has_dust_jacket) dustJacketCount++
  })

  // Tier 3: Top 10 Authors
  const authorCounts: Record<string, number> = {}
  allBookContributors.forEach(bc => {
    if (authorRoleIds.includes(bc.role_id)) {
      const name = contributorMap.get(bc.contributor_id) || 'Unknown'
      authorCounts[name] = (authorCounts[name] || 0) + 1
    }
  })
  
  const topAuthors = Object.entries(authorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  // Tier 3: Top 10 Publishers
  const publisherCounts: Record<string, number> = {}
  allBooks.forEach(book => {
    if (book.publisher_name) {
      publisherCounts[book.publisher_name] = (publisherCounts[book.publisher_name] || 0) + 1
    }
  })
  
  const topPublishers = Object.entries(publisherCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  // Tier 3: By Language
  const languageCounts: Record<string, number> = {}
  allBooks.forEach(book => {
    const langName = book.language_id ? languageMap.get(book.language_id) || 'Unknown' : 'Not set'
    languageCounts[langName] = (languageCounts[langName] || 0) + 1
  })
  
  const topLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  // Tier 3: By Publication Place
  const placeCounts: Record<string, number> = {}
  allBooks.forEach(book => {
    if (book.publication_place) {
      placeCounts[book.publication_place] = (placeCounts[book.publication_place] || 0) + 1
    }
  })
  
  const topPlaces = Object.entries(placeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  // Tier 4: By Cover Type (normalize case)
  const coverTypeCounts: Record<string, number> = {}
  allBooks.forEach(book => {
    if (book.cover_type) {
      const normalized = book.cover_type
        .toLowerCase()
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      coverTypeCounts[normalized] = (coverTypeCounts[normalized] || 0) + 1
    }
  })
  
  const topCoverTypes = Object.entries(coverTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  // Tier 4: By Shelf
  const shelfCounts: Record<string, number> = {}
  allBooks.forEach(book => {
    if (book.shelf) {
      shelfCounts[book.shelf] = (shelfCounts[book.shelf] || 0) + 1
    }
  })
  
  const topShelves = Object.entries(shelfCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  // Tier 5: By Publication Year
  const yearCounts: Record<string, number> = {}
  let oldestYear: number | null = null
  let newestYear: number | null = null
  
  allBooks.forEach(book => {
    if (book.publication_year) {
      const year = Number(book.publication_year)
      if (!isNaN(year) && year > 1000 && year < 2100) {
        yearCounts[year.toString()] = (yearCounts[year.toString()] || 0) + 1
        if (oldestYear === null || year < oldestYear) {
          oldestYear = year
        }
        if (newestYear === null || year > newestYear) {
          newestYear = year
        }
      }
    }
  })

  // Tier 5: By Acquisition Year
  const acquisitionYearCounts: Record<string, number> = {}
  let latestAcquisitionDate: string | null = null
  
  allBooks.forEach(book => {
    if (book.acquired_date) {
      const year = book.acquired_date.substring(0, 4)
      acquisitionYearCounts[year] = (acquisitionYearCounts[year] || 0) + 1
      if (latestAcquisitionDate === null || book.acquired_date > latestAcquisitionDate) {
        latestAcquisitionDate = book.acquired_date
      }
    }
  })

  const topAcquisitionYears = Object.entries(acquisitionYearCounts)
    .sort((a, b) => b[0].localeCompare(a[0])) // Sort by year descending
    .slice(0, 10)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format status labels
  const statusLabels: Record<string, string> = {
    in_collection: 'In Collection',
    on_sale: 'For Sale',
    sold: 'Sold',
    lent: 'Lent Out',
    lost: 'Lost',
    donated: 'Donated',
    unknown: 'Unknown',
  }

  // Status colors - Swiss Design (red for attention, grays for rest)
  const statusColors: Record<string, string> = {
    in_collection: 'bg-gray-800',
    on_sale: 'bg-red-600',
    sold: 'bg-gray-400',
    lent: 'bg-gray-500',
    lost: 'bg-red-600',
    donated: 'bg-gray-400',
    unknown: 'bg-gray-300',
  }

  // Sort conditions by count
  const sortedConditions = Object.entries(conditionCounts)
    .sort((a, b) => b[1] - a[1])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Statistics</h1>
        <p className="text-gray-500 mt-1">Overview of your collection</p>
      </div>


      {/* Tier 1: Key Metrics */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Key Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Total Books */}
          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Books</p>
                <p className="text-3xl font-bold mt-1">{totalBooks?.toLocaleString() || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Estimated Value */}
          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Estimated Value</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(totalEstimatedValue)}</p>
                <p className="text-xs text-gray-400 mt-1">{booksWithValue} books with value</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">
                <Euro className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Total Invested */}
          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Invested</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(totalAcquiredPrice)}</p>
                <p className="text-xs text-gray-400 mt-1">{booksWithPrice} books with price</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">
                <Euro className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Profit/Loss */}
          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Profit / Loss</p>
                <p className={`text-3xl font-bold mt-1 ${profitLoss >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                  {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {totalEstimatedValue > 0 && totalAcquiredPrice > 0 
                    ? `${((profitLoss / totalAcquiredPrice) * 100).toFixed(0)}% return`
                    : 'Need both values'}
                </p>
              </div>
              <div className={`w-12 h-12 flex items-center justify-center ${profitLoss >= 0 ? 'bg-gray-100' : 'bg-red-100'}`}>
                {profitLoss >= 0 
                  ? <TrendingUp className="w-6 h-6 text-gray-600" />
                  : <TrendingDown className="w-6 h-6 text-red-600" />
                }
              </div>
            </div>
          </div>

          {/* Action Needed */}
          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Action Needed</p>
                <p className={`text-3xl font-bold mt-1 ${actionNeededCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {actionNeededCount}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {actionNeededCount > 0 ? 'books need attention' : 'all good'}
                </p>
              </div>
              <div className={`w-12 h-12 flex items-center justify-center ${actionNeededCount > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                <AlertTriangle className={`w-6 h-6 ${actionNeededCount > 0 ? 'text-red-600' : 'text-gray-600'}`} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Tier 2: Status & Conditie */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Status & Condition</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Status Distribution */}
          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">By Status</h3>
            <div className="space-y-3">
              {Object.entries(statusCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => {
                  const percentage = totalBooks ? ((count / totalBooks) * 100).toFixed(1) : 0
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{statusLabels[status] || status}</span>
                        <span className="font-medium">{count.toLocaleString()} <span className="text-gray-400">({percentage}%)</span></span>
                      </div>
                      <div className="w-full bg-gray-100 h-2">
                        <div 
                          className={`h-2 ${statusColors[status] || 'bg-gray-400'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Condition Distribution */}
          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">By Condition</h3>
            <div className="space-y-3">
              {sortedConditions.map(([condition, count]) => {
                const percentage = totalBooks ? ((count / totalBooks) * 100).toFixed(1) : 0
                return (
                  <div key={condition}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{condition}</span>
                      <span className="font-medium">{count.toLocaleString()} <span className="text-gray-400">({percentage}%)</span></span>
                    </div>
                    <div className="w-full bg-gray-100 h-2">
                      <div 
                        className="h-2 bg-gray-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Special Items */}
          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Special Items</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50">
                <PenTool className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                <p className="text-2xl font-bold">{signedCount}</p>
                <p className="text-sm text-gray-500">Signed</p>
              </div>
              <div className="text-center p-4 bg-gray-50">
                <BookMarked className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                <p className="text-2xl font-bold">{dustJacketCount}</p>
                <p className="text-sm text-gray-500">With Dust Jacket</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Tier 3: Content & Origin */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Content & Origin</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top 10 Authors */}
          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700">Top 10 Authors</h3>
            </div>
            <div className="space-y-2">
              {topAuthors.map(([name, count], index) => (
                <div key={name} className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-400 w-5">{index + 1}.</span>
                    <span className="text-sm text-gray-700">{name}</span>
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
              {topAuthors.length === 0 && (
                <p className="text-sm text-gray-400">No author data available</p>
              )}
            </div>
          </div>

          {/* Top 10 Publishers */}
          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700">Top 10 Publishers</h3>
            </div>
            <div className="space-y-2">
              {topPublishers.map(([name, count], index) => (
                <div key={name} className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-400 w-5">{index + 1}.</span>
                    <span className="text-sm text-gray-700">{name}</span>
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
              {topPublishers.length === 0 && (
                <p className="text-sm text-gray-400">No publisher data available</p>
              )}
            </div>
          </div>

          {/* By Language */}
          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700">By Language</h3>
            </div>
            <div className="space-y-3">
              {topLanguages.map(([lang, count]) => {
                const percentage = totalBooks ? ((count / totalBooks) * 100).toFixed(1) : 0
                return (
                  <div key={lang}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{lang}</span>
                      <span className="font-medium">{count.toLocaleString()} <span className="text-gray-400">({percentage}%)</span></span>
                    </div>
                    <div className="w-full bg-gray-100 h-2">
                      <div 
                        className="h-2 bg-gray-600"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* By Publication Place */}
          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700">Top 10 Publication Places</h3>
            </div>
            <div className="space-y-2">
              {topPlaces.map(([place, count], index) => (
                <div key={place} className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-400 w-5">{index + 1}.</span>
                    <span className="text-sm text-gray-700">{place}</span>
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
              {topPlaces.length === 0 && (
                <p className="text-sm text-gray-400">No publication place data available</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Tier 4: Physical & Storage */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Physical & Storage</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* By Cover Type */}
          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookCopy className="w-5 h-5 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700">By Cover Type</h3>
            </div>
            <div className="space-y-3">
              {topCoverTypes.map(([coverType, count]) => {
                const percentage = totalBooks ? ((count / totalBooks) * 100).toFixed(1) : 0
                return (
                  <div key={coverType}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{coverType}</span>
                      <span className="font-medium">{count.toLocaleString()} <span className="text-gray-400">({percentage}%)</span></span>
                    </div>
                    <div className="w-full bg-gray-100 h-2">
                      <div 
                        className="h-2 bg-gray-600"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              {topCoverTypes.length === 0 && (
                <p className="text-sm text-gray-400">No cover type data available</p>
              )}
            </div>
          </div>

          {/* By Shelf */}
          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700">Top 10 Shelves</h3>
            </div>
            <div className="space-y-2">
              {topShelves.map(([shelf, count], index) => (
                <div key={shelf} className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-400 w-5">{index + 1}.</span>
                    <span className="text-sm text-gray-700 truncate max-w-[200px]" title={shelf}>{shelf}</span>
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
              {topShelves.length === 0 && (
                <p className="text-sm text-gray-400">No shelf data available</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Tier 5: Time & Growth */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Time & Growth</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Acquisitions by Year */}
          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700">Acquisitions by Year</h3>
            </div>
            <div className="space-y-2">
              {topAcquisitionYears.map(([year, count]) => (
                <div key={year} className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-700">{year}</span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
              {topAcquisitionYears.length === 0 && (
                <p className="text-sm text-gray-400">No acquisition date data available</p>
              )}
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700">Collection Milestones</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50">
                <p className="text-2xl font-bold">{oldestYear || '—'}</p>
                <p className="text-sm text-gray-500">Oldest Publication</p>
              </div>
              <div className="text-center p-4 bg-gray-50">
                <p className="text-2xl font-bold">{newestYear || '—'}</p>
                <p className="text-sm text-gray-500">Newest Publication</p>
              </div>
              <div className="text-center p-4 bg-gray-50 col-span-2">
                <p className="text-lg font-bold">{latestAcquisitionDate || '—'}</p>
                <p className="text-sm text-gray-500">Latest Acquisition</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
