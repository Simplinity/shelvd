import { BookOpen, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getPublicStats } from '@/lib/actions/public-stats'
import { AuthQuote } from '@/components/auth-quotes'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const stats = await getPublicStats()

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground text-background flex-col justify-between p-12 xl:p-16 2xl:p-20">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-11 h-11 bg-primary flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight">Shelvd</span>
        </Link>
        
        <div className="space-y-8">
          <h1 className="text-5xl xl:text-6xl 2xl:text-7xl font-bold leading-[1.1] tracking-tight">
            Manage
            <br />
            your book
            <br />
            collection.
          </h1>
          <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
            Professional collection management for serious collectors. 
            Catalog, organize, and value your books.
          </p>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-12">
            <div>
              <p className="text-3xl font-bold tabular-nums">{stats.totalBooks.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Books</p>
            </div>
            <div className="w-px h-12 bg-muted-foreground/20" />
            <div>
              <p className="text-3xl font-bold tabular-nums">{stats.totalContributors.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Contributors</p>
            </div>
            <div className="w-px h-12 bg-muted-foreground/20" />
            <div>
              <p className="text-3xl font-bold tabular-nums">{stats.totalPublishers.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Publishers</p>
            </div>
          </div>
          <div className="border-t border-muted-foreground/10 pt-6">
            <AuthQuote />
          </div>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold tracking-tight">Shelvd</span>
            </Link>
          </div>

          {/* Back to website */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to website
          </Link>
          
          {children}
        </div>
      </div>
    </div>
  )
}
