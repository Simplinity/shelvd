'use client'

import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'

interface StatsContentProps {
  initialStats: any
  calculatedAt: string | null
}

export function StatsContent({ initialStats, calculatedAt }: StatsContentProps) {
  const [stats, setStats] = useState(initialStats)
  const [lastCalculated, setLastCalculated] = useState(calculatedAt)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefreshing, setAutoRefreshing] = useState(false)

  // Auto-refresh if no stats or stats are older than 24 hours
  useEffect(() => {
    if (!stats && !autoRefreshing) {
      setAutoRefreshing(true)
      handleRefresh()
    }
  }, [stats])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/stats/calculate', { method: 'POST' })
      if (response.ok) {
        // Reload page to get fresh data
        window.location.reload()
      } else {
        const error = await response.json()
        alert('Failed to refresh stats: ' + error.error)
      }
    } catch (error) {
      alert('Failed to refresh stats')
    } finally {
      setIsRefreshing(false)
      setAutoRefreshing(false)
    }
  }

  // Format helpers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString('nl-BE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const statusLabels: Record<string, string> = {
    in_collection: 'In Collection', on_sale: 'For Sale', sold: 'Sold', lent: 'Lent Out', lost: 'Lost', donated: 'Donated', unknown: 'Unknown',
  }

  const statusColors: Record<string, string> = {
    in_collection: 'bg-gray-800', on_sale: 'bg-red-600', sold: 'bg-gray-400', lent: 'bg-gray-500', lost: 'bg-red-600', donated: 'bg-gray-400', unknown: 'bg-gray-300',
  }

  // Show loading/calculating state
  if (!stats || isRefreshing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mb-4" />
          <p className="text-gray-500">{autoRefreshing ? 'Calculating statistics for the first time...' : 'Refreshing statistics...'}</p>
          <p className="text-sm text-gray-400 mt-2">This may take a moment for large collections</p>
        </div>
      </div>
    )
  }

  const {
    totalBooks = 0,
    totalEstimatedValue = 0,
    totalAcquiredPrice = 0,
    profitLoss = 0,
    avgValuePerBook = 0,
    avgAcquiredPrice = 0,
    booksWithValue = 0,
    booksWithPrice = 0,
    actionNeededCount = 0,
    mostExpensiveBook = null,
    soldCount = 0,
    totalSoldRevenue = 0,
    booksWithISBN = 0,
    pctWithISBN = 0,
    booksWithPhoto = 0,
    pctWithPhoto = 0,
    booksAddedThisYear = 0,
    booksSoldThisYear = 0,
    signedCount = 0,
    dustJacketCount = 0,
    latestAcquisitionDate = null,
    currentYear = new Date().getFullYear().toString(),
    statusCounts = {},
    conditionCounts = {},
    topAuthors = [],
    topPublishers = [],
    topLanguages = [],
    topPlaces = [],
    topCoverTypes = [],
    topShelves = [],
    topAcquisitionYears = [],
  } = stats

  const sortedConditions = Object.entries(conditionCounts).sort((a, b) => (b[1] as number) - (a[1] as number))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Statistics</h1>
          <p className="text-gray-500 mt-1">Overview of your collection</p>
          <p className="text-xs text-gray-400 mt-1">Last updated: {formatDate(lastCalculated)}</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tier 1: Key Metrics */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Key Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Total Books</p>
            <p className="text-3xl font-bold mt-1">{totalBooks.toLocaleString()}</p>
          </div>

          <div className="bg-white border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Estimated Value</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(totalEstimatedValue)}</p>
            <p className="text-xs text-gray-400 mt-1">{booksWithValue} books with value</p>
          </div>

          <div className="bg-white border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Total Invested</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(totalAcquiredPrice)}</p>
            <p className="text-xs text-gray-400 mt-1">{booksWithPrice} books with price</p>
          </div>

          <div className="bg-white border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Profit / Loss</p>
            <p className={`text-3xl font-bold mt-1 ${profitLoss >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
              {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {totalEstimatedValue > 0 && totalAcquiredPrice > 0 ? `${((profitLoss / totalAcquiredPrice) * 100).toFixed(0)}% return` : 'Need both values'}
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Avg. Value per Book</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(avgValuePerBook)}</p>
          </div>

          <div className="bg-white border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Avg. Purchase Price</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(avgAcquiredPrice)}</p>
          </div>

          <div className="bg-white border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Total Sold</p>
            <p className="text-3xl font-bold mt-1">{soldCount}</p>
            <p className="text-xs text-gray-400 mt-1">{formatCurrency(totalSoldRevenue)} revenue</p>
          </div>

          <div className="bg-white border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Action Needed</p>
            <p className={`text-3xl font-bold mt-1 ${actionNeededCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {actionNeededCount}
            </p>
            <p className="text-xs text-gray-400 mt-1">{actionNeededCount > 0 ? 'books need attention' : 'all good'}</p>
          </div>

        </div>
      </div>

      {/* Tier 2: Status & Condition */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Status & Condition</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">By Status</h3>
            <div className="space-y-3">
              {Object.entries(statusCounts).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([status, count]) => {
                const percentage = totalBooks ? (((count as number) / totalBooks) * 100).toFixed(1) : 0
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{statusLabels[status] || status}</span>
                      <span className="font-medium">{(count as number).toLocaleString()} <span className="text-gray-400">({percentage}%)</span></span>
                    </div>
                    <div className="w-full bg-gray-100 h-2">
                      <div className={`h-2 ${statusColors[status] || 'bg-gray-400'}`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">By Condition</h3>
            <div className="space-y-3">
              {sortedConditions.map(([condition, count]) => {
                const percentage = totalBooks ? (((count as number) / totalBooks) * 100).toFixed(1) : 0
                return (
                  <div key={condition}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{condition}</span>
                      <span className="font-medium">{(count as number).toLocaleString()} <span className="text-gray-400">({percentage}%)</span></span>
                    </div>
                    <div className="w-full bg-gray-100 h-2">
                      <div className="h-2 bg-gray-500" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Special Items</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50">
                <p className="text-2xl font-bold">{signedCount}</p>
                <p className="text-sm text-gray-500">Signed</p>
              </div>
              <div className="text-center p-4 bg-gray-50">
                <p className="text-2xl font-bold">{dustJacketCount}</p>
                <p className="text-sm text-gray-500">Dust Jacket</p>
              </div>
              <div className="text-center p-4 bg-gray-50">
                <p className="text-2xl font-bold">{mostExpensiveBook ? formatCurrency(mostExpensiveBook.value) : '—'}</p>
                <p className="text-sm text-gray-500 truncate" title={mostExpensiveBook?.title}>Most Valuable</p>
              </div>
            </div>
            {mostExpensiveBook && (
              <p className="text-xs text-gray-400 mt-2 truncate" title={mostExpensiveBook.title}>
                Most valuable: {mostExpensiveBook.title}
              </p>
            )}
          </div>

          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Data Quality</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50">
                <p className="text-2xl font-bold">{pctWithPhoto.toFixed(0)}%</p>
                <p className="text-sm text-gray-500">With Photo</p>
              </div>
              <div className="text-center p-4 bg-gray-50">
                <p className="text-2xl font-bold">{pctWithISBN.toFixed(0)}%</p>
                <p className="text-sm text-gray-500">With ISBN</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Tier 3: Content & Origin */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Content & Origin</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Top 10 Authors</h3>
            <div className="space-y-2">
              {topAuthors.map(([name, count]: [string, number], index: number) => (
                <div key={name} className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-400 w-5">{index + 1}.</span>
                    <span className="text-sm text-gray-700">{name}</span>
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
              {topAuthors.length === 0 && <p className="text-sm text-gray-400">No author data available</p>}
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Top 10 Publishers</h3>
            <div className="space-y-2">
              {topPublishers.map(([name, count]: [string, number], index: number) => (
                <div key={name} className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-400 w-5">{index + 1}.</span>
                    <span className="text-sm text-gray-700">{name}</span>
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
              {topPublishers.length === 0 && <p className="text-sm text-gray-400">No publisher data available</p>}
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">By Language</h3>
            <div className="space-y-3">
              {topLanguages.map(([lang, count]: [string, number]) => {
                const percentage = totalBooks ? ((count / totalBooks) * 100).toFixed(1) : 0
                return (
                  <div key={lang}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{lang}</span>
                      <span className="font-medium">{count.toLocaleString()} <span className="text-gray-400">({percentage}%)</span></span>
                    </div>
                    <div className="w-full bg-gray-100 h-2">
                      <div className="h-2 bg-gray-600" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Top 10 Publication Places</h3>
            <div className="space-y-2">
              {topPlaces.map(([place, count]: [string, number], index: number) => (
                <div key={place} className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-400 w-5">{index + 1}.</span>
                    <span className="text-sm text-gray-700">{place}</span>
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
              {topPlaces.length === 0 && <p className="text-sm text-gray-400">No publication place data available</p>}
            </div>
          </div>

        </div>
      </div>

      {/* Tier 4: Physical & Storage */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Physical & Storage</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">By Cover Type</h3>
            <div className="space-y-3">
              {topCoverTypes.map(([coverType, count]: [string, number]) => {
                const percentage = totalBooks ? ((count / totalBooks) * 100).toFixed(1) : 0
                return (
                  <div key={coverType}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{coverType}</span>
                      <span className="font-medium">{count.toLocaleString()} <span className="text-gray-400">({percentage}%)</span></span>
                    </div>
                    <div className="w-full bg-gray-100 h-2">
                      <div className="h-2 bg-gray-600" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                )
              })}
              {topCoverTypes.length === 0 && <p className="text-sm text-gray-400">No cover type data available</p>}
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Top 10 Shelves</h3>
            <div className="space-y-2">
              {topShelves.map(([shelf, count]: [string, number], index: number) => (
                <div key={shelf} className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-400 w-5">{index + 1}.</span>
                    <span className="text-sm text-gray-700 truncate max-w-[200px]" title={shelf}>{shelf}</span>
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
              {topShelves.length === 0 && <p className="text-sm text-gray-400">No shelf data available</p>}
            </div>
          </div>

        </div>
      </div>

      {/* Tier 5: Time & Growth */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Time & Growth</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Acquisitions by Year</h3>
            <div className="space-y-2">
              {topAcquisitionYears.map(([year, count]: [string, number]) => (
                <div key={year} className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-700">{year}</span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
              {topAcquisitionYears.length === 0 && <p className="text-sm text-gray-400">No acquisition date data available</p>}
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">This Year ({currentYear})</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50">
                <p className="text-2xl font-bold">{booksAddedThisYear}</p>
                <p className="text-sm text-gray-500">Added</p>
              </div>
              <div className="text-center p-4 bg-gray-50">
                <p className="text-2xl font-bold">{booksSoldThisYear}</p>
                <p className="text-sm text-gray-500">Sold</p>
              </div>
            </div>
            {latestAcquisitionDate && (
              <p className="text-xs text-gray-400 mt-4">Latest acquisition: {latestAcquisitionDate}</p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
