import { BookOpen } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="text-center">
        {/* Swiss Design: Large bold typography, minimal elements */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-16 h-16 bg-primary flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-primary-foreground" strokeWidth={2.5} />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Shelvd
        </h1>
        
        <p className="text-muted-foreground text-lg mb-12 max-w-md mx-auto">
          Professional book collection management
          <br />
          for serious collectors
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg" className="h-12 px-8 text-sm font-semibold uppercase tracking-wide">
            <Link href="/login">
              Enter Collection
            </Link>
          </Button>
        </div>
        
        {/* Swiss Design element: red line */}
        <div className="mt-16 w-24 h-1 bg-primary mx-auto" />
        
        <p className="mt-8 text-xs text-muted-foreground uppercase tracking-widest">
          5,054 Books · 4,097 Contributors · 27,048 Images
        </p>
      </div>
    </main>
  )
}
