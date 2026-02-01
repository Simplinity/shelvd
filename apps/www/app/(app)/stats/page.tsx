import { createClient } from '@/lib/supabase/server'
import { BookOpen, Euro, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

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
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .neq('action_needed', 'none'),
  ])

  // Calculate totals from valueData (Supabase doesn't support SUM directly in JS client)
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Statistics</h1>
        <p className="text-gray-500 mt-1">Overview of your collection</p>
      </div>

      {/* Tier 1: Key Metrics */}
      <div className="mb-8">
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

      {/* Placeholder for more tiers */}
      <div className="text-center py-12 text-gray-400">
        <p>More statistics coming soon...</p>
      </div>
    </div>
  )
}
