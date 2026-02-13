import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BookOpen, Plus, Upload, Search, ScanBarcode, BarChart3, Clock, ClipboardCheck } from 'lucide-react'
import { APP_VERSION } from '@/lib/changelog'
import Link from 'next/link'
import { getCollectionsWithCounts } from '@/lib/actions/collections'
import { CollectionNav } from '@/components/collection-nav'
import { AnnouncementBanner } from '@/components/announcement-banner'
import { UserMenu } from '@/components/user-menu'
import { getUserTierData } from '@/lib/tier'
import { TierProviderWrapper } from '@/components/tier-provider-wrapper'
import { WelcomeWizard } from '@/components/onboarding/welcome-wizard'
import { ReturningUserNudge } from '@/components/returning-user-nudge'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check admin status + onboarding state
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin, user_type, onboarding_completed')
    .eq('id', user.id)
    .single()
  const isAdmin = profile?.is_admin === true

  // Determine if onboarding wizard is needed
  let needsOnboarding = !profile?.user_type
  if (needsOnboarding && isAdmin) {
    // Admins never see the wizard — auto-mark as onboarded
    needsOnboarding = false
    void supabase
      .from('user_profiles')
      .update({ user_type: 'collector', onboarding_completed: true })
      .eq('id', user.id)
  }
  if (needsOnboarding) {
    // Existing users with books skip the wizard — auto-mark as onboarded
    const { count: bookCount } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    if (bookCount && bookCount > 0) {
      needsOnboarding = false
      void supabase
        .from('user_profiles')
        .update({
          user_type: 'collector',
          onboarding_completed: true,
          collection_size_estimate: bookCount >= 5000 ? '5000_plus' : bookCount >= 500 ? '500_5000' : bookCount >= 50 ? '50_500' : 'under_50',
        })
        .eq('id', user.id)
    }
  }

  // Fetch collections for nav dropdown
  const { data: collections } = await getCollectionsWithCounts()

  // Get actual total book count (not sum of collection counts)
  const { count: totalBookCount } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })

  // Tier data for feature gating
  const tierData = await getUserTierData(user.id)

  // Active announcements
  const now = new Date().toISOString()
  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, message, type')
    .eq('is_active', true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order('created_at', { ascending: false })

  // Show wizard for new users
  if (needsOnboarding) {
    return <WelcomeWizard />
  }

  return (
    <TierProviderWrapper tierData={tierData}>
    <div className="min-h-screen bg-background">
      {/* Announcements */}
      {announcements && announcements.length > 0 && (
        <AnnouncementBanner announcements={announcements as any} />
      )}

      {/* Header - Swiss Design */}
      <header className="bg-white border-b-4 border-red-600 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 mr-6">
              <div className="w-9 h-9 bg-primary flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold tracking-tight uppercase">Shelvd</span>
              <span className="text-[9px] text-muted-foreground font-mono ml-1 mt-1">v{APP_VERSION}</span>
            </Link>

            {/* Primary navigation — core book actions, left-aligned */}
            <nav className="hidden md:flex items-center gap-1 flex-1">
              <CollectionNav collections={collections || []} totalBookCount={totalBookCount || 0} />
              <Link 
                href="/books/add" 
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </Link>
              <Link 
                href="/books/import" 
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Import
              </Link>
              <Link 
                href="/books/search" 
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                Search
              </Link>
              <Link 
                href="/books/lookup" 
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-1.5"
              >
                <ScanBarcode className="w-3.5 h-3.5" />
                Lookup
              </Link>
              <Link 
                href="/stats" 
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-1.5"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Stats
              </Link>
              <Link 
                href="/audit" 
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-1.5"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                Audit
              </Link>
              <Link 
                href="/activity" 
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                Activity
              </Link>
            </nav>

            {/* User menu dropdown — Settings, Support, Admin, Sign Out */}
            <div className="ml-auto">
              <UserMenu email={user.email || ''} isAdmin={isAdmin} />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        {children}
      </main>

      {/* Returning user nudge toast */}
      <ReturningUserNudge />
    </div>
    </TierProviderWrapper>
  )
}
