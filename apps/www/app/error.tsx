'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Page error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-muted flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-muted-foreground" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Something went wrong
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Even the finest collections have the occasional misprint.
          This page hit an unexpected error.
        </p>

        <div className="w-12 h-1 bg-primary mx-auto mb-8" />

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Button onClick={reset}>
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/books">Back to Collection</Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          If this keeps happening,{' '}
          <Link href="/support" className="underline hover:text-foreground">
            let us know
          </Link>.
        </p>
      </div>
    </div>
  )
}
