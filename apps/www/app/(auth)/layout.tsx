import { BookOpen } from 'lucide-react'
import Link from 'next/link'
import { getPublicStats } from '@/lib/actions/public-stats'
import { AuthBranding } from '@/components/auth-branding'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const stats = await getPublicStats()

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Swiss branding with live stats */}
      <AuthBranding stats={stats} />
      
      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-foreground flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-background" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold tracking-tight">Shelvd</span>
            </Link>
          </div>
          
          {children}

          {/* Mobile stats */}
          <div className="lg:hidden mt-10 pt-6 border-t border-border">
            <div className="flex justify-between text-center">
              <div>
                <p className="text-lg font-bold tabular-nums">{stats.totalBooks.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Books</p>
              </div>
              <div>
                <p className="text-lg font-bold tabular-nums">{stats.totalContributors.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Contributors</p>
              </div>
              <div>
                <p className="text-lg font-bold tabular-nums">{stats.totalImages.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Images</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
