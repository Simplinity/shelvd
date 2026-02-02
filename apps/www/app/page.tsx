import { BookOpen, Check, Sparkles, Database, FileSpreadsheet, BarChart3, Search, Globe, Shield, Zap, ArrowRight } from 'lucide-react'
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
          <span className="text-lg font-bold tracking-tight uppercase">Shelvd</span>
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
      <section className="flex-1 flex items-center justify-center p-8 min-h-[80vh]">
        <div className="text-center max-w-3xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            The catalog your
            <br />
            <span className="text-primary">books deserve.</span>
          </h1>
          
          <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-xl mx-auto">
            Professional collection management for serious collectors. 
            First editions, signed copies, fine bindings — cataloged with bibliographic precision.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="h-12 px-8 text-sm font-semibold uppercase tracking-wide">
              <Link href="/signup">
                Start For Free
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-sm font-semibold uppercase tracking-wide">
              <Link href="#features">
                See Features
              </Link>
            </Button>
          </div>
          
          {/* Swiss Design element: red line */}
          <div className="mt-16 w-24 h-1 bg-primary mx-auto" />
          
          <p className="mt-8 text-xs text-muted-foreground uppercase tracking-widest">
            Built for collectors who know the difference between a first edition and a first printing.
          </p>
        </div>
      </section>

      {/* Early Access Banner */}
      <section className="bg-primary text-primary-foreground py-6">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm md:text-base font-medium uppercase tracking-wide">
            <Sparkles className="inline w-4 h-4 mr-2 mb-1" />
            Early Access — First 1,000 users get lifetime free access
            <Sparkles className="inline w-4 h-4 ml-2 mb-1" />
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything a serious collector needs.
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Not another reading list app. Shelvd is built from the ground up for bibliophiles who collect physical books as valuable objects.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Database className="w-6 h-6" />}
              title="Bibliographic Depth"
              description="76 historical book formats (Folio, Quarto, Octavo...), 45+ cover types, 65 binding styles. Describe your books the way they deserve."
            />
            <FeatureCard
              icon={<FileSpreadsheet className="w-6 h-6" />}
              title="Professional Cataloging"
              description="ISBD-compliant catalog entries in 4 languages. 69 MARC contributor roles. Roman numerals, circa dates, bibliographic pagination."
            />
            <FeatureCard
              icon={<Search className="w-6 h-6" />}
              title="Powerful Search"
              description="Search across 14 fields. Find books by condition, binding, language, publisher, or any combination. Instant results across 5,000+ books."
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Collection Statistics"
              description="Track total value, profit/loss, condition distribution. See your top authors, publishers, acquisition trends at a glance."
            />
            <FeatureCard
              icon={<FileSpreadsheet className="w-6 h-6" />}
              title="Import & Export"
              description="Excel import with smart templates. Export to Excel, CSV, or JSON. Your data is always yours."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Fast & Modern"
              description="Built with Next.js 15. Instant page loads, responsive design, works beautifully on desktop and mobile."
            />
          </div>
        </div>
      </section>

      {/* Why Shelvd */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Why collectors choose Shelvd
            </h2>
          </div>

          <div className="space-y-6">
            <ComparisonRow 
              problem="ISBN scanners are useless for pre-1970 books"
              solution="Shelvd is built around bibliographic cataloging, not barcodes"
            />
            <ComparisonRow 
              problem="CLZ and LibraryThing feel outdated"
              solution="Modern web app with Swiss Design — clean, fast, beautiful"
            />
            <ComparisonRow 
              problem="No app understands fine bindings and paper types"
              solution="Half leather, marbled endpapers, gilt edges — we speak your language"
            />
            <ComparisonRow 
              problem="Condition grading is oversimplified"
              solution="Separate dust jacket condition, text block condition, detailed notes"
            />
            <ComparisonRow 
              problem="Your data is trapped in proprietary formats"
              solution="Full Excel/CSV/JSON export anytime. Your collection, your data."
            />
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              And we're just getting started.
            </h2>
            <p className="text-muted-foreground text-lg">
              Features in development — available soon for all users.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <ComingSoonItem>Book images with zoom</ComingSoonItem>
            <ComingSoonItem>Wishlist / Desiderata</ComingSoonItem>
            <ComingSoonItem>Custom collections & tags</ComingSoonItem>
            <ComingSoonItem>Insurance reports (PDF)</ComingSoonItem>
            <ComingSoonItem>Public catalog sharing</ComingSoonItem>
            <ComingSoonItem>Duplicate detection</ComingSoonItem>
            <ComingSoonItem>WooCommerce & Catawiki export</ComingSoonItem>
            <ComingSoonItem>Provenance tracking</ComingSoonItem>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-foreground text-background">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Join the first 1,000.
          </h2>
          <p className="text-lg md:text-xl mb-4 opacity-80">
            We're in early access. Sign up now and get lifetime free access — no credit card, no catch.
          </p>
          <p className="text-sm mb-10 opacity-60">
            After 1,000 users, paid plans will start at €7/month. Early users keep free access forever.
          </p>
          
          <Button asChild size="lg" variant="secondary" className="h-14 px-10 text-base font-semibold uppercase tracking-wide">
            <Link href="/signup">
              Create Free Account <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold tracking-tight uppercase">Shelvd</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 Bruno van Branden / Simplinity
          </p>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 border bg-background hover:border-primary/50 transition-colors">
      <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-4 text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function ComparisonRow({ problem, solution }: { problem: string, solution: string }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-8 p-6 bg-background border">
      <div className="flex-1">
        <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wide">The problem</p>
        <p className="font-medium">{problem}</p>
      </div>
      <div className="hidden md:block w-px bg-border" />
      <div className="flex-1">
        <p className="text-sm text-primary mb-1 uppercase tracking-wide">Shelvd</p>
        <p className="font-medium">{solution}</p>
      </div>
    </div>
  )
}

function ComingSoonItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 p-4 border bg-muted/30">
      <div className="w-6 h-6 border-2 border-primary/30 flex items-center justify-center">
        <div className="w-2 h-2 bg-primary/30" />
      </div>
      <span className="text-sm font-medium">{children}</span>
    </div>
  )
}
