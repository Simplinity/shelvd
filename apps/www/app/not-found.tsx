import Link from 'next/link'
import { BookX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <p className="text-[6rem] sm:text-[8rem] font-bold tracking-[0.2em] text-muted-foreground/20 leading-none mb-2 select-none">
          404
        </p>

        <div className="w-16 h-1 bg-primary mx-auto mb-8" />

        <div className="w-14 h-14 bg-muted flex items-center justify-center mx-auto mb-6">
          <BookX className="w-7 h-7 text-muted-foreground" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
          Ex Libris Nobody
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-8 max-w-sm mx-auto">
          This page once belonged to someone, but the bookplate
          has been removed and all provenance is lost.
        </p>

        <div className="text-sm text-muted-foreground/80 mb-10 space-y-1.5 italic">
          <p>Possible explanations:</p>
          <p>· It was a forgery all along</p>
          <p>· Foxing rendered it illegible</p>
          <p>· Someone shelved it in the wrong section</p>
          <p>· The bookseller swears it was here yesterday</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Button asChild>
            <Link href="/books">Back to the Catalogue</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          If you expected a book here, perhaps try{' '}
          <Link href="/books" className="underline hover:text-foreground">
            Search
          </Link>.
        </p>
      </div>
    </div>
  )
}
