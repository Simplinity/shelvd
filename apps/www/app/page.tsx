import { BookOpen } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight">Shelvd</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign In
          </Link>
          <Button asChild size="sm">
            <Link href="/signup">
              Get Started
            </Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          {/* Swiss Design: Large bold typography */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Manage your
            <br />
            <span className="text-primary">book collection.</span>
          </h1>
          
          <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-lg mx-auto">
            Professional collection management for serious collectors. 
            Catalog, organize, and value your books.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="h-12 px-8 text-sm font-semibold uppercase tracking-wide">
              <Link href="/signup">
                Start For Free
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-sm font-semibold uppercase tracking-wide">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>
          
          {/* Swiss Design element: red line */}
          <div className="mt-16 w-24 h-1 bg-primary mx-auto" />
          
          <p className="mt-8 text-xs text-muted-foreground uppercase tracking-widest">
            5,054 Books · 4,097 Contributors · 27,048 Images
          </p>
        </div>
      </div>
    </main>
  )
}
