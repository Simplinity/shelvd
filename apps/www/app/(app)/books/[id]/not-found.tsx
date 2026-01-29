import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function BookNotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center">
        <div className="w-16 h-16 bg-muted flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Book not found</h1>
        <p className="text-muted-foreground mb-8">
          The book you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/books">Back to collection</Link>
        </Button>
      </div>
    </div>
  )
}
