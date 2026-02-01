import { createClient } from '@/lib/supabase/server'
import { BookOpen, Euro, TrendingUp, TrendingDown, AlertTriangle, PenTool, BookMarked } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not authorized</div>
  }

  // Fetch all stats in parallel
  const [
    { count: totalBooks },
    { data: valueData },
    { data: actionNeededData },
    { data: statusData },
    { data: conditionData },
    { data: specialData },
  ] = await Promise.all([
    // Total books count
    supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
    
    // Sum of estimated_value and acquired_price
    supabase
      .from('books')
      .select('estimated_value, acquired_price')
      .eq('user_id', user.id),
    
    // Books with action needed
    supabase
      .from('books')
      .select('id')
      .eq('user_id', user.id)
      .neq('action_needed', 'none'),
    
    // Status counts
    supabase
      .from('books')
      .select('status')
      .eq('user_id', user.id),
    
    // Condition counts (with condition names)
    supabase
      .from('books')
      .select('condition_id')
      .eq('user_id', user.id),
    
    // Special books (signed, dust jacket)
    supabase
      .from('books')
      .select('is_signed, has_dust_jacket')
      .eq('user_id', user.id),
  ])

  // Fetch conditions lookup
  const { data: conditionsLookup } = await supabase
    .from('conditions')
    .select('id, name')

  const conditionMap = new Map(conditionsLookup?.map(c => [c.id, c.name]) || [])

  // Calculate Tier 1 totals
  let totalEstimatedValue = 0
  let totalAcquiredPrice = 0
  let booksWithValue = 0
  let booksWithPrice = 0

  valueData?.forEach(book => {
    if (book.estimated_value) {
      totalEstimatedValue += Number(book.estimated_value)
      booksWithValue++
    }
    if (book.acquired_price) {
      totalAcquiredPrice += Number(book.acquired_price)
      booksWithPrice++
    }
  })

  const profitLoss = totalEstimatedValue - totalAcquiredPrice
  const actionNeededCount = actionNeededData?.length || 0

  // Calculate Tier 2: Status counts
  const statusCounts: Record<string, number> = {}
  statusData?.forEach(book => {
    const status = book.status || 'unknown'
    statusCounts[status] = (statusCounts[status] || 0) + 1
  })

  // Calculate Tier 2: Condition counts
  const conditionCounts: Record<string, number> = {}
  conditionData?.forEach(book => {
    const conditionName = book.condition_id ? conditionMap.get(book.condition_id) || 'Unknown' : 'Not set'
    conditionCounts[conditionName] = (conditionCounts[conditionName] || 0) + 1
  })

  // Calculate Tier 2: Special counts
  let signedCount = 0
  let dustJacketCount = 0
  specialData?.forEach(book => {
    if (book.is_signed) signedCount++
    if (book.has_dust_jacket) dustJacketCount++
  })

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

  // Status colors
  const statusColors: Record<string, string> = {
    in_collection: 'bg-green-500',
    on_sale: 'bg-blue-500',
    sold: 'bg-gray-400',
    lent: 'bg-yellow-500',
    lost: 'bg-red-500',
    donated: 'bg-purple-500',
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
                <p className={`text-3xl font-bold mt-1 ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {totalEstimatedValue > 0 && totalAcquiredPrice > 0 
                    ? `${((profitLoss / totalAcquiredPrice) * 100).toFixed(0)}% return`
                    : 'Need both values'}
                </p>
              </div>
              <div className={`w-12 h-12 flex items-center justify-center ${profitLoss >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {profitLoss >= 0 
                  ? <TrendingUp className="w-6 h-6 text-green-600" />
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
                <p className={`text-3xl font-bold mt-1 ${actionNeededCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {actionNeededCount}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {actionNeededCount > 0 ? 'books need attention' : 'all good!'}
                </p>
              </div>
              <div className={`w-12 h-12 flex items-center justify-center ${actionNeededCount > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                <AlertTriangle className={`w-6 h-6 ${actionNeededCount > 0 ? 'text-red-600' : 'text-green-600'}`} />
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

      {/* Placeholder for more tiers */}
      <div className="text-center py-12 text-gray-400">
        <p>More statistics coming soon...</p>
      </div>
    </div>
  )
}
