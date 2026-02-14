'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => {
        if (window.history.length > 1) {
          sessionStorage.setItem('books-restore-scroll', '1')
          router.back()
        } else {
          router.push('/books')
        }
      }}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to collection
    </button>
  )
}
